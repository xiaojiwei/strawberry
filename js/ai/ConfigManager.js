/**
 * AI流程图生成 - 配置管理器
 * 负责保存和加载大模型API配置
 */

var ConfigManager = (function() {
    'use strict';

    /**
     * 配置管理器构造函数
     */
    function ConfigManager() {
        this.storageKey = 'strawberry_ai_config_v1';
        this.config = null;
    }

    /**
     * 获取默认配置
     * @returns {Object} - 默认配置对象
     */
    ConfigManager.prototype.getDefaultConfig = function() {
        return {
            // OpenAI配置
            openai: {
                apiKey: '',
                baseURL: 'https://api.openai.com/v1',
                model: 'gpt-4o',
                enabled: false
            },

            // Claude配置
            claude: {
                apiKey: '',
                baseURL: 'https://api.anthropic.com/v1',
                model: 'claude-3-5-sonnet-20241022',
                enabled: false
            },

            // 通义千问配置
            qwen: {
                apiKey: '',
                baseURL: 'https://dashscope.aliyuncs.com/api/v1',
                model: 'qwen-plus',
                enabled: false
            },

            // 豆包配置
            doubao: {
                apiKey: '',
                baseURL: 'https://ark.cn-beijing.volces.com/api/v3',
                model: 'doubao-pro-32k',
                enabled: false
            },

            // MiniMax配置
            minimax: {
                apiKey: 'sk-api-h-KWQ9KWojRp1_f3dqDs1SJgqAr6JbtMSm9A41SrMJj4LPHx00vzJMSWR44KziNi19zU9OOS47pTXHteLVThRzIFIJmMuby-IPL6NmE4-QafuMt3z57d9sI',
                baseURL: 'https://api.minimaxi.com/anthropic',
                model: 'MiniMax-M2.7',
                enabled: true
            },

            // 自定义模型配置
            custom: {
                apiKey: '',
                baseURL: '',
                model: '',
                headers: {},
                enabled: false
            },

            // 默认使用的模型
            defaultModel: 'minimax',

            // 其他设置
            settings: {
                autoLayout: true,        // 自动布局
                clearBeforeGenerate: false,  // 生成前清空画布
                showConfirmDialog: true,     // 显示确认对话框
                maxRetries: 3,              // 最大重试次数
                timeout: 60000              // 超时时间（毫秒）
            }
        };
    };

    /**
     * 加载配置
     * @returns {Object} - 配置对象
     */
    ConfigManager.prototype.loadConfig = function() {
        if (this.config) {
            return this.config;
        }

        try {
            if (typeof localStorage === 'undefined') {
                console.warn('浏览器不支持localStorage，使用默认配置');
                this.config = this.getDefaultConfig();
                return this.config;
            }

            var configStr = localStorage.getItem(this.storageKey);

            if (configStr) {
                this.config = JSON.parse(configStr);

                // 合并默认配置（处理新增的配置项）
                var defaultConfig = this.getDefaultConfig();
                this.config = this._mergeConfig(defaultConfig, this.config);

                console.log('配置加载成功');
            } else {
                console.log('未找到保存的配置，使用默认配置');
                this.config = this.getDefaultConfig();
            }
        } catch (e) {
            console.error('配置加载失败:', e);
            this.config = this.getDefaultConfig();
        }

        return this.config;
    };

    /**
     * 保存配置
     * @param {Object} config - 要保存的配置对象
     * @returns {boolean} - 保存是否成功
     */
    ConfigManager.prototype.saveConfig = function(config) {
        try {
            if (typeof localStorage === 'undefined') {
                console.error('浏览器不支持localStorage');
                return false;
            }

            // 验证配置
            if (!config || typeof config !== 'object') {
                throw new Error('配置对象无效');
            }

            localStorage.setItem(this.storageKey, JSON.stringify(config));
            this.config = config;

            console.log('配置保存成功');
            return true;
        } catch (e) {
            console.error('配置保存失败:', e);
            return false;
        }
    };

    /**
     * 获取指定模型的配置
     * @param {string} modelType - 模型类型（openai/claude/qwen/doubao/custom）
     * @returns {Object} - 模型配置
     */
    ConfigManager.prototype.getModelConfig = function(modelType) {
        var config = this.loadConfig();

        if (!config[modelType]) {
            throw new Error('不支持的模型类型: ' + modelType);
        }

        return config[modelType];
    };

    /**
     * 更新指定模型的配置
     * @param {string} modelType - 模型类型
     * @param {Object} modelConfig - 模型配置
     * @returns {boolean} - 更新是否成功
     */
    ConfigManager.prototype.updateModelConfig = function(modelType, modelConfig) {
        var config = this.loadConfig();

        if (!config[modelType]) {
            throw new Error('不支持的模型类型: ' + modelType);
        }

        config[modelType] = modelConfig;
        return this.saveConfig(config);
    };

    /**
     * 验证模型配置
     * @param {string} modelType - 模型类型
     * @param {Object} modelConfig - 模型配置（可选，不传则使用已保存的配置）
     * @throws {Error} - 如果配置无效
     * @returns {boolean} - 验证是否通过
     */
    ConfigManager.prototype.validateConfig = function(modelType, modelConfig) {
        if (!modelConfig) {
            modelConfig = this.getModelConfig(modelType);
        }

        // 基本验证
        if (!modelConfig.apiKey || modelConfig.apiKey.trim() === '') {
            throw new Error('请配置 ' + this._getModelDisplayName(modelType) + ' 的API Key');
        }

        if (!modelConfig.baseURL || modelConfig.baseURL.trim() === '') {
            throw new Error('请配置 ' + this._getModelDisplayName(modelType) + ' 的Base URL');
        }

        if (!modelConfig.model || modelConfig.model.trim() === '') {
            throw new Error('请配置 ' + this._getModelDisplayName(modelType) + ' 的模型名称');
        }

        // URL格式验证
        try {
            new URL(modelConfig.baseURL);
        } catch (e) {
            throw new Error('Base URL格式无效: ' + modelConfig.baseURL);
        }

        return true;
    };

    /**
     * 重置配置为默认值
     * @returns {boolean} - 重置是否成功
     */
    ConfigManager.prototype.resetConfig = function() {
        this.config = this.getDefaultConfig();
        return this.saveConfig(this.config);
    };

    /**
     * 导出配置为JSON文件
     */
    ConfigManager.prototype.exportConfig = function() {
        var config = this.loadConfig();

        // 移除敏感信息（API Key）
        var exportConfig = JSON.parse(JSON.stringify(config));
        for (var modelType in exportConfig) {
            if (exportConfig[modelType] && exportConfig[modelType].apiKey) {
                exportConfig[modelType].apiKey = '******';
            }
        }

        var blob = new Blob([JSON.stringify(exportConfig, null, 2)], {
            type: 'application/json'
        });

        var link = document.createElement('a');
        link.download = 'strawberry-ai-config.json';
        link.href = URL.createObjectURL(blob);
        link.click();
    };

    /**
     * 从JSON文件导入配置
     * @param {File} file - JSON配置文件
     * @returns {Promise<boolean>} - 导入是否成功
     */
    ConfigManager.prototype.importConfig = function(file) {
        var self = this;

        return new Promise(function(resolve, reject) {
            var reader = new FileReader();

            reader.onload = function(e) {
                try {
                    var importedConfig = JSON.parse(e.target.result);

                    // 合并配置（保留现有的API Key如果导入的配置中是******）
                    var currentConfig = self.loadConfig();
                    var mergedConfig = self._mergeConfig(currentConfig, importedConfig);

                    // 保存配置
                    if (self.saveConfig(mergedConfig)) {
                        resolve(true);
                    } else {
                        reject(new Error('保存配置失败'));
                    }
                } catch (e) {
                    reject(new Error('配置文件格式无效: ' + e.message));
                }
            };

            reader.onerror = function() {
                reject(new Error('读取配置文件失败'));
            };

            reader.readAsText(file);
        });
    };

    /**
     * 合并配置对象（深度合并）
     * @param {Object} target - 目标对象
     * @param {Object} source - 源对象
     * @returns {Object} - 合并后的对象
     * @private
     */
    ConfigManager.prototype._mergeConfig = function(target, source) {
        var result = {};

        // 复制target的所有属性
        for (var key in target) {
            if (target.hasOwnProperty(key)) {
                result[key] = target[key];
            }
        }

        // 合并source的属性
        for (var key in source) {
            if (source.hasOwnProperty(key)) {
                if (typeof source[key] === 'object' && source[key] !== null &&
                    !Array.isArray(source[key])) {
                    // 递归合并对象
                    result[key] = this._mergeConfig(
                        result[key] || {},
                        source[key]
                    );
                } else {
                    // 覆盖基本类型值（但跳过******占位符）
                    if (source[key] !== '******') {
                        result[key] = source[key];
                    }
                }
            }
        }

        return result;
    };

    /**
     * 获取模型的显示名称
     * @param {string} modelType - 模型类型
     * @returns {string} - 显示名称
     * @private
     */
    ConfigManager.prototype._getModelDisplayName = function(modelType) {
        var names = {
            'openai': 'OpenAI',
            'claude': 'Claude',
            'qwen': '通义千问',
            'doubao': '豆包',
            'minimax': 'MiniMax',
            'custom': '自定义模型'
        };

        return names[modelType] || modelType;
    };

    /**
     * 检查是否有可用的配置
     * @returns {Array<string>} - 已配置的模型类型列表
     */
    ConfigManager.prototype.getAvailableModels = function() {
        var config = this.loadConfig();
        var availableModels = [];

        var modelTypes = ['openai', 'claude', 'qwen', 'doubao', 'minimax', 'custom'];

        for (var i = 0; i < modelTypes.length; i++) {
            var modelType = modelTypes[i];
            var modelConfig = config[modelType];

            if (modelConfig && modelConfig.apiKey && modelConfig.apiKey.trim() !== '') {
                availableModels.push(modelType);
            }
        }

        return availableModels;
    };

    /**
     * 获取设置
     * @returns {Object} - 设置对象
     */
    ConfigManager.prototype.getSettings = function() {
        var config = this.loadConfig();
        return config.settings || this.getDefaultConfig().settings;
    };

    /**
     * 更新设置
     * @param {Object} settings - 新的设置
     * @returns {boolean} - 更新是否成功
     */
    ConfigManager.prototype.updateSettings = function(settings) {
        var config = this.loadConfig();
        config.settings = settings;
        return this.saveConfig(config);
    };

    return ConfigManager;
})();
