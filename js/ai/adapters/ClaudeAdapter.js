/**
 * AI流程图生成 - Claude适配器
 * 支持Anthropic的Messages API
 */

var ClaudeAdapter = (function() {
    'use strict';

    /**
     * Claude适配器构造函数
     * @param {Object} config - 配置对象
     * @extends ModelAdapter
     */
    function ClaudeAdapter(config) {
        // 调用父类构造函数
        ModelAdapter.call(this, config);

        // Claude特定配置
        this.temperature = config.temperature || 1.0;
        this.maxTokens = config.maxTokens || 4096;
        this.apiVersion = config.apiVersion || '2023-06-01';
    }

    // 继承ModelAdapter
    ClaudeAdapter.prototype = Object.create(ModelAdapter.prototype);
    ClaudeAdapter.prototype.constructor = ClaudeAdapter;

    /**
     * 生成流程图
     * @param {string} description - 用户描述
     * @returns {Promise<Object>} - 流程图数据
     */
    ClaudeAdapter.prototype.generateFlowchart = function(description) {
        var self = this;

        this.log('info', 'Claude: 开始生成流程图');
        this.log('info', 'Claude: 模型=' + this.model + ', 描述长度=' + description.length);

        // 构建消息
        var messages = PromptTemplates.buildClaudeMessages(description);

        // 构建请求数据
        var requestData = {
            model: this.model,
            max_tokens: this.maxTokens,
            temperature: this.temperature,
            system: PromptTemplates.SYSTEM_PROMPT,
            messages: messages
        };

        // 构建请求头（Claude使用x-api-key而不是Authorization）
        var headers = {
            'x-api-key': this.apiKey,
            'anthropic-version': this.apiVersion
        };

        // 发送请求（带重试）
        return this.withRetry(function() {
            return self.request('/messages', requestData, headers);
        }, 3, 2000).then(function(response) {
            self.log('info', 'Claude: 收到响应');

            // 提取内容
            if (!response.content || response.content.length === 0) {
                throw new Error('Claude返回的响应中没有content');
            }

            var content = response.content[0].text;

            if (!content) {
                throw new Error('Claude返回的内容为空');
            }

            self.log('info', 'Claude: 响应内容长度=' + content.length);

            // 解析JSON
            var flowData = self.parseFlowchartJSON(content);

            // 验证数据
            self.validateFlowData(flowData);

            self.log('info', 'Claude: 流程图生成成功，节点数=' + flowData.nodes.length +
                           ', 边数=' + flowData.edges.length);

            return flowData;
        }).catch(function(error) {
            self.log('error', 'Claude: 生成失败 - ' + error.message);
            throw error;
        });
    };

    /**
     * 流式生成流程图（Claude Stream API）
     * @param {string} description - 用户描述
     * @param {Function} onChunk - 接收数据块的回调函数
     * @returns {Promise<Object>} - 完整的流程图数据
     */
    ClaudeAdapter.prototype.generateFlowchartStream = function(description, onChunk) {
        var self = this;

        this.log('info', 'Claude: 开始流式生成');

        var messages = PromptTemplates.buildClaudeMessages(description);

        var requestData = {
            model: this.model,
            max_tokens: this.maxTokens,
            temperature: this.temperature,
            system: PromptTemplates.SYSTEM_PROMPT,
            messages: messages,
            stream: true
        };

        var headers = {
            'x-api-key': this.apiKey,
            'anthropic-version': this.apiVersion
        };

        var url = this.baseURL + '/messages';

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
                        return self.parseFlowchartJSON(buffer);
                    }

                    var chunk = decoder.decode(result.value, { stream: true });
                    var lines = chunk.split('\n');

                    for (var i = 0; i < lines.length; i++) {
                        var line = lines[i].trim();

                        if (line === '' || !line.startsWith('data: ')) {
                            continue;
                        }

                        try {
                            var data = JSON.parse(line.substring(6));

                            if (data.type === 'content_block_delta' &&
                                data.delta && data.delta.text) {
                                var text = data.delta.text;
                                buffer += text;

                                if (onChunk) {
                                    onChunk(text);
                                }
                            }
                        } catch (e) {
                            // 跳过无法解析的行
                        }
                    }

                    return readChunk();
                });
            }

            return readChunk();
        }).then(function(flowData) {
            self.validateFlowData(flowData);
            self.log('info', 'Claude Stream: 生成完成');
            return flowData;
        }).catch(function(error) {
            self.log('error', 'Claude Stream: 生成失败 - ' + error.message);
            throw error;
        });
    };

    return ClaudeAdapter;
})();
