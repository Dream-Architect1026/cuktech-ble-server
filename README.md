<div align="center">

# 酷态科 10 Ultra · BLE 本地控制

**蓝牙直连 · 实时数据大屏 · 本地充电记录 · 超级小爱语音控制**

<p align="center"><sub>7B 贾维斯 · 个人能源消费数采组件</sub></p>

[![Python](https://img.shields.io/badge/Python-3.9%2B-blue?logo=python&logoColor=white)](https://www.python.org/)
[![Platform](https://img.shields.io/badge/Platform-Windows%20%7C%20Linux-0abf81)](#系统要求)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

</div>

<p align="center">English: <a href="README.en.md">README.en.md</a></p>

通过低功耗蓝牙（BLE）本地直连酷态科 10 Ultra 充电器，在电脑上提供实时数据大屏 Web 控制台，
并可接入巴法云，用小爱同学语音控制各端口开关。数据仅在本地流转，默认只监听 `127.0.0.1`。

![实时数据大屏](docs/dashboard.png)

<p align="center"><em>首页数据大屏：大数字总功率仪表、流动功率条与四项 KPI，数值平滑刷新</em></p>

## 功能

- **实时数据大屏**：大数字总功率仪表、流动功率条、KPI 卡片，数值平滑刷新
- **实时功率曲线**：约 1 秒 1 帧；1 分 / 5 分 / 10 分 / 30 分 / 1 小时；滚轮缩放、拖拽平移、悬停 W·V·A、点击详情
- **端口监控**：C1 / C2 / C3 / USB-A 独立开关，实时电压 / 电流 / 功率、充电时长、协议识别，单端口详情
- **本地充电记录**：会话存入 SQLite，电量 / 时长 / 峰值统计，CSV 导出
- **智能管理**：最大充电时长、硬件倒计时、定时任务、低功率保护、功率告警
- **语音控制**：接入巴法云，经米家绑定后用小爱同学控制；同时支持 MQTT / Home Assistant
- **主题与多语言**：深色科技风磨砂玻璃，中英文，PC 宽屏适配

## 界面展示

### 实时功率曲线

蓝牙硬件约 1 秒推送 1 帧，主曲线随数据实时滚动；提供 1 分 / 5 分 / 10 分 / 30 分 / 1 小时五档区间，
滚轮以鼠标为中心缩放，按住拖拽回看历史，双击或按钮回到实时。

| 1 分钟（实时） | 5 分钟区间 |
| :---: | :---: |
| ![](docs/chart-live.png) | ![](docs/chart-5m.png) |

将鼠标移到曲线上，磨砂玻璃提示框同时列出该时刻各端口的功率、电压与电流；单击则弹出详情卡给出该点完整读数，整点电流以呼吸点标记。

| 悬停查看 W·V·A | 单击查看详情卡 |
| :---: | :---: |
| ![](docs/chart-tooltip.png) | ![](docs/chart-inspector.png) |

### 端口监控与单端口详情

端口卡实时显示四路 C1 / C2 / C3 / USB-A 的开关、电压 / 电流 / 功率、本次充电时长与充电协议。

![端口监控](docs/ports.png)

点击任意端口打开详情：顶部四个大数字仪表（电压 / 电流 / 功率 / 协议），下方是该端口独立的 V·A·W 实时曲线，并可直接切换 PD / PPS / UFCS 协议。

![单端口详情](docs/port-detail.png)

### 充电记录

每次充电自动生成会话并写入本地 SQLite，记录电量、时长、平均与峰值功率，支持按日查询、分页与 CSV 导出。

![充电记录](docs/sessions.png)

点开单次会话可回看整段充电的功率曲线与完整 KPI，包括中途的协议切换。

![会话详情](docs/session-detail.png)

### 定时控制

自定义任务栏集中管理定时开 / 关：每条任务显示时间、端口与动作，可随时暂停、启用或删除，底部表单快速添加，最多 50 条。

![定时控制](docs/schedule.png)

### 系统配置

配置页可视化管理 BLE / 巴法云 / MQTT 参数、开机自启与每日重启、端口最大充电时长、智能充电保护和数据保留期，保存后自动重启生效。

![系统配置](docs/settings.png)

## 快速开始

**1. 获取设备参数（MAC / Token / BLE Key）**

```bash
git clone https://github.com/PiotrMachowski/Xiaomi-cloud-tokens-extractor.git
cd Xiaomi-cloud-tokens-extractor
pip install -r requirements.txt
python token_extractor.py
```

登录绑定充电器的小米账号（地区 `cn`），记下 MAC、Token、BLE Key。

**2. 安装本服务**

```bash
git clone https://github.com/Dream-Architect1026/cuktech-ble-server.git
cd cuktech-ble-server
python -m venv venv
# Windows
.\venv\Scripts\python.exe -m pip install -r requirements.txt
# Linux
# ./venv/bin/pip install -r requirements.txt
```

**3. 填写配置**

```bash
cp config.yaml.example config.yaml   # Windows 用 Copy-Item
```

编辑 `config.yaml`：

```yaml
ble:
  mac: "XX:XX:XX:XX:XX:XX"
  token: "<你的 Token>"
  ble_key: "<你的 BLE Key>"
```

**4.（可选）接入小爱同学**

在 [巴法云](https://cloud.bemfa.com/) 注册并复制用户私钥，填入：

```yaml
bemfa:
  enabled: true
  uid: "<你的巴法云私钥>"
```

然后在米家 App **我的 → 其他平台设备 → 添加 → 巴法** 完成绑定，即可语音控制。

## 启动

```powershell
.\venv\Scripts\pythonw.exe ha_server.py   # Windows 后台
.\venv\Scripts\python.exe ha_server.py    # 调试
# Linux: ./venv/bin/python ha_server.py
```

启动后打开 <http://127.0.0.1:8080/>（配置页 `/config.html`）。
Windows 也可双击 `quick_start.vbs` 一键后台启动并打开浏览器。

## 系统要求

酷态科 10 Ultra（型号 `njcuk.fitting.ad1204`，固件实测 `2.1.2_0073`）、BLE 4.0+ 适配器、Python 3.9+。

## 技术栈

Python · aiohttp · bleak · paho-mqtt · PyYAML · SQLite；原生 ES2020 · Chart.js · SSE · 玻璃拟态 CSS · 中英文 i18n。

## 致谢

- 本项目基于 [**kairui1108/cuktech-ble-server**](https://github.com/kairui1108/cuktech-ble-server) 二次开发，特别感谢原作者
- BLE 协议参考：[**zhyzhaogit/cuktech-ble-controller**](https://github.com/zhyzhaogit/cuktech-ble-controller)
- 协议检测参考：[**zuyan9/ha-cuk-ble**](https://github.com/zuyan9/ha-cuk-ble)
- 小米设备 Token 提取：[**PiotrMachowski/Xiaomi-cloud-tokens-extractor**](https://github.com/PiotrMachowski/Xiaomi-cloud-tokens-extractor)
- BLE 通信库：[**hbldh/bleak**](https://github.com/hbldh/bleak)
- MQTT 客户端：[**Eclipse Paho**](https://eclipse.dev/paho/)

## 免责声明

个人学习自用项目，与 CUKTECH / 小米官方无关。请妥善保管 `config.yaml` 中的凭据，切勿公开。

## 许可证

[MIT](LICENSE)
