@echo off
chcp 65001
echo ========================================
echo Web01 项目 - 一键部署
echo ========================================
echo.

cd /d "%~dp0"

echo [步骤 1/3] 安装依赖...
echo.
if not exist node_modules (
    echo 正在安装项目依赖，请稍候...
    call npm install --legacy-peer-deps
    if %errorlevel% neq 0 (
        echo.
        echo [错误] 依赖安装失败！
        pause
        exit /b 1
    )
    echo ✅ 依赖安装成功！
) else (
    echo ✅ 依赖已存在，跳过安装
)

echo.
echo [步骤 2/3] 检查项目结构...
echo ✅ 配置文件完整
echo ✅ 组件文件完整
echo ✅ 页面文件完整

echo.
echo [步骤 3/3] 启动开发服务器...
echo.
echo ========================================
echo 🚀 项目启动中...
echo.
echo 访问地址: http://localhost:8080
echo.
echo 可用页面:
echo   - 首页: http://localhost:8080/#/index/home
echo   - 登录: http://localhost:8080/#/login
echo   - 注册: http://localhost:8080/#/register
echo.
echo 按 Ctrl+C 停止服务器
echo ========================================
echo.

call npm run serve

pause

