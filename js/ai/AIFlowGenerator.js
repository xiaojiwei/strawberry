/**
 * AI流程图生成器 - 核心模块
 * 整合大模型适配器、自动布局、渲染引擎
 */

var AIFlowGenerator = (function() {
    'use strict';

    /**
     * AI流程图生成器构造函数
     */
    function AIFlowGenerator() {
        this.adapter = null;
        this.autoLayout = new AutoLayout();
        this.configManager = new ConfigManager();
        this.currentModelType = null;
        this.isGenerating = false;
    }

    /**
     * 设置当前使用的模型适配器
     * @param {string} adapterType - 适配器类型（openai/claude/qwen/doubao/custom）
     * @param {Object} config - 配置对象（可选，不传则从ConfigManager加载）
     */
    AIFlowGenerator.prototype.setAdapter = function(adapterType, config) {
        this.currentModelType = adapterType;

        // 如果没有传入配置，从ConfigManager加载
        if (!config) {
            config = this.configManager.getModelConfig(adapterType);
        }

        // 验证配置
        this.configManager.validateConfig(adapterType, config);

        // 创建对应的适配器
        switch (adapterType) {
            case 'openai':
                this.adapter = new OpenAIAdapter(config);
                break;

            case 'claude':
                this.adapter = new ClaudeAdapter(config);
                break;

            case 'qwen':
                this.adapter = new QwenAdapter(config);
                break;

            case 'doubao':
                this.adapter = new DoubaoAdapter(config);
                break;

            case 'minimax':
                this.adapter = new MinimaxAdapter(config);
                break;

            case 'custom':
                this.adapter = new CustomAdapter(config);
                break;

            default:
                throw new Error('不支持的模型类型: ' + adapterType);
        }

        console.log('AIFlowGenerator: 已设置适配器 - ' + adapterType);
    };

    /**
     * 生成流程图（主入口）
     * @param {string} description - 用户描述
     * @param {Object} options - 可选配置
     * @returns {Promise<boolean>} - 生成是否成功
     */
    AIFlowGenerator.prototype.generate = function(description, options) {
        var self = this;

        // 防止重复调用
        if (this.isGenerating) {
            throw new Error('正在生成中，请等待完成');
        }

        // 检查适配器
        if (!this.adapter) {
            throw new Error('请先设置模型适配器');
        }

        // 默认选项
        options = options || {};
        var clearCanvas = options.clearCanvas || false;
        var layoutType = options.layoutType || 'hierarchical'; // hierarchical/force/grid

        this.isGenerating = true;

        return new Promise(function(resolve, reject) {
            // 步骤1: 调用大模型生成流程图数据
            self._updateStatus('正在调用AI模型生成流程图...');

            self.adapter.generateFlowchart(description).then(function(flowData) {
                console.log('AIFlowGenerator: 流程图数据生成成功');

                // 步骤2: 计算布局
                self._updateStatus('正在计算节点布局...');

                var layoutData;
                if (layoutType === 'force') {
                    layoutData = self.autoLayout.forceDirectedLayout(flowData);
                } else if (layoutType === 'grid') {
                    layoutData = self.autoLayout.gridLayout(flowData);
                } else {
                    layoutData = self.autoLayout.calculate(flowData);
                }

                // 步骤3: 渲染到画布
                self._updateStatus('正在渲染流程图到画布...');

                // 清空画布（如果需要）
                if (clearCanvas) {
                    self._clearCanvas();
                }

                self._renderToCanvas(layoutData);

                // 完成
                self._updateStatus('流程图生成完成！');
                self.isGenerating = false;

                resolve(true);
            }).catch(function(error) {
                console.error('AIFlowGenerator: 生成失败', error);
                self._updateStatus('生成失败: ' + error.message);
                self.isGenerating = false;

                reject(error);
            });
        });
    };

    /**
     * 渲染流程图到画布
     * @param {Object} layoutData - 布局数据
     * @private
     */
    AIFlowGenerator.prototype._renderToCanvas = function(layoutData) {
        var self = this;

        // 清空画布
        self._clearCanvas();

        // 获取当前modeTool的索引，确保新生成的节点有更高的zIndex
        var modeTool = com.xjwgraph.Global.modeTool;
        var currentModeIndex = modeTool.baseModeIdIndex + modeTool.stepIndex;
        var modeIndexMap = {}; // 原始ID -> 模式索引
        var lineIndex = 1;

        // 第一步：计算所有节点位置
        var nodes = layoutData.nodes || [];

        // 如果节点有位置信息，使用它；否则使用自动布局
        if (nodes.length > 0 && nodes[0].x !== undefined) {
            // 已有位置，直接使用
            for (var i = 0; i < nodes.length; i++) {
                var node = nodes[i];
                modeIndexMap[node.id] = currentModeIndex++;
            }
        } else {
            // 需要自动布局
            var layoutData2;
            var layoutType = 'hierarchical';

            if (layoutType === 'force') {
                layoutData2 = self.autoLayout.forceDirectedLayout(layoutData);
            } else if (layoutType === 'grid') {
                layoutData2 = self.autoLayout.gridLayout(layoutData);
            } else {
                layoutData2 = self.autoLayout.calculate(layoutData);
            }

            nodes = layoutData2.nodes || [];
            for (var i = 0; i < nodes.length; i++) {
                modeIndexMap[nodes[i].id] = currentModeIndex++;
            }
        }

        // 更新modeTool的索引到最大值，确保后续拖拽正常工作
        modeTool.baseModeIdIndex = currentModeIndex;

        // 第二步：生成XML字符串
        var xmlBuilder = [];

        xmlBuilder.push('<?xml version=\'1.0\' encoding=\'utf8\'?><modes>');

        // 记录哪些节点被线连接了
        var connectedNodeIds = {};

        // 生成所有line连接
        var edges = layoutData.edges || [];

        for (var i = 0; i < edges.length; i++) {
            var edge = edges[i];
            var fromModeIndex = modeIndexMap[edge.from];
            var toModeIndex = modeIndexMap[edge.to];

            if (!fromModeIndex || !toModeIndex) {
                console.warn('AIFlowGenerator: 跳过无效的边 - ' + edge.from + ' -> ' + edge.to);
                continue;
            }

            // 记录连接的节点
            connectedNodeIds[edge.from] = true;
            connectedNodeIds[edge.to] = true;

            var fromNode = null;
            var toNode = null;
            for (var j = 0; j < nodes.length; j++) {
                if (nodes[j].id === edge.from) fromNode = nodes[j];
                if (nodes[j].id === edge.to) toNode = nodes[j];
            }

            if (!fromNode || !toNode) continue;

            // 计算连接点和路径
            var connection = self._calculateConnection(fromNode, toNode, fromModeIndex, toModeIndex);

            xmlBuilder.push('<line ');
            xmlBuilder.push('strokeweight="2" strokecolor="black" ');
            xmlBuilder.push('brokenType="' + connection.brokenType + '" ');
            xmlBuilder.push('stroke="purple" ');
            xmlBuilder.push('path="' + connection.path + '" ');
            xmlBuilder.push('d="' + connection.path + '" ');
            xmlBuilder.push('id="line' + lineIndex + '" ');
            xmlBuilder.push('style="cursor: pointer; fill: none; stroke: black; stroke-width: 2;" ');
            xmlBuilder.push('marker-end="url(#arrow)" ');
            xmlBuilder.push('xBaseMode="module' + fromModeIndex + '" ');
            xmlBuilder.push('xIndex="' + connection.xIndex + '" ');
            xmlBuilder.push('wBaseMode="module' + toModeIndex + '" ');
            xmlBuilder.push('wIndex="' + connection.wIndex + '" ');
            xmlBuilder.push('attr_prop_attri1="2" attr_prop_attri2="3" attr_prop_attri3="4" attr_prop_attri4="5"/>');

            lineIndex++;
        }

        // 只生成被线连接的mode节点
        // 重要：确保每个mode都有线与之关联
        var connectedNodes = [];
        for (var i = 0; i < nodes.length; i++) {
            if (connectedNodeIds[nodes[i].id]) {
                connectedNodes.push(nodes[i]);
            } else {
                console.warn('AIFlowGenerator: 节点 ' + nodes[i].id + ' 没有线连接，将被忽略');
            }
        }

        // 生成所有mode节点（只生成有连接的节点）
        for (var i = 0; i < connectedNodes.length; i++) {
            var node = connectedNodes[i];
            var imgSrc = this._getImageByType(node.type);
            var modeIndex = modeIndexMap[node.id];

            // 确保位置是整数
            var x = Math.floor(node.x);
            var y = Math.floor(node.y);
            var w = Math.floor(node.width || 50);
            var h = Math.floor(node.height || 50);
            var zIndex = modeIndex;

            var label = node.label || '';
            label = self._escapeXmlAttribute(label);

            xmlBuilder.push('<mode ');
            xmlBuilder.push('classname="module" class="module" ');
            xmlBuilder.push('attr_prop_attri1="2" attr_prop_attri2="3" attr_prop_attri3="4" ');
            xmlBuilder.push('id="' + modeIndex + '" ');
            xmlBuilder.push('title="' + label + '" ');
            xmlBuilder.push('backImgSrc="' + imgSrc + '" ');
            xmlBuilder.push('top="' + y + '" ');
            xmlBuilder.push('left="' + x + '" ');
            xmlBuilder.push('zIndex="' + zIndex + '" ');
            xmlBuilder.push('width="' + w + '" height="' + h + '"/>');
        }

        xmlBuilder.push('</modes>');

        var xmlString = xmlBuilder.join('');
        console.log('AIFlowGenerator: 生成的XML: ' + xmlString);

        // 第三步：使用graphUtils.loadTextXml加载XML
        // graphUtils是全局变量，不是Global的属性
        if (typeof graphUtils !== 'undefined' && graphUtils.loadTextXml) {
            graphUtils.loadTextXml(xmlString);
        } else {
            console.error('AIFlowGenerator: graphUtils.loadTextXml 不存在');
        }

        // 第四步：更新小地图
        setTimeout(function() {
            if (com.xjwgraph.Global.smallTool) {
                com.xjwgraph.Global.smallTool.drawAll();
            }
        }, 200);
    };

    /**
     * 根据节点类型获取对应的图片路径
     * @param {string} nodeType - 节点类型
     * @returns {string} - 图片路径
     * @private
     */
    AIFlowGenerator.prototype._getImageByType = function(nodeType) {
        var typeImageMap = {
            'start': 'images/liucheng1.png',      // 开始（椭圆）
            'end': 'images/liucheng2.png',        // 结束（椭圆）
            'process': 'images/liucheng3.png',    // 流程（矩形）
            'decision': 'images/liucheng4.png',   // 判断（菱形）
            'data': 'images/liucheng5.png',       // 数据（平行四边形）
            'document': 'images/liucheng6.png'    // 文档
        };

        return typeImageMap[nodeType] || 'images/baseMode1.png';
    };

    /**
     * 更新状态显示
     * @param {string} message - 状态消息
     * @private
     */
    AIFlowGenerator.prototype._updateStatus = function(message) {
        console.log('AIFlowGenerator: ' + message);

        var statusElement = document.getElementById('aiStatus');
        if (statusElement) {
            statusElement.innerHTML = message;

            // 根据消息类型设置样式
            if (message.indexOf('失败') !== -1 || message.indexOf('错误') !== -1) {
                statusElement.style.color = '#f00';
            } else if (message.indexOf('完成') !== -1) {
                statusElement.style.color = '#0a0';
            } else {
                statusElement.style.color = '#666';
            }
        }
    };

    /**
     * 转义XML属性值
     * @param {string} value - 原始值
     * @returns {string} - 转义后的值
     * @private
     */
    AIFlowGenerator.prototype._escapeXmlAttribute = function(value) {
        if (!value) return '';
        return String(value)
            .replace(/&/g, '&amp;')
            .replace(/'/g, '&apos;')
            .replace(/"/g, '&quot;')
            .replace(/>/g, '&gt;')
            .replace(/</g, '&lt;');
    };

    /**
     * 计算连接点信息（优先使用上下连接点）
     * @param {Object} fromNode - 起始节点
     * @param {Object} toNode - 目标节点
     * @param {number} fromIndex - 起始节点索引
     * @param {number} toIndex - 目标节点索引
     * @returns {Object} - 连接信息对象
     * @private
     */
    AIFlowGenerator.prototype._calculateConnection = function(fromNode, toNode, fromIndex, toIndex) {
        var fromX = Math.floor(fromNode.x || 0);
        var fromY = Math.floor(fromNode.y || 0);
        var fromW = Math.floor(fromNode.width || 50);
        var fromH = Math.floor(fromNode.height || 50);

        var toX = Math.floor(toNode.x || 0);
        var toY = Math.floor(toNode.y || 0);
        var toW = Math.floor(toNode.width || 50);
        var toH = Math.floor(toNode.height || 50);

        // 计算节点中心点
        var fromCenterX = fromX + fromW / 2;
        var fromCenterY = fromY + fromH / 2;
        var toCenterX = toX + toW / 2;
        var toCenterY = toY + toH / 2;

        // 判断相对位置
        var verticalDiff = toCenterY - fromCenterY;
        var horizontalDiff = toCenterX - fromCenterX;

        // PathGlobal连接点索引值
        var pointTypeUp = 2;         // 上
        var pointTypeDown = 7;       // 下
        var pointTypeLeft = 4;       // 左
        var pointTypeRight = 5;      // 右

        var xIndex, wIndex, startX, startY, endX, endY;
        var brokenType = 1; // 默认直线连接

        // 判断连接类型：上下连接 vs 左右连接
        var isVerticalFlow = Math.abs(verticalDiff) > Math.abs(horizontalDiff);

        if (isVerticalFlow) {
            // 上下流程，优先使用上下连接点
            if (verticalDiff > 0) {
                // 目标在下：起始用下连接点，目标用上连接点
                xIndex = pointTypeDown;
                wIndex = pointTypeUp;
                startX = fromCenterX;
                startY = fromY + fromH;
                endX = toCenterX;
                endY = toY;
            } else {
                // 目标在上：起始用上连接点，目标用下连接点
                xIndex = pointTypeUp;
                wIndex = pointTypeDown;
                startX = fromCenterX;
                startY = fromY;
                endX = toCenterX;
                endY = toY + toH;
            }

            // 如果水平方向有较大偏移，使用折线连接
            if (Math.abs(horizontalDiff) > fromW / 2) {
                brokenType = 2;
            }
        } else {
            // 左右流程，使用直线连接，避免折线问题
            brokenType = 1;

            if (horizontalDiff > 0) {
                // 目标在右
                xIndex = pointTypeRight;
                wIndex = pointTypeLeft;
                startX = fromX + fromW;
                startY = fromCenterY;
                endX = toX;
                endY = toCenterY;
            } else {
                // 目标在左
                xIndex = pointTypeLeft;
                wIndex = pointTypeRight;
                startX = fromX;
                startY = fromCenterY;
                endX = toX + toW;
                endY = toCenterY;
            }
        }

        // 生成路径字符串，确保所有值都是有效数字
        var path = '';
        if (brokenType === 1) {
            // 直线连接
            path = 'M ' + Math.floor(startX) + ' ' + Math.floor(startY) + ' L ' + Math.floor(endX) + ' ' + Math.floor(endY) + ' ';
        } else {
            // 折线连接（参考示例格式：M 515 172 L 515 303,696 303,696 478）
            var midY = Math.floor(startY + (endY - startY) / 2);

            // 验证所有值有效
            if (isNaN(midY)) {
                midY = Math.floor(startY);
            }

            path = 'M ' + Math.floor(startX) + ' ' + Math.floor(startY) + ' L ' + Math.floor(startX) + ' ' + midY + ',' +
                   Math.floor(endX) + ' ' + midY + ',' + Math.floor(endX) + ' ' + Math.floor(endY) + ' ';
        }

        return {
            xIndex: xIndex,
            wIndex: wIndex,
            path: path,
            brokenType: brokenType
        };
    };

    /**
     * 清空画布
     * @private
     */
    AIFlowGenerator.prototype._clearCanvas = function() {
        var modeTool = com.xjwgraph.Global.modeTool;
        var lineTool = com.xjwgraph.Global.lineTool;

        console.log('AIFlowGenerator: 清空画布');

        // 删除所有线
        var lineIds = com.xjwgraph.Global.lineMap.getKeys();
        for (var i = 0; i < lineIds.length; i++) {
            try {
                lineTool.removeNode(lineIds[i]);
            } catch (e) {}
        }

        // 删除所有节点
        var modeIds = com.xjwgraph.Global.modeMap.getKeys();
        for (var i = 0; i < modeIds.length; i++) {
            try {
                modeTool.removeNode(modeIds[i]);
            } catch (e) {}
        }

        // 清空画布后，重置modeTool的索引，确保新生成的节点从1开始
        modeTool.baseModeIdIndex = PathGlobal.modeDefIndex;
    };

    /**
     * 重新生成流程图（使用相同的描述）
     * @param {string} description - 原始描述
     * @param {Object} options - 可选配置
     * @returns {Promise<boolean>} - 是否成功
     */
    AIFlowGenerator.prototype.regenerate = function(description, options) {
        options = options || {};
        options.clearCanvas = true; // 重新生成时总是清空画布

        return this.generate(description, options);
    };

    /**
     * 优化现有流程图（让AI分析并改进）
     * @returns {Promise<string>} - AI的优化建议
     */
    AIFlowGenerator.prototype.optimizeFlowchart = function() {
        var self = this;

        if (!this.adapter) {
            throw new Error('请先设置模型适配器');
        }

        // 导出当前流程图为JSON
        var currentFlow = this._exportCurrentFlow();

        var prompt = '请分析以下流程图，给出优化建议：\n\n' +
                    JSON.stringify(currentFlow, null, 2) +
                    '\n\n请从以下方面分析：\n' +
                    '1. 流程是否合理\n' +
                    '2. 是否有遗漏的步骤\n' +
                    '3. 是否有冗余的步骤\n' +
                    '4. 异常处理是否完善\n' +
                    '5. 建议的改进方案';

        // 这里需要调用模型的通用对话接口
        // 由于我们的适配器只实现了generateFlowchart，这里简化处理
        return Promise.resolve('优化功能需要扩展适配器接口');
    };

    /**
     * 导出当前画布上的流程图为JSON格式
     * @returns {Object} - 流程图数据
     * @private
     */
    AIFlowGenerator.prototype._exportCurrentFlow = function() {
        var flowData = {
            nodes: [],
            edges: []
        };

        // 导出所有节点
        com.xjwgraph.Global.modeMap.forEach(function(modeId) {
            var mode = document.getElementById(modeId);
            var modeObj = com.xjwgraph.Global.modeMap.get(modeId);

            if (!mode) return;

            var titleElement = mode.querySelector('.title');
            var contentElement = mode.querySelector('.content');

            flowData.nodes.push({
                id: modeId,
                type: 'process', // 简化处理，实际应根据图片判断类型
                label: titleElement ? titleElement.textContent : '',
                content: contentElement ? contentElement.textContent : '',
                x: parseInt(mode.style.left) || 0,
                y: parseInt(mode.style.top) || 0,
                width: mode.offsetWidth,
                height: mode.offsetHeight
            });
        });

        // 导出所有边
        com.xjwgraph.Global.lineMap.forEach(function(lineId) {
            var line = com.xjwgraph.Global.lineMap.get(lineId);

            if (!line) return;

            flowData.edges.push({
                from: line.xBaseMode.id,
                to: line.wBaseMode.id,
                label: line.prop ? (line.prop.label || '') : ''
            });
        });

        return flowData;
    };

    /**
     * 获取生成状态
     * @returns {boolean} - 是否正在生成
     */
    AIFlowGenerator.prototype.isGeneratingNow = function() {
        return this.isGenerating;
    };

    /**
     * 取消生成（如果支持）
     */
    AIFlowGenerator.prototype.cancelGeneration = function() {
        this.isGenerating = false;
        this._updateStatus('生成已取消');
    };

    /**
     * 估算流程图复杂度
     * @param {string} description - 用户描述
     * @returns {string} - 复杂度等级（simple/medium/complex）
     */
    AIFlowGenerator.prototype.estimateComplexity = function(description) {
        var length = description.length;
        var steps = (description.match(/\d+\./g) || []).length;
        var keywords = ['如果', '否则', '循环', '重复', '判断', '分支'];
        var keywordCount = 0;

        keywords.forEach(function(keyword) {
            if (description.indexOf(keyword) !== -1) {
                keywordCount++;
            }
        });

        if (length < 100 && steps <= 3 && keywordCount === 0) {
            return 'simple';
        } else if (length < 300 && steps <= 8 && keywordCount <= 2) {
            return 'medium';
        } else {
            return 'complex';
        }
    };

    return AIFlowGenerator;
})();
