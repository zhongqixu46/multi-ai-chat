@echo off
chcp 65001 >nul
cd /d "%~dp0"
set "LOG=%~dp0setup-log.txt"
echo ===== setup started %date% %time% ===== > "%LOG%"
echo [node] >> "%LOG%"
node -v >> "%LOG%" 2>&1
echo [npm] >> "%LOG%"
call npm -v >> "%LOG%" 2>&1
echo [git] >> "%LOG%"
git --version >> "%LOG%" 2>&1
echo [python] >> "%LOG%"
python --version >> "%LOG%" 2>&1
echo [vs-cpp] >> "%LOG%"
set "VSWHERE=%ProgramFiles(x86)%\Microsoft Visual Studio\Installer\vswhere.exe"
if not exist "%VSWHERE%" goto novs
"%VSWHERE%" -products * -requires Microsoft.VisualStudio.Component.VC.Tools.x86.x64 -property displayName >> "%LOG%" 2>&1
goto vsdone
:novs
echo vswhere not found >> "%LOG%"
:vsdone
echo ===== npm install ===== >> "%LOG%"
call npm install >> "%LOG%" 2>&1
echo npm install exit code: %errorlevel% >> "%LOG%"
echo ===== npm run format ===== >> "%LOG%"
call npm run format >> "%LOG%" 2>&1
echo format exit code: %errorlevel% >> "%LOG%"
echo ===== npm run typecheck ===== >> "%LOG%"
call npm run typecheck >> "%LOG%" 2>&1
echo typecheck exit code: %errorlevel% >> "%LOG%"
echo ===== setup finished %date% %time% ===== >> "%LOG%"
