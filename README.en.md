<div align="center">

# CUKTECH 10 · BLE Local Control Server

**Direct BLE charger link · Real-time data dashboard · Local charge history · Bemfa / XiaoAi voice control**

[![Python](https://img.shields.io/badge/Python-3.9%2B-blue?logo=python&logoColor=white)](https://www.python.org/)
[![Platform](https://img.shields.io/badge/Platform-Windows%20%7C%20Linux-0abf81)](#requirements)
[![License](https://img.shields.io/badge/License-MIT-green)](#license)
[![PRs](https://img.shields.io/badge/PRs-welcome-brightgreen)](#)

**[中文](README.md)**

</div>

A local server that connects to the CUKTECH 10 charger over **Bluetooth Low Energy (BLE)** — no cloud relay
required — to read real-time voltage / current / power and charging protocols for all four ports. It ships with a
sci-fi **data-dashboard web console**, and can connect to **Bemfa Cloud (MQTT)** so you can control the ports with
**XiaoAi voice assistants** after linking it in the Mi Home app.

> Data stays between the local BLE link and the on-device database; the server listens on `127.0.0.1` by default and is not exposed to the internet.

![Dashboard](docs/dashboard.png)

---

## Features

### 1. Real-time data dashboard
- Hero **large total-power gauge** with a `LIVE` indicator and an animated **0–140W power bar**
- Four KPIs: max voltage / real-time current / active ports / load rate
- Monospaced digits with eased tweening for smooth value changes
- Top badges for BLE / MQTT / Bemfa link status (hover for link quality)

### 2. Real-time power chart
- About **1 frame per second** from BLE hardware, pushed to the main chart over SSE
- Ranges: **1m / 5m / 10m / 30m / 1h**
- **Mouse-centered wheel zoom · drag to pan · double-click / button to return to live**
- Hover a glass tooltip showing **W · V · A** for every port
- Click for a frosted-glass **inspector card**; on-the-hour current is marked with a pulsing dot

| Hover W·V·A | Click inspector |
|:---:|:---:|
| ![tooltip](docs/chart-tooltip.png) | ![inspector](docs/chart-inspector.png) |

![5m chart](docs/chart-5m.png)

### 3. Port monitoring
- Independent **switches** and live readings for C1 / C2 / C3 / USB-A
- Voltage / current / power, **this-session duration**, live protocol (PD / PPS / QC, …)
- Click for a port detail modal with a per-port live chart and protocol switching

![Ports](docs/ports.png)

### 4. Charge history (local storage)
- Sessions stored in local **SQLite (WAL)**; flush + checkpoint on shutdown
- Session list, energy (Wh), avg / peak power, duration, protocol; daily query & pagination
- **Session CSV / daily report CSV export**; configurable retention (365 days by default)
- Expand a session for the point-by-point power curve and full KPIs

| Sessions | Session detail |
|:---:|:---:|
| ![sessions](docs/sessions.png) | ![session detail](docs/session-detail.png) |

### 5. Smart charging management
- **Max charge duration per port** (auto cut-off; 0 = unlimited)
- **Hardware countdown** with smooth per-second decay
- **Scheduled tasks** to turn ports on/off (up to 5)
- **Trickle-charge protection**: hard cut-off after sustained low power (per-port exemptions)
- **Power alarm thresholds** + browser / system notifications

### 6. Voice control (Bemfa → XiaoAi)
- Auto-registers 5 switch devices: C1 / C2 / C3 / USB-A / Bluetooth
- After linking **Mi Home → Me → Third-party devices → Bemfa**, say
  **"Turn on CUKTECH C-port 1" / "Turn off CUKTECH USB-A"**
- Standard MQTT is also supported for Home Assistant

### 7. Themes & languages
- Dark sci-fi look with frosted glass, multiple themes + custom accent color
- **Chinese / English** bilingual with instant switching
- Efficient wide-screen PC layout and a responsive mobile view

![Mobile](docs/mobile.png)

---

## Requirements

- **Hardware**: CUKTECH 10 charger (model `njcuk.fitting.ad1204`, firmware tested `2.1.2_0073`)
- **Bluetooth**: built-in or external BLE 4.0+ adapter
- **OS**: Windows 10/11 (tested for this enhancement) or Linux (upstream-verified, bleak cross-platform)
- **Software**: Python 3.9+

---

## Installation

### Step 1: Get the device credentials (MAC / Token / BLE Key)

Use the open-source tool [**Xiaomi-cloud-tokens-extractor**](https://github.com/PiotrMachowski/Xiaomi-cloud-tokens-extractor):

```bash
git clone https://github.com/PiotrMachowski/Xiaomi-cloud-tokens-extractor.git
cd Xiaomi-cloud-tokens-extractor
pip install -r requirements.txt
python token_extractor.py
```

Log in with the **Mi account bound to the charger** (region `cn`) and note the **MAC, Token, BLE Key**.
The password is entered only on your own machine.

> You can also open `/config.html`, click "Xiaomi cloud auto-fetch", and scan with the Mi Home app.

### Step 2: Install the server

```bash
git clone https://github.com/NJ-CODE101/cuktech-ble-server.git
cd cuktech-ble-server
python -m venv venv
# Windows
.\venv\Scripts\python.exe -m pip install -r requirements.txt
# Linux
# ./venv/bin/pip install -r requirements.txt
```

### Step 3: Configure

```powershell
Copy-Item config.yaml.example config.yaml   # Windows
# cp config.yaml.example config.yaml        # Linux
```

Edit `config.yaml` with the credentials from Step 1:

```yaml
ble:
  mac: "XX:XX:XX:XX:XX:XX"
  token: "<your token>"
  ble_key: "<your ble key>"
```

### Step 4 (optional): Bemfa / XiaoAi

1. Register at [Bemfa](https://cloud.bemfa.com/) and copy the **user private key**;
2. In `config.yaml`:
   ```yaml
   bemfa:
     enabled: true
     uid: "<your bemfa key>"
   ```
3. Link **Mi Home → Me → Third-party devices → Add → Bemfa**;
4. Voice control becomes available after sync.

---

## Running

**Windows recommended: one-click (background + auto-open browser)**

Double-click the desktop shortcut (or `quick_start.vbs`): it probes the port, starts the server silently in the
background, and opens the browser — if already running it only opens the page.

**Manual**

```powershell
.\venv\Scripts\pythonw.exe ha_server.py   # Windows background
.\venv\Scripts\python.exe ha_server.py    # debug with console
```
```bash
./venv/bin/python ha_server.py            # Linux
```

Then open:
- Dashboard: <http://127.0.0.1:8080/>
- Config: <http://127.0.0.1:8080/config.html>

> Optionally enable **auto-start on login** in the config page (writes to the current user's registry Run key, no admin needed).
> `server.idle_shutdown_seconds` sets auto-exit after all pages close; `0` keeps it always on.

---

## Tech stack

**Backend**: Python · aiohttp · bleak (BLE) · paho-mqtt · cryptography · PyYAML · SQLite
**Frontend**: vanilla ES2020 · Chart.js · SSE · CSS glassmorphism · zh/en i18n

---

## Acknowledgments

- Data-dashboard and interaction enhancements built on [**kairui1108/cuktech-ble-server**](https://github.com/kairui1108/cuktech-ble-server) — thank you to the original author.
- Credential extraction: [**PiotrMachowski/Xiaomi-cloud-tokens-extractor**](https://github.com/PiotrMachowski/Xiaomi-cloud-tokens-extractor).

## Disclaimer

This is a personal learning / self-use tool and is not affiliated with CUKTECH or Xiaomi. BLE control carries risk;
the author is not liable for any device or data loss. Keep the credentials in `config.yaml` private.

## License

[MIT License](LICENSE)
