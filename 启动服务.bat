@echo off
chcp 65001 >nul
title 酷态科BLE后台服务
cd /d "%~dp0"
echo ============================================
echo  酷态科10号 BLE 后台服务
echo  Web 界面: http://127.0.0.1:8080
echo  配置页面: http://127.0.0.1:8080/config.html
echo ============================================
"C:\Users\D_A\Documents\qwen-agent\ol7g3DG14n\default\cuktech-ble-server\venv\Scripts\pythonw.exe" ha_server.py
if errorlevel 1 (
    echo.
    echo [错误] 服务启动失败，改用 python.exe 重试以便查看报错...
    pause
    "C:\Users\D_A\Documents\qwen-agent\ol7g3DG14n\default\cuktech-ble-server\venv\Scripts\python.exe" ha_server.py
    pause
)
