"""CUKTECH BLE Server - Configuration management.

Supports YAML config file and environment variables.
YAML file takes precedence over environment variables.
"""
import logging
import os
import sys
from dataclasses import dataclass, field
from pathlib import Path

_LOGGER = logging.getLogger(__name__)

LOG_LEVELS = {
    "debug": logging.DEBUG,
    "info": logging.INFO,
    "warning": logging.WARNING,
    "error": logging.ERROR,
}


def _load_yaml_config():
    """Load config from YAML file if exists."""
    config_path = Path(os.environ.get("CUKTECH_CONFIG_PATH", str(Path(__file__).parent / "config.yaml")))
    if not config_path.exists():
        config_path = Path.cwd() / "config.yaml"
    if not config_path.exists():
        return {}
    try:
        import yaml
        # Windows 下 open() 默认 GBK，读 UTF-8 的 config.yaml 会抛
        # UnicodeDecodeError（服务启动即崩）。显式用 UTF-8 读取，与系统
        # locale/环境变量无关。
        with open(config_path, encoding="utf-8-sig") as f:
            return yaml.safe_load(f) or {}
    except ImportError:
        return {}


@dataclass
class BLEConfig:
    mac: str = ""
    token: str = ""
    ble_key: str = ""
    scan_timeout: int = 10

    def __post_init__(self):
        if not self.mac or self.mac == "XX:XX:XX:XX:XX:XX":
            _LOGGER.warning("CUKTECH_DEVICE_MAC 未配置，BLE 连接不可用。可通过 config.html 配置或设置环境变量")
        if not self.token:
            _LOGGER.warning("CUKTECH_DEVICE_TOKEN 未配置，BLE 连接不可用。可通过 config.html 配置或设置环境变量")


@dataclass
class MQTTConfig:
    enabled: bool = False
    host: str = "localhost"
    port: int = 1883
    username: str = ""
    password: str = ""
    keepalive: int = 60
    topic_prefix: str = "cuktech/charger"


@dataclass
class ServerConfig:
    host: str = "0.0.0.0"
    port: int = field(default_factory=lambda: 18199 if sys.platform == "win32" else 8199)
    command_timeout: float = 10.0
    settings_refresh_interval: float = 10.0
    log_level: str = "info"
    history_retention_days: int = 2
    history_db_path: str = "port_history.db"
    reconnect_base_delay: float = 1.0
    reconnect_max_delay: float = 300.0
    idle_shutdown_seconds: int = 0  # 0=常驻; N=网页全部关闭 N 秒后自动退出服务


@dataclass
class BemfaConfig:
    enabled: bool = False
    uid: str = ""
    name_c1: str = "C口1开关"
    name_c2: str = "C口2开关"
    name_c3: str = "C口3开关"
    name_a: str = "USB-A开关"
    name_ble: str = "蓝牙开关"
    modified: bool = False  # set true when names change, triggers topic delete+recreate on next start


@dataclass
class ServiceConfig:
    """服务管理：开机自启、每日定时重启。"""
    auto_start: bool = True               # 开机（登录）后自动后台常驻
    daily_restart_enabled: bool = True    # 每日定时重启开关
    daily_restart_time: str = "06:30"     # HH:MM


@dataclass
class ChargeLimitConfig:
    """各端口最大充电时长（分钟），0 表示不限制。"""
    c1: int = 120
    c2: int = 120
    c3: int = 120
    a: int = 120


@dataclass
class ProtectionConfig:
    """智能充电保护：仅 C1/C2 生效。持续低功率自动断电。"""
    enabled: bool = True
    low_power_w: float = 15.0       # 低功率触发阈值（W）
    low_power_minutes: int = 30     # 低功率持续时长（分钟）


@dataclass
class Config:
    ble: BLEConfig = field(default_factory=BLEConfig)
    mqtt: MQTTConfig = field(default_factory=MQTTConfig)
    server: ServerConfig = field(default_factory=ServerConfig)
    bemfa: BemfaConfig = field(default_factory=BemfaConfig)
    service: ServiceConfig = field(default_factory=ServiceConfig)
    charge_limit: ChargeLimitConfig = field(default_factory=ChargeLimitConfig)
    protection: ProtectionConfig = field(default_factory=ProtectionConfig)

    @property
    def topic_port(self):
        return f"{self.mqtt.topic_prefix}/port"

    @property
    def topic_settings(self):
        return f"{self.mqtt.topic_prefix}/settings"

    @property
    def topic_status(self):
        return f"{self.mqtt.topic_prefix}/status"

    @property
    def topic_charge_event(self):
        return f"{self.mqtt.topic_prefix}/charge_event"


