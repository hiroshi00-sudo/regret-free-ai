@echo off
SET PATH=C:\Program Files\nodejs;%PATH%
echo サーバーを起動しています...
echo 起動したら http://localhost:3000 をブラウザで開いてください
echo.
echo ※ このウィンドウを閉じるとサーバーが止まります
echo.
"C:\Program Files\nodejs\npm.cmd" run dev
pause
