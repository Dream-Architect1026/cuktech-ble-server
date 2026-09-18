<div align="center">

# CUKTECH 10 Ultra · BLE Local Control

**Direct BLE link · Real-time dashboard · Local charge history · XiaoAi voice control**

[![Python](https://img.shields.io/badge/Python-3.9%2B-blue?logo=python&logoColor=white)](https://www.python.org/)
[![Platform](https://img.shields.io/badge/Platform-Windows%20%7C%20Linux-0abf81)](#requirements)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

**[中文](README.md)**

</div>

Connects to the CUKTECH 10 Ultra charger over Bluetooth Low Energy (BLE) and provides a real-time data-dashboard
web console on your computer. It can also link to Bemfa Cloud for XiaoAi voice control. Data stays local; the server
listens on `127.0.0.1` by default.

![Dashboard](docs/dashboard.png)

<p align="center"><em>Dashboard: large total-power gauge, animated power bar and four KPIs with smooth updates</em></p>

## Features

- **Real-time dashboard**: large total-power gauge, animated power bar, KPI cards with smooth updates
- **Real-time power chart**: ~1 frame/sec; 1m / 5m / 10m / 30m / 1h; wheel zoom, drag pan, hover W·V·A, click inspector
- **Port monitoring**: independent switches for C1 / C2 / C3 / USB-A, live voltage / current / power, duration, protocol, per-port detail
- **Local charge history**: sessions in SQLite, energy / duration / peak stats, CSV export
- **Smart management**: max charge duration, hardware countdown, scheduled tasks, trickle protection, power alarms
- **Voice control**: Bemfa Cloud with XiaoAi via Mi Home; also MQTT / Home Assistant
- **Themes & languages**: dark glassmorphism UI, Chinese / English, PC & mobile

## Showcase

### Real-time power chart

BLE pushes about one frame per second and the main chart scrolls live. Five ranges (1m / 5m / 10m / 30m / 1h),
mouse-centered wheel zoom, drag to review history, and double-click or button to return to live.

| 1 minute (live) | 5 minute range |
| :---: | :---: |
| ![](docs/chart-live.png) | ![](docs/chart-5m.png) |

Hover the chart for a frosted tooltip listing power, voltage and current for every port at that instant; click for an inspector card with the full reading, and on-the-hour current is marked with a pulsing dot.

| Hover W·V·A | Click inspector |
| :---: | :---: |
| ![](docs/chart-tooltip.png) | ![](docs/chart-inspector.png) |

### Port monitoring & per-port detail

Port cards show the switches, voltage / current / power, this-session duration and protocol for C1 / C2 / C3 / USB-A.

![Port monitoring](docs/ports.png)

Click any port to open its detail: four large gauges (voltage / current / power / protocol) on top, a dedicated V·A·W live chart below, and direct PD / PPS / UFCS switching.

![Port detail](docs/port-detail.png)

### Charge history

Each charge is recorded as a session in local SQLite with energy, duration, average and peak power; supports daily query, pagination and CSV export.

![Charge sessions](docs/sessions.png)

Open a session to review its full power curve and KPIs, including any protocol switch along the way.

![Session detail](docs/session-detail.png)

### Scheduled tasks

The custom task bar manages scheduled on/off: each task shows time, port and action, with pause / resume / delete, and a quick-add form at the bottom (up to 50 tasks).

![Scheduled tasks](docs/schedule.png)

### Config

The config page manages BLE / Bemfa / MQTT settings, auto-start and daily restart, max charge duration, trickle protection and data retention, then restarts automatically on save.

![Config](docs/settings.png)

### Mobile

The UI is responsive in mobile browsers for checking power and controlling ports.

<p align="center">
<img src="docs/mobile.png" width="320" alt="mobile">
</p>

## Quick start

**1. Get the credentials (MAC / Token / BLE Key)**

```bash
git clone https://github.com/PiotrMachowski/Xiaomi-cloud-tokens-extractor.git
cd Xiaomi-cloud-tokens-extractor
pip install -r requirements.txt
python token_extractor.py
```

Log in with the Mi account bound to the charger (region `cn`) and note the MAC, Token, BLE Key.

**2. Install**

```bash
git clone https://github.com/Dream-Architect1026/cuktech-ble-server.git
cd cuktech-ble-server
python -m venv venv
# Windows
.\venv\Scripts\python.exe -m pip install -r requirements.txt
# Linux
# ./venv/bin/pip install -r requirements.txt
```

**3. Configure**

```bash
cp config.yaml.example config.yaml
```

Edit `config.yaml`:

```yaml
ble:
  mac: "XX:XX:XX:XX:XX:XX"
  token: "<your token>"
  ble_key: "<your ble key>"
```

**4. (optional) XiaoAi voice control**

Register at [Bemfa](https://cloud.bemfa.com/), copy your private key, and set:

```yaml
bemfa:
  enabled: true
  uid: "<your bemfa key>"
```

Then link **Mi Home → Me → Third-party devices → Add → Bemfa**.

## Running

```powershell
.\venv\Scripts\pythonw.exe ha_server.py   # Windows background
.\venv\Scripts\python.exe ha_server.py    # debug
# Linux: ./venv/bin/python ha_server.py
```

Open <http://127.0.0.1:8080/> (config at `/config.html`).
On Windows you can also double-click `quick_start.vbs` to start in the background and open the browser.

## Requirements

CUKTECH 10 Ultra (model `njcuk.fitting.ad1204`, firmware tested `2.1.2_0073`), BLE 4.0+ adapter, Python 3.9+.

## Tech stack

Python · aiohttp · bleak · paho-mqtt · PyYAML · SQLite; vanilla ES2020 · Chart.js · SSE · glassmorphism CSS · zh/en i18n.

## Acknowledgments

- Built on [**kairui1108/cuktech-ble-server**](https://github.com/kairui1108/cuktech-ble-server) — special thanks to the original author
- BLE protocol reference: [**zhyzhaogit/cuktech-ble-controller**](https://github.com/zhyzhaogit/cuktech-ble-controller)
- Protocol detection reference: [**zuyan9/ha-cuk-ble**](https://github.com/zuyan9/ha-cuk-ble)
- Token extraction: [**PiotrMachowski/Xiaomi-cloud-tokens-extractor**](https://github.com/PiotrMachowski/Xiaomi-cloud-tokens-extractor)
- BLE library: [**hbldh/bleak**](https://github.com/hbldh/bleak)
- MQTT client: [**Eclipse Paho**](https://eclipse.dev/paho/)

## Disclaimer

A personal learning / self-use project, not affiliated with CUKTECH or Xiaomi. Keep the credentials in `config.yaml` private.

## License

[MIT](LICENSE)
