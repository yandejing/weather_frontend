del /f /q log.txt
for /f "tokens=*" %%i in (src\modules\list.txt) do npm run build %%i >>log.txt
pause
