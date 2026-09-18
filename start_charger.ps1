# start_charger.ps1 - CUKTECH charger reliable launcher
# 1) If port 8080 is already up, just open the browser (no restart).
# 2) Otherwise: kill stuck leftovers, start the service, wait for the port
#    (timeout-safe check), then open the web UI.
$proj = "C:\Users\D_A\Documents\qwen-agent\ol7g3DG14n\default\cuktech-ble-server"
$port = 8080
$log  = "$proj\launcher.log"

function Log($m) {
    try { Add-Content -Path $log -Value ("{0} {1}" -f (Get-Date -Format 'HH:mm:ss'), $m) } catch {}
}

# Timeout-safe port check: BeginConnect + 500ms wait.
# Plain TcpClient.Connect() can hang for tens of seconds when the port has
# TIME_WAIT sockets left by frequent start/stop, which froze the launcher.
function Test-PortUp {
    $c = New-Object Net.Sockets.TcpClient
    $iar = $c.BeginConnect('127.0.0.1', $port, $null, $null)
    $ok = $iar.AsyncWaitHandle.WaitOne(250)
    if ($ok) {
        try { $c.EndConnect($iar); $c.Close(); return $true } catch {}
    }
    try { $c.Close() } catch {}
    return $false
}

Log "==== launcher start ===="
$up = Test-PortUp
Log "port check: up=$up"

if (-not $up) {
    Log "killing leftover service processes..."
    Get-CimInstance Win32_Process -Filter "Name='pythonw.exe' OR Name='python.exe'" |
        Where-Object { $_.CommandLine -like "*cuktech-ble-server*ha_server.py*" } |
        ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }
    Start-Sleep -Milliseconds 400

    Log "starting service via pythonw..."
    Set-Location $proj
    $svcErr = "$proj\_svc_err.log"
    Start-Process -FilePath "$proj\venv\Scripts\pythonw.exe" -ArgumentList "ha_server.py" `
        -WorkingDirectory $proj -WindowStyle Hidden -RedirectStandardError $svcErr | Out-Null

    Log "waiting for port (up to 45s, poll every 0.25s)..."
    for ($i = 0; $i -lt 180; $i++) {
        if (Test-PortUp) { Log ("port up after {0:N1}s" -f ($i * 0.25)); break }
        Start-Sleep -Milliseconds 250
    }
}

Log "opening browser"
Start-Process "http://127.0.0.1:$port/"
Log "==== launcher done ===="
