/**
 * AI流程图生成 - 自定义模型适配器
 * 支持任何兼容OpenAI API格式的大模型
 */

var CustomAdapter = (function() {
    'use strict';

    /**
     * 自定义模型适配器构造函数
     * @param {Object} config - 配置对象
     * @extends ModelAdapter
     */
    function CustomAdapter(config) {
        // 调用父类构造函数
        ModelAdapter.call(this, config);

        // 自定义配置
        this.temperature = config.temperature || 0.7;
        this.maxTokens = config.maxTokens || 4096;
        this.customHeaders = config.headers || {};
        this.endpoint = config.endpoint || '/chat/completions';
    }

    // 继承ModelAdapter
    CustomAdapter.prototype = Object.create(ModelAdapter.prototype);
    CustomAdapter.prototype.constructor = CustomAdapter;

    /**
     * 生成流程图
     * @param {string} description - 用户描述
     * @returns {Promise<Object>} - 流程图数据
     */
    CustomAdapter.prototype.generateFlowchart = function(description) {
        var self = this;

        this.log('info', '自定义模型: 开始生成流程图');
        this.log('info', '自定义模型: 端点=' + this.endpoint + ', 模型=' + this.model);

        // 构建消息（使用OpenAI兼容格式）
        var messages = PromptTemplates.buildOpenAIMessages(description);

        // 构建请求数据
        var requestData = {
            model: this.model,
            messages: messages,
            temperature: this.temperature,
            max_tokens: this.maxTokens
        };

        // 合并自定义请求头
        var headers = {};

        // 默认Authorization头（如果API Key存在）
        if (this.apiKey) {
            headers['Authorization'] = 'Bearer ' + this.apiKey;
        }

        // 合并自定义headers
        for (var key in this.customHeaders) {
            if (this.customHeaders.hasOwnProperty(key)) {
                headers[key] = this.customHeaders[key];
            }
        }

        // 发送请求（带重试）
        return this.withRetry(function() {
            return self.request(self.endpoint, requestData, headers);
        }, 3, 2000).then(function(response) {
            self.log('info', '自定义模型: 收到响应');

            // 尝试从多种可能的响应格式中提取内容
            var content = self._extractContent(response);

            if (!content) {
                throw new Error('自定义模型返回的内容为空');
            }

            self.log('info', '自定义模型: 响应内容长度=' + content.length);

            // 解析JSON
            var flowData = self.parseFlowchartJSON(content);

            // 验证数据
            self.validateFlowData(flowData);

            self.log('info', '自定义模型: 流程图生成成功，节点数=' + flowData.nodes.length +
                           ', 边数=' + flowData.edges.length);

            return flowData;
        }).catch(function(error) {
            self.log('error', '自定义模型: 生成失败 - ' + error.message);
            throw error;
        });
    };

    /**
     * 从响应中提取内容（支持多种格式）
     * @param {Object} response - API响应
     * @returns {string} - 提取的内容
     * @private
     */
    CustomAdapter.prototype._extractContent = function(response) {
        // 格式1: OpenAI格式
        if (response.choices && response.choices.length > 0) {
            if (response.choices[0].message && response.choices[0].message.content) {
                return response.choices[0].message.content;
            }
            if (response.choices[0].text) {
                return response.choices[0].text;
            }
        }

        // 格式2: 直接返回文本
        if (response.text) {
            return response.text;
        }

        // 格式3: content字段
        if (response.content) {
            if (typeof response.content === 'string') {
                return response.content;
            }
            if (Array.isArray(response.content) && response.content.length > 0) {
                if (response.content[0].text) {
                    return response.content[0].text;
                }
            }
        }

        // 格式4: output字段（某些国产模型）
        if (response.output) {
            if (typeof response.output === 'string') {
                return response.output;
            }
            if (response.output.text) {
                return response.output.text;
            }
            if (response.output.choices && response.output.choices.length > 0) {
                if (response.output.choices[0].message && response.output.choices[0].message.content) {
                    return response.output.choices[0].message.content;
                }
            }
        }

        // 格式5: result字段
        if (response.result) {
            if (typeof response.result === 'string') {
                return response.result;
            }
            if (response.result.text) {
                return response.result.text;
            }
        }

        // 格式6: data字段
        if (response.data) {
            if (typeof response.data === 'string') {
                return response.data;
            }
            if (response.data.text) {
                return response.data.text;
            }
        }

        this.log('warn', '自定义模型: 无法从响应中提取内容，响应结构: ' +
                       JSON.stringify(Object.keys(response)));

        return null;
    };

    return CustomAdapter;
})();
