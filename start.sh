@echo off
echo ========================================
echo       AI Assistant - 流式聊天应用
echo ========================================
echo.
echo 正在检查依赖...
if not exist "node_modules" (
    echo 安装根目录依赖...
    call npm install
)

if not exist "frontend\node_modules" (
    echo 安装前端依赖...
    cd frontend
    call npm install
    cd ..
)

if not exist "backend\node_modules" (
    echo 安装后端依赖...
    cd backend
    call npm install
    cd ..
)

echo.
echo 启动应用...
echo 前端地址: http://localhost:3000
echo 后端地址: http://localhost:3001
echo.
echo 按 Ctrl+C 停止应用
echo.

start "Backend Server" /D "%~dp0backend" npm run dev
timeout /t 3 /nobreak >nul
start "Frontend Server" /D "%~dp0frontend" npm run dev

echo 应用已启动！
echo.
echo 请等待几秒钟，然后在浏览器中访问 http://localhost:3000
echo.
pause