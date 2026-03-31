/**
 * AI流程图生成 - 增强导出功能
 * 支持导出为PNG、PDF、JSON等多种格式
 */

var EnhancedExport = (function() {
    'use strict';

    /**
     * 增强导出构造函数
     */
    function EnhancedExport() {
        this.html2canvasLoaded = false;
        this.jsPDFLoaded = false;
    }

    /**
     * 检查html2canvas库是否加载
     * @returns {boolean}
     * @private
     */
    EnhancedExport.prototype._checkHtml2Canvas = function() {
        if (typeof html2canvas === 'undefined') {
            alert('html2canvas库未加载，无法导出PNG/PDF\n请确保已在HTML中引入html2canvas库');
            return false;
        }
        return true;
    };

    /**
     * 检查jsPDF库是否加载
     * @returns {boolean}
     * @private
     */
    EnhancedExport.prototype._checkJsPDF = function() {
        if (typeof jspdf === 'undefined' && typeof jsPDF === 'undefined') {
            alert('jsPDF库未加载，无法导出PDF\n请确保已在HTML中引入jsPDF库');
            return false;
        }
        return true;
    };

    /**
     * 导出为PNG图片
     * @param {string} filename - 文件名（默认：flowchart.png）
     * @returns {Promise<boolean>} - 导出是否成功
     */
    EnhancedExport.prototype.toPNG = function(filename) {
        var self = this;
        filename = filename || 'flowchart.png';

        if (!this._checkHtml2Canvas()) {
            return Promise.reject(new Error('html2canvas未加载'));
        }

        console.log('EnhancedExport: 开始导出PNG');

        var pathBody = document.getElementById('pathBody');

        if (!pathBody) {
            return Promise.reject(new Error('找不到画布元素'));
        }

        return html2canvas(pathBody, {
            backgroundColor: '#ffffff',
            scale: 2,  // 提高清晰度
            logging: false,
            useCORS: true  // 支持跨域图片
        }).then(function(canvas) {
            console.log('EnhancedExport: Canvas生成成功，尺寸=' +
                       canvas.width + 'x' + canvas.height);

            // 转换为DataURL
            var dataURL = canvas.toDataURL('image/png');

            // 触发下载
            var link = document.createElement('a');
            link.download = filename;
            link.href = dataURL;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            console.log('EnhancedExport: PNG导出成功');
            return true;
        }).catch(function(error) {
            console.error('EnhancedExport: PNG导出失败', error);
            alert('PNG导出失败: ' + error.message);
            return false;
        });
    };

    /**
     * 导出为PDF文档
     * @param {string} filename - 文件名（默认：flowchart.pdf）
     * @param {string} orientation - 方向（portrait/landscape，默认landscape）
     * @returns {Promise<boolean>} - 导出是否成功
     */
    EnhancedExport.prototype.toPDF = function(filename, orientation) {
        var self = this;
        filename = filename || 'flowchart.pdf';
        orientation = orientation || 'landscape';

        if (!this._checkHtml2Canvas() || !this._checkJsPDF()) {
            return Promise.reject(new Error('所需库未加载'));
        }

        console.log('EnhancedExport: 开始导出PDF');

        var pathBody = document.getElementById('pathBody');

        if (!pathBody) {
            return Promise.reject(new Error('找不到画布元素'));
        }

        return html2canvas(pathBody, {
            backgroundColor: '#ffffff',
            scale: 2,
            logging: false,
            useCORS: true
        }).then(function(canvas) {
            console.log('EnhancedExport: Canvas生成成功');

            // 获取图片数据
            var imgData = canvas.toDataURL('image/png');

            // 创建PDF（使用正确的jsPDF构造函数）
            var pdf;
            if (typeof jsPDF !== 'undefined') {
                pdf = new jsPDF({
                    orientation: orientation,
                    unit: 'mm',
                    format: 'a4'
                });
            } else if (typeof jspdf !== 'undefined' && jspdf.jsPDF) {
                pdf = new jspdf.jsPDF({
                    orientation: orientation,
                    unit: 'mm',
                    format: 'a4'
                });
            } else {
                throw new Error('jsPDF未正确加载');
            }

            // 计算图片尺寸
            var pageWidth = pdf.internal.pageSize.getWidth();
            var pageHeight = pdf.internal.pageSize.getHeight();

            var imgWidth = pageWidth - 20; // 留10mm边距
            var imgHeight = (canvas.height * imgWidth) / canvas.width;

            // 如果图片高度超过页面，缩放以适应
            if (imgHeight > pageHeight - 20) {
                imgHeight = pageHeight - 20;
                imgWidth = (canvas.width * imgHeight) / canvas.height;
            }

            // 居中放置
            var x = (pageWidth - imgWidth) / 2;
            var y = (pageHeight - imgHeight) / 2;

            pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight);

            // 保存PDF
            pdf.save(filename);

            console.log('EnhancedExport: PDF导出成功');
            return true;
        }).catch(function(error) {
            console.error('EnhancedExport: PDF导出失败', error);
            alert('PDF导出失败: ' + error.message);
            return false;
        });
    };

    /**
     * 导出为JSON格式
     * @param {string} filename - 文件名（默认：flowchart.json）
     * @returns {boolean} - 导出是否成功
     */
    EnhancedExport.prototype.toJSON = function(filename) {
        filename = filename || 'flowchart.json';

        console.log('EnhancedExport: 开始导出JSON');

        var flowData = {
            metadata: {
                version: '1.0',
                exported: new Date().toISOString(),
                generator: 'Strawberry AI Flowchart'
            },
            nodes: [],
            edges: []
        };

        try {
            // 导出所有节点
            com.xjwgraph.Global.modeMap.forEach(function(modeId) {
                var mode = document.getElementById(modeId);
                var modeObj = com.xjwgraph.Global.modeMap.get(modeId);

                if (!mode) return;

                var titleElement = mode.querySelector('.title');
                var contentElement = mode.querySelector('.content');
                var imgElement = mode.querySelector('img');

                flowData.nodes.push({
                    id: modeId,
                    position: {
                        x: parseInt(mode.style.left) || 0,
                        y: parseInt(mode.style.top) || 0
                    },
                    size: {
                        width: mode.offsetWidth,
                        height: mode.offsetHeight
                    },
                    label: titleElement ? titleElement.textContent : '',
                    content: contentElement ? contentElement.textContent : '',
                    image: imgElement ? imgElement.src : '',
                    properties: modeObj.prop || {},
                    style: {
                        backgroundColor: mode.style.backgroundColor,
                        borderColor: mode.style.borderColor,
                        borderWidth: mode.style.borderWidth
                    }
                });
            });

            // 导出所有边
            com.xjwgraph.Global.lineMap.forEach(function(lineId) {
                var line = com.xjwgraph.Global.lineMap.get(lineId);

                if (!line) return;

                flowData.edges.push({
                    id: lineId,
                    from: line.xBaseMode ? line.xBaseMode.id : '',
                    to: line.wBaseMode ? line.wBaseMode.id : '',
                    fromIndex: line.xIndex,
                    toIndex: line.wIndex,
                    type: line.type || '折线',
                    label: line.prop ? (line.prop.label || '') : '',
                    properties: line.prop || {}
                });
            });

            // 生成JSON字符串
            var jsonStr = JSON.stringify(flowData, null, 2);

            // 创建Blob并下载
            var blob = new Blob([jsonStr], {
                type: 'application/json;charset=utf-8'
            });

            var link = document.createElement('a');
            link.download = filename;
            link.href = URL.createObjectURL(blob);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            console.log('EnhancedExport: JSON导出成功，节点数=' + flowData.nodes.length +
                       ', 边数=' + flowData.edges.length);

            return true;
        } catch (error) {
            console.error('EnhancedExport: JSON导出失败', error);
            alert('JSON导出失败: ' + error.message);
            return false;
        }
    };

    /**
     * 从JSON导入流程图
     * @param {File} file - JSON文件
     * @returns {Promise<boolean>} - 导入是否成功
     */
    EnhancedExport.prototype.fromJSON = function(file) {
        var self = this;

        return new Promise(function(resolve, reject) {
            var reader = new FileReader();

            reader.onload = function(e) {
                try {
                    var flowData = JSON.parse(e.target.result);

                    console.log('EnhancedExport: JSON解析成功');

                    // 验证格式
                    if (!flowData.nodes || !flowData.edges) {
                        throw new Error('JSON格式不正确：缺少nodes或edges字段');
                    }

                    // 清空画布
                    self._clearCanvas();

                    // 重建流程图
                    self._rebuildFromJSON(flowData);

                    resolve(true);
                } catch (error) {
                    console.error('EnhancedExport: JSON导入失败', error);
                    alert('JSON导入失败: ' + error.message);
                    reject(error);
                }
            };

            reader.onerror = function() {
                reject(new Error('读取文件失败'));
            };

            reader.readAsText(file);
        });
    };

    /**
     * 从JSON数据重建流程图
     * @param {Object} flowData - 流程图JSON数据
     * @private
     */
    EnhancedExport.prototype._rebuildFromJSON = function(flowData) {
        var modeTool = com.xjwgraph.Global.modeTool;
        var lineTool = com.xjwgraph.Global.lineTool;
        var nodeIdMap = {};

        console.log('EnhancedExport: 开始重建流程图');

        // 创建所有节点
        flowData.nodes.forEach(function(node) {
            var imgSrc = node.image || 'images/baseMode1.png';

            // 提取相对路径
            var imgMatch = imgSrc.match(/images\/[^"']+/);
            if (imgMatch) {
                imgSrc = imgMatch[0];
            }

            var modeId = modeTool.create(node.position.y, node.position.x, imgSrc);
            nodeIdMap[node.id] = modeId;

            var modeElement = document.getElementById(modeId);

            if (modeElement) {
                // 恢复标题
                var titleElement = modeElement.querySelector('.title');
                if (titleElement && node.label) {
                    titleElement.innerHTML = node.label;
                }

                // 恢复内容
                var contentElement = modeElement.querySelector('.content');
                if (contentElement && node.content) {
                    var textDiv = document.createElement('div');
                    textDiv.innerHTML = node.content;
                    contentElement.appendChild(textDiv);
                }

                // 恢复尺寸
                if (node.size) {
                    modeElement.style.width = node.size.width + 'px';
                    modeElement.style.height = node.size.height + 'px';
                }

                // 恢复样式
                if (node.style) {
                    if (node.style.backgroundColor) {
                        modeElement.style.backgroundColor = node.style.backgroundColor;
                    }
                    if (node.style.borderColor) {
                        modeElement.style.borderColor = node.style.borderColor;
                    }
                }

                // 恢复属性
                var modeObj = com.xjwgraph.Global.modeMap.get(modeId);
                if (modeObj && node.properties) {
                    modeObj.prop = node.properties;
                }
            }
        });

        // 延迟创建连接线
        setTimeout(function() {
            flowData.edges.forEach(function(edge) {
                var fromModeId = nodeIdMap[edge.from];
                var toModeId = nodeIdMap[edge.to];

                if (!fromModeId || !toModeId) {
                    console.warn('EnhancedExport: 跳过无效的边');
                    return;
                }

                var fromMode = com.xjwgraph.Global.modeMap.get(fromModeId);
                var toMode = com.xjwgraph.Global.modeMap.get(toModeId);

                if (fromMode && toMode && lineTool.createLineAI) {
                    lineTool.createLineAI(fromMode, toMode, edge.label || '');
                }
            });

            // 刷新小地图
            if (com.xjwgraph.Global.smallTool) {
                com.xjwgraph.Global.smallTool.refresh();
            }

            console.log('EnhancedExport: 流程图重建完成');
        }, 200);
    };

    /**
     * 清空画布
     * @private
     */
    EnhancedExport.prototype._clearCanvas = function() {
        var modeTool = com.xjwgraph.Global.modeTool;
        var lineTool = com.xjwgraph.Global.lineTool;

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
    };

    /**
     * 导出为SVG（如果画布使用SVG渲染）
     * @param {string} filename - 文件名
     * @returns {boolean} - 导出是否成功
     */
    EnhancedExport.prototype.toSVG = function(filename) {
        filename = filename || 'flowchart.svg';

        console.log('EnhancedExport: 开始导出SVG');

        try {
            var svgContext = document.getElementById('svgContext');

            if (!svgContext) {
                alert('当前画布不是SVG格式，无法导出SVG');
                return false;
            }

            // 克隆SVG元素
            var svgClone = svgContext.cloneNode(true);

            // 添加命名空间
            svgClone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');

            // 设置viewBox
            var pathBody = document.getElementById('pathBody');
            svgClone.setAttribute('viewBox', '0 0 ' + pathBody.scrollWidth + ' ' + pathBody.scrollHeight);

            // 转换为字符串
            var serializer = new XMLSerializer();
            var svgString = serializer.serializeToString(svgClone);

            // 创建Blob并下载
            var blob = new Blob([svgString], {
                type: 'image/svg+xml;charset=utf-8'
            });

            var link = document.createElement('a');
            link.download = filename;
            link.href = URL.createObjectURL(blob);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            console.log('EnhancedExport: SVG导出成功');
            return true;
        } catch (error) {
            console.error('EnhancedExport: SVG导出失败', error);
            alert('SVG导出失败: ' + error.message);
            return false;
        }
    };

    /**
     * 导出为Markdown文档（流程图的文本描述）
     * @param {string} filename - 文件名
     * @returns {boolean} - 导出是否成功
     */
    EnhancedExport.prototype.toMarkdown = function(filename) {
        filename = filename || 'flowchart.md';

        console.log('EnhancedExport: 开始导出Markdown');

        try {
            var markdown = '# 流程图文档\n\n';
            markdown += '生成时间: ' + new Date().toLocaleString() + '\n\n';

            // 导出节点列表
            markdown += '## 节点列表\n\n';

            var nodeIndex = 1;
            com.xjwgraph.Global.modeMap.forEach(function(modeId) {
                var mode = document.getElementById(modeId);
                if (!mode) return;

                var titleElement = mode.querySelector('.title');
                var contentElement = mode.querySelector('.content');

                markdown += nodeIndex + '. **' + (titleElement ? titleElement.textContent : '未命名') + '**\n';

                if (contentElement && contentElement.textContent) {
                    markdown += '   - ' + contentElement.textContent + '\n';
                }

                markdown += '\n';
                nodeIndex++;
            });

            // 导出连接关系
            markdown += '## 流程连接\n\n';

            com.xjwgraph.Global.lineMap.forEach(function(lineId) {
                var line = com.xjwgraph.Global.lineMap.get(lineId);
                if (!line) return;

                var fromMode = document.getElementById(line.xBaseMode.id);
                var toMode = document.getElementById(line.wBaseMode.id);

                if (!fromMode || !toMode) return;

                var fromTitle = fromMode.querySelector('.title');
                var toTitle = toMode.querySelector('.title');

                var fromText = fromTitle ? fromTitle.textContent : line.xBaseMode.id;
                var toText = toTitle ? toTitle.textContent : line.wBaseMode.id;

                var label = line.prop && line.prop.label ? ' (' + line.prop.label + ')' : '';

                markdown += '- ' + fromText + ' → ' + toText + label + '\n';
            });

            // 创建Blob并下载
            var blob = new Blob([markdown], {
                type: 'text/markdown;charset=utf-8'
            });

            var link = document.createElement('a');
            link.download = filename;
            link.href = URL.createObjectURL(blob);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            console.log('EnhancedExport: Markdown导出成功');
            return true;
        } catch (error) {
            console.error('EnhancedExport: Markdown导出失败', error);
            alert('Markdown导出失败: ' + error.message);
            return false;
        }
    };

    return EnhancedExport;
})();
