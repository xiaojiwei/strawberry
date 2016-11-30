var SmallMapTool = com.xjwgraph.SmallMapTool = function (smallMap, body) {
	
	var self = this;
	
	self.smallMap = $id(smallMap);
	self.body = $id(body);
	self.multiple = self.getMultiple();
	self.defaultColor = PathGlobal.defaultColor;
	self.checkColor = "#00ff00";

	self.widthPercent = self.smallMap.offsetWidth / parseInt(self.body.scrollWidth) / self.multiple;
	self.heightPercent = self.smallMap.offsetHeight / parseInt(self.body.scrollHeight) / self.multiple;
	
	self.percent = 0;
	
	self.initPercent();

	self.smallModeMap = new Map();
	self.smallLineMap = new Map();
	
	var doc = document;

	if (com.xjwgraph.Global.lineTool.isSVG) {
		
		self.svgBody = doc.createElementNS('http://www.w3.org/2000/svg', 'svg');
		self.svgBody.setAttribute("id", "smallSvgContext");
		self.svgBody.setAttribute("height", '100%');
		self.svgBody.setAttribute("width", '100%');
    self.svgBody.setAttribute("style", "position:absolute;z-index:0;");
		
		self.smallMap.appendChild(self.svgBody);
		
	}
	
	self.smallBody = doc.createElement("div");
	self.smallBody.id = "smallBodyId";
	
	var smallBodyStyle = self.smallBody.style;
	smallBodyStyle.fontSize = "0px";
	smallBodyStyle.borderWidth = "2px";
	smallBodyStyle.borderColor = '#0F0';
	smallBodyStyle.borderStyle= "solid";
	smallBodyStyle.position = "absolute";
	smallBodyStyle.cursor = "pointer";
	
	self.drag(self.smallBody);
	self.smallMap.appendChild(self.smallBody);
	
	self.scalingDiv = doc.createElement("div");
	self.scalingDiv.id = "scalingId";
	self.scalingDiv.setAttribute("class", "scaling");
	self.scalingDiv.setAttribute("className", "scaling");
	
	self.dragScaling(self.scalingDiv);
	self.smallMap.appendChild(self.scalingDiv);
	
	self.initSmallBody();

}

