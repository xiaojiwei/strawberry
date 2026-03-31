/**
 * MiniMax 大模型适配器
 *
 * MiniMax 使用 Anthropic (Claude) 兼容的 API 格式
 *
 * 使用说明：
 * 1. 注册获取 API Key：https://platform.minimaxi.com/
 * 2. Base URL: https://api.minimaxi.com/anthropic
 * 3. 模型名称: MiniMax-M2.7（推荐）
 * 4. 端点: /v1/messages (Claude格式)
 * 5. 请求头: x-api-key (不是Authorization)
 *
 * 示例配置：
 * {
 *   apiKey: "your-minimax-api-key",
 *   baseURL: "https://api.minimaxi.com/anthropic",
 *   model: "MiniMax-M2.7"
 * }
 */

var MinimaxAdapter = (function() {
    'use strict';

    /**
     * MiniMax 适配器构造函数
     * @param {Object} config - 配置对象
     * @param {string} config.apiKey - MiniMax API Key
     * @param {string} config.baseURL - API基础URL
     * @param {string} config.model - 模型名称
     * @constructor
     */
    function MinimaxAdapter(config) {
        console.log('MinimaxAdapter: 初始化适配器', config);

        // 调用父类构造函数
        ModelAdapter.call(this, config);

        // 验证配置
        if (!config.apiKey) {
            throw new Error('MiniMax API Key 未配置');
        }

        if (!config.baseURL) {
            config.baseURL = 'https://api.minimaxi.com/anthropic';
        }

        if (!config.model) {
            config.model = 'MiniMax-M2.7';
        }

        this.apiKey = config.apiKey;
        this.baseURL = config.baseURL.replace(/\/$/, ''); // 移除末尾斜杠
        this.model = config.model;

        console.log('MinimaxAdapter: 初始化完成，模型=' + this.model);
    }

    // 继承 ModelAdapter
    MinimaxAdapter.prototype = Object.create(ModelAdapter.prototype);
    MinimaxAdapter.prototype.constructor = MinimaxAdapter;

    /**
     * 生成流程图
     * @param {string} description - 流程图描述
     * @returns {Promise<Object>} - 返回流程图数据
     */
    MinimaxAdapter.prototype.generateFlowchart = function(description) {
        var self = this;

        console.log('MinimaxAdapter: 开始生成流程图');
        console.log('MinimaxAdapter: 描述长度=' + description.length);

        // 构建请求消息（Claude格式）
        var messages = PromptTemplates.buildClaudeMessages(description);

        console.log('MinimaxAdapter: 消息构建完成，messages数量=' + messages.length);

        // 构建请求数据（Claude格式）
        var requestData = {
            model: this.model,
            messages: messages,
            max_tokens: 4000,
            temperature: 0.7,
            system: PromptTemplates.SYSTEM_PROMPT
        };

        console.log('MinimaxAdapter: 准备发送请求到 ' + this.baseURL + '/v1/messages');

        // 请求头（Claude格式 - 使用x-api-key）
        var headers = {
            'x-api-key': this.apiKey,
            'Content-Type': 'application/json'
        };

        // 使用重试机制发送请求
        return this.withRetry(function() {
            return self.request('/v1/messages', requestData, headers).then(function(response) {
                console.log('MinimaxAdapter: 收到API响应');

                // 验证响应格式（Claude格式）
                if (!response || !response.content) {
                    console.error('MinimaxAdapter: 无效的响应格式', response);
                    throw new Error('MiniMax API 响应格式无效');
                }

                // MiniMax返回的content是数组，需要找到type为'text'的内容
                var textContent = null;
                for (var i = 0; i < response.content.length; i++) {
                    if (response.content[i].type === 'text') {
                        textContent = response.content[i].text;
                        break;
                    }
                }

                if (!textContent) {
                    throw new Error('MiniMax 返回内容为空');
                }

                console.log('MinimaxAdapter: 内容长度=' + textContent.length);
                console.log('MinimaxAdapter: 内容预览=' + textContent.substring(0, 200));

                // 解析JSON
                var flowData = self.parseFlowchartJSON(textContent);

                // 验证数据
                self.validateFlowData(flowData);

                console.log('MinimaxAdapter: 流程图数据验证通过');
                console.log('MinimaxAdapter: 节点数=' + flowData.nodes.length + ', 边数=' + flowData.edges.length);

                return flowData;
            });
        }, 3, 2000); // 最多重试3次，每次间隔2秒
    };

    /**
     * 获取适配器名称
     * @returns {string}
     */
    MinimaxAdapter.prototype.getName = function() {
        return 'MiniMax';
    };

    /**
     * 获取适配器版本
     * @returns {string}
     */
    MinimaxAdapter.prototype.getVersion = function() {
        return '1.0.0';
    };

    /**
     * 获取支持的模型列表
     * @returns {Array<Object>}
     */
    MinimaxAdapter.prototype.getSupportedModels = function() {
        return [
            {
                id: 'MiniMax-M2.7',
                name: 'MiniMax-M2.7',
                description: '最新旗舰模型，推荐使用'
            },
            {
                id: 'abab6.5s-chat',
                name: 'abab6.5s-chat',
                description: '高性能对话模型'
            },
            {
                id: 'abab6.5g-chat',
                name: 'abab6.5g-chat',
                description: '通用对话模型'
            },
            {
                id: 'abab6.5t-chat',
                name: 'abab6.5t-chat',
                description: '快速对话模型'
            },
            {
                id: 'abab5.5s-chat',
                name: 'abab5.5s-chat',
                description: '经济型对话模型'
            }
        ];
    };

    // 导出到全局
    window.MinimaxAdapter = MinimaxAdapter;

    return MinimaxAdapter;

})();

console.log('MinimaxAdapter.js 加载完成');
