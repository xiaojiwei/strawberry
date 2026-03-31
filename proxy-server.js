/**
 * Strawberry AI 代理服务器
 * 用于解决浏览器直接调用AI API的CORS问题
 */

const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
const PORT = 3000;

// 启用CORS（允许所有来源）
app.use(cors());

// 解析JSON请求体
app.use(express.json({ limit: '10mb' }));

// 静态文件服务（提供前端页面）
app.use(express.static(__dirname));

// 代理端点：转发所有AI API请求
app.post('/api/proxy', async (req, res) => {
    try {
        const { url, method = 'POST', headers = {}, body } = req.body;

        console.log(`[代理请求] ${method} ${url}`);
        console.log('[请求头]', headers);
        console.log('[请求体预览]', JSON.stringify(body).substring(0, 200));

        // 发送请求到目标API
        const response = await fetch(url, {
            method: method,
            headers: headers,
            body: body ? JSON.stringify(body) : undefined
        });

        console.log('[响应状态]', response.status);
        console.log('[响应头]', response.headers.raw());

        // 读取响应文本
        const text = await response.text();
        console.log('[响应体预览]', text.substring(0, 500));

        // 尝试解析为JSON
        let data;
        try {
            data = JSON.parse(text);
            console.log('[响应解析] 成功解析为JSON');
        } catch (e) {
            console.error('[响应解析] JSON解析失败:', e.message);
            console.error('[完整响应]', text);

            // 如果不是JSON，返回错误
            return res.status(500).json({
                error: true,
                message: '目标API返回了非JSON格式的响应',
                response: text.substring(0, 1000)
            });
        }

        // 返回响应
        res.status(response.status).json(data);

    } catch (error) {
        console.error('[代理错误]', error.message);
        console.error('[错误堆栈]', error.stack);

        res.status(500).json({
            error: true,
            message: error.message,
            stack: error.stack
        });
    }
});

// 启动服务器
app.listen(PORT, () => {
    console.log('==============================================');
    console.log('  Strawberry AI 流程图生成系统');
    console.log('==============================================');
    console.log('');
    console.log(`  服务器已启动: http://localhost:${PORT}`);
    console.log('');
    console.log('  访问地址: http://localhost:' + PORT);
    console.log('');
    console.log('  按 Ctrl+C 停止服务器');
    console.log('');
    console.log('==============================================');
});
