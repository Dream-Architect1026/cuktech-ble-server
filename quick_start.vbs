' quick_start.vbs - CUKTECH charger fast launcher
' Port open -> open browser; port closed -> start service then open browser

Option Explicit

Dim WshShell, fso, proj, pythonw, i, execObj, out, q

Set WshShell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")
q = Chr(34)

proj = fso.GetParentFolderName(WScript.ScriptFullName)
pythonw = proj & "\venv\Scripts\pythonw.exe"
If Not fso.FileExists(pythonw) Then pythonw = "pythonw.exe"

' Check if port 8080 is listening
Set execObj = WshShell.Exec("%comspec% /c netstat -ano | findstr /R " & q & ":8080.*LISTENING" & q)
Do While execObj.Status = 0
    WScript.Sleep 30
Loop
out = execObj.StdOut.ReadAll()

If Len(out) = 0 Then
    ' Port not open - start service
    WshShell.CurrentDirectory = proj
    WshShell.Run q & pythonw & q & " ha_server.py", 0, False
    ' Wait for port to open (up to 30 seconds)
    For i = 1 To 150
        WScript.Sleep 200
        Set execObj = WshShell.Exec("%comspec% /c netstat -ano | findstr /R " & q & ":8080.*LISTENING" & q)
        Do While execObj.Status = 0
            WScript.Sleep 30
        Loop
        If Len(execObj.StdOut.ReadAll()) > 0 Then Exit For
    Next
End If

' Open web UI
WshShell.Run "http://127.0.0.1:8080/", 1, False

Set WshShell = Nothing
Set fso = Nothing
