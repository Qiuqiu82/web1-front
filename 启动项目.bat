@echo off
chcp 65001
echo ========================================
echo 启动 Web01 开发服务器
echo ========================================
echo.

cd /d "%~dp0"

if not exist node_modules (
    echo [警告] 未检测到 node_modules 目录
    echo 请先运行 安装依赖.bat
    pause
    exit /b 1
)

echo 正在启动开发服务器...
echo 项目将在浏览器中自动打开
echo 访问地址: http://localhost:8080
echo.
echo 按 Ctrl+C 停止服务器
echo ========================================
echo.

call npm run serve

pause

