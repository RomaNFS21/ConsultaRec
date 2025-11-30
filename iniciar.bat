@echo off
echo Iniciando servidor Flask e abrindo o frontend...
cd back-end
call ..\.venv\Scripts\activate
start "" "http://127.0.0.1:5000"
start "" "..\front-end\index.html"
python app.py
pause