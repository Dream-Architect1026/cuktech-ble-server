# -*- coding: utf-8 -*-
"""充电守护引擎（PRD 需求 2 / 需求 4）。

- 需求 2「端口最大充电时长」：单次充电从实时功率 > 0 起计时，达到该端口配置
  的上限时长后自动断电；剩余 ≤ 10 分钟或已用 ≥ 80% 时进入预警（warn）。
- 需求 4「智能充电保护」：仅 C1 / C2（pid 1/2）生效。单次连续充电中实时功率
  低于阈值则启动保护倒计时，期间功率回升到阈值及以上立即重置；持续到点仍未
  恢复则硬性断开该端口。

本模块只做纯逻辑判定，不直接依赖 asyncio / BLE：
- 由 ``Server._automation_loop`` 每 1 秒调用一次 :meth:`tick`；
- 需要断电时通过注入的 ``on_cutoff(port_key, reason)`` 回调下发，由 Server 发 BLE；
- 前端展示数据通过 :meth:`snapshot` 合并进 /api/status 与 SSE 事件。

断电后端口进入 stopped 锁定态（保留原因用于红色展示），直到该端口重新出现
充电功率、或被用户手动重新开启（:meth:`resume`）才开始新会话。
"""
import json
import logging
import os
import time

_LOGGER = logging.getLogger("charge_guard")

# pid -> 前端/接口使用的端口 key
PORT_KEY = {1: "c1", 2: "c2", 3: "c3", 4: "a"}
# 智能充电保护仅对 C1 / C2 生效
PROTECTED_PORTS = {1, 2}
# 剩余时长 ≤ 该秒数即预警
WARN_REMAIN_SEC = 10 * 60
# 已用时长达到上限的该比例即预警
WARN_RATIO = 0.8
# 持久化保护/上限事件的最大条数
MAX_EVENTS = 50

STATE_IDLE = "idle"
STATE_CHARGING = "charging"
STATE_WARN = "warn"
STATE_LIMIT = "limit"
STATE_PROTECT = "protect"


class _Session:
    __slots__ = ("active", "start_ts", "stopped", "reason", "low_since",
                 "cut_ts", "cut_power", "cut_elapsed", "cleared")

    def __init__(self):
        self.reset()

    def reset(self):
        self.active = False
        self.start_ts = None
        self.stopped = False
        self.reason = None
        self.low_since = None
        self.cut_ts = None
        self.cut_power = 0.0
        self.cut_elapsed = 0
        # 断电后是否已观测到功率真正归零（区分「断电回落延迟」与「重新来电」）
        self.cleared = False