def load_config() -> Config:
    """Load config from YAML file, then override with environment variables."""
    ycfg = _load_yaml_config()

    ble_cfg = ycfg.get("ble", {})
    mqtt_cfg = ycfg.get("mqtt", {})
    server_cfg = ycfg.get("server", {})

    ble = BLEConfig(
        mac=os.environ.get("CUKTECH_DEVICE_MAC", ble_cfg.get("mac", "")),
        token=os.environ.get("CUKTECH_DEVICE_TOKEN", ble_cfg.get("token", "")),
        ble_key=os.environ.get("CUKTECH_DEVICE_BLE_KEY", ble_cfg.get("ble_key", "")),
        scan_timeout=ble_cfg.get("scan_timeout", 10),
    )

    try:
        mqtt_port = int(os.environ.get("MQTT_PORT", mqtt_cfg.get("port", 1883)))
    except (ValueError, TypeError) as e:
        raise ValueError(f"MQTT port must be an integer: {e}")

    _mqtt_enabled_env = os.environ.get("MQTT_ENABLED", "").lower()
    mqtt_enabled = _mqtt_enabled_env in ("1", "true", "yes") or mqtt_cfg.get("enabled", False)

    mqtt = MQTTConfig(
        enabled=mqtt_enabled,
        host=os.environ.get("MQTT_HOST", mqtt_cfg.get("host", "localhost")),
        port=mqtt_port,
        username=os.environ.get("MQTT_USER", mqtt_cfg.get("username", "")),
        password=os.environ.get("MQTT_PASS", mqtt_cfg.get("password", "")),
        keepalive=mqtt_cfg.get("keepalive", 60),
        topic_prefix=os.environ.get("MQTT_TOPIC_PREFIX", mqtt_cfg.get("topic_prefix", "cuktech/charger")),
    )

    try:
        history_retention = int(os.environ.get("CUKTECH_HISTORY_RETENTION_DAYS", server_cfg.get("history_retention_days", 2)))
    except (ValueError, TypeError) as e:
        raise ValueError(f"History retention days must be an integer: {e}")
    try:
        reconnect_base_delay = float(server_cfg.get("reconnect_base_delay", 1.0))
    except (ValueError, TypeError) as e:
        raise ValueError(f"Reconnect base delay must be a number: {e}")
    try:
        reconnect_max_delay = float(server_cfg.get("reconnect_max_delay", 300.0))
    except (ValueError, TypeError) as e:
        raise ValueError(f"Reconnect max delay must be a number: {e}")

    server = ServerConfig(
        host=server_cfg.get("host", "0.0.0.0"),
        port=int(os.environ.get("CUKTECH_SERVER_PORT", server_cfg.get("port", 18199 if sys.platform == "win32" else 8199))),
        command_timeout=server_cfg.get("command_timeout", 10.0),
        settings_refresh_interval=server_cfg.get("settings_refresh_interval", 60.0),
        log_level=os.environ.get("CUKTECH_LOG_LEVEL", server_cfg.get("log_level", "info")),
        history_retention_days=history_retention,
        history_db_path=os.environ.get("CUKTECH_HISTORY_DB_PATH", server_cfg.get("history_db_path", "port_history.db")),
        reconnect_base_delay=reconnect_base_delay,
        reconnect_max_delay=reconnect_max_delay,
        idle_shutdown_seconds=int(server_cfg.get("idle_shutdown_seconds") or 0),
    )

    bemfa_cfg = ycfg.get("bemfa", {})
    bemfa_enabled_env = os.environ.get("BEMFA_ENABLED", "").lower()
    bemfa_enabled = bemfa_enabled_env in ("1", "true", "yes") or bemfa_cfg.get("enabled", False)
    bemfa = BemfaConfig(
        enabled=bemfa_enabled,
        uid=os.environ.get("BEMFA_UID", bemfa_cfg.get("uid", "")),
        name_c1=bemfa_cfg.get("name_c1", "C口1开关"),
        name_c2=bemfa_cfg.get("name_c2", "C口2开关"),
        name_c3=bemfa_cfg.get("name_c3", "C口3开关"),
        name_a=bemfa_cfg.get("name_a", "USB-A开关"),
        name_ble=bemfa_cfg.get("name_ble", "蓝牙开关"),
        modified=bemfa_cfg.get("modified", False),
    )

    # ── 服务管理 / 最大充电时长 / 智能保护（PRD 新增，均带默认值与类型清洗）──
    def _as_bool(v, default=False):
        if isinstance(v, bool):
            return v
        if v is None:
            return default
        return str(v).strip().lower() in ("1", "true", "yes", "on", "开启")

    def _as_int(v, default, minimum=0, maximum=None):
        try:
            iv = int(float(v))
        except (ValueError, TypeError):
            return default
        if minimum is not None:
            iv = max(minimum, iv)
        if maximum is not None:
            iv = min(maximum, iv)
        return iv

    def _as_float(v, default, minimum=0.0):
        try:
            fv = float(v)
        except (ValueError, TypeError):
            return default
        return max(minimum, fv)

    svc_cfg = ycfg.get("service", {}) or {}
    import re as _re
    drt = str(svc_cfg.get("daily_restart_time", "06:30") or "06:30").strip()
    if not _re.match(r"^\d{2}:\d{2}$", drt):
        drt = "06:30"
    service = ServiceConfig(
        auto_start=_as_bool(svc_cfg.get("auto_start", True), True),
        daily_restart_enabled=_as_bool(svc_cfg.get("daily_restart_enabled", True), True),
        daily_restart_time=drt,
    )

    limit_cfg = ycfg.get("charge_limit", {}) or {}
    charge_limit = ChargeLimitConfig(
        c1=_as_int(limit_cfg.get("c1", 120), 120),
        c2=_as_int(limit_cfg.get("c2", 120), 120),
        c3=_as_int(limit_cfg.get("c3", 120), 120),
        a=_as_int(limit_cfg.get("a", 120), 120),
    )

    prot_cfg = ycfg.get("protection", {}) or {}
    protection = ProtectionConfig(
        enabled=_as_bool(prot_cfg.get("enabled", True), True),
        low_power_w=_as_float(prot_cfg.get("low_power_w", 15.0), 15.0),
        low_power_minutes=_as_int(prot_cfg.get("low_power_minutes", 30), 30),
    )

    return Config(ble=ble, mqtt=mqtt, server=server, bemfa=bemfa,
                  service=service, charge_limit=charge_limit, protection=protection)
