' CUKTECH BLE service - silent auto-start at logon
' Used by Windows registry auto-start (HKCU\...\Run).
' Lightweight: netstat port check, no PowerShell cold-start, no console window.
' If port 8080 is already listening, do nothing. Otherwise launch pythonw hidden.

Option Explicit

Dim WshShell, fso, proj, pythonw, execObj, out, i

Set WshShell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

' Project root = directory of this script (works after moving to another PC)
proj = fso.GetParentFolderName(WScript.ScriptFullName)
pythonw = proj & "\venv\Scripts\pythonw.exe"

' Fallback: if venv pythonw not found, try system pythonw
If Not fso.FileExists(pythonw) Then
    pythonw = "pythonw.exe"
End If

' --- port check via netstat (cmd built-in) ---
Function PortOpen()
    Set execObj = WshShell.Exec("%comspec% /c netstat -ano | findstr /R "":8080.*LISTENING""")
    Do While execObj.Status = 0
        WScript.Sleep 30
    Loop
    out = execObj.StdOut.ReadAll()
    PortOpen = (Len(out) > 0)
End Function

If Not PortOpen() Then
    WshShell.CurrentDirectory = proj
    WshShell.Run """" & pythonw & """ ha_server.py", 0, False
End If

Set WshShell = Nothing
Set fso = Nothing
