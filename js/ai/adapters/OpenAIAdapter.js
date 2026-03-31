/**
 * AI流程图生成 - OpenAI适配器
 * 支持OpenAI的Chat Completions API
 */

var OpenAIAdapter = (function() {
    'use strict';

    /**
     * OpenAI适配器构造函数
     * @param {Object} config - 配置对象
     * @extends ModelAdapter
     */
    function OpenAIAdapter(config) {
        // 调用父类构造函数
        ModelAdapter.call(this, config);

        // OpenAI特定配置
        this.temperature = config.temperature || 0.7;
        this.maxTokens = config.maxTokens || 4096;
    }

    // 继承ModelAdapter
    OpenAIAdapter.prototype = Object.create(ModelAdapter.prototype);
    OpenAIAdapter.prototype.constructor = OpenAIAdapter;

    /**
     * 生成流程图
     * @param {string} description - 用户描述
     * @returns {Promise<Object>} - 流程图数据
     */
    OpenAIAdapter.prototype.generateFlowchart = function(description) {
        var self = this;

        this.log('info', 'OpenAI: 开始生成流程图');
        this.log('info', 'OpenAI: 模型=' + this.model + ', 描述长度=' + description.length);

        // 构建消息
        var messages = PromptTemplates.buildOpenAIMessages(description);

        // 构建请求数据
        var requestData = {
            model: this.model,
            messages: messages,
            temperature: this.temperature,
            max_tokens: this.maxTokens
        };

        // 如果模型支持JSON模式，启用它
        if (this.model.indexOf('gpt-4') !== -1 || this.model.indexOf('gpt-3.5') !== -1) {
            requestData.response_format = { type: 'json_object' };
        }

        // 构建请求头
        var headers = {
            'Authorization': 'Bearer ' + this.apiKey
        };

        // 发送请求（带重试）
        return this.withRetry(function() {
            return self.request('/chat/completions', requestData, headers);
        }, 3, 2000).then(function(response) {
            self.log('info', 'OpenAI: 收到响应');

            // 提取内容
            if (!response.choices || response.choices.length === 0) {
                throw new Error('OpenAI返回的响应中没有choices');
            }

            var content = response.choices[0].message.content;

            if (!content) {
                throw new Error('OpenAI返回的内容为空');
            }

            self.log('info', 'OpenAI: 响应内容长度=' + content.length);

            // 解析JSON
            var flowData = self.parseFlowchartJSON(content);

            // 验证数据
            self.validateFlowData(flowData);

            self.log('info', 'OpenAI: 流程图生成成功，节点数=' + flowData.nodes.length +
                           ', 边数=' + flowData.edges.length);

            return flowData;
        }).catch(function(error) {
            self.log('error', 'OpenAI: 生成失败 - ' + error.message);
            throw error;
        });
    };

    /**
     * 流式生成流程图（可选功能）
     * @param {string} description - 用户描述
     * @param {Function} onChunk - 接收数据块的回调函数
     * @returns {Promise<Object>} - 完整的流程图数据
     */
    OpenAIAdapter.prototype.generateFlowchartStream = function(description, onChunk) {
        var self = this;

        this.log('info', 'OpenAI: 开始流式生成');

        var messages = PromptTemplates.buildOpenAIMessages(description);

        var requestData = {
            model: this.model,
            messages: messages,
            temperature: this.temperature,
            max_tokens: this.maxTokens,
            stream: true
        };

        var headers = {
            'Authorization': 'Bearer ' + this.apiKey
        };

        var url = this.baseURL + '/chat/completions';

        return fetch(url, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(requestData)
        }).then(function(response) {
            if (!response.ok) {
                throw new Error('API请求失败 (' + response.status + ')');
            }

            var reader = response.body.getReader();
            var decoder = new TextDecoder();
            var buffer = '';

            function readChunk() {
                return reader.read().then(function(result) {
                    if (result.done) {
                        // 解析完整的内容
                        return self.parseFlowchartJSON(buffer);
                    }

                    var chunk = decoder.decode(result.value, { stream: true });
                    var lines = chunk.split('\n');

                    for (var i = 0; i < lines.length; i++) {
                        var line = lines[i].trim();

                        if (line === '' || line === 'data: [DONE]') {
                            continue;
                        }

                        if (line.startsWith('data: ')) {
                            try {
                                var data = JSON.parse(line.substring(6));
                                var content = data.choices[0].delta.content;

                                if (content) {
                                    buffer += content;
                                    if (onChunk) {
                                        onChunk(content);
                                    }
                                }
                            } catch (e) {
                                self.log('warn', 'OpenAI Stream: 解析数据块失败 - ' + e.message);
                            }
                        }
                    }

                    return readChunk();
                });
            }

            return readChunk();
        }).then(function(flowData) {
            self.validateFlowData(flowData);
            self.log('info', 'OpenAI Stream: 生成完成');
            return flowData;
        }).catch(function(error) {
            self.log('error', 'OpenAI Stream: 生成失败 - ' + error.message);
            throw error;
        });
    };

    return OpenAIAdapter;
})();
