@echo off
echo ====================================
echo  Hate Speech Detection ML Backend
echo ====================================
echo.

REM Navigate to backend directory
cd /d "%~dp0"

echo [1/3] Installing Python dependencies...
pip install -r requirements.txt
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to install dependencies. Make sure Python and pip are installed.
    pause
    exit /b 1
)

echo.
echo [2/3] Training the ML model...
python train_model.py
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to train model. Check the dataset path.
    pause
    exit /b 1
)

echo.
echo [3/3] Starting the API server...
echo.
echo Server will be available at http://localhost:5000
echo Press Ctrl+C to stop the server.
echo.
python server.py
