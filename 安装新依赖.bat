@echo off
chcp 65001
echo ========================================
echo 安装完整项目依赖
echo ========================================
echo.

cd /d "%~dp0"

echo [1/4] 删除旧的依赖...
if exist node_modules (
    echo 删除 node_modules...
    rmdir /s /q node_modules
)
if exist package-lock.json (
    del /f package-lock.json
)

echo.
echo [2/4] 清理 npm 缓存...
call npm cache clean --force

echo.
echo [3/4] 检查 Node 版本...
node -v
npm -v

echo.
echo [4/4] 安装所有依赖（这可能需要 5-10 分钟）...
echo 正在安装: Vue Router, Vuex, Element UI, 富文本编辑器等...
call npm install --legacy-peer-deps

if %errorlevel% neq 0 (
    echo.
    echo [错误] 依赖安装失败！
    echo.
    echo 请尝试以下方法：
    echo 1. 使用 cnpm: npm install -g cnpm --registry=https://registry.npmmirror.com
    echo 2. 然后运行: cnpm install
    pause
    exit /b 1
)

echo.
echo ========================================
echo ✅ 所有依赖安装成功！
echo.
echo 已安装的主要依赖：
echo - Vue Router 3.5.2 (路由)
echo - Vuex 3.1.1 (状态管理)
echo - Element UI 2.15.5 (UI组件库)
echo - Vue Quill Editor 3.0.6 (富文本编辑器)
echo - Vue Baidu Map 0.21.22 (百度地图)
echo - Sass 1.97.3 (样式预处理器)
echo.
echo 下一步: 运行 启动项目.bat
echo ========================================
pause

