var Utils = com.xjwgraph.Utils = {
	
	create : function (options) {
		
		this.global = com.xjwgraph.Global;
		
		this.global.modeMap = new com.xjwgraph.Map();
  	this.global.lineMap = new com.xjwgraph.Map();
  	this.global.beanXml = new com.xjwgraph.BeanXML();
  		
		var contextBody = options.contextBody,
		contextBodyDiv = $id(contextBody),
		contextWidth = options.width,
		contextHeight = options.height;
		
		this.global.baseTool = new com.xjwgraph.BaseTool(contextBodyDiv, contextWidth, contextHeight);
		this.global.modeTool = new com.xjwgraph.ModeTool(contextBodyDiv);
		this.global.lineTool = new com.xjwgraph.LineTool(contextBodyDiv);
		this.global.clientTool = new com.xjwgraph.ClientTool(options);
		
		var smallMap = options.smallMap;
		this.global.smallTool = new com.xjwgraph.SmallMapTool(smallMap, contextBody);
		
		var mainControl = $id(options.mainControl);
		this.global.controlTool = new com.xjwgraph.ControlTool(mainControl);
		
		var historyMessage = options.historyMessage;
		this.global.undoRedoEventFactory = new com.xjwgraph.UndoRedoEventFactory(historyMessage);
		this.global.undoRedoEventFactory.init();
		
		return this;
		
	}, 
	
	showLinePro : function () {
		this.global.lineTool.showProperty();
	},
	
	showModePro : function () {
		this.global.modeTool.showProperty();
	},
	
	toMerge : function () {
		this.global.baseTool.toMerge();
	},
	
	toSplit : function () {
		this.global.baseTool.toSeparate()
	},
	
	toTop : function () {
		this.global.modeTool.toTop();
	},
	
	toBottom : function () {
		this.global.modeTool.toBottom();
	},
	
	printView : function () {
		this.global.baseTool.printView();
	},
	
	undo : function () {
		this.global.undoRedoEventFactory.undo();
	},
	
	redo : function () {
		this.global.undoRedoEventFactory.redo();
	},
	
	saveXml : function () {
		this.global.beanXml.toXML();
	},
	
	loadXml : function () {
		this.global.beanXml.toHTML();
	},
	
	loadTextXml : function (textXml) {
		
		this.global.beanXml.doc = null;
		this.global.beanXml.doc = this.global.beanXml.loadXmlText(textXml);
		
		this.loadXml();
	
	},
	
	clearHtml : function () {
		this.global.beanXml.clearHTML();
	},
	
	copyNode : function () {
		keyDownFactory.copyNode();
	},
	
	removeNode : function () {
		keyDownFactory.removeNode();
	},
	
	alignLeft : function () {
		
		this.global.baseTool.toLeft();
		this.global.baseTool.clearContext();
	
	},
	
	alignRight : function () {
		
		this.global.baseTool.toRight();
		this.global.baseTool.clearContext();
		
	},
	
	verticalCenter : function () {
		
		this.global.baseTool.toMiddleWidth();
		this.global.baseTool.clearContext();
	
	},
	
	alignTop : function () {
		
		this.global.baseTool.toTop();
		this.global.baseTool.clearContext();
		
	},
	
	horizontalCenter : function () {
		
		this.global.baseTool.toMiddleHeight();
		this.global.baseTool.clearContext();
	
	},
	
	bottomAlignment : function () {
		
		this.global.baseTool.toBottom();
		this.global.baseTool.clearContext();
		
	},
	
	nodeDrag : function (node, isLine, lineType) {
		this.global.baseTool.drag(node, isLine, lineType);
	},
	
	closeAutoLineType : function () {
		PathGlobal.isAutoLineType = false;
	},
	
	openAutoLineType : function () {
		PathGlobal.isAutoLineType = true;
	},

	// ==================== AI流程图生成功能 ====================

	/**
	 * 初始化AI功能模块
	 */
	initAI : function () {
		console.log('Utils: 初始化AI功能模块');

		// 创建AI相关对象
		this.global.aiFlowGenerator = new AIFlowGenerator();
		this.global.configManager = new ConfigManager();
		this.global.enhancedExport = new EnhancedExport();

		// 加载保存的配置
		var config = this.global.configManager.loadConfig();

		// 检查是否有可用的模型
		var availableModels = this.global.configManager.getAvailableModels();

		if (availableModels.length > 0) {
			console.log('Utils: 找到' + availableModels.length + '个已配置的模型');
		} else {
			console.log('Utils: 未找到已配置的模型，请先配置API Key');
		}

		// 初始化UI事件监听
		this._initAIEventListeners();

		return this;
	},

	/**
	 * 初始化AI相关的UI事件监听
	 * @private
	 */
	_initAIEventListeners : function () {
		var self = this;

		// 生成按钮
		var generateBtn = document.getElementById('generateBtn');
		if (generateBtn) {
			generateBtn.onclick = function() {
				self.generateFlowchart();
			};
		}

		// 配置按钮
		var aiSettingsBtn = document.getElementById('aiSettingsBtn');
		if (aiSettingsBtn) {
			aiSettingsBtn.onclick = function() {
				self.showAIConfig();
			};
		}

		// 模型选择器
		var modelSelector = document.getElementById('modelSelector');
		if (modelSelector) {
			modelSelector.onchange = function(e) {
				self._onModelChange(e.target.value);
			};

			// 加载默认模型
			var config = self.global.configManager.loadConfig();
			if (config.defaultModel) {
				modelSelector.value = config.defaultModel;
			}
		}

		console.log('Utils: AI事件监听器初始化完成');
	},

	/**
	 * 模型切换事件处理
	 * @param {string} modelType - 新选择的模型类型
	 * @private
	 */
	_onModelChange : function (modelType) {
		console.log('Utils: 切换模型到 ' + modelType);

		// 保存默认模型设置
		var config = this.global.configManager.loadConfig();
		config.defaultModel = modelType;
		this.global.configManager.saveConfig(config);
	},

	/**
	 * 生成流程图（主入口）
	 */
	generateFlowchart : function () {
		var self = this;

		// 获取用户输入
		var aiInput = document.getElementById('aiInput');
		if (!aiInput) {
			alert('找不到AI输入框');
			return;
		}

		var description = aiInput.value.trim();

		if (!description) {
			alert('请输入流程图描述');
			return;
		}

		// 获取选择的模型
		var modelSelector = document.getElementById('modelSelector');
		if (!modelSelector) {
			alert('找不到模型选择器');
			return;
		}

		var modelType = modelSelector.value;

		console.log('Utils: 准备生成流程图，模型=' + modelType);

		try {
			// 验证配置
			var modelConfig = this.global.configManager.getModelConfig(modelType);
			this.global.configManager.validateConfig(modelType, modelConfig);

			// 设置适配器
			this.global.aiFlowGenerator.setAdapter(modelType, modelConfig);

			// 禁用生成按钮
			var generateBtn = document.getElementById('generateBtn');
			if (generateBtn) {
				generateBtn.disabled = true;
				generateBtn.innerHTML = '生成中...';
			}

			// 更新状态
			this._updateAIStatus('正在调用 ' + this._getModelDisplayName(modelType) + ' 生成流程图...', 'info');

			// 生成流程图
			this.global.aiFlowGenerator.generate(description, {
				clearCanvas: false,  // 不清空画布，允许增量添加
				layoutType: 'hierarchical'
			}).then(function(success) {
				// 恢复按钮
				if (generateBtn) {
					generateBtn.disabled = false;
					generateBtn.innerHTML = '生成流程图';
				}

				if (success) {
					self._updateAIStatus('流程图生成成功！', 'success');
				}
			}).catch(function(error) {
				// 恢复按钮
				if (generateBtn) {
					generateBtn.disabled = false;
					generateBtn.innerHTML = '生成流程图';
				}

				self._updateAIStatus('生成失败: ' + error.message, 'error');
				alert('生成失败: ' + error.message);
			});

		} catch (error) {
			console.error('Utils: 生成流程图失败', error);
			alert('生成失败: ' + error.message);

			// 恢复按钮
			var generateBtn = document.getElementById('generateBtn');
			if (generateBtn) {
				generateBtn.disabled = false;
				generateBtn.innerHTML = '生成流程图';
			}
		}
	},

	/**
	 * 显示AI流程图生成面板（弹出对话框）
	 */
	showAIPanel : function () {
		var self = this;

		// 创建遮罩层和对话框
		var overlay = document.createElement('div');
		overlay.id = 'aiModalOverlay';
		overlay.className = 'ai-modal-overlay';
		overlay.style.display = 'flex';

		var dialog = document.createElement('div');
		dialog.className = 'ai-modal-dialog';

		// 对话框头部
		var header = document.createElement('div');
		header.className = 'ai-modal-header';

		var headerLeft = document.createElement('div');
		var title = document.createElement('h2');
		title.className = 'ai-modal-title';
		title.textContent = 'AI流程图生成';
		headerLeft.appendChild(title);

		var closeBtn = document.createElement('button');
		closeBtn.className = 'ai-modal-close';
		closeBtn.innerHTML = '&times;';
		closeBtn.onclick = function() {
			self.closeAIPanel();
		};

		header.appendChild(headerLeft);
		header.appendChild(closeBtn);

		// 对话框内容
		var body = document.createElement('div');
		body.className = 'ai-modal-body';

		// 创建内容
		var content = self._createAIPanelContent();
		body.appendChild(content);

		// 对话框底部按钮
		var footer = document.createElement('div');
		footer.className = 'ai-modal-footer';

		var generateBtn = document.createElement('button');
		generateBtn.className = 'ai-btn ai-btn-primary';
		generateBtn.textContent = '生成';
		generateBtn.onclick = function() {
			self.generateFlowchartFromDialog();
		};

		var configBtn = document.createElement('button');
		configBtn.className = 'ai-btn ai-btn-secondary';
		configBtn.textContent = '配置';
		configBtn.onclick = function() {
			self.closeAIPanel();
			self.showAIConfig();
		};

		var cancelBtn = document.createElement('button');
		cancelBtn.className = 'ai-btn ai-btn-cancel';
		cancelBtn.textContent = '取消';
		cancelBtn.onclick = function() {
			self.closeAIPanel();
		};

		footer.appendChild(generateBtn);
		footer.appendChild(configBtn);
		footer.appendChild(cancelBtn);

		// 组装对话框
		dialog.appendChild(header);
		dialog.appendChild(body);
		dialog.appendChild(footer);
		overlay.appendChild(dialog);

		// 移除旧对话框（如果有）
		var oldOverlay = document.getElementById('aiModalOverlay');
		if (oldOverlay) {
			document.body.removeChild(oldOverlay);
		}

		// 添加到页面
		document.body.appendChild(overlay);

		// 点击遮罩层关闭
		overlay.onclick = function(e) {
			if (e.target === overlay) {
				self.closeAIPanel();
			}
		};
	},

	/**
	 * 关闭AI面板对话框
	 */
	closeAIPanel : function () {
		var overlay = document.getElementById('aiModalOverlay');
		if (overlay) {
			document.body.removeChild(overlay);
		}
	},

	/**
	 * 创建AI面板DOM内容
	 * @returns {HTMLElement} - DOM元素
	 * @private
	 */
	_createAIPanelContent : function () {
		var container = document.createElement('div');
		container.className = 'ai-panel-container';

		// 输入框区域
		var inputSection = document.createElement('div');
		inputSection.className = 'ai-section';

		var label = document.createElement('label');
		label.className = 'ai-label';
		label.textContent = '流程图描述';
		inputSection.appendChild(label);

		var textarea = document.createElement('textarea');
		textarea.id = 'aiInput';
		textarea.className = 'ai-input';
		textarea.rows = 6;
		textarea.textContent = '创建一个用户登录流程，包括：\n1. 用户访问登录页面\n2. 输入用户名和密码\n3. 点击登录按钮提交\n4. 系统验证用户凭证\n5. 如果验证成功，创建用户会话并跳转到主页\n6. 如果验证失败，显示错误信息并返回登录页';
		inputSection.appendChild(textarea);

		container.appendChild(inputSection);

		// 模型选择器
		var selectSection = document.createElement('div');
		selectSection.className = 'ai-section';

		var modelLabel = document.createElement('label');
		modelLabel.className = 'ai-label';
		modelLabel.textContent = 'AI模型';
		selectSection.appendChild(modelLabel);

		var select = document.createElement('select');
		select.id = 'modelSelector';
		select.className = 'ai-select';

		var models = [
			{ value: 'minimax', text: 'MiniMax' },
			{ value: 'openai', text: 'OpenAI GPT-4' },
			{ value: 'claude', text: 'Claude 3.5 Sonnet' },
			{ value: 'qwen', text: '通义千问' },
			{ value: 'doubao', text: '豆包' },
			{ value: 'custom', text: '自定义模型' }
		];

		for (var i = 0; i < models.length; i++) {
			var option = document.createElement('option');
			option.value = models[i].value;
			option.text = models[i].text;
			if (models[i].value === 'minimax') {
				option.selected = true;
			}
			select.appendChild(option);
		}

		selectSection.appendChild(select);
		container.appendChild(selectSection);

		// 状态显示
		var statusDiv = document.createElement('div');
		statusDiv.id = 'aiStatus';
		statusDiv.className = 'ai-status';
		statusDiv.textContent = '就绪';
		container.appendChild(statusDiv);

		// 加载模型选择器的默认值
		var config = this.global.configManager.loadConfig();
		if (config.defaultModel) {
			select.value = config.defaultModel;
		}

		return container;
	},

	/**
	 * 从对话框生成流程图
	 */
	generateFlowchartFromDialog : function () {
		var self = this;

		// 获取用户输入
		var aiInput = document.getElementById('aiInput');
		if (!aiInput) {
			alert('找不到AI输入框');
			return;
		}

		var description = aiInput.value.trim();

		if (!description) {
			alert('请输入流程图描述');
			return;
		}

		// 获取选择的模型
		var modelSelector = document.getElementById('modelSelector');
		if (!modelSelector) {
			alert('找不到模型选择器');
			return;
		}

		var modelType = modelSelector.value;

		console.log('Utils: 准备生成流程图，模型=' + modelType);

		try {
			// 验证配置
			var modelConfig = this.global.configManager.getModelConfig(modelType);
			this.global.configManager.validateConfig(modelType, modelConfig);

			// 设置适配器
			this.global.aiFlowGenerator.setAdapter(modelType, modelConfig);

			// 更新状态
			self._updateAIStatusFromDialog('正在调用 ' + this._getModelDisplayName(modelType) + ' 生成流程图...', 'info');

			// 生成流程图
			this.global.aiFlowGenerator.generate(description, {
				clearCanvas: false,
				layoutType: 'hierarchical'
			}).then(function(success) {
				if (success) {
					self._updateAIStatusFromDialog('流程图生成成功！', 'success');
					// 2秒后关闭对话框
					setTimeout(function() {
						self.closeAIPanel();
					}, 2000);
				}
			}).catch(function(error) {
				self._updateAIStatusFromDialog('生成失败: ' + error.message, 'error');
				alert('生成失败: ' + error.message);
			});

		} catch (error) {
			console.error('Utils: 生成流程图失败', error);
			alert('生成失败: ' + error.message);
		}
	},

	/**
	 * 从对话框更新AI状态显示
	 * @param {string} message - 状态消息
	 * @param {string} type - 消息类型（info/success/error）
	 * @private
	 */
	_updateAIStatusFromDialog : function (message, type) {
		var statusElement = document.getElementById('aiStatus');

		if (statusElement) {
			statusElement.textContent = message;

			// 设置颜色
			if (type === 'error') {
				statusElement.style.color = '#f00';
			} else if (type === 'success') {
				statusElement.style.color = '#0a0';
			} else {
				statusElement.style.color = '#666';
			}
		}
	},

	/**
	 * 显示AI配置对话框
	 */
	showAIConfig : function () {
		var self = this;

		// 创建遮罩层和对话框
		var overlay = document.createElement('div');
		overlay.id = 'aiConfigOverlay';
		overlay.className = 'ai-modal-overlay';
		overlay.style.display = 'flex';

		var dialog = document.createElement('div');
		dialog.className = 'ai-modal-dialog ai-config-dialog';

		// 对话框头部
		var header = document.createElement('div');
		header.className = 'ai-modal-header';

		var headerLeft = document.createElement('div');
		var title = document.createElement('h2');
		title.className = 'ai-modal-title';
		title.textContent = 'AI模型配置';
		headerLeft.appendChild(title);

		var closeBtn = document.createElement('button');
		closeBtn.className = 'ai-modal-close';
		closeBtn.innerHTML = '&times;';
		closeBtn.onclick = function() {
			self.closeAIConfig();
		};

		header.appendChild(headerLeft);
		header.appendChild(closeBtn);

		// 对话框内容
		var body = document.createElement('div');
		body.className = 'ai-modal-body';
		body.id = 'aiConfigBody';

		// 创建配置内容
		var content = self._createConfigDialogContent();
		body.appendChild(content);

		// 对话框底部按钮
		var footer = document.createElement('div');
		footer.className = 'ai-modal-footer';

		var saveBtn = document.createElement('button');
		saveBtn.className = 'ai-btn ai-btn-primary';
		saveBtn.textContent = '保存';
		saveBtn.onclick = function() {
			self.saveAIConfig();
		};

		var resetBtn = document.createElement('button');
		resetBtn.className = 'ai-btn ai-btn-secondary';
		resetBtn.textContent = '重置';
		resetBtn.onclick = function() {
			if (confirm('确定要重置所有配置吗？')) {
				self.global.configManager.resetConfig();
				self._loadConfigToForm();
				alert('配置已重置');
			}
		};

		var cancelBtn = document.createElement('button');
		cancelBtn.className = 'ai-btn ai-btn-cancel';
		cancelBtn.textContent = '取消';
		cancelBtn.onclick = function() {
			self.closeAIConfig();
		};

		footer.appendChild(saveBtn);
		footer.appendChild(resetBtn);
		footer.appendChild(cancelBtn);

		// 组装对话框
		dialog.appendChild(header);
		dialog.appendChild(body);
		dialog.appendChild(footer);
		overlay.appendChild(dialog);

		// 移除旧对话框（如果有）
		var oldOverlay = document.getElementById('aiConfigOverlay');
		if (oldOverlay) {
			document.body.removeChild(oldOverlay);
		}

		// 添加到页面
		document.body.appendChild(overlay);

		// 加载当前配置到表单
		this._loadConfigToForm();

		// 点击遮罩层关闭
		overlay.onclick = function(e) {
			if (e.target === overlay) {
				self.closeAIConfig();
			}
		};
	},

	/**
	 * 关闭AI配置对话框
	 */
	closeAIConfig : function () {
		var overlay = document.getElementById('aiConfigOverlay');
		if (overlay) {
			document.body.removeChild(overlay);
		}
	},

	/**
	 * 创建AI配置DOM内容
	 * @returns {HTMLElement} - DOM元素
	 * @private
	 */
	_createConfigDialogContent : function () {
		var container = document.createElement('div');
		container.className = 'ai-config-container';

		var models = [
			{
				id: 'openai',
				name: 'OpenAI',
				fields: ['apikey', 'baseurl', 'model'],
				placeholders: {
					apikey: 'sk-...',
					baseurl: '',
					model: ''
				}
			},
			{
				id: 'claude',
				name: 'Claude',
				fields: ['apikey', 'baseurl', 'model'],
				placeholders: {
					apikey: 'sk-ant-...',
					baseurl: '',
					model: ''
				}
			},
			{
				id: 'qwen',
				name: '通义千问',
				fields: ['apikey', 'baseurl', 'model'],
				placeholders: {
					apikey: '',
					baseurl: '',
					model: ''
				}
			},
			{
				id: 'doubao',
				name: '豆包',
				fields: ['apikey', 'baseurl', 'model'],
				placeholders: {
					apikey: '',
					baseurl: '',
					model: ''
				}
			},
			{
				id: 'minimax',
				name: 'MiniMax',
				fields: ['apikey', 'baseurl', 'model'],
				placeholders: {
					apikey: '获取地址: https://platform.minimaxi.com/',
					baseurl: '',
					model: ''
				}
			},
			{
				id: 'custom',
				name: '自定义模型',
				fields: ['apikey', 'baseurl', 'model', 'endpoint'],
				placeholders: {
					apikey: '',
					baseurl: 'https://api.example.com/v1',
					model: '',
					endpoint: '/chat/completions'
				}
			}
		];

		for (var i = 0; i < models.length; i++) {
			var model = models[i];
			var section = document.createElement('div');
			section.className = 'config-section';

			var title = document.createElement('h3');
			title.textContent = model.name + ' 配置';
			section.appendChild(title);

			var table = document.createElement('table');
			table.className = 'config-table';

			var fieldNames = {
				apikey: 'API Key',
				baseurl: 'Base URL',
				model: 'Model',
				endpoint: 'Endpoint'
			};

			for (var j = 0; j < model.fields.length; j++) {
				var field = model.fields[j];
				var tr = document.createElement('tr');

				var tdLabel = document.createElement('td');
				tdLabel.textContent = fieldNames[field] + ':';

				var tdInput = document.createElement('td');
				var input = document.createElement('input');
				input.type = field === 'apikey' ? 'password' : 'text';
				input.id = 'config_' + model.id + '_' + field;
				input.style.width = '400px';
				if (model.placeholders[field]) {
					input.placeholder = model.placeholders[field];
				}
				tdInput.appendChild(input);

				tr.appendChild(tdLabel);
				tr.appendChild(tdInput);
				table.appendChild(tr);
			}

			section.appendChild(table);
			container.appendChild(section);
		}

		return container;
	},

	/**
	 * 构建配置对话框HTML内容（已废弃，保留兼容）
	 * @returns {string} - HTML字符串
	 * @private
	 * @deprecated
	 */
	_buildConfigDialogContent : function () {
		var html = '<div class="ai-config-container" style="max-height: 400px; overflow-y: auto;">';

		// OpenAI配置
		html += '<div class="config-section">';
		html += '<h3>OpenAI 配置</h3>';
		html += '<table class="config-table">';
		html += '<tr><td>API Key:</td><td><input type="password" id="config_openai_apikey" style="width: 400px;" placeholder="sk-..." /></td></tr>';
		html += '<tr><td>Base URL:</td><td><input type="text" id="config_openai_baseurl" style="width: 400px;" /></td></tr>';
		html += '<tr><td>Model:</td><td><input type="text" id="config_openai_model" style="width: 400px;" /></td></tr>';
		html += '</table>';
		html += '</div>';

		// Claude配置
		html += '<div class="config-section">';
		html += '<h3>Claude 配置</h3>';
		html += '<table class="config-table">';
		html += '<tr><td>API Key:</td><td><input type="password" id="config_claude_apikey" style="width: 400px;" placeholder="sk-ant-..." /></td></tr>';
		html += '<tr><td>Base URL:</td><td><input type="text" id="config_claude_baseurl" style="width: 400px;" /></td></tr>';
		html += '<tr><td>Model:</td><td><input type="text" id="config_claude_model" style="width: 400px;" /></td></tr>';
		html += '</table>';
		html += '</div>';

		// 通义千问配置
		html += '<div class="config-section">';
		html += '<h3>通义千问 配置</h3>';
		html += '<table class="config-table">';
		html += '<tr><td>API Key:</td><td><input type="password" id="config_qwen_apikey" style="width: 400px;" /></td></tr>';
		html += '<tr><td>Base URL:</td><td><input type="text" id="config_qwen_baseurl" style="width: 400px;" /></td></tr>';
		html += '<tr><td>Model:</td><td><input type="text" id="config_qwen_model" style="width: 400px;" /></td></tr>';
		html += '</table>';
		html += '</div>';

		// 豆包配置
		html += '<div class="config-section">';
		html += '<h3>豆包 配置</h3>';
		html += '<table class="config-table">';
		html += '<tr><td>API Key:</td><td><input type="password" id="config_doubao_apikey" style="width: 400px;" /></td></tr>';
		html += '<tr><td>Base URL:</td><td><input type="text" id="config_doubao_baseurl" style="width: 400px;" /></td></tr>';
		html += '<tr><td>Model:</td><td><input type="text" id="config_doubao_model" style="width: 400px;" /></td></tr>';
		html += '</table>';
		html += '</div>';

		// MiniMax配置
		html += '<div class="config-section">';
		html += '<h3>MiniMax 配置</h3>';
		html += '<table class="config-table">';
		html += '<tr><td>API Key:</td><td><input type="password" id="config_minimax_apikey" style="width: 400px;" placeholder="获取地址: https://platform.minimaxi.com/" /></td></tr>';
		html += '<tr><td>Base URL:</td><td><input type="text" id="config_minimax_baseurl" style="width: 400px;" /></td></tr>';
		html += '<tr><td>Model:</td><td><input type="text" id="config_minimax_model" style="width: 400px;" /></td></tr>';
		html += '</table>';
		html += '</div>';

		// 自定义模型配置
		html += '<div class="config-section">';
		html += '<h3>自定义模型 配置</h3>';
		html += '<table class="config-table">';
		html += '<tr><td>API Key:</td><td><input type="password" id="config_custom_apikey" style="width: 400px;" /></td></tr>';
		html += '<tr><td>Base URL:</td><td><input type="text" id="config_custom_baseurl" style="width: 400px;" placeholder="https://api.example.com/v1" /></td></tr>';
		html += '<tr><td>Model:</td><td><input type="text" id="config_custom_model" style="width: 400px;" /></td></tr>';
		html += '<tr><td>Endpoint:</td><td><input type="text" id="config_custom_endpoint" style="width: 400px;" placeholder="/chat/completions" /></td></tr>';
		html += '</table>';
		html += '</div>';

		html += '</div>';

		return html;
	},

	/**
	 * 加载配置到表单
	 * @private
	 */
	_loadConfigToForm : function () {
		var config = this.global.configManager.loadConfig();

		var models = ['openai', 'claude', 'qwen', 'doubao', 'minimax', 'custom'];

		for (var i = 0; i < models.length; i++) {
			var modelType = models[i];
			var modelConfig = config[modelType];

			if (modelConfig) {
				var apikeyInput = document.getElementById('config_' + modelType + '_apikey');
				var baseurlInput = document.getElementById('config_' + modelType + '_baseurl');
				var modelInput = document.getElementById('config_' + modelType + '_model');

				if (apikeyInput) apikeyInput.value = modelConfig.apiKey || '';
				if (baseurlInput) baseurlInput.value = modelConfig.baseURL || '';
				if (modelInput) modelInput.value = modelConfig.model || '';

				// 自定义模型的endpoint
				if (modelType === 'custom') {
					var endpointInput = document.getElementById('config_custom_endpoint');
					if (endpointInput) {
						endpointInput.value = modelConfig.endpoint || '/chat/completions';
					}
				}
			}
		}
	},

	/**
	 * 保存AI配置
	 */
	saveAIConfig : function () {
		var config = this.global.configManager.loadConfig();

		var models = ['openai', 'claude', 'qwen', 'doubao', 'minimax', 'custom'];

		for (var i = 0; i < models.length; i++) {
			var modelType = models[i];
			var apikeyInput = document.getElementById('config_' + modelType + '_apikey');
			var baseurlInput = document.getElementById('config_' + modelType + '_baseurl');
			var modelInput = document.getElementById('config_' + modelType + '_model');

			if (apikeyInput && baseurlInput && modelInput) {
				config[modelType] = {
					apiKey: apikeyInput.value.trim(),
					baseURL: baseurlInput.value.trim(),
					model: modelInput.value.trim()
				};

				// 自定义模型的endpoint
				if (modelType === 'custom') {
					var endpointInput = document.getElementById('config_custom_endpoint');
					if (endpointInput) {
						config[modelType].endpoint = endpointInput.value.trim();
					}
				}
			}
		}

		// 保存配置
		if (this.global.configManager.saveConfig(config)) {
			alert('配置保存成功！');
			$('#aiConfigDialog').dialog('close');
		} else {
			alert('配置保存失败，请检查浏览器控制台');
		}
	},

	/**
	 * 更新AI状态显示
	 * @param {string} message - 状态消息
	 * @param {string} type - 消息类型（info/success/error）
	 * @private
	 */
	_updateAIStatus : function (message, type) {
		var statusElement = document.getElementById('aiStatus');

		if (statusElement) {
			statusElement.innerHTML = message;

			// 设置颜色
			if (type === 'error') {
				statusElement.style.color = '#f00';
			} else if (type === 'success') {
				statusElement.style.color = '#0a0';
			} else {
				statusElement.style.color = '#666';
			}
		}
	},

	/**
	 * 获取模型的显示名称
	 * @param {string} modelType - 模型类型
	 * @returns {string} - 显示名称
	 * @private
	 */
	_getModelDisplayName : function (modelType) {
		var names = {
			'openai': 'OpenAI',
			'claude': 'Claude',
			'qwen': '通义千问',
			'doubao': '豆包',
			'minimax': 'MiniMax',
			'custom': '自定义模型'
		};

		return names[modelType] || modelType;
	},

	/**
	 * 导出为PNG
	 */
	exportPNG : function () {
		this.global.enhancedExport.toPNG();
	},

	/**
	 * 导出为PDF
	 */
	exportPDF : function () {
		this.global.enhancedExport.toPDF();
	},

	/**
	 * 导出为JSON
	 */
	exportJSON : function () {
		this.global.enhancedExport.toJSON();
	},

	/**
	 * 从JSON导入
	 */
	importJSON : function () {
		var input = document.createElement('input');
		input.type = 'file';
		input.accept = '.json';

		var self = this;

		input.onchange = function(e) {
			var file = e.target.files[0];

			if (file) {
				self.global.enhancedExport.fromJSON(file).then(function() {
					alert('JSON导入成功');
				}).catch(function(error) {
					alert('JSON导入失败: ' + error.message);
				});
			}
		};

		input.click();
	},

	/**
	 * 导出为Markdown
	 */
	exportMarkdown : function () {
		this.global.enhancedExport.toMarkdown();
	}

}