SmallMapTool.prototype = {
	
	dragScaling : function (scalingDiv) {
		
		var global = com.xjwgraph.Global;
		
		scalingDiv.ondragstart = function () {
				return false;
		};
		
		scalingDiv.onmousedown = function(event) {
			
			var multiple = 1,
			tempSmallTool = global.smallTool,
			
			scalingDivStyle = scalingDiv.style,
			smallBodyStyle = tempSmallTool.smallBody.style,
		
			oldWidth = smallBodyStyle.width,
			oldHeight = smallBodyStyle.height;
			
			event = event || window.event;
			
			if (scalingDiv.setCapture) {
				scalingDiv.setCapture();
			} else if (window.captureEvents) {
				window.captureEvents(Event.MOUSEMOVE|Event.MOUSEUP);
			}
			
			var x = event.layerX ? event.layerX : event.offsetX,
					y = event.layerY ? event.layerY : event.offsetY,
			
			doc = document;
			
			doc.onmousemove = function (event) {
				
				event = event || window.event;
				
				if (!event.pageX) {
					event.pageX = event.clientX;
				} 
			
	   		if (!event.pageY) {
	   			event.pageY = event.clientY;
	   		}
	   	
	   		var tx = event.pageX - x,
	   				ty = event.pageY - y,
	   		
				smallMap = tempSmallTool.smallMap,
				leftTop = global.baseTool.sumLeftTop(smallMap);
				
				tx = tx - parseInt(leftTop[0]);
				ty = ty - parseInt(leftTop[1]);
			
				if (global.baseTool.isIE) {
					tx = tx - 4;
					ty = ty - 4;
				}
	   		
				scalingDivStyle.left = tx + "px";
	    	scalingDivStyle.top = ty + "px";
	    	
	    	var newWidth = tx + 1 - parseInt(smallBodyStyle.left),
	    			newHeight = ty + 1 - parseInt(smallBodyStyle.top);
	    	
	    	if (newWidth < 1) {
	    		newWidth = 1;
	    	}
	    	
	    	if (newHeight < 1) {
	    		newHeight = 1;
	    	}
	    	
	    	smallBodyStyle.width = newWidth + "px";
	    	smallBodyStyle.height = newHeight + "px";
	    	
	    	multiple = parseInt(smallBodyStyle.width) / parseInt(oldWidth);
	    	
	    	if (multiple < PathGlobal.defaultMaxMag) {
	    		multiple = PathGlobal.defaultMaxMag;
	    	} else if (multiple > PathGlobal.defaultMinMag) {
	    		multiple = PathGlobal.defaultMinMag;
	    	}
	    	
	    	global.undoRedoEventFactory.clear();
	
			};
			
			doc.onmouseup = function (event) {
				
				event = event || window.event;
				
				if (scalingDiv.releaseCapture) {
					scalingDiv.releaseCapture();
				} else if (window.releaseEvents) {
					window.releaseEvents(Event.MOUSEMOVE|Event.MOUSEUP);
				}
				
				global.lineTool.initScaling(multiple);
				global.modeTool.initScaling(multiple);
				global.baseTool.initScaling(multiple);
				
				tempSmallTool.initSmallBody();
				
	   		doc.onmousemove = null;
	   		doc.onmouseup = null;
	
			};
			
		}
		
	},

	drag : function (smallBody) {
		
		var global = com.xjwgraph.Global;
	
		smallBody.ondragstart = function () {
				return false;
		};
		
		smallBody.onmousedown = function(event) {
			
			event = event || window.event;
			
			if (smallBody.setCapture) {
				smallBody.setCapture();
			} else if (window.captureEvents) {
				window.captureEvents(Event.MOUSEMOVE|Event.MOUSEUP);
			}
			
			var x = event.layerX ? event.layerX : event.offsetX,
					y = event.layerY ? event.layerY : event.offsetY,
			
			doc = document;
			
			doc.onmousemove = function (event) {
				
				event = event || window.event;
				
				if (!event.pageX) {
					event.pageX = event.clientX;
				} 
			
	   		if (!event.pageY) {
	   			event.pageY = event.clientY;
	   		}
	   	
	   		var tx = event.pageX - x,
	   				ty = event.pageY - y,
	   		
	   		tempSmallTool = global.smallTool,
	   		smallMap = tempSmallTool.smallMap,
	   		
	   		leftTop = global.baseTool.sumLeftTop(smallMap);
				
				tx = tx - parseInt(leftTop[0]);
				ty = ty - parseInt(leftTop[1]);
	   		
	   		if (tx < 0) {
	   			tx = 0;
	   		}
	   		
	   		if (ty < 0) {
	   			ty = 0;
	   		}
	   		
				smallBody.style.left = tx + "px";
	    	smallBody.style.top = ty + "px";
	    	
	    	var tempLineTool = global.lineTool,
	    	tempSmallTool = global.smallTool,
	    	
	    	pathBody = $id(tempLineTool.pathBody.id);
	    	
	    	pathBody.scrollLeft = parseInt(tx / tempSmallTool.widthPercent);
	    	pathBody.scrollTop = parseInt(ty / tempSmallTool.heightPercent);
	    	
	    	tempSmallTool.initSmallBody();
	
			};
			
			doc.onmouseup = function (event) {
				
				event = event || window.event;
				
				if (smallBody.releaseCapture) {
					smallBody.releaseCapture();
				} else if (window.releaseEvents) {
					window.releaseEvents(Event.MOUSEMOVE|Event.MOUSEUP);
				}
	
	   		doc.onmousemove = null;
	   		doc.onmouseup = null;
	
			};
			
		}
		
	},

	initSmallBody : function () {
	
		var self = this,
		smallBodyStyle = self.smallBody.style;
		
		smallBodyStyle.left = self.body.scrollLeft * self.widthPercent + "px";
		smallBodyStyle.top = self.body.scrollTop * self.heightPercent + "px";
		smallBodyStyle.width = self.body.offsetWidth * self.widthPercent + "px";
		smallBodyStyle.height = self.body.offsetHeight * self.heightPercent + "px";
		
		var scalingDivStyle = self.scalingDiv.style,
		
		left = parseInt(smallBodyStyle.left) + parseInt(smallBodyStyle.width),
		top = parseInt(smallBodyStyle.top) + parseInt(smallBodyStyle.height);
	
		if (com.xjwgraph.Global.baseTool.isIE) {
			left = left - 4;
			top = top - 4;
		}
		
		scalingDivStyle.left = left + "px";
		scalingDivStyle.top = top + "px";
		
	},

	getMultiple : function () {
	
		var self = this,
		bodyStyle = self.body.style,
		
		multiple = (parseInt(self.body.scrollWidth) + parseInt(self.body.scrollHeight)) / (parseInt(bodyStyle.width) + parseInt(bodyStyle.height));
		
		if (multiple > 1.82) {
			multiple = multiple - 0.82;
		} else if (multiple < 1.2) {
			multiple = 1.2;
		}
		
		return multiple;
	
	},

	initPercent : function () {
	
		var self = this;
		self.multiple = self.getMultiple();
		
		self.widthPercent = self.smallMap.offsetWidth / parseInt(self.body.scrollWidth);
		self.heightPercent = self.smallMap.offsetHeight / parseInt(self.body.scrollHeight);
		
		self.percent = self.heightPercent <= self.widthPercent ? self.heightPercent : self.widthPercent;
	
	},

	activeMode : function (modeId) {
		
		var global = com.xjwgraph.Global;
		
		global.modeTool.clear();
		
		var smallObjStyle = $id("small" + modeId).style;
		
		smallObjStyle.borderWidth = "1px";
		smallObjStyle.borderColor = global.smallTool.checkColor;
		smallObjStyle.borderStyle= "solid";
		
		stopEvent = true;
		
	},

	drawMode : function (mode) {

		var smallObj = null,
		self = this;
		
		if ($id("small" + mode.id)) {
			smallObj = $id("small" + mode.id);
		} else {
			
			smallObj = document.createElement("img");
			smallObj.ondragstart = function () {
				return false;
			};
			smallObj.id = "small" + mode.id;
			smallObj.style.position = "absolute";
			
			smallObj.onclick = function () {
				
				var global = com.xjwgraph.Global;
				
				global.modeTool.flip(mode.id.substring("modelu".length));
				global.smallTool.activeMode(mode.id);
			
			}
	
			self.smallMap.appendChild(smallObj);
			
		}
		
		self.smallModeMap.put(smallObj.id, smallObj);
		
		smallObj = $id(smallObj.id);
		
		var imageId = mode.id.replace("module", "backImg");
		
		smallObj.src = $id(imageId).src;
		
		var smallObjStyle = smallObj.style;
		smallObjStyle.fontSize = "0px";
			
		smallObjStyle.left = mode.offsetLeft * self.widthPercent + "px";
		smallObjStyle.top = mode.offsetTop * self.heightPercent + "px";
		smallObjStyle.width = mode.offsetWidth * self.percent + "px";
		smallObjStyle.height = mode.offsetHeight * self.percent + "px";
	
		smallObjStyle.borderWidth = "1px";
		smallObjStyle.borderColor = com.xjwgraph.Global.smallTool.checkColor;
		smallObjStyle.borderStyle= "solid";
	
	},
	
	_smallPath : function (path) {
		
		var tempLineTool = com.xjwgraph.Global.lineTool,
				paths = tempLineTool.getPathArray(path),
				pathLength = paths.length,
				self = this;
				
		for (var i = pathLength; i--;) {
			
			if (i % 2 == 1) {
				paths[i] = parseInt(paths[i] * self.heightPercent);
			} else {
				paths[i] = parseInt(paths[i] * self.widthPercent);
			}
			
		}
		
		return tempLineTool.arrayToPath(paths);
		
	},

	drawLine : function (line) {
		
		var global = com.xjwgraph.Global,
	
		tempLineTool = global.lineTool,
		
		path = tempLineTool.getPath(line),
		head = tempLineTool.getLineHead(path),
		end = tempLineTool.getLineEnd(path),
	
		self = this,
			
		headPoint1 = parseInt(head[0]) * self.widthPercent,
		headPoint2 = parseInt(head[1]) * self.heightPercent,
			
		endPoint1 = parseInt(end[0]) * self.widthPercent,
		endPoint2 = parseInt(end[1]) * self.heightPercent,
		
		brokenType = line.getAttribute("brokenType");
		
		path = self._smallPath(path);
			
		var lineObj = null;
		
		if (self.smallLineMap.get("small" + line.id) && $id("small" + line.id)) {
			
			lineObj = $id("small" + line.id);
			global.lineTool.setPath(lineObj, path);
			
		} else {
		
			if (tempLineTool.isSVG) {
			
				lineObj = document.createElementNS('http://www.w3.org/2000/svg', "path");
	    
	    	lineObj.setAttribute("id", "small" + line.id);
	    	lineObj.setAttribute("style", "fill:none; stroke:" + PathGlobal.lineColor + "; stroke-width:1");
	    	
	    	global.lineTool.setPath(lineObj, path);
	    
	    	self.svgBody.appendChild(lineObj);
	    
			} else if (tempLineTool.isVML) {
	
				lineObj = document.createElement('<v:shape id="small' + line.id + '" style="WIDTH:100;POSITION:absolute;HEIGHT:100" coordsize="100,100" filled="f" strokeweight="1px" strokecolor="' + PathGlobal.lineColor + '" path="' + path + '"></v:shape>'); 
				self.smallMap.appendChild(lineObj);
			
			}
			
			self.smallLineMap.put(lineObj.id, lineObj);
		
		}
	
	},

	drawAll : function () {
	
		var self = this;
		
		self.drawAllMode();
		self.drawAllLine();
		
	},

	drawAllMode : function () {
		
		var global = com.xjwgraph.Global;
		
		global.modeTool.forEach(function (modeId) {
			global.smallTool.drawMode($id(modeId));
		});
		
	},

	drawAllLine : function () {
		
		var global = com.xjwgraph.Global;
		
		global.lineTool.forEach(function (lineId) {
			global.smallTool.drawLine($id(lineId));
		});
		
	},

	removeAll : function () {
	
		var self = this;
		
		self.removeAllMode();
		self.removeAllLine();
	
	},

	removeAllMode : function () {
		com.xjwgraph.Global.modeTool.forEach(this.removeMode);
	},

	removeAllLine : function () {
		com.xjwgraph.Global.lineTool.forEach(this.removeLine);
	},

	removeMode : function (modeId) {
	
		var smallMode = $id("small" + modeId);
		this.smallModeMap.remove(smallMode.id)
		smallMode.parentNode.removeChild(smallMode);
		
	},

	removeLine : function (lineId) {
	
		var smallLine = $id("small" + lineId);
		smallLine.parentNode.removeChild(smallLine);
		
	},

	clear : function () {
		this.forEachMode(this.clearMode);
	},

	clearMode : function (node) {
			
		if (node) {
				
			if (node.id.indexOf("module") > 0) {
				node.style.border = "none";
			}
				
		}
		
	},

	forEachMode : function (fn) {
	
		var self = this;
		var mapLength = self.smallMap.childNodes.length;
		
		for (var i = mapLength; i--;) {
			
			if (fn) {
				fn(self.smallMap.childNodes[i]);
			}
			
		}
		
	},

	initDraw : function () {
	
		var self = this;
		
		self.removeAll();
		self.initPercent();
		self.drawAll();
		
	}

}