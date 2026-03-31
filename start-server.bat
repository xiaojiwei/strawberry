@echo off
REM Strawberry AI 流程图生成系统 - 本地服务器启动脚本 (Windows)

echo 正在启动 Strawberry AI 流程图系统...
echo ======================================
echo.

REM 检查Python是否安装
where python >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    set PORT=8080
    echo 使用 Python 启动HTTP服务器，端口: %PORT%
    echo 访问地址: http://localhost:%PORT%
    echo.
    echo 按 Ctrl+C 停止服务器
    echo ======================================
    python -m http.server %PORT%
) else (
    echo 错误: 未找到Python，请安装Python后重试
    echo 或手动运行以下命令：
    echo   python -m http.server 8080
    pause
)
