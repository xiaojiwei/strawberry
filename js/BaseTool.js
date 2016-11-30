var com = {};
com.xjwgraph = {};

var PathGlobal = com.xjwgraph.PathGlobal = {
	
	pointTypeLeftUp : 1,
	pointTypeUp : 2,
	pointTypeUpRight : 3,
	pointTypeLeft : 4,
	pointTypeRight :5,
	pointTypeLeftDown : 6,
	pointTypeDown : 7,
	pointTypeDownRight : 8,
	
	lineDefIndex : 10,
	lineDefStep : 2,
	modeDefIndex : 10,
	modeDefStep : 2,
	
	modeInc : 3,
	pauseTime : 10,
	modeHeigh : 0,
	copyModeDec : 10,
	rightMenu : false,
	isPixel : true,
	isAutoLineType : false,
	maxEvent : 100007,
	minHeight : 32,
	minWidth : 32,
	selectColor : 'C5E7F6',
	clearBoderColor : 'blue',
	defaultColor : 'green',
	defaultMaxMag : 0.5,
	defaultMinMag : 2,
	lineColor : 'black',
	lineCheckColor : 'red',
	strokeweight : 1.8,
	dragPointDec : 3,
	switchType : false,
	
	newGraph : '\u65b0\u5efa\u56fe\u5c42',
	modeCreate : '\u521b\u5efa\u6a21\u5143',
	lineCreate : '\u521b\u5efa\u7ebf\u5143',
	modeMove : '\u79fb\u52a8\u6a21\u5143',
	lineMove : '\u79fb\u52a8\u7ebf\u5143',
	modeDragPoint : '\u7f29\u653e\u6a21\u5143',
	updateMode : '\u7f16\u8f91\u6a21\u5143',
	updateLine : '\u7f16\u8f91\u7ebf\u5143',
	copyMode : '\u62f7\u8d1d\u6a21\u5143',
	removeMode : '\u5220\u9664\u6a21\u5143',
	remodeLine : '\u5220\u9664\u7ebf\u5143',
	baseClear : '\u9009\u62e9\u6a21\u5143',
	toMerge : '\u7ec4\u5408\u6a21\u5143',
	toSeparate : '\u89e3\u7ec4\u6a21\u5143',
	clearContext : '\u6e05\u9664\u533a\u57df',
	contextDivDrag : '\u79fb\u52a8\u533a\u57df',
	toLeft : '\u5de6\u5bf9\u9f50',
	toRight : '\u53f3\u5bf9\u9f50',
	toMiddleWidth : '\u5782\u76f4\u5c45\u4e2d',
	toTop : '\u9876\u5bf9\u9f50',
	toMiddleHeight : '\u6c34\u5e73\u5c45\u4e2d',
	toBottom : '\u5e95\u5bf9\u9f50',
	buildLineAndMode : '\u7ed1\u5b9a\u7ebf\u5143',
	removeLineAndMode : '\u79fb\u9664\u7ed1\u5b9a',
	modeCutter : '\u526a\u5207\u6a21\u5143',
	modeDuplicate : '\u590d\u5236\u6a21\u578b',
	eventName : '\u89e6\u53d1\u4e8b\u4ef6',
	lineProTitle : '\u7ebf\u5c5e\u6027\u8bbe\u7f6e',
	modeProTitle : '\u7f16\u8f91\u6a21\u5143',
	editProp : '\u7f16\u8f91\u5c5e\u6027'
	
}
 	
var UndoRedoEventFactory = com.xjwgraph.UndoRedoEventFactory = function (hisMessageDiv) {
	
	var self = this;
	
	self.hisMessageDiv = hisMessageDiv;
	self.stack = [];
	self.index = 0;
	
	self.redo = function() {
		
		stopEvent = true;
		
		var fn = self.stack[self.index];

		if (fn) {
			fn.redo();
			this.index++;
		}
		
		var endLength = self.stack.length;
		
		if (this.index > endLength) {
			this.index = endLength;
		}
		
		self.history();
	
	}
	
	self.undo = function() {
		
		stopEvent = true;
		
		var fn = self.stack[self.index - 1];
		
		if (fn) {
			fn.undo();
			self.index--;
		}
		
		if (this.index < 1) {
			self.index = 1;
		}
		
		self.history();
	
	}
	
	self.addEvent = function(undoRedoEvent) {
		
		self.stack.splice(self.index, (self.stack.length - self.index++), undoRedoEvent);
		
		if (self.stack.length > PathGlobal.maxEvent) {
			self.stack.splice(0, 1);
			this.index = PathGlobal.maxEvent;
		}
		
		self.history();
		
	}
	
}

UndoRedoEventFactory.prototype = {
	
	init : function () {
	
		var newGraph = new com.xjwgraph.UndoRedoEvent(function () {}, PathGlobal.newGraph);
		newGraph.setRedo(function() {});

	}, 
	
	onHistory : function (historyDiv, indexDiv) {
	
		var self = this;
	
		historyDiv.onclick = function () {
			
			var global = com.xjwgraph.Global;
			
			global.lineTool.clear();
			global.modeTool.clear();
			
			stopEvent = true;
		
			if (indexDiv > self.index) {

				for (var i = self.index; i <= indexDiv - 1; i++) {
			
					var fn = self.stack[i];
				
					if (fn && fn.redo) {
						fn.redo();
					}
			
				}
		
			} else if (indexDiv < self.index) {
			
				for (var i = self.index; i >= indexDiv; i--) {
			
					var fn = self.stack[i];
				
					if (fn && fn.undo) {
						fn.undo();
					}
			
				}
			
			}
		
			self.index = indexDiv;
			self.history();
	
		}
	
	},
	
	history : function () {
	
		var history = $id(this.hisMessageDiv);
	
		if (!history) {
			return;
		}
	
		var self = this;
		history.innerHTML = "";
	
		var stackLength = self.stack.length,
		doc = document,
		tempFragment = doc.createDocumentFragment();
	
		for (var i = 0; i < stackLength; i++) {
		
			var div = doc.createElement("div");
			div.style.cssText = "position:relative;text-align:center;border-bottom:1px dotted #cccccc; width:112px;height:20px;line-height:20px;";
			div.innerHTML = self.stack[i].name;
		 
			var indexDiv = i + 1;
			self.onHistory(div, indexDiv);
		 
			if ((self.index) == indexDiv) {
				div.style.backgroundColor = PathGlobal.selectColor;
			}
		 
			tempFragment.appendChild(div);

		}
	
		history.appendChild(tempFragment);
	
	}, 
	
	clear : function () {
	
		var self = this;
	
		delete self.stack;
	
		self.stack = [];
		self.index = 0;
		
		self.history();
	
	}

}

var UndoRedoEvent = com.xjwgraph.UndoRedoEvent = function (undoFn, name) {
	
	var self = this;
	
	self.name = name ? name : PathGlobal.eventName;
	self.undo = undoFn;
	self.redo;
	
	com.xjwgraph.Global.undoRedoEventFactory.addEvent(self);
	
	self.setUndo = function (undoFn) {
		self.undo = undoFn;
	}
	
	self.setRedo = function (redoFn) {
		self.redo = redoFn;
	}
	
}

var BaseTool = com.xjwgraph.BaseTool = function (pathBody, width, height) {
	
	var self = this;
	
	self.pathBody = pathBody;
	self.checkColor = "#00ff00";
	self.areaDiv = document.createElement("div");
	self.initEndDiv(width, height);
	self.initPathBody(self.pathBody);
	self.contextMoveAbale = false;
	self.contextMoveAttempt = false;
	self.contextMap = new Map();
	self.tempContextId = null;
	
	self.checkBrowser();
	
}

