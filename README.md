<div align="center">

# 酷态科 10 号 · BLE 本地控制服务

**蓝牙直连充电器 · 实时数据大屏 · 本地充电记录 · 巴法云 / 小爱同学语音控制**

[![Python](https://img.shields.io/badge/Python-3.9%2B-blue?logo=python&logoColor=white)](https://www.python.org/)
[![Platform](https://img.shields.io/badge/Platform-Windows%20%7C%20Linux-0abf81)](#-系统要求)
[![License](https://img.shields.io/badge/License-MIT-green)](#-许可证)
[![PRs](https://img.shields.io/badge/PRs-welcome-brightgreen)](#)

</div>

在 PC / 树莓派上常驻的充电器控制服务：通过**低功耗蓝牙（BLE）本地直连**酷态科 10 号充电器，
无需云端中转即可读取四路端口的实时电压 / 电流 / 功率与充电协议，提供一套**科技风数据大屏 Web 控制台**，
并可接入 **巴法云（MQTT）**，经米家「其他平台设备」绑定后用**小爱同学语音控制**各端口开关。

> 数据全程在本地蓝牙链路与本机数据库之间流转，默认仅监听 `127.0.0.1`，不做外网暴露。

![实时数据大屏](docs/dashboard.png)

---

## ✨ 功能特性

### 1. 实时数据大屏

- Hero 区**大数字总功率仪表** + `LIVE` 标识，0–140W **流动功率条**实时填充
- 四项 KPI 同屏：最高电压 / 实时电流 / 活跃端口 / 负载率
- 等宽数字 + 缓动插值，数值跳变平滑不抖动
- 顶栏 BLE / MQTT / Bemfa 三路连接状态徽章，悬停查看链路质量

### 2. 实时功率曲线

- BLE 硬件约 **1 秒 1 帧**，SSE 直推主曲线，灵敏跟手
- 时间区间：**1 分钟 / 5 分钟 / 10 分钟 / 30 分钟 / 1 小时**
- **滚轮以鼠标为中心缩放 · 按住拖拽平移 · 双击 / 按钮回到实时**
- 悬停玻璃 tooltip，同时显示该时刻各端口 **W · V · A**
- 单击弹出磨砂玻璃**详情卡**；整点电流以呼吸脉冲点标记

| 悬停 W·V·A | 单击详情卡 |
|:---:|:---:|
| ![tooltip](docs/chart-tooltip.png) | ![inspector](docs/chart-inspector.png) |

![5 分钟曲线](docs/chart-5m.png)

### 3. 端口监控

- C1 / C2 / C3 / USB-A 四路独立**开关**与实时读数
- 每路显示电压 / 电流 / 功率、**本次充电时长**、实时充电协议（PD / PPS / QC 等）
- 点击进入端口详情弹窗，含单口实时曲线与协议切换

![端口监控](docs/ports.png)

### 4. 充电记录（本地存储）

- 充电会话写入本机 **SQLite（WAL）**，关闭服务时自动 flush + checkpoint
- 会话列表、电量（Wh）、平均 / 峰值功率、时长、协议，按日查询与分页
- 支持**会话 CSV / 日报 CSV 导出**；数据保留期可配置（默认 365 天）
- 单次会话可展开查看逐点功率曲线与完整 KPI

| 充电记录 | 单次会话详情 |
|:---:|:---:|
| ![充电记录](docs/sessions.png) | ![会话详情](docs/session-detail.png) |

### 5. 智能充电管理

- **端口最大充电时长**：达到上限自动断电（0 = 不限）
- **硬件倒计时**：秒级平滑递减，归零自动关端口
- **定时任务**：定时开 / 关端口（最多 5 个）
- **智能充电保护**：低功率持续达到阈值自动硬断开（可豁免指定端口）
- **功率告警阈值** + 浏览器 / 系统通知

### 6. 语音控制（巴法云 → 小爱同学）

- 接入巴法云后自动注册 5 个开关设备：C口1 / C口2 / C口3 / USB-A / 蓝牙
- 米家 App「其他平台设备 → 巴法」绑定后，对小爱同学说
  **「打开酷态科C口1」「关闭酷态科USB-A」** 即可
- 同时支持标准 MQTT，可接入 Home Assistant

### 7. 主题与多语言

- 深色科技风、磨砂玻璃质感，多套主题 + 自定义强调色
- **中文 / English** 双语，界面语言即时切换
- PC 宽屏高效布局，移动端自适应

![移动端](docs/mobile.png)

---

## 🧰 系统要求

- **硬件**：酷态科 10 号充电器（型号 `njcuk.fitting.ad1204`，固件实测 `2.1.2_0073`）
- **蓝牙**：电脑 / 树莓派自带或外接 BLE 4.0+ 适配器（Windows 使用内置蓝牙即可）
- **系统**：Windows 10/11（本增强实测）或 Linux（上游官方验证，bleak 跨平台）
- **软件**：Python 3.9+

---

## 🚀 安装与配置

### 第 1 步：获取设备三参数（MAC / Token / BLE Key）

使用开源工具 [**Xiaomi-cloud-tokens-extractor**](https://github.com/PiotrMachowski/Xiaomi-cloud-tokens-extractor)：

```bash
git clone https://github.com/PiotrMachowski/Xiaomi-cloud-tokens-extractor.git
cd Xiaomi-cloud-tokens-extractor
pip install -r requirements.txt
python token_extractor.py
```

按提示登录**绑定了充电器的小米账号**（服务器地区输入 `cn`），在设备列表中找到充电器，
记下 **MAC、Token、BLE Key** 三串值。密码仅在你本机输入，不会经过任何第三方。

> 也可在本服务启动后打开 `/config.html`，点「小米云自动获取」用米家 App 扫码自动填入。

### 第 2 步：安装本服务

```bash
git clone https://github.com/NJ-CODE101/cuktech-ble-server.git
cd cuktech-ble-server
python -m venv venv
# Windows
.\venv\Scripts\python.exe -m pip install -r requirements.txt
# Linux
# ./venv/bin/pip install -r requirements.txt
```

### 第 3 步：填写配置

```powershell
Copy-Item config.yaml.example config.yaml   # Windows
# cp config.yaml.example config.yaml        # Linux
```

编辑 `config.yaml`，填入第 1 步拿到的三参数：

```yaml
ble:
  mac: "XX:XX:XX:XX:XX:XX"
  token: "<你的 Token>"
  ble_key: "<你的 BLE Key>"
```

### 第 4 步（可选）：接入巴法云 / 小爱同学

1. 注册并登录 [巴法云](https://cloud.bemfa.com/)，复制控制台首页的**用户私钥**；
2. 在 `config.yaml` 中：
   ```yaml
   bemfa:
     enabled: true
     uid: "<你的巴法云私钥>"
   ```
3. 打开**米家 App → 我的 → 其他平台设备 → 添加 → 巴法**，输入巴法云账号密码完成绑定；
4. 设备同步后即可对小爱同学语音控制。

---

## ▶️ 启动方式

**Windows 推荐：一键启动（后台 + 自动开网页）**

双击桌面快捷方式（或项目内 `quick_start.vbs`）：自动探测端口 → 后台静默起服 → 自动打开浏览器，
已在运行则只开页面、不重复启动。

**手动启动**

```powershell
# Windows（后台静默）
.\venv\Scripts\pythonw.exe ha_server.py
# 调试（带控制台输出）
.\venv\Scripts\python.exe ha_server.py
```
```bash
# Linux
./venv/bin/python ha_server.py
```

启动后访问：

- 首页控制台：<http://127.0.0.1:8080/>
- 系统配置页：<http://127.0.0.1:8080/config.html>

> 可选：在配置页「服务管理」开启**开机自启动**（写入当前用户注册表 Run 键，免管理员）。
> `server.idle_shutdown_seconds` 可设置「所有网页关闭后 N 秒自动退出」，`0` 为永久常驻。

---

## 📁 目录结构

```
cuktech-ble-server/
├── ha_server.py          # 后端主程序：aiohttp 路由、SSE、后台守护
├── ble_manager.py        # BLE 连接、MiOT 认证、指令收发
├── config.py             # 配置加载与清洗
├── state.py / state_protocol_v2.py   # 状态模型 / 协议识别
├── history.py            # 充电会话与电量统计（SQLite）
├── charge_guard.py       # 最大时长 + 低功率保护引擎
├── automation.py         # 定时任务 / 通知
├── bemfa_client.py       # 巴法云客户端
├── xiaomi_cloud.py       # 小米云登录 / 自动获取参数
├── config.yaml.example   # 配置模板（config.yaml 已被 gitignore）
├── requirements.txt
├── web/                  # 前端（原生 HTML/CSS/JS + Chart.js）
│   ├── index.html / config.html
│   └── static/  app.js · index.css · locales(zh/en) · plugin_imgs
├── src/                  # 可复用 BLE 协议库
├── tests/                # 单元 / 集成测试
├── docker/ systemd/      # 容器与 Linux 部署
└── docs/                 # README 功能截图
```

## 🔌 HTTP 接口（摘要）

| 方法 | 路径 | 作用 |
|---|---|---|
| GET | `/api/status` | 全量状态 |
| GET | `/api/events` | SSE 实时推送 |
| GET | `/api/chart` | 功率曲线数据 |
| POST | `/api/port` | 端口开 / 关 |
| GET | `/api/sessions`、`/api/sessions/{id}/points` | 充电会话与逐点数据 |
| GET | `/api/export/{port}` | CSV 导出 |
| GET/POST | `/api/config` | 读取 / 保存配置 |
| * | `/api/automation/*`、`/api/bemfa`、`/api/xiaomi/*` | 自动化 / 云接入 |

---

## 🛠 技术栈

**后端**：Python · aiohttp · bleak（BLE）· paho-mqtt · cryptography · PyYAML · SQLite
**前端**：原生 ES2020 · Chart.js · SSE · CSS 玻璃拟态 · 中英文 i18n

## 🗺 路线图

- [ ] 更多酷态科 / 米家 BLE 充电器型号适配
- [ ] 多设备同时管理
- [ ] 充电效率与温度统计增强

---

## 🙏 致谢

- 本项目在 [**kairui1108/cuktech-ble-server**](https://github.com/kairui1108/cuktech-ble-server) 基础上做数据大屏与交互增强，感谢原作者。
- 设备参数获取：[**PiotrMachowski/Xiaomi-cloud-tokens-extractor**](https://github.com/PiotrMachowski/Xiaomi-cloud-tokens-extractor)。

## ⚠️ 免责声明

本项目为个人学习与自用工具，与 CUKTECH / 小米官方无关。蓝牙控制存在风险，请自行评估；
因使用本项目造成的设备或数据损失，作者不承担责任。请妥善保管 `config.yaml` 中的设备凭据，切勿公开。

## 📄 许可证

[MIT License](LICENSE)
