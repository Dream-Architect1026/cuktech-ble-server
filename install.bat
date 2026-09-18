@echo off
chcp 65001 >nul
title 酷态科 BLE 控制服务 - 一键安装
cd /d "%~dp0"

echo ============================================
echo   酷态科10号充电器 BLE 控制服务 - 安装
echo ============================================
echo.

echo [1/5] 检查 Python 环境...
python --version >nul 2>&1
if errorlevel 1 (
    echo [错误] 未检测到 Python，请先安装 Python 3.10+
    echo 下载地址: https://www.python.org/downloads/
    echo 安装时请勾选 "Add Python to PATH"
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('python --version') do echo  已检测到: %%i
echo.

echo [2/5] 创建虚拟环境 venv...
if not exist "venv\Scripts\python.exe" (
    python -m venv venv
    if errorlevel 1 (
        echo [错误] 虚拟环境创建失败
        pause
        exit /b 1
    )
    echo  虚拟环境创建成功
) else (
    echo  虚拟环境已存在，跳过
)
echo.

echo [3/5] 安装依赖包...
venv\Scripts\python.exe -m pip install --upgrade pip >nul 2>&1
venv\Scripts\python.exe -m pip install -r requirements.txt
if errorlevel 1 (
    echo [错误] 依赖安装失败，请检查网络连接
    pause
    exit /b 1
)
echo  依赖安装成功
echo.

echo [4/5] 配置开机自启动...
set "VBS_PATH=%~dp0start_service.vbs"
set "VBS_PATH=%VBS_PATH:\=\\%"
reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Run" /v "CuktechChargerAutoStart" /t REG_SZ /d "wscript.exe \"%~dp0start_service.vbs\"" /f >nul 2>&1
if errorlevel 1 (
    echo  [警告] 注册表写入失败，可手动设置自启动
) else (
    echo  开机自启动已配置
)
echo.

echo [5/5] 创建桌面快捷方式...
powershell -NoProfile -Command "$ws=New-Object -ComObject WScript.Shell;$s=$ws.CreateShortcut([Environment]::GetFolderPath('Desktop')+'\酷态科充电控制.lnk');$s.TargetPath='wscript.exe';$s.Arguments='\"%~dp0quick_start.vbs\"';$s.WorkingDirectory='%~dp0';$s.Description='酷态科充电器 BLE 控制服务';$s.Save()"
if errorlevel 1 (
    echo  [警告] 快捷方式创建失败
) else (
    echo  桌面快捷方式已创建: 酷态科充电控制.lnk
)
echo.

echo ============================================
echo   安装完成！
echo ============================================
echo.
echo 下一步:
echo   1. 编辑 config.yaml，填入你的 BLE MAC / Token / BLE Key
echo      和巴法云私钥（详见 部署指南.md）
echo   2. 双击桌面 "酷态科充电控制" 启动服务并打开网页
echo   3. 或运行: venv\Scripts\pythonw.exe ha_server.py
echo.
echo 服务地址: http://127.0.0.1:8080/
echo 配置页面: http://127.0.0.1:8080/config.html
echo.
pause