class ChargeGuard:
    def __init__(self, persist_path, sse=None):
        self.path = persist_path
        self.sse = sse
        # 由 Server 注入：on_cutoff(port_key:str, reason:str) -> None
        self.on_cutoff = None
        self.sessions = {pid: _Session() for pid in range(1, 5)}
        self.events = self._load_events()
        # 用于只在状态变化时推 SSE，避免每秒推送
        self._last_state = {}

    # ───────────────────────── 持久化（断开原因与时间） ─────────────────────────
    def _load_events(self):
        if os.path.exists(self.path):
            try:
                with open(self.path, "r", encoding="utf-8") as f:
                    data = json.load(f)
                evs = data.get("events", [])
                return evs[-MAX_EVENTS:] if isinstance(evs, list) else []
            except Exception as e:
                _LOGGER.error("charge_guard load failed: %s", e)
        return []

    def _save_events(self):
        try:
            tmp = self.path + ".tmp"
            with open(tmp, "w", encoding="utf-8") as f:
                json.dump({"events": self.events[-MAX_EVENTS:]}, f,
                          ensure_ascii=False, indent=2)
            os.replace(tmp, self.path)
        except Exception as e:
            _LOGGER.error("charge_guard save failed: %s", e)

    def _record_event(self, pid, reason, now, power, elapsed):
        evt = {
            "ts": round(now, 1),
            "time": time.strftime("%Y-%m-%d %H:%M:%S", time.localtime(now)),
            "port": PORT_KEY.get(pid, str(pid)),
            "port_name": {1: "C1", 2: "C2", 3: "C3", 4: "USB-A"}.get(pid, str(pid)),
            "reason": reason,                      # limit=已达上限  protect=低功率保护
            "elapsed_sec": int(elapsed or 0),
            "power_w": round(float(power or 0), 2),
        }
        self.events.append(evt)
        self.events = self.events[-MAX_EVENTS:]
        self._save_events()
        return evt

    def get_events(self):
        return list(self.events)

    # ───────────────────────── 外部交互 ─────────────────────────
    def resume(self, pid):
        """用户手动开启某端口：解除 stopped 锁定，开始接受新会话。"""
        try:
            pid = int(pid)
        except (TypeError, ValueError):
            return
        s = self.sessions.get(pid)
        if s:
            s.reset()

    @staticmethod
    def _limit_minutes(cfg, pid):
        cl = getattr(cfg, "charge_limit", None)
        if cl is None:
            return 0
        return int(getattr(cl, PORT_KEY.get(pid, ""), 0) or 0)

    def _port_state(self, pid, s, cfg, now):
        """计算单个端口当前展示状态。"""
        if s.stopped:
            return STATE_LIMIT if s.reason == "limit" else STATE_PROTECT
        if not s.active or s.start_ts is None:
            return STATE_IDLE
        elapsed = now - s.start_ts
        lim = self._limit_minutes(cfg, pid)
        if lim > 0:
            lim_sec = lim * 60
            remain = lim_sec - elapsed
            if remain <= WARN_REMAIN_SEC or elapsed >= lim_sec * WARN_RATIO:
                return STATE_WARN
        return STATE_CHARGING

    # ───────────────────────── 周期判定 ─────────────────────────
    def tick(self, state, cfg, now=None):
        """每 1 秒调用一次。返回本次触发的断电动作列表 [(port_key, reason), ...]。"""
        now = now if now is not None else time.time()
        cutoffs = []
        if state is None or not getattr(state, "connected", False):
            return cutoffs
        ports = getattr(state, "ports", {}) or {}
        prot = getattr(cfg, "protection", None)
        prot_enabled = bool(getattr(prot, "enabled", True)) if prot else True
        low_w = float(getattr(prot, "low_power_w", 15.0)) if prot else 15.0
        low_min = float(getattr(prot, "low_power_minutes", 30.0)) if prot else 30.0
        low_need_sec = low_min * 60

        for pid in range(1, 5):
            ps = ports.get(pid)
            power = float(getattr(ps, "power", 0.0) or 0.0)
            s = self.sessions[pid]
            charging = power > 0

            # 1) stopped 锁定态：必须先观测到功率归零（确认断电生效），
            #    之后再次来电才解锁为新会话，避免断电回落延迟被误判为重新来电
            if s.stopped:
                if not charging:
                    s.cleared = True
                    self._maybe_emit(pid, now, cfg)
                    continue
                if not s.cleared:
                    self._maybe_emit(pid, now, cfg)
                    continue
                s.reset()

            # 2) 会话边沿
            if charging:
                if not s.active:
                    s.active = True
                    s.start_ts = now
                    s.low_since = None
                elapsed = now - s.start_ts

                # 2a) 最大充电时长
                lim = self._limit_minutes(cfg, pid)
                if lim > 0 and elapsed >= lim * 60:
                    self._cutoff(pid, "limit", now, power, elapsed, cutoffs)
                    self._maybe_emit(pid, now, cfg, force=True)
                    continue

                # 2b) 低功率保护（仅 C1/C2）：0 < power < 阈值才计时
                if prot_enabled and pid in PROTECTED_PORTS:
                    if 0 < power < low_w:
                        if s.low_since is None:
                            s.low_since = now
                        elif now - s.low_since >= low_need_sec:
                            self._cutoff(pid, "protect", now, power, elapsed, cutoffs)
                            self._maybe_emit(pid, now, cfg, force=True)
                            continue
                    elif power >= low_w:
                        s.low_since = None
            else:
                # 功率归零且未被我方断电：正常结束本次会话
                if s.active:
                    s.reset()

            self._maybe_emit(pid, now, cfg)

        return cutoffs

    def _cutoff(self, pid, reason, now, power, elapsed, cutoffs):
        s = self.sessions[pid]
        s.stopped = True
        s.reason = reason
        s.active = False
        s.low_since = None
        s.cleared = False
        s.cut_ts = now
        s.cut_power = power
        s.cut_elapsed = int(elapsed or 0)
        port_key = PORT_KEY[pid]
        cutoffs.append((port_key, reason))
        evt = self._record_event(pid, reason, now, power, elapsed)
        pname = {1: "C1", 2: "C2"}.get(pid, port_key)
        title = "已达充电时长上限" if reason == "limit" else "智能充电保护"
        msg = (f"{pname} 已达最大充电时长，自动断电" if reason == "limit"
               else f"{pname} 持续低功率（{power:.1f}W），自动保护断开")
        _LOGGER.warning("自动断电: %s", json.dumps(evt, ensure_ascii=False))
        if self.sse is not None:
            try:
                self.sse.emit("notify", {"level": "warning", "port": pid,
                                         "title": title, "message": msg})
            except Exception:
                pass
        if self.on_cutoff:
            try:
                self.on_cutoff(port_key, reason)
            except Exception as e:
                _LOGGER.error("on_cutoff failed: %s", e)

    def _maybe_emit(self, pid, now, cfg, force=False):
        """状态字符串变化时通过 SSE 推送一次全量守护快照。"""
        if self.sse is None:
            return
        st = self._port_state(pid, self.sessions[pid], cfg, now)
        prev = self._last_state.get(pid)
        if force or prev != st:
            self._last_state[pid] = st
            try:
                snap = self.snapshot(now)
                self.sse.emit("charge", {"server_now": round(now, 2), "ports": snap})
            except Exception:
                pass

    # ───────────────────────── 下发前端 ─────────────────────────
    def snapshot(self, now=None):
        """返回每端口的守护状态，供合并进 /api/status 与 SSE init。"""
        now = now if now is not None else time.time()
        out = {}
        for pid in range(1, 5):
            s = self.sessions[pid]
            out[PORT_KEY[pid]] = self._snapshot_one(pid, s, now)
        return out

    def _snapshot_one(self, pid, s, now):
        # cfg 不在手时只用已有数据计算（limit_sec 由 server 二次填充亦可）
        if s.stopped:
            return {
                "state": STATE_LIMIT if s.reason == "limit" else STATE_PROTECT,
                "active": False,
                "start_ts": None,
                "elapsed": int(s.cut_elapsed or 0),
                "limit_sec": 0,
                "remaining": None,
                "reason": s.reason,
                "low_remain": None,
                "cut_time": time.strftime("%H:%M:%S", time.localtime(s.cut_ts))
                if s.cut_ts else None,
            }
        if not s.active or s.start_ts is None:
            return {
                "state": STATE_IDLE, "active": False, "start_ts": None,
                "elapsed": 0, "limit_sec": 0, "remaining": None,
                "reason": None, "low_remain": None, "cut_time": None,
            }
        return {
            "state": STATE_CHARGING,  # warn 由 server 结合 cfg 二次修正
            "active": True,
            "start_ts": round(s.start_ts, 2),
            "elapsed": int(now - s.start_ts),
            "limit_sec": 0,
            "remaining": None,
            "reason": None,
            "low_remain": None,
            "cut_time": None,
        }

    def snapshot_with_cfg(self, cfg, now=None):
        """带配置的完整快照（含 limit_sec / remaining / warn / 低功率倒计时）。"""
        now = now if now is not None else time.time()
        prot = getattr(cfg, "protection", None)
        low_w = float(getattr(prot, "low_power_w", 15.0)) if prot else 15.0
        low_need = (float(getattr(prot, "low_power_minutes", 30.0)) if prot else 30.0) * 60
        out = {}
        for pid in range(1, 5):
            s = self.sessions[pid]
            base = self._snapshot_one(pid, s, now)
            lim = self._limit_minutes(cfg, pid)
            base["limit_sec"] = lim * 60
            if s.active and s.start_ts is not None and lim > 0:
                elapsed = now - s.start_ts
                remain = lim * 60 - elapsed
                base["elapsed"] = int(elapsed)
                base["remaining"] = max(0, int(remain))
                if remain <= WARN_REMAIN_SEC or elapsed >= lim * 60 * WARN_RATIO:
                    base["state"] = STATE_WARN
            if s.active and s.low_since is not None:
                base["low_remain"] = max(0, int(low_need - (now - s.low_since)))
            out[PORT_KEY[pid]] = base
        return out
