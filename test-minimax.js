/**
 * 测试 MiniMax API 的不同端点
 */

const fetch = require('node-fetch');

const API_KEY = 'sk-api-h-KWQ9KWojRp1_f3dqDs1SJgqAr6JbtMSm9A41SrMJj4LPHx00vzJMSWR44KziNi19zU9OOS47pTXHteLVThRzIFIJmMuby-IPL6NmE4-QafuMt3z57d9sI';
const BASE_URL = 'https://api.minimaxi.com/anthropic';

async function testEndpoint(endpoint, headers, body) {
    const url = BASE_URL + endpoint;
    console.log('\n=================================');
    console.log('测试端点:', url);
    console.log('请求头:', JSON.stringify(headers, null, 2));
    console.log('请求体:', JSON.stringify(body, null, 2));

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(body)
        });

        console.log('响应状态:', response.status);
        console.log('响应头:', response.headers.raw());

        const text = await response.text();
        console.log('响应内容预览:', text.substring(0, 500));

        try {
            const json = JSON.parse(text);
            console.log('✓ JSON解析成功');
            console.log('响应数据:', JSON.stringify(json, null, 2).substring(0, 500));
        } catch (e) {
            console.log('✗ JSON解析失败:', e.message);
        }

    } catch (error) {
        console.error('✗ 请求失败:', error.message);
    }
}

async function runTests() {
    console.log('开始测试 MiniMax API...');

    // 测试1: Claude格式 /v1/messages
    await testEndpoint('/v1/messages', {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY
    }, {
        model: 'MiniMax-M2.7',
        messages: [{ role: 'user', content: '你好' }],
        max_tokens: 100
    });

    // 测试2: OpenAI格式 /v1/chat/completions
    await testEndpoint('/v1/chat/completions', {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + API_KEY
    }, {
        model: 'MiniMax-M2.7',
        messages: [{ role: 'user', content: '你好' }],
        max_tokens: 100
    });

    console.log('\n测试完成！');
}

runTests();
