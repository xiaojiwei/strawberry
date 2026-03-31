/**
 * AI流程图生成 - 通义千问适配器
 * 支持阿里云的DashScope API
 */

var QwenAdapter = (function() {
    'use strict';

    /**
     * 通义千问适配器构造函数
     * @param {Object} config - 配置对象
     * @extends ModelAdapter
     */
    function QwenAdapter(config) {
        // 调用父类构造函数
        ModelAdapter.call(this, config);

        // 通义千问特定配置
        this.temperature = config.temperature || 0.85;
        this.topP = config.topP || 0.8;
    }

    // 继承ModelAdapter
    QwenAdapter.prototype = Object.create(ModelAdapter.prototype);
    QwenAdapter.prototype.constructor = QwenAdapter;

    /**
     * 生成流程图
     * @param {string} description - 用户描述
     * @returns {Promise<Object>} - 流程图数据
     */
    QwenAdapter.prototype.generateFlowchart = function(description) {
        var self = this;

        this.log('info', '通义千问: 开始生成流程图');
        this.log('info', '通义千问: 模型=' + this.model + ', 描述长度=' + description.length);

        // 构建消息
        var messages = PromptTemplates.buildOpenAIMessages(description);

        // 构建请求数据（通义千问兼容OpenAI格式）
        var requestData = {
            model: this.model,
            messages: messages,
            temperature: this.temperature,
            top_p: this.topP,
            result_format: 'message'  // 返回message格式
        };

        // 构建请求头（通义千问使用Authorization: Bearer）
        var headers = {
            'Authorization': 'Bearer ' + this.apiKey
        };

        // 发送请求（带重试）
        return this.withRetry(function() {
            return self.request('/services/aigc/text-generation/generation', requestData, headers);
        }, 3, 2000).then(function(response) {
            self.log('info', '通义千问: 收到响应');

            // 提取内容（通义千问的响应格式）
            if (!response.output || !response.output.choices || response.output.choices.length === 0) {
                throw new Error('通义千问返回的响应格式不正确');
            }

            var content = response.output.choices[0].message.content;

            if (!content) {
                throw new Error('通义千问返回的内容为空');
            }

            self.log('info', '通义千问: 响应内容长度=' + content.length);

            // 解析JSON
            var flowData = self.parseFlowchartJSON(content);

            // 验证数据
            self.validateFlowData(flowData);

            self.log('info', '通义千问: 流程图生成成功，节点数=' + flowData.nodes.length +
                           ', 边数=' + flowData.edges.length);

            return flowData;
        }).catch(function(error) {
            self.log('error', '通义千问: 生成失败 - ' + error.message);
            throw error;
        });
    };

    return QwenAdapter;
})();
