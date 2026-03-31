/**
 * AI流程图生成 - 自动布局算法
 * 实现层次布局算法，将流程图节点自动排列
 */

var AutoLayout = (function() {
    'use strict';

    /**
     * 自动布局构造函数
     */
    function AutoLayout() {
        // 布局参数
        this.nodeWidth = 100;              // 节点默认宽度
        this.nodeHeight = 60;              // 节点默认高度
        this.horizontalSpacing = 180;      // 水平间距
        this.verticalSpacing = 120;        // 垂直间距
        this.canvasOffsetX = 100;          // 画布左边距
        this.canvasOffsetY = 80;           // 画布上边距

        // 特殊节点尺寸
        this.nodeTypeSizes = {
            'start': { width: 120, height: 60 },
            'end': { width: 120, height: 60 },
            'process': { width: 140, height: 70 },
            'decision': { width: 120, height: 120 },
            'data': { width: 140, height: 70 },
            'document': { width: 130, height: 80 }
        };
    }

    /**
     * 计算布局
     * @param {Object} flowData - 流程图数据 {nodes: [], edges: []}
     * @returns {Object} - 带有坐标信息的布局数据
     */
    AutoLayout.prototype.calculate = function(flowData) {
        console.log('AutoLayout: 开始计算布局');

        // 1. 构建图结构
        var graph = this._buildGraph(flowData);

        // 2. 拓扑排序（检测环）
        var sortedNodes = this._topologicalSort(graph);

        // 3. 分层
        var layers = this._assignLayers(sortedNodes, graph);

        // 4. 减少交叉（可选优化）
        this._minimizeCrossings(layers, graph);

        // 5. 计算坐标
        var positions = this._calculatePositions(layers, flowData.nodes);

        // 6. 生成最终布局数据
        var layoutData = this._generateLayoutData(flowData, positions);

        console.log('AutoLayout: 布局计算完成，共' + layers.length + '层');

        return layoutData;
    };

    /**
     * 构建图结构
     * @param {Object} flowData - 流程图数据
     * @returns {Object} - 图对象
     * @private
     */
    AutoLayout.prototype._buildGraph = function(flowData) {
        var graph = {
            nodes: flowData.nodes,
            edges: flowData.edges,
            adjacency: {},      // 邻接表：nodeId -> [子节点ID列表]
            reverseAdjacency: {} // 反向邻接表：nodeId -> [父节点ID列表]
        };

        // 初始化邻接表
        flowData.nodes.forEach(function(node) {
            graph.adjacency[node.id] = [];
            graph.reverseAdjacency[node.id] = [];
        });

        // 构建邻接表
        flowData.edges.forEach(function(edge) {
            graph.adjacency[edge.from].push(edge.to);
            graph.reverseAdjacency[edge.to].push(edge.from);
        });

        return graph;
    };

    /**
     * 拓扑排序（Kahn算法）
     * @param {Object} graph - 图对象
     * @returns {Array<string>} - 排序后的节点ID列表
     * @private
     */
    AutoLayout.prototype._topologicalSort = function(graph) {
        var inDegree = {};
        var queue = [];
        var result = [];

        // 计算入度
        graph.nodes.forEach(function(node) {
            inDegree[node.id] = graph.reverseAdjacency[node.id].length;
        });

        // 找出所有入度为0的节点（起始节点）
        for (var nodeId in inDegree) {
            if (inDegree[nodeId] === 0) {
                queue.push(nodeId);
            }
        }

        // BFS遍历
        while (queue.length > 0) {
            var nodeId = queue.shift();
            result.push(nodeId);

            // 访问所有邻居
            var neighbors = graph.adjacency[nodeId];
            for (var i = 0; i < neighbors.length; i++) {
                var neighborId = neighbors[i];
                inDegree[neighborId]--;

                if (inDegree[neighborId] === 0) {
                    queue.push(neighborId);
                }
            }
        }

        // 检测环
        if (result.length !== graph.nodes.length) {
            console.warn('AutoLayout: 检测到环路，将使用强制布局');
            // 添加未访问的节点
            graph.nodes.forEach(function(node) {
                if (result.indexOf(node.id) === -1) {
                    result.push(node.id);
                }
            });
        }

        return result;
    };

    /**
     * 分配节点层级
     * @param {Array<string>} sortedNodes - 排序后的节点ID
     * @param {Object} graph - 图对象
     * @returns {Array<Array<string>>} - 层级数组，每层是节点ID列表
     * @private
     */
    AutoLayout.prototype._assignLayers = function(sortedNodes, graph) {
        var nodeLayer = {};
        var maxLayer = 0;

        // 为每个节点分配层级
        sortedNodes.forEach(function(nodeId) {
            var parents = graph.reverseAdjacency[nodeId];

            if (parents.length === 0) {
                // 没有父节点，放在第0层
                nodeLayer[nodeId] = 0;
            } else {
                // 计算父节点的最大层级，然后+1
                var maxParentLayer = -1;
                for (var i = 0; i < parents.length; i++) {
                    var parentId = parents[i];
                    if (nodeLayer[parentId] !== undefined) {
                        maxParentLayer = Math.max(maxParentLayer, nodeLayer[parentId]);
                    }
                }
                nodeLayer[nodeId] = maxParentLayer + 1;
            }

            maxLayer = Math.max(maxLayer, nodeLayer[nodeId]);
        });

        // 将节点按层分组
        var layers = [];
        for (var i = 0; i <= maxLayer; i++) {
            layers[i] = [];
        }

        for (var nodeId in nodeLayer) {
            var layer = nodeLayer[nodeId];
            layers[layer].push(nodeId);
        }

        return layers;
    };

    /**
     * 减少边交叉（简化版的重心启发式算法）
     * @param {Array<Array<string>>} layers - 层级数组
     * @param {Object} graph - 图对象
     * @private
     */
    AutoLayout.prototype._minimizeCrossings = function(layers, graph) {
        var maxIterations = 10;

        for (var iter = 0; iter < maxIterations; iter++) {
            var improved = false;

            // 从上到下优化
            for (var i = 1; i < layers.length; i++) {
                if (this._optimizeLayer(layers, i, graph, 'down')) {
                    improved = true;
                }
            }

            // 从下到上优化
            for (var i = layers.length - 2; i >= 0; i--) {
                if (this._optimizeLayer(layers, i, graph, 'up')) {
                    improved = true;
                }
            }

            // 如果没有改进，提前退出
            if (!improved) {
                break;
            }
        }
    };

    /**
     * 优化单层的节点顺序
     * @param {Array<Array<string>>} layers - 层级数组
     * @param {number} layerIndex - 要优化的层索引
     * @param {Object} graph - 图对象
     * @param {string} direction - 优化方向（'up'或'down'）
     * @returns {boolean} - 是否有改进
     * @private
     */
    AutoLayout.prototype._optimizeLayer = function(layers, layerIndex, graph, direction) {
        var layer = layers[layerIndex];
        var self = this;

        // 计算每个节点的重心位置
        var barycenters = layer.map(function(nodeId) {
            var sum = 0;
            var count = 0;

            // 根据方向选择邻居（父节点或子节点）
            var neighbors = direction === 'down' ?
                          graph.reverseAdjacency[nodeId] :
                          graph.adjacency[nodeId];

            // 计算邻居在其层中的平均位置
            neighbors.forEach(function(neighborId) {
                var neighborLayerIndex = direction === 'down' ? layerIndex - 1 : layerIndex + 1;

                if (neighborLayerIndex >= 0 && neighborLayerIndex < layers.length) {
                    var neighborLayer = layers[neighborLayerIndex];
                    var position = neighborLayer.indexOf(neighborId);

                    if (position !== -1) {
                        sum += position;
                        count++;
                    }
                }
            });

            return {
                nodeId: nodeId,
                barycenter: count > 0 ? sum / count : layer.indexOf(nodeId)
            };
        });

        // 按重心排序
        barycenters.sort(function(a, b) {
            return a.barycenter - b.barycenter;
        });

        // 更新层节点顺序
        var newOrder = barycenters.map(function(item) {
            return item.nodeId;
        });

        // 检查是否有变化
        var changed = false;
        for (var i = 0; i < layer.length; i++) {
            if (layer[i] !== newOrder[i]) {
                changed = true;
                break;
            }
        }

        if (changed) {
            layers[layerIndex] = newOrder;
        }

        return changed;
    };

    /**
     * 计算节点坐标
     * @param {Array<Array<string>>} layers - 层级数组
     * @param {Array<Object>} nodes - 节点数据
     * @returns {Object} - 节点ID到坐标的映射
     * @private
     */
    AutoLayout.prototype._calculatePositions = function(layers, nodes) {
        var positions = {};
        var self = this;

        // 创建节点ID到节点对象的映射
        var nodeMap = {};
        nodes.forEach(function(node) {
            nodeMap[node.id] = node;
        });

        layers.forEach(function(layer, layerIndex) {
            // 计算本层的总宽度
            var totalWidth = 0;
            layer.forEach(function(nodeId) {
                var node = nodeMap[nodeId];
                var size = self._getNodeSize(node.type);
                totalWidth += size.width;
            });

            totalWidth += (layer.length - 1) * self.horizontalSpacing;

            // 计算起始X坐标（居中）
            var startX = self.canvasOffsetX + Math.max(0, (800 - totalWidth) / 2);

            // 为每个节点计算坐标
            var currentX = startX;

            layer.forEach(function(nodeId) {
                var node = nodeMap[nodeId];
                var size = self._getNodeSize(node.type);

                var y = self.canvasOffsetY + layerIndex * (self.nodeHeight + self.verticalSpacing);
                var x = currentX;

                positions[nodeId] = {
                    x: x,
                    y: y,
                    width: size.width,
                    height: size.height
                };

                currentX += size.width + self.horizontalSpacing;
            });
        });

        return positions;
    };

    /**
     * 获取节点尺寸
     * @param {string} nodeType - 节点类型
     * @returns {Object} - {width, height}
     * @private
     */
    AutoLayout.prototype._getNodeSize = function(nodeType) {
        if (this.nodeTypeSizes[nodeType]) {
            return this.nodeTypeSizes[nodeType];
        }

        return {
            width: this.nodeWidth,
            height: this.nodeHeight
        };
    };

    /**
     * 生成最终布局数据
     * @param {Object} flowData - 原始流程图数据
     * @param {Object} positions - 节点位置映射
     * @returns {Object} - 完整的布局数据
     * @private
     */
    AutoLayout.prototype._generateLayoutData = function(flowData, positions) {
        var layoutData = {
            nodes: [],
            edges: flowData.edges
        };

        flowData.nodes.forEach(function(node) {
            var position = positions[node.id];

            layoutData.nodes.push({
                id: node.id,
                type: node.type,
                label: node.label,
                content: node.content || '',
                x: position.x,
                y: position.y,
                width: position.width,
                height: position.height
            });
        });

        return layoutData;
    };

    /**
     * 力导向布局（可选算法，适合关系网络图）
     * @param {Object} flowData - 流程图数据
     * @param {number} iterations - 迭代次数
     * @returns {Object} - 布局数据
     */
    AutoLayout.prototype.forceDirectedLayout = function(flowData, iterations) {
        iterations = iterations || 100;

        var self = this;
        var nodes = flowData.nodes;
        var edges = flowData.edges;

        // 初始化随机位置
        var positions = {};
        nodes.forEach(function(node) {
            positions[node.id] = {
                x: Math.random() * 800 + 100,
                y: Math.random() * 600 + 100,
                vx: 0,  // 速度
                vy: 0
            };
        });

        // 力导向参数
        var k = 150;  // 理想距离
        var c = 0.1;  // 阻尼系数

        // 迭代计算
        for (var iter = 0; iter < iterations; iter++) {
            // 计算斥力（节点间相互排斥）
            for (var i = 0; i < nodes.length; i++) {
                for (var j = i + 1; j < nodes.length; j++) {
                    var node1 = nodes[i];
                    var node2 = nodes[j];

                    var pos1 = positions[node1.id];
                    var pos2 = positions[node2.id];

                    var dx = pos2.x - pos1.x;
                    var dy = pos2.y - pos1.y;
                    var distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < 1) distance = 1;

                    // 库仑斥力
                    var force = k * k / distance;
                    var fx = force * dx / distance;
                    var fy = force * dy / distance;

                    pos1.vx -= fx;
                    pos1.vy -= fy;
                    pos2.vx += fx;
                    pos2.vy += fy;
                }
            }

            // 计算引力（连接的节点相互吸引）
            edges.forEach(function(edge) {
                var pos1 = positions[edge.from];
                var pos2 = positions[edge.to];

                var dx = pos2.x - pos1.x;
                var dy = pos2.y - pos1.y;
                var distance = Math.sqrt(dx * dx + dy * dy);

                // 胡克引力
                var force = distance / k;
                var fx = force * dx / distance;
                var fy = force * dy / distance;

                pos1.vx += fx;
                pos1.vy += fy;
                pos2.vx -= fx;
                pos2.vy -= fy;
            });

            // 更新位置（应用速度）
            nodes.forEach(function(node) {
                var pos = positions[node.id];

                pos.x += pos.vx;
                pos.y += pos.vy;

                // 阻尼
                pos.vx *= (1 - c);
                pos.vy *= (1 - c);

                // 边界限制
                pos.x = Math.max(50, Math.min(1400, pos.x));
                pos.y = Math.max(50, Math.min(900, pos.y));
            });
        }

        // 生成布局数据
        var layoutData = {
            nodes: [],
            edges: edges
        };

        nodes.forEach(function(node) {
            var pos = positions[node.id];
            var size = self._getNodeSize(node.type);

            layoutData.nodes.push({
                id: node.id,
                type: node.type,
                label: node.label,
                content: node.content || '',
                x: Math.round(pos.x),
                y: Math.round(pos.y),
                width: size.width,
                height: size.height
            });
        });

        return layoutData;
    };

    /**
     * 网格布局（最简单的布局方式）
     * @param {Object} flowData - 流程图数据
     * @param {number} columns - 列数
     * @returns {Object} - 布局数据
     */
    AutoLayout.prototype.gridLayout = function(flowData, columns) {
        columns = columns || 4;

        var self = this;
        var layoutData = {
            nodes: [],
            edges: flowData.edges
        };

        flowData.nodes.forEach(function(node, index) {
            var row = Math.floor(index / columns);
            var col = index % columns;

            var size = self._getNodeSize(node.type);

            var x = self.canvasOffsetX + col * (size.width + self.horizontalSpacing);
            var y = self.canvasOffsetY + row * (size.height + self.verticalSpacing);

            layoutData.nodes.push({
                id: node.id,
                type: node.type,
                label: node.label,
                content: node.content || '',
                x: x,
                y: y,
                width: size.width,
                height: size.height
            });
        });

        return layoutData;
    };

    return AutoLayout;
})();
