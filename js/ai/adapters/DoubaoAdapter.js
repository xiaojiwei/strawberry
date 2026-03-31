/**
 * AI流程图生成 - 豆包适配器
 * 支持字节跳动的豆包大模型API（火山引擎）
 */

var DoubaoAdapter = (function() {
    'use strict';

    /**
     * 豆包适配器构造函数
     * @param {Object} config - 配置对象
     * @extends ModelAdapter
     */
    function DoubaoAdapter(config) {
        // 调用父类构造函数
        ModelAdapter.call(this, config);

        // 豆包特定配置
        this.temperature = config.temperature || 0.9;
        this.topP = config.topP || 0.7;
    }

    // 继承ModelAdapter
    DoubaoAdapter.prototype = Object.create(ModelAdapter.prototype);
    DoubaoAdapter.prototype.constructor = DoubaoAdapter;

    /**
     * 生成流程图
     * @param {string} description - 用户描述
     * @returns {Promise<Object>} - 流程图数据
     */
    DoubaoAdapter.prototype.generateFlowchart = function(description) {
        var self = this;

        this.log('info', '豆包: 开始生成流程图');
        this.log('info', '豆包: 模型=' + this.model + ', 描述长度=' + description.length);

        // 构建消息（豆包兼容OpenAI格式）
        var messages = PromptTemplates.buildOpenAIMessages(description);

        // 构建请求数据
        var requestData = {
            model: this.model,
            messages: messages,
            temperature: this.temperature,
            top_p: this.topP
        };

        // 构建请求头（豆包使用Authorization: Bearer）
        var headers = {
            'Authorization': 'Bearer ' + this.apiKey
        };

        // 发送请求（带重试）
        return this.withRetry(function() {
            return self.request('/chat/completions', requestData, headers);
        }, 3, 2000).then(function(response) {
            self.log('info', '豆包: 收到响应');

            // 提取内容（豆包兼容OpenAI响应格式）
            if (!response.choices || response.choices.length === 0) {
                throw new Error('豆包返回的响应中没有choices');
            }

            var content = response.choices[0].message.content;

            if (!content) {
                throw new Error('豆包返回的内容为空');
            }

            self.log('info', '豆包: 响应内容长度=' + content.length);

            // 解析JSON
            var flowData = self.parseFlowchartJSON(content);

            // 验证数据
            self.validateFlowData(flowData);

            self.log('info', '豆包: 流程图生成成功，节点数=' + flowData.nodes.length +
                           ', 边数=' + flowData.edges.length);

            return flowData;
        }).catch(function(error) {
            self.log('error', '豆包: 生成失败 - ' + error.message);
            throw error;
        });
    };

    return DoubaoAdapter;
})();
