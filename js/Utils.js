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
	}

}