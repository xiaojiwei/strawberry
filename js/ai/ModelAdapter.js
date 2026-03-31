/**
 * AI流程图生成 - 大模型适配器基类
 * 为不同的大模型提供统一的接口
 */

var ModelAdapter = (function() {
    'use strict';

    /**
     * 大模型适配器基类
     * @param {Object} config - 配置对象
     * @param {string} config.apiKey - API密钥
     * @param {string} config.baseURL - API基础URL
     * @param {string} config.model - 模型名称
     */
    function ModelAdapter(config) {
        if (!config) {
            throw new Error('配置对象不能为空');
        }

        this.apiKey = config.apiKey || '';
        this.baseURL = config.baseURL || '';
        this.model = config.model || '';
        this.timeout = config.timeout || 60000; // 默认60秒超时
    }

    /**
     * 生成流程图（抽象方法，子类必须实现）
     * @param {string} description - 用户的流程图描述
     * @returns {Promise<Object>} - 返回流程图数据 {nodes: [], edges: []}
     */
    ModelAdapter.prototype.generateFlowchart = function(description) {
        throw new Error('子类必须实现 generateFlowchart() 方法');
    };

    /**
     * 发送HTTP请求的通用方法
     * @param {string} endpoint - API端点
     * @param {Object} data - 请求数据
     * @param {Object} customHeaders - 自定义请求头
     * @returns {Promise<Object>} - 响应数据
     */
    ModelAdapter.prototype.request = function(endpoint, data, customHeaders) {
        var self = this;
        var url = this.baseURL + endpoint;

        // 默认请求头
        var headers = {
            'Content-Type': 'application/json'
        };

        // 合并自定义请求头
        if (customHeaders) {
            for (var key in customHeaders) {
                headers[key] = customHeaders[key];
            }
        }

        // 检测是否需要使用代理（避免CORS问题）
        var useProxy = this._shouldUseProxy();
        var requestUrl = url;
        var requestHeaders = headers;
        var requestBody = data;

        if (useProxy) {
            console.log('ModelAdapter: 使用代理服务器转发请求到 ' + url);
            // 使用代理端点
            requestUrl = window.location.origin + '/api/proxy';
            requestHeaders = {
                'Content-Type': 'application/json'
            };
            requestBody = {
                url: url,
                method: 'POST',
                headers: headers,
                body: data
            };
        }

        // 创建超时Promise
        var timeoutPromise = new Promise(function(resolve, reject) {
            setTimeout(function() {
                reject(new Error('请求超时（' + (self.timeout / 1000) + '秒）'));
            }, self.timeout);
        });

        // 创建fetch Promise
        var fetchPromise = fetch(requestUrl, {
            method: 'POST',
            headers: requestHeaders,
            body: JSON.stringify(requestBody)
        }).then(function(response) {
            if (!response.ok) {
                return response.text().then(function(text) {
                    var errorMsg = 'API请求失败 (' + response.status + ')';
                    try {
                        var errorData = JSON.parse(text);
                        if (errorData.error && errorData.error.message) {
                            errorMsg += ': ' + errorData.error.message;
                        } else if (errorData.message) {
                            errorMsg += ': ' + errorData.message;
                        }
                    } catch (e) {
                        errorMsg += ': ' + text.substring(0, 200);
                    }
                    throw new Error(errorMsg);
                });
            }
            return response.json();
        });

        // 使用Promise.race实现超时控制
        return Promise.race([fetchPromise, timeoutPromise]);
    };

    /**
     * 判断是否应该使用代理服务器
     * @returns {boolean}
     * @private
     */
    ModelAdapter.prototype._shouldUseProxy = function() {
        // 如果是从localhost访问，使用代理
        var origin = window.location.origin;
        var isLocalhost = origin.indexOf('localhost') !== -1 || origin.indexOf('127.0.0.1') !== -1;

        return isLocalhost;
    };

    /**
     * 解析大模型返回的JSON数据
     * @param {string} content - 模型返回的内容
     * @returns {Object} - 解析后的流程图数据
     */
    ModelAdapter.prototype.parseFlowchartJSON = function(content) {
        if (!content) {
            throw new Error('模型返回内容为空');
        }

        try {
            // 尝试直接解析
            return JSON.parse(content);
        } catch (e) {
            // 尝试提取JSON（如果模型返回了markdown包装）
            var jsonMatch = content.match(/```json\s*\n([\s\S]*?)\n```/);
            if (jsonMatch) {
                try {
                    return JSON.parse(jsonMatch[1]);
                } catch (e2) {
                    throw new Error('无法解析JSON（markdown格式）: ' + e2.message);
                }
            }

            // 尝试提取普通代码块
            var codeMatch = content.match(/```\s*\n([\s\S]*?)\n```/);
            if (codeMatch) {
                try {
                    return JSON.parse(codeMatch[1]);
                } catch (e3) {
                    throw new Error('无法解析JSON（代码块格式）: ' + e3.message);
                }
            }

            // 尝试查找JSON对象（以{开头，以}结尾）
            var objectMatch = content.match(/\{[\s\S]*\}/);
            if (objectMatch) {
                try {
                    return JSON.parse(objectMatch[0]);
                } catch (e4) {
                    throw new Error('无法解析JSON（对象提取）: ' + e4.message);
                }
            }

            throw new Error('无法从模型响应中提取有效的JSON数据');
        }
    };

    /**
     * 验证流程图数据结构
     * @param {Object} flowData - 流程图数据
     * @throws {Error} - 如果数据格式不正确
     */
    ModelAdapter.prototype.validateFlowData = function(flowData) {
        // 检查基本结构
        if (!flowData || typeof flowData !== 'object') {
            throw new Error('流程图数据必须是一个对象');
        }

        if (!flowData.nodes || !Array.isArray(flowData.nodes)) {
            throw new Error('缺少nodes数组');
        }

        if (!flowData.edges || !Array.isArray(flowData.edges)) {
            throw new Error('缺少edges数组');
        }

        if (flowData.nodes.length === 0) {
            throw new Error('流程图至少需要一个节点');
        }

        // 验证节点
        var validTypes = ['start', 'end', 'process', 'decision', 'data', 'document'];
        var nodeIds = {};
        var hasStart = false;
        var hasEnd = false;

        for (var i = 0; i < flowData.nodes.length; i++) {
            var node = flowData.nodes[i];

            // 检查必需字段
            if (!node.id) {
                throw new Error('节点缺少id字段（索引' + i + '）');
            }

            if (!node.type) {
                throw new Error('节点' + node.id + '缺少type字段');
            }

            if (!node.label) {
                throw new Error('节点' + node.id + '缺少label字段');
            }

            // 检查节点类型
            if (validTypes.indexOf(node.type) === -1) {
                throw new Error('节点' + node.id + '的类型无效: ' + node.type +
                              '（有效类型: ' + validTypes.join(', ') + '）');
            }

            // 检查ID唯一性
            if (nodeIds[node.id]) {
                throw new Error('节点ID重复: ' + node.id);
            }
            nodeIds[node.id] = true;

            // 检查start和end节点
            if (node.type === 'start') {
                if (hasStart) {
                    throw new Error('流程图只能有一个start节点');
                }
                hasStart = true;
            }

            if (node.type === 'end') {
                hasEnd = true;
            }
        }

        // 验证必需的节点类型
        if (!hasStart) {
            throw new Error('流程图必须有一个start节点');
        }

        if (!hasEnd) {
            throw new Error('流程图必须有至少一个end节点');
        }

        // 验证边
        for (var i = 0; i < flowData.edges.length; i++) {
            var edge = flowData.edges[i];

            if (!edge.from) {
                throw new Error('边缺少from字段（索引' + i + '）');
            }

            if (!edge.to) {
                throw new Error('边缺少to字段（索引' + i + '）');
            }

            // 检查节点引用
            if (!nodeIds[edge.from]) {
                throw new Error('边引用了不存在的节点: ' + edge.from);
            }

            if (!nodeIds[edge.to]) {
                throw new Error('边引用了不存在的节点: ' + edge.to);
            }
        }

        return true;
    };

    /**
     * 日志记录辅助方法
     * @param {string} level - 日志级别（info/warn/error）
     * @param {string} message - 日志消息
     */
    ModelAdapter.prototype.log = function(level, message) {
        var timestamp = new Date().toISOString();
        var logMessage = '[' + timestamp + '] [' + level.toUpperCase() + '] ' + message;

        if (level === 'error') {
            console.error(logMessage);
        } else if (level === 'warn') {
            console.warn(logMessage);
        } else {
            console.log(logMessage);
        }
    };

    /**
     * 重试机制包装器
     * @param {Function} fn - 要执行的异步函数
     * @param {number} maxRetries - 最大重试次数
     * @param {number} retryDelay - 重试延迟（毫秒）
     * @returns {Promise} - 函数执行结果
     */
    ModelAdapter.prototype.withRetry = function(fn, maxRetries, retryDelay) {
        maxRetries = maxRetries || 3;
        retryDelay = retryDelay || 1000;

        var self = this;
        var attempt = 0;

        function executeWithRetry() {
            attempt++;
            return fn().catch(function(error) {
                if (attempt >= maxRetries) {
                    self.log('error', '重试' + maxRetries + '次后仍然失败: ' + error.message);
                    throw error;
                }

                self.log('warn', '第' + attempt + '次尝试失败，' + retryDelay + 'ms后重试: ' + error.message);

                return new Promise(function(resolve) {
                    setTimeout(resolve, retryDelay * attempt); // 指数退避
                }).then(executeWithRetry);
            });
        }

        return executeWithRetry();
    };

    return ModelAdapter;
})();