BaseTool.prototype = {
	
	initScaling : function (multiple) {
	
		var self = this,
				global = com.xjwgraph.Global,
				tempSmallTool = global.smallTool,
				tempLineTool = global.lineTool;
	
		self.forEach(self.contextMap, function (contextId) {
		
			var context = $id(contextId),
			contextStyle = context.style;
		
			contextStyle.top = 0 + "px";
			contextStyle.left = 0 + "px";
		
			var contextWidth = 0,
					contextHeight = 0,
					contextInfo = self.contextMap.get(contextId),
					modeMaps = contextInfo.contextModeMap,
					lineMaps = contextInfo.contextLineMap;
					
			self.forEach(lineMaps, function (lineId) {
				
					var line = $id(lineId),
			    path = tempLineTool.getPath(line),
					paths = tempLineTool.getPathArray(path),
					pathLength = paths.length;
					
					for (var i = pathLength; i--;) {
						
						var isTop = (i % 2 == 1);
						
						if (isTop && (parseInt(contextStyle.top) > paths[i] || parseInt(contextStyle.top) == 0)) {
							contextStyle.top = paths[i] - 2 + "px";
						}
			
						if (!isTop && (parseInt(contextStyle.left) > paths[i] || parseInt(contextStyle.left) == 0)) {
							contextStyle.left = paths[i] - 2 + "px";
						}
						
						if (isTop && (parseInt(contextHeight) < parseInt(paths[i]))) {
							contextHeight = paths[i];
						}
						
						if (!isTop && (parseInt(contextWidth) < parseInt(paths[i]))) {
							contextWidth = paths[i];
						}
						
					}
					
			});
		
			self.forEach(modeMaps, function (modeId) {
			
				var mode = $id(modeId),
				modeStyle = mode.style,
			
				modeTop = parseInt(modeStyle.top),
				modeLeft = parseInt(modeStyle.left),
				modeWidth = parseInt(mode.offsetWidth),
				modeHeight = parseInt(mode.offsetHeight),
			
				contextTop = parseInt(contextStyle.top),
				contextLeft = parseInt(contextStyle.left);
			
				if (contextTop > modeTop || contextTop == 0) {
					contextStyle.top = modeTop + "px";
				}
			
				if (contextLeft > modeLeft || contextLeft == 0) {
					contextStyle.left = modeLeft + "px";
				}
			
				if (contextWidth < modeWidth + modeLeft) {
					contextWidth = modeWidth + modeLeft;
				}
			
				if (contextHeight < modeHeight + modeTop) {
					contextHeight = modeHeight + modeTop;
				}
			
			});
			
			

			contextStyle.width = contextWidth - parseInt(contextStyle.left) + "px";
			contextStyle.height = contextHeight - parseInt(contextStyle.top) + "px";
		
		});
	
	}, 

	getOptionMap : function (tempContextId) {
	
		var self = this,
		map = null;

		if (tempContextId) {
			map = self.contextMap.get(tempContextId).contextModeMap;
		} else {
			
			
			var global = com.xjwgraph.Global;
			
			map = new Map();
			map.putAll(global.modeMap);
		
			var tempBaseTool = global.baseTool;
		
			tempBaseTool.forEach(tempBaseTool.contextMap, function (contextId) {
				
				var sonContextModeMap = tempBaseTool.contextMap.get(contextId).contextModeMap,
				sonContextDiv = $id(contextId),
				isGroups = sonContextDiv.getAttribute("groups");
				
				tempBaseTool.forEach(sonContextModeMap, function (modeId) {
				
					if (isGroups == "true" || isGroups) {
						map.remove(modeId);
					}
					
				});
				
			});
		
		}
	
		return map;

	},

	toLeft : function () {
	
		var self = this,
		map = self.getOptionMap(self.tempContextId),
		
		left = -1;
	
		self.forEach(map, function (modeId) {
			
			var mode = $id(modeId),
			modeLeft = parseInt(mode.style.left);
		
			if (left > modeLeft || left == -1) {
				left = modeLeft;
			}
		
		});
		
		var global = com.xjwgraph.Global,
	
		tempModeTool = global.modeTool,
		tempSmallTool = global.smallTool,
	
		oldLeftMap = new Map(),
		afterLeftMap = new Map();
	
		self.forEach(map, function (modeId) {
		
			var mode = $id(modeId),
			modeStyle = mode.style;
		
			oldLeftMap.put(modeId, parseInt(modeStyle.left));
		
			modeStyle.left = left + "px";
		
			afterLeftMap.put(modeId, parseInt(modeStyle.left));
		
			tempModeTool.showPointer(mode);
			tempModeTool.changeBaseModeAndLine(mode, true);
		
			tempSmallTool.drawMode(mode);
		
		});
	
		var undoRedoEvent = new com.xjwgraph.UndoRedoEvent(function () {
		
			self.forEach(map, function (modeId) {
		
				var mode = $id(modeId);
		
				mode.style.left = oldLeftMap.get(modeId) + "px";
		
				tempModeTool.showPointer(mode);
				tempModeTool.changeBaseModeAndLine(mode, true);
		
				tempSmallTool.drawMode(mode);
		
			});
				
		}, PathGlobal.toLeft);
	
		undoRedoEvent.setRedo(function () {
		
			self.forEach(map, function (modeId) {
		
				var mode = $id(modeId);
		
				mode.style.left = afterLeftMap.get(modeId) + "px";
		
				tempModeTool.showPointer(mode);
				tempModeTool.changeBaseModeAndLine(mode, true);
		
				tempSmallTool.drawMode(mode);
		
			});
		
		});
	
	},
	
	toMiddleWidth : function () {
	
		var self = this,
		map = self.getOptionMap(self.tempContextId),
		middleWidthArray = [],
		i = 0;
	
		self.forEach(map, function (modeId) {
		
			var mode = $id(modeId);
			middleWidthArray[i++] = parseInt(mode.style.left) + parseInt(parseInt(mode.offsetWidth) / 2);
		
		});
	
		middleWidthArray = middleWidthArray.sort(function (n1, n2) { 
			return n1 - n2
		});
	
		var middleNumber = parseInt(middleWidthArray.length / 2),
		middleLeft = middleWidthArray[middleNumber],
	
		global = com.xjwgraph.Global,
		
		tempModeTool = global.modeTool,
		tempSmallTool = global.smallTool,
	
		oldLeftMap = new Map(),
		afterLeftMap = new Map();
	
		self.forEach(map, function (modeId) {
		
			var mode = $id(modeId),
			modeStyle = mode.style;
		
			oldLeftMap.put(modeId, parseInt(modeStyle.left));
		
			var decLeft = parseInt(parseInt(modeStyle.left) + parseInt(parseInt(mode.offsetWidth) / 2) - middleLeft);
			modeStyle.left = parseInt(parseInt(modeStyle.left) - decLeft) + "px";
		
			afterLeftMap.put(modeId, parseInt(modeStyle.left));
		
			tempModeTool.showPointer(mode);
			tempModeTool.changeBaseModeAndLine(mode, true);
		
			tempSmallTool.drawMode(mode);
		
		});
	
		var undoRedoEvent = new com.xjwgraph.UndoRedoEvent(function () {
		
			self.forEach(map, function (modeId) {
		
				var mode = $id(modeId);
		
				mode.style.left = oldLeftMap.get(modeId) + "px";
		
				tempModeTool.showPointer(mode);
				tempModeTool.changeBaseModeAndLine(mode, true);
		
				tempSmallTool.drawMode(mode);
		
			});
				
		}, PathGlobal.toMiddleWidth);
	
		undoRedoEvent.setRedo(function () {
		
			self.forEach(map, function (modeId) {
		
				var mode = $id(modeId);
		
				mode.style.left = afterLeftMap.get(modeId) + "px";
		
				tempModeTool.showPointer(mode);
				tempModeTool.changeBaseModeAndLine(mode, true);
		
				tempSmallTool.drawMode(mode);
		
			});
		
		});
	
	},
	
	toRight : function () {
	
		var self = this,
		map = self.getOptionMap(self.tempContextId),
	
		right = -1;
	
		self.forEach(map, function (modeId) {
		
			var mode = $id(modeId),
			modeRight = parseInt(mode.style.left) + parseInt(mode.offsetWidth);
		
			if (right < modeRight) {
				right = modeRight;
			}
		
		});
		
		var global = com.xjwgraph.Global,
		
		tempModeTool = global.modeTool,
		tempSmallTool = global.smallTool,
	
		oldLeftMap = new Map(),
		afterLeftMap = new Map();
	
		self.forEach(map, function (modeId) {
		
			var mode = $id(modeId),
			modeStyle = mode.style;
		
			oldLeftMap.put(modeId, parseInt(modeStyle.left));
		
			var modeRight = parseInt(modeStyle.left) + parseInt(mode.offsetWidth);
			modeStyle.left = (right - modeRight) + parseInt(modeStyle.left) + "px";
		
			afterLeftMap.put(modeId, parseInt(modeStyle.left));
		
			tempModeTool.showPointer(mode);
			tempModeTool.changeBaseModeAndLine(mode, true);
		
			tempSmallTool.drawMode(mode);
		
		});
	
		var undoRedoEvent = new com.xjwgraph.UndoRedoEvent(function () {
		
			self.forEach(map, function (modeId) {
		
				var mode = $id(modeId);
		
				mode.style.left = oldLeftMap.get(modeId) + "px";
		
				tempModeTool.showPointer(mode);
				tempModeTool.changeBaseModeAndLine(mode, true);
		
				tempSmallTool.drawMode(mode);
		
			});
				
		}, PathGlobal.toRight);
	
		undoRedoEvent.setRedo(function () {
		
			self.forEach(map, function (modeId) {
		
				var mode = $id(modeId);
		
				mode.style.left = afterLeftMap.get(modeId) + "px";
		
				tempModeTool.showPointer(mode);
				tempModeTool.changeBaseModeAndLine(mode, true);
		
				tempSmallTool.drawMode(mode);
		
			});
		
		});
	
	}, 

	toTop : function () {
	
		var self = this,
		map = self.getOptionMap(self.tempContextId),
		top = -1;
	
		self.forEach(map, function (modeId) {
		
			var mode = $id(modeId),
			modeTop = parseInt(mode.style.top);
		
			if (top > modeTop || top == -1) {
				top = modeTop;
			}
		
		});
		
		var global = com.xjwgraph.Global,
	
		tempModeTool = global.modeTool,
		tempSmallTool = global.smallTool,
	
		oldTopMap = new Map(),
		afterTopMap = new Map();
	
		self.forEach(map, function (modeId) {
		
			var mode = $id(modeId),
			modeStyle = mode.style;
		
			oldTopMap.put(modeId, parseInt(modeStyle.top));
		
			modeStyle.top = top + "px";
		
			afterTopMap.put(modeId, parseInt(modeStyle.top));
		
			tempModeTool.showPointer(mode);
			tempModeTool.changeBaseModeAndLine(mode, true);
		
			tempSmallTool.drawMode(mode);
		
		});
	
		var undoRedoEvent = new com.xjwgraph.UndoRedoEvent(function () {
		
			self.forEach(map, function (modeId) {
		
				var mode = $id(modeId);
		
				mode.style.top = oldTopMap.get(modeId) + "px";
		
				tempModeTool.showPointer(mode);
				tempModeTool.changeBaseModeAndLine(mode, true);
		
				tempSmallTool.drawMode(mode);
		
			});
				
		}, PathGlobal.toTop);
	
		undoRedoEvent.setRedo(function () {
		
			self.forEach(map, function (modeId) {
		
				var mode = $id(modeId);
		
				mode.style.top = afterTopMap.get(modeId) + "px";
		
				tempModeTool.showPointer(mode);
				tempModeTool.changeBaseModeAndLine(mode, true);
		
				tempSmallTool.drawMode(mode);
		
			});
		
		});
	
	},

	toMiddleHeight : function () {
	
		var self = this,
		map = self.getOptionMap(self.tempContextId),
		middleHeightArray = [],
		i = 0;
	
		this.forEach(map, function (modeId) {
		
			var mode = $id(modeId);
			middleHeightArray[i++] = parseInt(mode.style.top) + parseInt(parseInt(mode.offsetHeight) / 2);
		
		});
	
		middleHeightArray = middleHeightArray.sort(function (n1, n2) { 
			return n1 - n2
		});
	
		var middleNumber = parseInt(middleHeightArray.length / 2),
		middleTop = middleHeightArray[middleNumber],
		
		global = com.xjwgraph.Global,
		
		tempModeTool = global.modeTool,
		tempSmallTool = global.smallTool,
	
		oldTopMap = new Map(),
		afterTopMap = new Map();
	
		self.forEach(map, function (modeId) {
		
			var mode = $id(modeId),
			modeStyle = mode.style,
		
			decTop = parseInt(parseInt(modeStyle.top) + parseInt(parseInt(mode.offsetHeight) / 2) - middleTop);
		
			oldTopMap.put(modeId, parseInt(modeStyle.top));
		
			modeStyle.top = parseInt(parseInt(modeStyle.top) - decTop) + "px";
		
			afterTopMap.put(modeId, parseInt(modeStyle.top));
		
			tempModeTool.showPointer(mode);
			tempModeTool.changeBaseModeAndLine(mode, true);
		
			tempSmallTool.drawMode(mode);
		
		});
	
		var undoRedoEvent = new com.xjwgraph.UndoRedoEvent(function () {
		
			self.forEach(map, function (modeId) {
		
				var mode = $id(modeId);
		
				mode.style.top = oldTopMap.get(modeId) + "px";
		
				tempModeTool.showPointer(mode);
				tempModeTool.changeBaseModeAndLine(mode, true);
		
				tempSmallTool.drawMode(mode);
		
			});
				
		}, PathGlobal.toMiddleHeight);
	
		undoRedoEvent.setRedo(function () {
		
			self.forEach(map, function (modeId) {
		
				var mode = $id(modeId);
		
				mode.style.top = afterTopMap.get(modeId) + "px";
		
				tempModeTool.showPointer(mode);
				tempModeTool.changeBaseModeAndLine(mode, true);
		
				tempSmallTool.drawMode(mode);
		
			});
		
		});
	
	},

	toBottom : function () {
	
		var self = this,
		
		map = self.getOptionMap(self.tempContextId),
		bottom = -1;

		self.forEach(map, function (modeId) {
		
			var mode = $id(modeId),
			modeBottom = parseInt(mode.style.top) + parseInt(mode.offsetHeight);
		
			if (bottom < modeBottom) {
				bottom = modeBottom
			}
		
		});
		
		var global = com.xjwgraph.Global,
		
		tempModeTool = global.modeTool,
		tempSmallTool = global.smallTool,
	
		oldTopMap = new Map(),
		afterTopMap = new Map();
	
		self.forEach(map, function (modeId) {
		
			var mode = $id(modeId),
			modeStyle = mode.style,
		
			modeBottom = parseInt(modeStyle.top) + parseInt(mode.offsetHeight);
		
			oldTopMap.put(modeId, parseInt(modeStyle.top));
		
			modeStyle.top = (bottom - modeBottom) + parseInt(modeStyle.top) + "px";
		
			afterTopMap.put(modeId, parseInt(modeStyle.top));
		
			tempModeTool.showPointer(mode);
			tempModeTool.changeBaseModeAndLine(mode, true);
		
			tempSmallTool.drawMode(mode);
		
		});
	
		var undoRedoEvent = new com.xjwgraph.UndoRedoEvent(function () {
		
			self.forEach(map, function (modeId) {
		
				var mode = $id(modeId);
		
				mode.style.top = oldTopMap.get(modeId) + "px";
		
				tempModeTool.showPointer(mode);
				tempModeTool.changeBaseModeAndLine(mode, true);
		
				tempSmallTool.drawMode(mode);
		
			});
				
		}, PathGlobal.toBottom);
	
		undoRedoEvent.setRedo(function () {
		
			self.forEach(map, function (modeId) {
		
				var mode = $id(modeId);
		
				mode.style.top = afterTopMap.get(modeId) + "px";
		
				tempModeTool.showPointer(mode);
				tempModeTool.changeBaseModeAndLine(mode, true);
		
				tempSmallTool.drawMode(mode);
		
			});
		
		});
	
	}, 

	sumLeftTop : function (body, sumLeft, sumTop) {
	
		if (!sumLeft) {
			sumLeft = body.offsetLeft;
		}
	
		if (!sumTop) {
			sumTop = body.offsetTop;
		}
	
		var parent = body.offsetParent;
					
		if (parent) {
						
			sumLeft += parent.offsetLeft;
			sumTop += parent.offsetTop; 
						
			return this.sumLeftTop(parent, sumLeft, sumTop);
					
		} else {
			return [sumLeft, sumTop];
		}
	
	},
	
	changStyle : function (div) {
	
		PathGlobal.isPixel = !PathGlobal.isPixel;
		div.innerHTML = PathGlobal.isPixel ? "Pixel" : "Grid";
	
	},

	showMenu : function (event, contextId) {
	
		this.tempContextId = contextId;
	
		event = event || window.event;
	
		if (!event.pageX) {
			event.pageX = event.clientX;
		} 
		
		if (!event.pageY) {
			event.pageY = event.clientY;
		}
   	
  	var tx = event.pageX,
		ty = event.pageY,
		
		global = com.xjwgraph.Global,
		
		tempPathBody = global.lineTool.pathBody,
		leftTops = global.baseTool.sumLeftTop(tempPathBody);
   			
		tx = tx - parseInt(leftTops[0]) + parseInt(tempPathBody.scrollLeft);
		ty = ty - parseInt(leftTops[1]) + parseInt(tempPathBody.scrollTop);
	
		var isPixel = $id("isPixel"),
		isPixelStyle = isPixel.style;
	
		if (contextId) {
			isPixelStyle.visibility = "hidden";
		} else {
			isPixelStyle.visibility = "visible";
		}
	
		var pathBodyRightMenu = $id("pathBodyRightMenu");
		pathBodyRightMenuStyle = pathBodyRightMenu.style;

		pathBodyRightMenuStyle.top = ty + "px";
		pathBodyRightMenuStyle.left = tx + "px";
		pathBodyRightMenuStyle.visibility = "visible";
		pathBodyRightMenuStyle.zIndex = com.xjwgraph.Global.modeTool.getNextIndex();
					
	},

	toSeparate : function () {
	
		var self = this,
		contextArray = [],
		i = 0;
	
		self.forEach(self.contextMap, function(contextId) {
			
			var contextDiv = $id(contextId);
		
			if (contextDiv.style.borderColor == PathGlobal.defaultColor) {
				contextArray[i++] = contextDiv;
				contextDiv.setAttribute("groups", false);
			}
		
		});
		
		var global = com.xjwgraph.Global;
		
		var undoRedoEvent = new com.xjwgraph.UndoRedoEvent(function () {
		
			var contextLength = contextArray.length,
			tempBaseTool = global.baseTool;
		
			for (var i = contextLength; i--;) {
		
				var contextDiv = contextArray[i];
				contextDiv.setAttribute("groups", true);
			
			}
		
		}, PathGlobal.toSeparate);
	
		undoRedoEvent.setRedo(function () {
		
			var contextLength = contextArray.length,
			tempBaseTool = global.baseTool;
		
			for (var i = contextLength; i--;) {
			
				var contextDiv = contextArray[i];
				contextDiv.setAttribute("groups", true);
			
			}
		
		});
	
		self.clearContext();
	
	},

	checkBrowser : function () {

		var ua = navigator.userAgent.toLowerCase();
	
		check = function(r){
			return r.test(ua);
		}
	
		var self = this;
	
		self.isOpera = check(/opera/);
		self.isIE = !self.isOpera && check(/msie/);
		self.isIE7 = self.isIE && check(/msie 7/);
		self.isIE8 = self.isIE && check(/msie 8/);
		self.isIE6 = self.isIE && !self.isIE7 && !self.isIE8;
		self.isChrome = check(/chrome/);
		self.isWebKit = check(/webkit/);
		self.isSafari = !self.isChrome && check(/safari/);
		self.isSafari2 = self.isSafari && check(/applewebkit\/4/);
		self.isSafari3 = self.isSafari && check(/version\/3/);
		self.isSafari4 = self.isSafari && check(/version\/4/);
		self.isGecko = !self.isWebKit && check(/gecko/);
		self.isGecko2 = self.isGecko && check(/rv:1\.8/);
		self.isGecko3 = self.isGecko && check(/rv:1\.9/);
	
	},
	
	getBrowserName : function () {
	
		var self = this;
	
		if (self.isIE) {
		
			if (self.isIE8) {
				return "IE8";
			} else if (self.isIE7) {
				return "IE7";
			} else if (self.isIE6) {
				return "IE6";
			} else {
				return "IE";
			}
		
		}
	
		if (self.isChrome) {
			return "CHROME";
		} else if (self.isWebKit) {
			return "WEBKIT";
		} else if (self.isOpera) {
			return "OPERA";
		} else if (self.isGecko) {
			return "GECKO";
		} else if (self.isGecko2) {
			return "GECKO2";
		} else if (self.isGecko3) {
			return "GECKO3";
		}
	
		if (self.isSafari) {
			return "SAFARI";
		} else if (self.isSafari2) {
			return "SAFARI2";
		} else if (self.isSafari3) {
			return "SAFARI3";
		} else if (self.isSafari4) {
			return "SAFARI4";
		}
	
	},

	printView : function () {
	
		var viewHTML = window.open('view.html', '', '');
		
		if (this.isChrome || this.isGecko) {
		
			var viewHTMLBuffer = [],
			i = 0;
	
			viewHTMLBuffer[i++] = '<html>';
			viewHTMLBuffer[i++] = '<head>';
			viewHTMLBuffer[i++] = '<link href="css/flowPath.css" type="text/css" rel="stylesheet" />';
			viewHTMLBuffer[i++] = '<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />';
			viewHTMLBuffer[i++] = '<title></title>';
			viewHTMLBuffer[i++] = '</head>';
			viewHTMLBuffer[i++] = '<body>';
			viewHTMLBuffer[i++] = document.getElementById("contextBody").innerHTML;
			viewHTMLBuffer[i++] = '</body></html>';
		
			viewHTML.document.write(viewHTMLBuffer.join(""));
		
		}
	
		viewHTML.document.close();

	},

	toMerge : function () {
	
		var self = this,
		contextArray = [],
		i = 0;
	
		self.forEach(self.contextMap, function(contextId) {
		
			var contextDiv = $id(contextId);
		
			if (contextDiv.style.borderColor ==  PathGlobal.defaultColor) {
			
				contextArray[i++] = contextDiv;
				contextDiv.setAttribute("groups", true);
			
				contextDiv.oncontextmenu = function () {
					return false;
				}
			
			}
		
		});
		
		var global = com.xjwgraph.Global;
		
		var undoRedoEvent = new com.xjwgraph.UndoRedoEvent(function () {
		
			var contextLength = contextArray.length,
			tempBaseTool = global.baseTool;
		
			for (var i = contextLength; i--;) {
		
				var contextDiv = contextArray[i];
			
				contextDiv.setAttribute("groups", false);
				contextDiv.oncontextmenu = function (event) {
			
					PathGlobal.rightMenu = true;
					tempBaseTool.showMenu(event, this.id);
			
					return false;
		
				}
			
			}
		
		}, PathGlobal.toMerge);
	
		undoRedoEvent.setRedo(function () {
		
			var contextLength = contextArray.length,
			tempBaseTool = global.baseTool;
		
			for (var i = contextLength; i--;) {
			
				var contextDiv = contextArray[i];
			
				contextDiv.setAttribute("groups", true);
				contextDiv.oncontextmenu = function (event) {
					return false;
				}
			
			}
		
		});
	
	},
	
	forEach : function (maps, fn) {

		var mapKeys = maps.getKeys(),
  	mapKeysLength = mapKeys.length;

		for (var i = mapKeysLength; i--;) {
		
			if (fn) {
				fn(mapKeys[i]);
			}
			
		}

	},
	
	removeAll : function () {
	
		var self = this,
		tempBaseTool = com.xjwgraph.Global.baseTool;
	
		self.forEach(self.contextMap, function(contextId) {
		
			var contextDiv = $id(contextId);
			
			tempBaseTool.contextMap.remove(contextId);
			tempBaseTool.pathBody.removeChild(contextDiv);

		});
	
	},
	
	clearContext : function () {
	
		var self = this;
	
		self.tempContextId = null;
	
		var contextArray = [],
		contextMap = [],
		i = 0,
	
		tempBaseTool = com.xjwgraph.Global.baseTool;
	
		self.forEach(self.contextMap, function(contextId) {
		
			var contextDiv = $id(contextId),
			contextDivStyle = contextDiv.style;
		
			contextDivStyle.borderColor = PathGlobal.clearBoderColor;
			contextDivStyle.filter = "alpha(opacity=10)";
			contextDivStyle.opacity = "0.1";
		
			var groups = contextDiv.getAttribute("groups");

			if (groups == "false" || !groups) {
			
				contextArray[i] = contextDiv;
				contextMap[i++] = tempBaseTool.contextMap.get(contextId);
			
				tempBaseTool.contextMap.remove(contextId);
				tempBaseTool.pathBody.removeChild(contextDiv);
		
			}
		
		});
	
		if (contextArray.length > 0) {
		
			var undoRedoEvent = new com.xjwgraph.UndoRedoEvent(function () {
		
				var contextLength = contextArray.length;
		
				for (var i = contextLength; i--;) {
			
					var contextDiv = contextArray[i];
			
					tempBaseTool.contextMap.put(contextDiv.id, contextMap[i]);
					tempBaseTool.pathBody.appendChild(contextDiv);
			
				}
				
			}, PathGlobal.clearContext);
	
			undoRedoEvent.setRedo(function () {
		
				var contextLength = contextArray.length;
		
				for (var i = contextLength; i--;) {
			
					var contextDiv = contextArray[i];
				
					if (contextDiv && contextDiv.id && $id(contextDiv.id)) {
					
						tempBaseTool.contextMap.remove(contextDiv.id);
						tempBaseTool.pathBody.removeChild(contextDiv);
				
					}
			
				}
		
			});
		
		}

	},
	
	clear : function () {
	
		PathGlobal.rightMenu = false;
	
		var pathBodyRightMenu = $id("pathBodyRightMenu");
		pathBodyRightMenu.style.visibility = "hidden";
	
		var isPixel = $id("isPixel");
		isPixel.style.visibility = "hidden";
	
		var self = this,
		areaDivStyle = self.areaDiv.style,
	
		top = parseInt(areaDivStyle.top),
		left = parseInt(areaDivStyle.left),
		width = parseInt(areaDivStyle.width),
		height = parseInt(areaDivStyle.height);
	
		if (areaDivStyle.visibility != "visible") {
			return;
		}
	
		var contextDiv = document.createElement("div"),
		contextDivStyle = contextDiv.style;
	
		contextDivStyle.position = "absolute";
		contextDivStyle.fontSize = "0px";
		contextDivStyle.borderWidth = "1px";
		contextDivStyle.borderStyle = "solid";
		contextDivStyle.borderColor = PathGlobal.defaultColor;
		contextDivStyle.visibility = "visible";
		contextDivStyle.top = 0 + "px";
		contextDivStyle.left = 0 + "px";
		contextDivStyle.width = 0 + "px";
		contextDivStyle.height = 0 + "px";
		contextDivStyle.backgroundColor = PathGlobal.selectColor;
		contextDivStyle.filter = "alpha(opacity=20)";
		contextDivStyle.opacity = "0.2";
		
		var global = com.xjwgraph.Global,
		
		tempModeTool = global.modeTool,
		tempLineTool = global.lineTool,
		contextDivId = tempModeTool.getNextIndex();
		
		contextDivStyle.zIndex = contextDivId;

		contextDiv.setAttribute("id", "contextDiv" + contextDivId);
	
		var contextModeMap = new Map(),
				contextLineMap = new Map(),
	
				contextWidth = 0,
				contextHeight = 0,
	
				tempBaseTool = com.xjwgraph.Global.baseTool;
		
		tempLineTool.clear();
		
		tempLineTool.forEach(function (lineId) {
			
			var line = $id(lineId),
			    path = tempLineTool.getPath(line),
					paths = tempLineTool.getPathArray(path),
					pathLength = paths.length,
					isHas = true,
					point1 = 0,
					point2 = 0;
					
					for (var i = pathLength; i--;) {
						
						var isTop = true;
						if (i % 2 == 1) {
							
							point1 = top;
							point2 = top + height;
							
 						
 						} else {
							
							point1 = left;
							point2 = left + width;
							isTop = false;
							
						}
						
						if (!(paths[i] >= point1 && paths[i] <= point2)) {
							
								isHas = false;	
								break;
						}
						
						if (isTop && (parseInt(contextDivStyle.top) > paths[i] || parseInt(contextDivStyle.top) == 0)) {
							contextDivStyle.top = paths[i] - 2 + "px";
						}
			
						if (!isTop && (parseInt(contextDivStyle.left) > paths[i] || parseInt(contextDivStyle.left) == 0)) {
							contextDivStyle.left = paths[i] - 2 + "px";
						}
						
						if (isTop && (parseInt(contextHeight) < parseInt(paths[i]))) {
							contextHeight = paths[i];
						}
						
						
						if (!isTop && (parseInt(contextWidth) < parseInt(paths[i]))) {
							contextWidth = paths[i];
						}
			
					}
					
					if (isHas) {
						
						var isAbleMode = true;
						
						tempBaseTool.forEach(tempBaseTool.contextMap, function (contextId) {
				
							var sonContextLineMap = global.baseTool.contextMap.get(contextId).contextLineMap, 
									sonContextDiv = $id(contextId),
									isGroups = sonContextDiv.getAttribute("groups");
				
									tempBaseTool.forEach(sonContextLineMap, function (lineId) {
					
										if (lineId == line.id && (isGroups == "true" || isGroups)) {
											isAbleMode = false;
										}
					
									});
				
						});
						
						stopEvent = true;
						
						if (isAbleMode) {
							
							tempLineTool.show(line);
							contextLineMap.put(lineId, line);
							
						}
						
					}
			
		});
	
		tempModeTool.forEach(function (modeId) {
		
			var mode = $id(modeId),
			modeStyle = mode.style,
		
			imag = $id(modeId.replace("module", "backImg")),
			imagStyle = imag.style,
		
			modeTop = parseInt(modeStyle.top),
			modeLeft = parseInt(modeStyle.left),
		
			modeWidth = parseInt(imagStyle.width),
			modeHeight = parseInt(imagStyle.height),
		
			isAbleMode = true;
			
			tempBaseTool.forEach(tempBaseTool.contextMap, function (contextId) {
				
				var sonContextModeMap = global.baseTool.contextMap.get(contextId).contextModeMap,
						sonContextDiv = $id(contextId),
						isGroups = sonContextDiv.getAttribute("groups");
				
				tempBaseTool.forEach(sonContextModeMap, function (modeId) {
					
					if (modeId == mode.id && (isGroups == "true" || isGroups)) {
						isAbleMode = false;
					}
					
				});
				
			});
		
			if (isAbleMode && modeTop > top && modeLeft > left 
					&& modeLeft + modeWidth < left + width 
					&& modeTop + modeHeight < top + height) {
			
				if (parseInt(contextDivStyle.top) > modeTop || parseInt(contextDivStyle.top) == 0) {
					contextDivStyle.top = modeTop + "px";
				}
			
				if (parseInt(contextDivStyle.left) > modeLeft || parseInt(contextDivStyle.left) == 0) {
					contextDivStyle.left = modeLeft + "px";
				}
			
				if (contextWidth < modeWidth + modeLeft) {
					contextWidth = modeWidth + modeLeft;
				}
			
				if (contextHeight < modeHeight + modeTop) {
					contextHeight = modeHeight + modeTop;
				}
			
				stopEvent = true;
				global.modeTool.showPointer(mode);
				contextModeMap.put(mode.id, mode);
			
			} else {
				global.modeTool.hiddPointer(mode);
			}
		
		});
		
		self.clearContext();
		
		function contextEntry (modeMap, lineMap) {
			this.contextModeMap = modeMap;
			this.contextLineMap = lineMap;
		}

		if ((contextModeMap.size() + contextLineMap.size()) > 1) {
			
			self.pathBody.appendChild(contextDiv);
			
			var contextEntry = new contextEntry(contextModeMap, contextLineMap);
			
			self.contextMap.put(contextDiv.id, contextEntry);
		
			self.tempContextId = contextDiv.id;
		
			contextDivStyle.width = (contextWidth - parseInt(contextDivStyle.left)) + "px";
			contextDivStyle.height = (contextHeight - parseInt(contextDivStyle.top)) + "px";
		
			var tempBaseTool = global.baseTool;
		
			var undoRedoEvent = new com.xjwgraph.UndoRedoEvent(function () {
			
				if (contextDiv && contextDiv.id && $id(contextDiv.id)) {
				
					tempBaseTool.pathBody.removeChild(contextDiv);		
					tempBaseTool.contextMap.remove(contextDiv.id);
			
				}
			
			}, PathGlobal.baseClear);
	
			undoRedoEvent.setRedo(function () {
				
				tempBaseTool.pathBody.appendChild(contextDiv);
				tempBaseTool.contextMap.put(contextDiv.id, contextEntry);
			
			});
		
			self.contextDivDrag(contextDiv, contextEntry);

		}
	
		areaDivStyle.top = 1 + "px";
		areaDivStyle.left = 1 + "px";
		areaDivStyle.width = 1 + "px";
		areaDivStyle.height = 1 + "px";
		areaDivStyle.visibility = "hidden";
	
	},
	
	contextDivDrag : function (contextDiv, contextEntry) {
	
		var contextDivStyle = contextDiv.style,
		global = com.xjwgraph.Global,
		tempSmallTool = global.smallTool,
		tempBaseTool = global.baseTool,
		tempModeTool = global.modeTool,
		tempLineTool = global.lineTool,
		contextModeMap = contextEntry.contextModeMap,
		contextLineMap = contextEntry.contextLineMap;
	
		contextDiv.onclick = function () {
			
			contextDivStyle.borderColor = PathGlobal.defaultColor;
			contextDivStyle.filter = "alpha(opacity=30)";
			contextDivStyle.opacity = "0.3";
			
			tempBaseTool.forEach(tempBaseTool.contextMap, function (contextId) {
				
				if (contextId != contextDiv.id) {
				
					var sonContextDiv = $id(contextId);
					var sonContextDivStyle = sonContextDiv.style;
				
					sonContextDivStyle.borderColor = PathGlobal.clearBoderColor;
					sonContextDivStyle.filter = "alpha(opacity=10)";
					sonContextDivStyle.opacity = "0.1";
				
				}
				
			});
			
		}
		
		contextDiv.oncontextmenu = function (event) {
			
			PathGlobal.rightMenu = true;
			tempBaseTool.showMenu(event, this.id);
			
			return false;
		
		}
		
		contextDiv.ondragstart = function () {
			return false;
		};
	
		contextDiv.onmousedown = function(event) {
			
			event = event || window.event;
			
			global.modeTool.clear();
			
			tempBaseTool.contextMoveAbale = true;
			contextDivStyle.borderColor = PathGlobal.defaultColor;
			contextDivStyle.filter = "alpha(opacity=20)";
			contextDivStyle.opacity = "0.2";
			contextDivStyle.visibility = "visible";
			
			tempBaseTool.forEach(tempBaseTool.contextMap, function (contextId) {
				
				if (contextId != contextDiv.id) {
				
					var sonContextDiv = $id(contextId),
					sonContextDivStyle = sonContextDiv.style;
					
					sonContextDivStyle.borderColor = PathGlobal.clearBoderColor;
					sonContextDivStyle.filter = "alpha(opacity=10)";
					sonContextDivStyle.opacity = "0.1";
				
				}
				
			});
			
			var oldTop = parseInt(contextDivStyle.top),
			oldLeft = parseInt(contextDivStyle.left);
		
			if (contextDiv.setCapture) {
				contextDiv.setCapture();
			} else if (window.captureEvents) {
				window.captureEvents(Event.MOUSEMOVE|Event.MOUSEUP);
			}
		
			var x = event.layerX && event.layerX >= 0 ? event.layerX : event.offsetX,
			y = event.layerY && event.layerX >= 0 ? event.layerY : event.offsetY,
			
			oldTop = parseInt(contextDivStyle.top),
			oldLeft = parseInt(contextDivStyle.left),
			doc = document;
			
			doc.onmousemove = function (event) {
			
				tempBaseTool.contextMoveAttempt = true;
				
				event = event || window.event;
				
				if (!event.pageX) {
					event.pageX = event.clientX;
				} 
		
   			if (!event.pageY) {
   				event.pageY = event.clientY;
   			}
   		
   			var tx = event.pageX - x,
   			ty = event.pageY - y,
   			
   			global = com.xjwgraph.Global,
   			
   			tempPathBody = global.lineTool.pathBody,
   			leftTops = global.baseTool.sumLeftTop(tempPathBody);
   			
   			tx = tx - parseInt(leftTops[0]) + parseInt(tempPathBody.scrollLeft);
				ty = ty - parseInt(leftTops[1]) + parseInt(tempPathBody.scrollTop);
			
				contextDivStyle.left = tx + "px";
    		contextDivStyle.top = ty + "px";

			};
		
			doc.onmouseup = function (event) {
			
				event = event || window.event;
				
				if (!event.pageX) {
					event.pageX = event.clientX;
				} 
		
   			if (!event.pageY) {
   				event.pageY = event.clientY;
   			}
				
				var tx = event.pageX - x,
   			ty = event.pageY - y,
   			
   			global = com.xjwgraph.Global,
   			
   			tempPathBody = global.lineTool.pathBody,
   			leftTops = global.baseTool.sumLeftTop(tempPathBody);
   			
   			tx = tx - parseInt(leftTops[0]) + parseInt(tempPathBody.scrollLeft);
				ty = ty - parseInt(leftTops[1]) + parseInt(tempPathBody.scrollTop);
			
				if (contextDiv.releaseCapture) {
					contextDiv.releaseCapture();
				} else if (window.releaseEvents) {
					window.releaseEvents(Event.MOUSEMOVE|Event.MOUSEUP);
				}
				
   			doc.onmousemove = null;
   			doc.onmouseup = null;
   			
   			if (tempBaseTool.contextMoveAttempt) {

   				var contextModeMapKeys = contextModeMap.getKeys(),
  						contextModeMapKeyLength = contextModeMapKeys.length,
  						contextLineMapKeys = contextLineMap.getKeys(),
  						contextLineMapKeyLength = contextLineMapKeys.length,
  						oldPathMap = new Map(),
							newPathMap = new Map();

  				for (var i = contextLineMapKeyLength; i--;) {
  					
  					var lineId = contextLineMapKeys[i];
  					line = $id(lineId),
  					newLineLeft = tx - oldLeft,
						newLineTop = ty - oldTop,
						path = tempLineTool.getPath(line),
						paths = tempLineTool.getPathArray(path),
						pathLength = paths.length,
						lineMode = global.lineMap.get(line.id),
						xBaseMode = lineMode.xBaseMode,
						wBaseMode = lineMode.wBaseMode;
						
						oldPathMap.put(lineId, path);
						
						for (var j = pathLength; j--;) {
							
							if (j % 2 == 1) {
								paths[j] = parseInt(paths[j]) + parseInt(newLineTop);
							} else {
								paths[j] = parseInt(paths[j]) + parseInt(newLineLeft);
							}
							
						}
						
						var newPath = tempLineTool.arrayToPath(paths);
						
						newPathMap.put(lineId, newPath);
			
						tempLineTool.setPath(line, newPath);
						tempLineTool.setDragPoint(line);
						
						if (wBaseMode && $id(wBaseMode.id) && !contextModeMap.containsKey(wBaseMode.id)) {
							tempLineTool.removeAllLineAndMode(line, $id(wBaseMode.id));
						}
						
						if (xBaseMode && $id(xBaseMode.id) && !contextModeMap.containsKey(xBaseMode.id)) {
							tempLineTool.removeAllLineAndMode(line, $id(xBaseMode.id));
						}
						
						tempSmallTool.drawLine(line);
						tempLineTool.clearLine(lineId);
  					
  				}
  				
  				function ModeTopLeft(valueTop, valueLeft) {
  					
  					var self = this;
  					
  					self.modeTop = valueTop;
  					self.modeLeft = valueLeft;
  					
  				}
  				
  				var oldModeTopLeftMap = new Map(),
					newModeTopLeftMap = new Map(); 
  			
					for (var i = contextModeMapKeyLength; i--;) {
		
						var mode = $id(contextModeMapKeys[i]),
						modeStyle = mode.style,
					
						newModeLeft = tx - oldLeft,
						newModeTop = ty - oldTop;
						
						oldModeTopLeftMap.put(mode.id, new ModeTopLeft(parseInt(modeStyle.top), parseInt(modeStyle.left)));
						
						modeStyle.left = parseInt(modeStyle.left) + newModeLeft + "px";
						modeStyle.top = parseInt(modeStyle.top) + newModeTop + "px";
						
						newModeTopLeftMap.put(mode.id, new ModeTopLeft(parseInt(modeStyle.top), parseInt(modeStyle.left)));
						
						tempModeTool.changeBaseModeAndLine(mode, true);
    				tempSmallTool.drawMode(mode);

					}
					
					var undoRedoEvent = new com.xjwgraph.UndoRedoEvent(function () {
						
						contextDivStyle.top = oldTop + "px";
						contextDivStyle.left = oldLeft + "px";
  					
  					for (var i = contextModeMapKeyLength; i--;) {
		
							var mode = $id(contextModeMapKeys[i]),
							modeStyle = mode.style,
							modeTopLeft = oldModeTopLeftMap.get(mode.id);
							
							modeStyle.left = modeTopLeft.modeLeft + "px";
							modeStyle.top = modeTopLeft.modeTop + "px";
							
							tempModeTool.showPointer(mode);
							tempModeTool.changeBaseModeAndLine(mode, true);
							
    					tempSmallTool.drawMode(mode);

						}
						
						for (var i = contextLineMapKeyLength; i--;) {
							
							var lineId = contextLineMapKeys[i];
									line = $id(lineId),
									oldLine = oldPathMap.get(lineId);
									
							tempLineTool.setPath(line, oldLine);
							tempLineTool.show(line);
						
							tempSmallTool.drawLine(line);
							
						}
			
					}, PathGlobal.contextDivDrag);
					
					var afterTop = parseInt(contextDivStyle.top),
					afterLeft = parseInt(contextDivStyle.left);
					
					undoRedoEvent.setRedo(function () {

						contextDivStyle.top = afterTop + "px";
						contextDivStyle.left = afterLeft + "px";
						
						for (var i = contextModeMapKeyLength; i--;) {
		
							var mode = $id(contextModeMapKeys[i]),
							modeStyle = mode.style,
							modeTopLeft = newModeTopLeftMap.get(mode.id);
							
							modeStyle.left = modeTopLeft.modeLeft + "px";
							modeStyle.top = modeTopLeft.modeTop + "px";
							
							tempModeTool.showPointer(mode);
							tempModeTool.changeBaseModeAndLine(mode, true);
							
    					tempSmallTool.drawMode(mode);

						}
						
						for (var i = contextLineMapKeyLength; i--;) {
							
							var lineId = contextLineMapKeys[i];
									line = $id(lineId),
									newPath = newPathMap.get(lineId);
									
							tempLineTool.setPath(line, newPath);
							tempLineTool.show(line);
						
							tempSmallTool.drawLine(line);
							
						}
		
					});
				
				}
				
				tempBaseTool.contextMoveAttempt = false;
				tempBaseTool.contextMoveAbale = false;

			};
		
		}
	
	}, 
	
	initPathBody : function (pathBody) {
	
		var pathBody = $id(pathBody.id),
		self = this,
	
		areaDiv = self.areaDiv,
		areaDivStyle = areaDiv.style;
	
		areaDivStyle.position = "absolute";
		areaDivStyle.width = 1 + "px";
		areaDivStyle.height = 1 + "px";
		areaDivStyle.fontSize = "0px";
		areaDivStyle.borderWidth = "1px";
		areaDivStyle.borderStyle= "solid";
		areaDivStyle.visibility = "hidden";
		areaDivStyle.backgroundColor = PathGlobal.selectColor;
		areaDivStyle.filter = "alpha(opacity=30)";
		areaDivStyle.opacity = "0.3";

		pathBody.appendChild(areaDiv);
	
		pathBody.ondragstart = function () {
				return false;
		};
		
		var global = com.xjwgraph.Global;
		
		pathBody.onclick = function () {
			global.baseTool.clear();
		}
	
		pathBody.ondblclick = function () {
			global.baseTool.clear();
		}

		pathBody.onmousedown = function(event) {
		
			areaDivStyle.borderColor = global.baseTool.checkColor;
			event = event || window.event;
		
			if (!PathGlobal.rightMenu) {
				global.baseTool.clear();
			}
		
			var x = event.clientX ? event.clientX : event.offsetX,
			y = event.clientY ? event.clientY : event.offsetY,
			
			tempPathBody = global.lineTool.pathBody,
			leftTops = global.baseTool.sumLeftTop(tempPathBody);
		
			x = x - parseInt(leftTops[0]) + parseInt(tempPathBody.scrollLeft);
			y = y - parseInt(leftTops[1]) + parseInt(tempPathBody.scrollTop);

			areaDivStyle.left = x + "px";
			areaDivStyle.top = y + "px";
		
			if (global.modeTool.moveable == true || global.lineTool.moveable == true || global.baseTool.contextMoveAbale == true) {
			} else {
				areaDivStyle.visibility = "visible";
			}
		
			pathBody.onmousemove = function (event) {
			
				event = event || window.event;
			
   			var tx = event.clientX,
						ty = event.clientY,
   		
   			tempPathBody = global.lineTool.pathBody,
   			leftTops = global.baseTool.sumLeftTop(tempPathBody);
   		
   			tx = tx - parseInt(leftTops[0]) + parseInt(tempPathBody.scrollLeft);
				ty = ty - parseInt(leftTops[1]) + parseInt(tempPathBody.scrollTop);
			
				var newTx = tx - x,
						newTy = ty - y;

				if (areaDiv && areaDivStyle.visibility == "visible") {
				
					if (tx >= x) {
						areaDivStyle.width = newTx + "px";
					} 
				
					if (ty >= y) {
						areaDivStyle.height = newTy + "px";
					}
				
					if (ty < y) {
						areaDivStyle.top = ty + "px";
						areaDivStyle.height = Math.abs(newTy) + "px";
					}
				
					if (tx < x) {
						areaDivStyle.left = tx + "px";
						areaDivStyle.width = Math.abs(newTx) + "px";
					}
				
				}

			};
		
			pathBody.onmouseup = function (event) {

				if (areaDiv && areaDivStyle.visibility == "visible" && !PathGlobal.rightMenu) {
					global.baseTool.clear();
				}
			
			};
		
		}
	
	},
	
	findBackImgSrc : function (baseMode) {
	
		for(var sonNode = baseMode.firstChild; sonNode != null; sonNode = sonNode.nextSibling) {
		
			if (sonNode.id && sonNode.id.indexOf("backGroundImg") >= 0) {
				return sonNode.src;
			}
					
		}
	
	},
	
	drag : function (baseMode, isLine, brokenType) {
	
		var baseMode = baseMode,
		isLine = isLine,
		imgSrc = this.findBackImgSrc(baseMode),
		
		global = com.xjwgraph.Global;
	
		baseMode.ondragstart = function () {
			return false;
		};
	
		baseMode.onmousedown = function(event) {
		
			event = event || window.event;
		
			var moveBaseModeImg = $id("moveBaseModeImg");
			moveBaseModeImg.src = imgSrc;
		
			var moveBaseMode = $id("moveBaseMode"),
			moveBaseModeStyle = moveBaseMode.style;
		
			moveBaseModeStyle.visibility = "visible";
		
			if (moveBaseMode.setCapture) {
				moveBaseMode.setCapture();
			} else if (window.captureEvents) {
				document.captureEvents(Event.MOUSEMOVE|Event.MOUSEUP);
			}
		
			var x = event.clientX ? event.clientX : event.offsetX,
					y = event.clientY ? event.clientY : event.offsetY;
		
			moveBaseModeStyle.left = x + "px";
			moveBaseModeStyle.top = y + "px";
		
			var doc = document;
		
			doc.onmousemove = function (event) {
			
				event = event || window.event;
				
   			var tx = event.clientX,
   					ty = event.clientY;

				moveBaseModeStyle.left = tx + "px";
    		moveBaseModeStyle.top = ty + "px";
	
			};
		
			doc.onmouseup = function (event) {
			
				event = event || window.event;
			
				if (moveBaseMode.releaseCapture) {
					moveBaseMode.releaseCapture();
				} else if (window.releaseEvents) {
					document.releaseEvents(Event.MOUSEMOVE|Event.MOUSEUP);
				}

   			doc.onmousemove = null;
   			doc.onmouseup = null;
   		
   			moveBaseModeStyle.visibility = "hidden";

				if (!event.pageX) {
					event.pageX = event.clientX;
				} 
		
   			if (!event.pageY) {
   				event.pageY = event.clientY;
   			}
   	
   			var tx = event.pageX,
   					ty = event.pageY,
   		
   			tempPathBody = global.lineTool.pathBody,
   			leftTops = global.baseTool.sumLeftTop(tempPathBody);
   		
   			tx = tx - parseInt(leftTops[0]) + parseInt(tempPathBody.scrollLeft);
				ty = ty - parseInt(leftTops[1]) + parseInt(tempPathBody.scrollTop);
   		
   			var isCreate = tx >= 0 && ty >= 0;
   		
   			if (isCreate) {
   			
   				if (isLine) {
   					global.lineTool.create(tx, ty, brokenType);
   				} else {
   					global.modeTool.create(ty, tx, imgSrc);
   				}
   			
   			}

			};
		
		}
	
	},
	
	initEndDiv : function (width, height) {
	
		var self = this;

		self.endDiv = document.createElement("div");
		var endDiv = self.endDiv,
				endDivStyle = endDiv.style;
	
		endDivStyle.left = width + "px";
		endDivStyle.top = height + "px";
		endDivStyle.width = "10px";
		endDivStyle.height = "10px";
		endDivStyle.fontSize = "10px";
		endDivStyle.position = "absolute";
	
		self.pathBody.appendChild(endDiv);
	
		var topCross = $id("topCross"),
		leftCross = $id("leftCross");
	
		topCross.style.width = width + "px";
		leftCross.style.height = height + "px";
	
	}, 

	isSVG : function () {
		return this.VGType() == "SVG";
	},
	
	VGType : function () {
		return window.SVGAngle || document.implementation.hasFeature("http://www.w3.org/TR/SVG11/feature#BasicStructure", "1.1") ? "SVG" : "VML";
	},
	
	isVML : function () {
		return this.VGType() == "VML";
	}

}