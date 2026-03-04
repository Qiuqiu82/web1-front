@echo off
chcp 65001
echo ========================================
echo 安装 Web01 项目依赖
echo ========================================
echo.

cd /d "%~dp0"

echo 当前目录: %cd%
echo.

echo [1/3] 清理旧的依赖...
if exist node_modules (
    echo 删除 node_modules...
    rmdir /s /q node_modules
)
if exist package-lock.json (
    del /f package-lock.json
)

echo.
echo [2/3] 检查 Node 版本...
node -v
npm -v

echo.
echo [3/3] 安装依赖（这可能需要几分钟）...
call npm install

if %errorlevel% neq 0 (
    echo.
    echo [错误] 依赖安装失败！
    echo.
    echo 请尝试以下方法：
    echo 1. 检查网络连接
    echo 2. 使用 cnpm: npm install -g cnpm --registry=https://registry.npmmirror.com
    echo 3. 然后运行: cnpm install
    pause
    exit /b 1
)

echo.
echo ========================================
echo ✅ 依赖安装成功！
echo.
echo 下一步: 运行 启动项目.bat 或执行 npm run serve
echo ========================================
pause

