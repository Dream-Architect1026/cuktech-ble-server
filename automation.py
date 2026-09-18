# -*- coding: utf-8 -*-
"""本地自动化管理：事件通知、告警阈值、定时控制。

- 充电开始/结束、端口功率越限 → 通过 SSE 推送 notify 事件
- 定时控制：到点自动开关端口
- 配置持久化到 automation.json
"""
import json
import logging
import os
import time

_LOGGER = logging.getLogger("automation")

PORT_NAMES = {1: "C1", 2: "C2", 3: "C3", 4: "USB-A"}

DEFAULT_DATA = {
    "notify": {"charge_start": True, "charge_end": True, "threshold": True},
    "thresholds": {},   # "1" -> {"min_w": 0, "max_w": 0}
    "schedules": [],    # [{id, port, time, action, enabled}]
}

THRESHOLD_DEBOUNCE_SEC = 60  # 越限通知最小间隔（秒）

MAX_SCHEDULES = 50  # 定时任务数量上限


class AutomationManager:
    def __init__(self, path, sse):
        self.path = path
        self.sse = sse
        self.on_fire = None  # 由 Server 注入：def callback(schedule_dict)
        self.data = self._load()
        self._prev_active = {}
        self._threshold_emit = {}
        self._schedule_last = {}

    # ── 持久化 ──
    def _load(self):
        if os.path.exists(self.path):
            try:
                with open(self.path, "r", encoding="utf-8") as f:
                    data = json.load(f)
                base = json.loads(json.dumps(DEFAULT_DATA))
                base.update(data)
                return base
            except Exception as e:
                _LOGGER.error("automation load failed: %s", e)
        return json.loads(json.dumps(DEFAULT_DATA))

    def _save(self):
        try:
            tmp = self.path + ".tmp"
            with open(tmp, "w", encoding="utf-8") as f:
                json.dump(self.data, f, ensure_ascii=False, indent=2)
            os.replace(tmp, self.path)
        except Exception as e:
            _LOGGER.error("automation save failed: %s", e)

    # ── 配置读写 ──
    def get(self):
        return self.data

    def set_notify(self, patch):
        nf = self.data["notify"]
        for k in ("charge_start", "charge_end", "threshold"):
            if k in patch:
                nf[k] = bool(patch[k])
        self._save()
        return self.data

    def set_threshold(self, port, min_w, max_w):
        min_w = max(0, float(min_w or 0))
        max_w = max(0, float(max_w or 0))
        key = str(int(port))
        if min_w == 0 and max_w == 0:
            self.data["thresholds"].pop(key, None)
        else:
            self.data["thresholds"][key] = {"min_w": min_w, "max_w": max_w}
        self._threshold_emit.pop(int(port), None)
        self._save()
        return self.data

    def add_schedule(self, port, time_str, action):
        if len(self.data["schedules"]) >= MAX_SCHEDULES:
            raise ValueError("schedule limit reached")
        sid = 1
        for s in self.data["schedules"]:
            if s.get("id", 0) >= sid:
                sid = s["id"] + 1
        self.data["schedules"].append({
            "id": sid, "port": port, "time": time_str,
            "action": action if action in ("on", "off") else "off",
            "enabled": True,
        })
        self._save()
        return self.data

    def delete_schedule(self, sid):
        self.data["schedules"] = [s for s in self.data["schedules"] if s.get("id") != sid]
        self._save()
        return self.data

    def toggle_schedule(self, sid, enabled):
        for s in self.data["schedules"]:
            if s.get("id") == sid:
                s["enabled"] = bool(enabled)
                break
        self._save()
        return self.data

    # ── 周期性检查（由服务端循环调用）──
    def tick(self, state, now=None):
        now = now or time.time()
        if not getattr(state, "connected", False):
            return
        ports = getattr(state, "ports", {}) or {}

        # 1. 充电开始 / 结束
        for pid, ps in ports.items():
            # power>0 即视为带电
            active = bool(getattr(ps, "power", 0) or 0) > 0
            prev = self._prev_active.get(pid)
            if prev is not None and prev != active:
                if active:
                    if self.data["notify"].get("charge_start", True):
                        self.sse.emit("notify", {
                            "level": "info", "port": pid,
                            "title": f"端口 {PORT_NAMES.get(pid, pid)} 开始充电",
                            "message": f"{PORT_NAMES.get(pid, pid)} 检测到充电电流",
                        })
                else:
                    if self.data["notify"].get("charge_end", True):
                        self.sse.emit("notify", {
                            "level": "success", "port": pid,
                            "title": f"端口 {PORT_NAMES.get(pid, pid)} 停止充电",
                            "message": f"{PORT_NAMES.get(pid, pid)} 已无输出功率",
                        })
            self._prev_active[pid] = active

        # 2. 告警阈值
        for key, th in self.data["thresholds"].items():
            try:
                pid = int(key)
            except (TypeError, ValueError):
                continue
            ps = ports.get(pid)
            if not ps:
                continue
            p = float(getattr(ps, "power", 0) or 0)
            max_w = float(th.get("max_w", 0) or 0)
            min_w = float(th.get("min_w", 0) or 0)
            level = None
            msg = ""
            if max_w > 0 and p > max_w:
                level = "danger"
                msg = f"端口 {PORT_NAMES.get(pid, pid)} 功率 {p:.1f}W 超过上限 {max_w:g}W"
            elif min_w > 0 and p > 0 and p < min_w:
                level = "warning"
                msg = f"端口 {PORT_NAMES.get(pid, pid)} 功率 {p:.1f}W 低于下限 {min_w:g}W"
            if level:
                last = self._threshold_emit.get(pid, 0)
                if now - last >= THRESHOLD_DEBOUNCE_SEC:
                    self._threshold_emit[pid] = now
                    if self.data["notify"].get("threshold", True):
                        self.sse.emit("notify", {
                            "level": level, "port": pid,
                            "title": f"端口 {PORT_NAMES.get(pid, pid)} 功率告警",
                            "message": msg,
                        })
            else:
                self._threshold_emit[pid] = 0  # 恢复正常，重置去抖

        # 3. 定时控制
        lt = time.localtime(now)
        hhmm = f"{lt.tm_hour:02d}:{lt.tm_min:02d}"
        day = f"{lt.tm_year}-{lt.tm_mon:02d}-{lt.tm_mday:02d}"
        for sch in self.data["schedules"]:
            if not sch.get("enabled", True):
                continue
            if sch.get("time") != hhmm:
                continue
            key = sch.get("id")
            stamp = f"{day} {hhmm}"
            if self._schedule_last.get(key) == stamp:
                continue
            self._schedule_last[key] = stamp
            port = sch.get("port")
            action = sch.get("action", "off")
            pname = PORT_NAMES.get(int(port), port) if str(port).isdigit() else port
            self.sse.emit("notify", {
                "level": "info", "port": port,
                "title": f"定时任务执行",
                "message": f"按计划在 {hhmm} {'开启' if action == 'on' else '关闭'} 端口 {pname}",
            })
            if self.on_fire:
                try:
                    self.on_fire(port, action)
                except Exception as e:
                    _LOGGER.error("schedule fire failed: %s", e)
