@echo off
SET PATH=C:\Program Files\Git\cmd;C:\Program Files\Git\bin;%PATH%
SET GIT_TERMINAL_PROMPT=0
cd /d "C:\Users\vera_\Downloads\images\regret-free-ai"
git push origin main
echo.
echo 完了しました。このウィンドウを閉じてください。
pause
