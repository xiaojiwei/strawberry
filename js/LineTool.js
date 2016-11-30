var LineTool = com.xjwgraph.LineTool = function (pathBody) {
	
	var self = this;
	
	self.stepIndex = PathGlobal.lineDefStep;
	self.pathBody = pathBody;
	
	var global = com.xjwgraph.Global;
	
	self.tool = global.baseTool;
	self.moveable = false;
	self.isSVG = self.tool.isSVG();
	self.isVML = self.tool.isVML();
	
	self.pathBody.oncontextmenu = function (event) {
				
		if (!PathGlobal.rightMenu) {
			
			PathGlobal.rightMenu = true;
			global.baseTool.showMenu(event);
		
		}
		
		return false;
		
	}
	
	self.baseLineIdIndex = PathGlobal.lineDefIndex;
	
	if (self.isSVG) {
		
		var doc = document;
		
		self.svgBody = doc.createElementNS('http://www.w3.org/2000/svg', 'svg');
		self.svgBody.setAttribute("id", "svgContext");
    self.svgBody.setAttribute("style", "position:absolute;z-index:0;");
    self.svgBody.setAttribute("height", this.pathBody.scrollHeight + "px");
		self.svgBody.setAttribute("width", this.pathBody.scrollWidth + "px");
		
		var marker = doc.createElementNS('http://www.w3.org/2000/svg', 'marker');
		marker.setAttribute("id", "arrow");
		marker.setAttribute("viewBox", "0 0 18 20");
		marker.setAttribute("refX", "0");
		marker.setAttribute("refY", "10");
		marker.setAttribute("markerUnits", "strokeWidth");
		marker.setAttribute("markerWidth", "3");
		marker.setAttribute("markerHeight", "10");
		marker.setAttribute("orient", "auto");
		
		var linePath = doc.createElementNS('http://www.w3.org/2000/svg', 'path');
		linePath.setAttribute("d", "M 0 0 L 20 10 L 0 20 z");
		linePath.setAttribute("fill", PathGlobal.lineColor);
		linePath.setAttribute("stroke", PathGlobal.lineColor);
		
		marker.appendChild(linePath);
		
		self.svgBody.appendChild(marker);
		self.pathBody.appendChild(self.svgBody);
		
		self.pathBody.addEventListener("scroll", function() {
				global.smallTool.initSmallBody();
		}, false);
		
	} else if (self.isVML) {

		self.pathBody.attachEvent("onscroll", function() {
				global.smallTool.initSmallBody();
		});
		
	}
	
}

LineTool.prototype = {
	
	tempLine : null,
	
	removeAll : function () {
	
		var self = this;
	
		self.forEach(function (lineId) {
			self.removeNode(lineId);
		});
	
	},
	
	createRect : function (id) {
		
		var result,
				doc = document;
		
		if (this.isSVG) {
			
			var g = doc.createElementNS('http://www.w3.org/2000/svg', 'g');
			g.setAttribute("style", "cursor: pointer;");
		
			var rect = doc.createElementNS('http://www.w3.org/2000/svg', 'rect');
			rect.setAttribute("stroke", "black");
			rect.setAttribute("id", id);
			rect.setAttribute("fill", "#00FF00");
			rect.setAttribute("shape-rendering", "crispEdges");
			rect.setAttribute("shapeRendering", "crispEdges");
			rect.setAttribute("stroke-width", "1");
			rect.setAttribute("strokeWidth", "1");
		
			rect.setAttribute("x", "100");
			rect.setAttribute("y", "100");
			rect.setAttribute("width", "7");
			rect.setAttribute("height", "7");
			rect.style.visibility = "hidden";
		
			g.appendChild(rect);
			
			result = g;
			
		} else if (this.isVML) {
		
			var rect = document.createElement("v:rect");
			rect.setAttribute("id", id);
			
			var rectStyle = rect.style;
   		rectStyle.width = "7px";
   		rectStyle.height = "7px";
   		rectStyle.position = "absolute";
   		rectStyle.left = "100px";
   		rectStyle.top = "100px";
   		rectStyle.cursor = "pointer";
   		rectStyle.visibility = "hidden";
   		
   		rect.fillcolor = "#00FF00";
   		rect.stroked = "black";
   		
   		result = rect;
			
		}
		
		return result; 
		
	},

	removeNode : function (lineId) {

		var self = this,
		line = $id(lineId);
		
		var dragBody = null;
		
		if (self.isVML && line) {
				
				dragBody = self.pathBody;
				
				dragBody.removeChild($id(lineId + 'lineHead'));
				dragBody.removeChild($id(lineId + 'lineMiddle'));
				dragBody.removeChild($id(lineId + 'lineEnd'));
			
		} else if (self.isSVG && line) {
				
				dragBody = self.svgBody;
				
				dragBody.removeChild($id(lineId + 'lineHead').parentNode);
				dragBody.removeChild($id(lineId + 'lineMiddle').parentNode);
				dragBody.removeChild($id(lineId + 'lineEnd').parentNode);
				
		}
		
		if (line) {
			
			dragBody.removeChild(line);
		
			var global = com.xjwgraph.Global;
			global.lineMap.remove(lineId);
	
			global.smallTool.removeLine(lineId);
		
		}
		
	},

	formatPath : function (path) {
	
		if (this.isVML) {
		
			path = path.replaceAll(",", " "),
			path = path.replaceAll("e", "z"),
			path = path.replaceAll("l", "L ");
		
		} else {
			
			path = path.replaceAll(",NaN NaN", ""),
			path = path.replaceAll(",undefined undefined", "");
			
		}
	
		return path;
	
	},
	
	getNextIndex : function () {
	
		var self = this;
		self.baseLineIdIndex += self.stepIndex;
	
		return self.baseLineIdIndex;

	},
	
	getActiveLine : function () {
	
		var activeLine;
	
		this.forEach(function (lineId) {
		
			var line = $id(lineId);
		
			if (com.xjwgraph.Global.lineTool.isActiveMode(line)) {
				activeMode = line;
			}
		
		});
	
		return activeLine;
	
	},
	
	isActiveLine : function (line) {
	
		var isActive,
		global = com.xjwgraph.Global;
		
		if (global.lineTool.isVML) {
			isActive = (line.getAttribute("strokecolor") == PathGlobal.lineCheckColor);
		} else if (global.lineTool.isSVG) {		
			isActive = (line.getAttribute("style").indexOf(PathGlobal.lineCheckColor) > 0);
		}

		return isActive;
	
	}, 
	
	forEach : function (fn) {
	
		var lineKeys = com.xjwgraph.Global.lineMap.getKeys(),
  	lineKeysLength = lineKeys.length;
  	
		for (var i = lineKeysLength; i--;) {
		
			if (fn) {
				fn(lineKeys[i]);
			}
		
		}
	
	},

	createBaseLine : function (lineId, path, brokenType) {
	
		var self = this,
		line = null,
	
		doc = document;
		var dragBody = null;
	
		if (self.isSVG) {
		
			line = doc.createElementNS('http://www.w3.org/2000/svg', "path");
			line.setAttribute("id", lineId);
			self.setPath(line, path);
			line.setAttribute("style", "cursor:pointer; fill:none; stroke:" + PathGlobal.lineColor + "; stroke-width:" + + PathGlobal.strokeweight);
			line.setAttribute("stroke", "purple");
			line.setAttribute("marker-end", 'url(#arrow)');
			line.setAttribute("brokenType", brokenType);
			
			dragBody = self.svgBody;
    
		} else if (self.isVML) {

			line = doc.createElement('<v:shape style="cursor:pointer;WIDTH:100;POSITION:absolute;HEIGHT:100" coordsize="100,100" filled="f" strokeweight="' + PathGlobal.strokeweight + 'px" strokecolor="' + PathGlobal.lineColor + '"></v:shape>'); 
		
			var stroke = doc.createElement("<v:stroke EndArrow='classic'/>");
			line.appendChild(stroke);
		
			line.setAttribute("id", lineId);
			line.setAttribute("brokenType", brokenType);
		
			self.setPath(line, path);
			
			dragBody = self.pathBody;
		
		}
		
		dragBody.appendChild(line);
			
		dragBody.appendChild(self.createRect(lineId + 'lineHead'));
		dragBody.appendChild(self.createRect(lineId + 'lineMiddle'));
		dragBody.appendChild(self.createRect(lineId + 'lineEnd'));
			
		self.drag(line);
	
		return line;
	
	},
	
	setPath : function (line, path) {
	
		var self = this;
	
		if (self.isSVG) {
			path = path.replace("z", "");
		}

		line.setAttribute("d", path);
		line.setAttribute("path", path);
	
	},
	
	getMiddle : function (path, lineId, isPainting) {
		
		path = path.replace("M", "");
		path = path.replace("m", "");
		path = path.replace("z", "");
		
		var paths = path.split("L"),
	
		self = this,
		endStr = self.strTrim(paths[1]),
	
		end,
		middle,
		middlePoint;
		
		if (self.isSVG) {
			
			if (endStr.indexOf(",") > 0) {
			
				end = endStr.split(",");

				var begin = self.strTrim(end[0]).split(" "),
						end = self.strTrim(end[1]).split(" "),
			
						x1 = parseInt(begin[0]),
						y1 = parseInt(begin[1]),
			
						x2 = parseInt(end[0]),
						y2 = parseInt(end[1]);
				
				middlePoint = [x1, y1, x2, y2];
				middle = [parseInt(Math.abs(x1 + x2) / 2), parseInt(Math.abs(y2 + y1) / 2)];
			
			} else {
			
				var head = self.getLineHead(path),
						end = self.getLineEnd(path);
				
				middle = [parseInt(Math.abs(head[0] + end[0]) / 2), parseInt(Math.abs(head[1] + end[1]) / 2)];

			}
		
		} else if (self.isVML) {
			
			end = self.strTrim(endStr).split(" ");

			if (end.length > 2) {
				
				var x1 = parseInt(self.strTrim(end[0])),
						y1 = parseInt(self.strTrim(end[1])),
				
						x2 = parseInt(self.strTrim(end[2])),
						y2 = parseInt(self.strTrim(end[3]));
				
				middlePoint = [x1, y1, x2, y2];
				middle = [parseInt(Math.abs(x1 + x2) / 2), parseInt(Math.abs(y2 + y1) / 2)];
				
			} else {
			
				var head = self.getLineHead(path),
					  end = self.getLineEnd(path);
				
				middle = [parseInt(Math.abs(head[0] + end[0]) / 2), parseInt(Math.abs(head[1] + end[1]) / 2)];

			}
			
		}
		
		if (isPainting) {
			
			var rectMiddle = $id(lineId + "lineMiddle"),
					rectMiddleStyle = rectMiddle.style;

			rectMiddle.setAttribute("x", middle[0] - PathGlobal.dragPointDec);
			rectMiddle.setAttribute("y", middle[1] - PathGlobal.dragPointDec);
			
			if (self.isActiveLine($id(lineId))) {
				rectMiddleStyle.visibility = "";	
			}
			
			rectMiddleStyle.left = middle[0] - PathGlobal.dragPointDec + "px";
			rectMiddleStyle.top = middle[1] - PathGlobal.dragPointDec + "px";
			
		}
		
		return middlePoint;
		
	},
	
	getLineHead : function (path) {
	
		path = path.replace("M", "");
		path = path.replace("m", "");
		path = path.replace("z", "");
	
		var paths = path.split("L"),
	
		head = this.strTrim(paths[0]).split(" "),
	
		left = parseInt(head[0]),
		top = parseInt(head[1]);
	
		return [left, top];
	
	},
	
	getLineEnd : function (path) {
	
		path = path.replace("M", "");
		path = path.replace("m", "");
		path = path.replace("z", "");
		
		if (this.isSVG) {
			
			var paths = path.split("L"),
			self = this,
			endStr = self.strTrim(paths[1]),
			end;
	
			if (endStr.indexOf(",") > 0) {
				end = endStr.split(",");
				end = self.strTrim(end[end.length - 1]).split(" ");
			} else {
				end = endStr.split(" ");
				end = [end[end.length - 2], end[end.length - 1]];
			}
		} else {
			
			path = path.replace("L", " ");
			path = path.replace(",", " ");

			path = this.strTrim(path);

			var end = path.split(" ");
			end = [end[end.length - 2], end[end.length - 1]];

			return [parseInt(end[0]), parseInt(end[1])];
	
		}
		
		return [parseInt(end[0]), parseInt(end[1])];
	
	},
	
	brokenPath : function (path, brokenType) {
	
		var self = this,
	
		head = self.getLineHead(path),
		left = head[0],
		top = head[1],
	
		end = self.getLineEnd(path),
		endLeft = end[0],
		endTop = end[1];
	
		if (brokenType == 2) {
			path = self.brokenVertical(left, top, endLeft, endTop, path);
		} else if (brokenType == 3) {
			path = self.brokenCross(left, top, endLeft, endTop, path);
		}
	
		return path;
	
	},
	
	broken : function (left, top, endLeft, endTop, brokenType, path) {
	
		if (brokenType == 2) {
			path = this.brokenVertical(left, top, endLeft, endTop, path);
		} else if (brokenType == 3) {
			path = this.brokenCross(left, top, endLeft, endTop, path);
		}

		return path;
	
	},
	
	brokenVertical : function (left, top, endLeft, endTop, path) {
	
		var paths = this.getPathArray(path),
				pathLength = paths.length;
		
		if (PathGlobal.switchType || pathLength < 5) {
			
			var descTop = endTop - top,
	
			path = "M " + left + " " + top + " L " + 
			(left) + " " + (top + parseInt(descTop/2)) + 
			"," + (endLeft) + " " + (endTop - parseInt(descTop/2)) + 
			"," + endLeft + " " + endTop + " z";
			
		} else {
			
			paths[0] = left;
			paths[1] = top;
			paths[2] = left;
			
			paths[4] = endLeft;
			paths[5] = paths[3];
			paths[6] = endLeft;
			paths[7] = endTop;
			
			path = this.arrayToPath(paths);
		
		}
		
		return path;
	
	},
	
	brokenCross : function (left, top, endLeft, endTop, path) {
		
		var paths = this.getPathArray(path),
				pathLength = paths.length;
				
		if (PathGlobal.switchType || pathLength < 5) {
		
			var descLeft = endLeft - left,
	
			path = "M " + left + " " + top + " L " + 
			(left + parseInt(descLeft/2)) + " " + (top) + 
			"," + (left + parseInt(descLeft/2)) + " " + (endTop) + 
			"," + endLeft + " " + endTop + " z";
		
		} else {
			
			paths[0] = left;
			paths[1] = top;
			paths[3] = top;
			
			paths[4] = paths[2];
			paths[5] = endTop;
			paths[6] = endLeft;
			paths[7] = endTop;
			
			path = this.arrayToPath(paths);
			
		}
	
		return path;
	
	},
	
	getPathArray : function(path) {
		
		path = path.replace("M", ""),
		path = path.replace("m", ""),
		path = path.replace("z", ""),
		path = path.replace("L", ""),
		path = path.replace("  ", " "),
		path = path.replaceAll(",", " ");
		
		var paths = this.strTrim(path).split(" "),
				paths = paths.join(","),
				paths = paths.replaceAll(",,", ",");
		
		return this.strTrim(paths).split(",");
		
	},
	
	arrayToPath : function (paths) {
		return smallPath = "M " + paths[0] + " " + paths[1] + " " + " L " + paths[2] + " " + paths[3] + "," + paths[4] + " " + paths[5] + "," + paths[6] + " " + paths[7];
	},
	
	create : function (left, top, brokenType) {
	
		var self = this,
		idIndex = self.getNextIndex(),
	
		path = "M " + left + " " + top + " L " + (left + 100) + " " + top + " z";
	
		if (brokenType != 1) {
			path = "M " + left + " " + top + " L " + (left + 100) + " " + (top + 60) + " z";
			path = self.brokenPath(path, brokenType);
		}
	
		var line = self.createBaseLine("line" + idIndex, path, brokenType),
	
		lineMode = new BuildLine();
		lineMode.id = "line" + idIndex;
		
		var global = com.xjwgraph.Global;
	
		global.lineMap.put(lineMode.id, lineMode);
	
		var tempSmallTool = global.smallTool,
	
		undoRedoLineEvent = new com.xjwgraph.UndoRedoEvent(function () {
		
			var isExist = line && line.id && $id(line.id);
			
			var dragBody = null,
					lineId = line.getAttribute("id");
		
			if (self.isVML && isExist) {
				
				dragBody = self.pathBody;
				
				dragBody.removeChild($id(lineId + 'lineHead'));
				dragBody.removeChild($id(lineId + 'lineMiddle'));
				dragBody.removeChild($id(lineId + 'lineEnd'));
			
			} else if (self.isSVG && isExist) {
				
				dragBody = self.svgBody;
				
				dragBody.removeChild($id(lineId + 'lineHead').parentNode);
				dragBody.removeChild($id(lineId + 'lineMiddle').parentNode);
				dragBody.removeChild($id(lineId + 'lineEnd').parentNode);
				
			}
			
			if (isExist) {
				dragBody.removeChild(line);
			}
			
			global.lineMap.remove(lineMode.id);
		
			if (isExist) {
				tempSmallTool.removeLine(lineMode.id);
			}
		
		}, PathGlobal.lineCreate);
	
		undoRedoLineEvent.setRedo(function () {
			
			var dragBody = null,
					lineId = line.getAttribute("id");
			
			if (self.isVML) {
			
				line.setAttribute("filled", "f");
				line.setAttribute("strokeweight", PathGlobal.strokeweight + "px");
				line.setAttribute("strokecolor", PathGlobal.lineColor);
			
				dragBody = self.pathBody;
			
			} else if (self.isSVG) {
				dragBody = self.svgBody;
			}
			
			dragBody.appendChild(line);
			
			dragBody.appendChild(self.createRect(lineId + 'lineHead'));
			dragBody.appendChild(self.createRect(lineId + 'lineMiddle'));
			dragBody.appendChild(self.createRect(lineId + 'lineEnd'));
			
			self.drag(line);
		
			global.lineMap.put(line.id, lineMode);
			tempSmallTool.drawLine(line);
		
		});
		
	},
	
	getPath : function (line) {
	
		var self = this,
		pathStr = "";
  	
		if (self.isSVG) {
			pathStr = line.getAttribute("d");
  	} else {
  		pathStr = line.path + "";
 		}
 	 
 	 	pathStr = self.formatPath(pathStr);
  
  	return pathStr;
	
	},
	
	distancePoint : function (x, y, line) {
	
		var self = this,
	
		pathStr = this.getPath(line),
	
		head = self.getLineHead(pathStr),
		end = self.getLineEnd(pathStr),
	
		x1 = parseInt(head[0]),
		y1 = parseInt(head[1]),
		
		x2 = parseInt(end[0]),
		y2 = parseInt(end[1]),
	
		disPoint1 = Math.abs(Math.sqrt(Math.pow(x1 - x, 2) + Math.pow(y1 - y, 2))),
		disPoint2 = Math.abs(Math.sqrt(Math.pow(x2 - x, 2) + Math.pow(y2 - y, 2)));
	
		return disPoint1 <= disPoint2;
	
	},

	strTrim : function (text) {
	
		text = text.replace(/^\s+/, "");
		
		for (var i = text.length - 1; i >= 0; i--) {
		
			if (/\S/.test(text.charAt(i))) {
				text = text.substring(0, i + 1);
				break;
			}
		
		}
	
		return text;
		
	},
	
	initScaling : function (multiple) {
	
		var self = this,
		tempSmalTool = com.xjwgraph.Global.smallTool;
	
		self.forEach(function (lineId) {
		
			var line = $id(lineId),
			path = self.formatPath(self.getPath(line)),
			paths = self.getPathArray(path),
			pathLength = paths.length;
			
			for (var i = pathLength; i--;) {
				
				paths[i] = parseInt(paths[i] / multiple);
				
			}
			
			path = self.arrayToPath(paths);
			
			self.setPath(line, path);
			self.setDragPoint(line);

  		tempSmalTool.drawLine(line);
		
		});
	
	},
	
	getEndPoint : function (path) {
	
		var paths = path.split("L");
		paths[1] = this.strTrim(paths[1]);
	
		return paths[1].split(" ");
	
	},
	
	getHeadPoint : function (path) {
	
		var paths = path.split("L");
		paths[0] = this.strTrim(paths[0]);
	
		return paths[0].split(" ");
	
	},
	
	endPoint : function (x, y, path, brokenType) {

		var self = this,
		newPath;

		if (brokenType != 1) {
			
			var head = self.getLineHead(path);
			newPath = self.broken(parseInt(head[0]), parseInt(head[1]), x, y, brokenType, path);
		
		} else {
		
			var paths = path.split("L");
			paths[0] = this.strTrim(paths[0]);
		
			newPath = paths[0] + " L " + x + " " + y + " z";
		
		}
	
		return newPath;
	
	},
	
	headPoint : function (x, y, path, brokenType) {
	
		var self = this,
		newPath;
	
		if (brokenType != 1) {
		
			var end = self.getLineEnd(path);
			newPath = self.broken(x, y, parseInt(end[0]), parseInt(end[1]), brokenType, path);
			
		} else {
		
			var paths = path.split("L");
			paths[1] = this.strTrim(paths[1]);
		
			newPath = "M " + x + " " + y + " L " + paths[1];
		
		}
		
		return newPath;
		
	},
	
	vecMultiply : function (p1, p2, p3) {
		return (( p1.x - p3.x ) * ( p2.y - p3.y ) - ( p2.x - p3.x ) * ( p1.y - p3.y ));
	},

	poInTrigon : function (p1, p2, p3, p) {
	
		var self = this,
	
		re1 = self.vecMultiply(p1, p, p2),
		re2 = self.vecMultiply(p2, p, p3),   
		re3 = self.vecMultiply(p3, p, p1);   
		
		if (re1 * re2 * re3 == 0) {
			return false; 
		} 
		
		if ((re1 > 0 && re2 > 0 && re3 > 0 ) ||( re1 < 0 && re2 < 0 && re3 < 0 )) {
			return true; 
		}
		
		return false;
	
	}, 

	buildModeAndPoint : function (line, mode, x, y) {
	
		var w = mode.offsetWidth,
		h = mode.offsetHeight,
	
		point = new Point(),
		pointA = new Point();

		pointA.x = parseInt(mode.offsetLeft);
		pointA.y = parseInt(mode.offsetTop);
	
		var pointB = new Point();
		pointB.x = parseInt(mode.offsetLeft) + parseInt(w);
		pointB.y = parseInt(mode.offsetTop);
	
		var pointC = new Point();
		pointC.x = parseInt(mode.offsetLeft) + parseInt(w) / 2;
		pointC.y = parseInt(mode.offsetTop) + parseInt(h) / 2;
		
		var pointD = new Point();
		pointD.x = x;
		pointD.y = y;
	
		var self = this;
	
		if (self.poInTrigon(pointA, pointB, pointC, pointD)) {
	  	
			point.x = "0px";
			point.y = w / 2 + "px";
			point.index = PathGlobal.pointTypeUp;
	  	
		} 
		
		pointB.x = parseInt(mode.offsetLeft);
		pointB.y = parseInt(mode.offsetTop) + parseInt(h);

		if (self.poInTrigon(pointA, pointB, pointC, pointD)) {
	
			point.x = h / 2 + "px";
			point.y = "0px";
			point.index = PathGlobal.pointTypeLeft;
		
		} 
		
		pointA.x = parseInt(mode.offsetLeft) + parseInt(w);
		pointA.y = parseInt(mode.offsetTop) + parseInt(h);
		
		if (self.poInTrigon(pointA, pointB, pointC, pointD)) {
			
			point.x = h + "px";
			point.y = w/2 + "px";
			point.index = PathGlobal.pointTypeDown;
		
		}
		
		pointB.x = parseInt(mode.offsetLeft) + parseInt(w);
		pointB.y = parseInt(mode.offsetTop);
		
		if (self.poInTrigon(pointA, pointB, pointC, pointD)) {
			
			point.x = h / 2 + "px";
			point.y = w + "px";
			point.index = PathGlobal.pointTypeRight;
		
		}
		
		point.x = parseInt(mode.offsetTop) + parseInt(point.x);
		point.y = parseInt(mode.offsetLeft) + parseInt(point.y);
		
		return point;
	
	},
	
	buildLineAndMode : function (line, mode, x, y, isPoint1) {
	
		var self = this,
	
		point = self.buildModeAndPoint(line, mode, x, y),

		buildLine = new BuildLine();
		buildLine.index = point.index;
		buildLine.id = line.id;

		self.pathLine(point.y, point.x, line, isPoint1);
		
		self.setDragPoint(line);
		
		var global = com.xjwgraph.Global,
		
		baseMode = global.modeMap.get(mode.id);
		buildLine.type = isPoint1;
		baseMode.lineMap.put(buildLine.id + "-" + buildLine.type, buildLine);
		
		var lineMode = global.lineMap.get(line.id);

		if (isPoint1) {
			lineMode.xBaseMode = baseMode;
			lineMode.xIndex = point.index;
		} else {
			lineMode.wBaseMode = baseMode;
			lineMode.wIndex = point.index;
		}
		
		global.lineMap.put(line.id, lineMode);
	
		var undoRedoEvent = new com.xjwgraph.UndoRedoEvent(function () {
		
			if (isPoint1) {
				lineMode.xBaseMode = null;
			} else {
				lineMode.wBaseMode = null;
			}
	
			baseMode.lineMap.remove(buildLine.id + "-" + buildLine.type);
			self.setDragPoint(line);
	
		}, PathGlobal.buildLineAndMode);
	
		undoRedoEvent.setRedo(function () {
		
			if (isPoint1) {
				lineMode.xBaseMode = baseMode;
			} else {
				lineMode.wBaseMode = baseMode;
			}
	
			baseMode.lineMap.put(buildLine.id + "-" + buildLine.type, buildLine);
			self.setDragPoint(line);
	
		});
	
	},
	
	removeAllLineAndMode : function (line, mode) {
		this.removeBuildLineAndMode(line, mode, true);
		this.removeBuildLineAndMode(line, mode, false);
	},
	
	removeBuildLineAndMode : function (line, mode, isPoint1) {
		
		var global = com.xjwgraph.Global,
	
		baseMode = global.modeMap.get(mode.id),
  	baseLineModeMap = baseMode.lineMap,
		key = line.id + "-" + isPoint1;
	
		if (baseLineModeMap.containsKey(key)) {
  		
  		var modeLineMap = baseMode.lineMap,
					oldMapEntry = modeLineMap.get(key),
					oldxBaseMode = null,
					oldwBaseMode = null;
					
			modeLineMap.remove(key);
			
  		var lineMode = global.lineMap.get(line.id);
  		
  		if (lineMode && lineMode.xBaseMode && lineMode.xBaseMode.id == mode.id) {
  			oldxBaseMode = lineMode.xBaseMode,
				lineMode.xBaseMode = null;
			} else if (lineMode && lineMode.wBaseMode && lineMode.wBaseMode.id == mode.id) {
  			lineMode.wBaseMode = null;
  			oldwBaseMode = lineMode.wBaseMode;
  		}
  		
  		var undoRedoEvent = new com.xjwgraph.UndoRedoEvent(function () {
		
			 	modeLineMap.put(key, oldMapEntry);
			 	
			 	lineMode.xBaseMode = oldxBaseMode;
			 	lineMode.wBaseMode = oldwBaseMode;
	
			}, PathGlobal.removeLineAndMode);
	
			undoRedoEvent.setRedo(function () {
		
				 modeLineMap.remove(key);
				 
				 lineMode.xBaseMode = null;
				 lineMode.wBaseMode = null;
	
			});
  	
  	}
	
	},
	
	isMoveBaseMode : function (x, y, line, isPoint1) {
		
		var global = com.xjwgraph.Global,
		
		modeKeys = global.modeMap.getKeys(),
		modeKeysLength = modeKeys.length,
	
		tempModeTool = global.modeTool;
  
		for (var i = modeKeysLength; i--;) {
		
			var mode = $id(modeKeys[i]),
			modeStyle = mode.style,
		
			left = parseInt(modeStyle.left),
			xWidth = mode.offsetWidth + left,
  		
  		top = parseInt(modeStyle.top),
  		yHeight = mode.offsetHeight + top;
  	
			if (x > left && x < xWidth && y > top && y < yHeight) {
			
				tempModeTool.hiddPointer(mode);
				tempModeTool.flip(global.modeTool.getModeIndex(mode));
			
				break;
		
			} else {
				tempModeTool.hiddPointer(mode);
  		}
	
		}
	
	},

	isCoverBaseMode : function (x, y, line, isPoint1) {
		
		var global = com.xjwgraph.Global,
		
		modeKeys = global.modeMap.getKeys(),
		modeKeysLength = modeKeys.length,
		tempModeTool = global.modeTool,
	
		self = this,
	
		activeMode = global.modeTool.getActiveMode();
	
		if (activeMode) {
		
			tempModeTool.hiddPointer(activeMode);
			tempModeTool.flip(global.modeTool.getModeIndex(activeMode));
			
			self.buildLineAndMode(line, activeMode, x, y, isPoint1);
			
		}
  
		for (var i = modeKeysLength; i--;) {
			
			var mode = $id(modeKeys[i]),
			modeStyle = mode.style,
		
			left = parseInt(modeStyle.left),
			xWidth = mode.offsetWidth + left,
  		
  		top = parseInt(modeStyle.top),
  		yHeight = mode.offsetHeight + top;
	
			if (activeMode && activeMode.id == mode.id) {
				continue;
			} else {
				tempModeTool.hiddPointer(mode);
				self.removeBuildLineAndMode(line, mode, isPoint1);
  		}
	
		}
	
	},
	
	pathLine : function (x1, y1, line, isPoint1) {
	
		var self = this,
		oldPath = self.getPath(line),
		newPath,
		brokenType = line.getAttribute("brokenType");
	
		if (isPoint1) {
			newPath = self.headPoint(parseInt(x1), parseInt(y1), oldPath, brokenType);
		} else {
			newPath = self.endPoint(parseInt(x1), parseInt(y1), oldPath, brokenType);
		}
	
		self.setPath(line, newPath);

		com.xjwgraph.Global.smallTool.drawLine(line);
  
	},
	
	clearLine : function (lineId) {
		
		var line = $id(lineId),
				global = com.xjwgraph.Global,
				tempLineTool = global.lineTool;
			
		if (tempLineTool.isVML) {
			line.setAttribute("strokecolor", PathGlobal.lineColor);
		} else if (global.lineTool.isSVG) {
			line.setAttribute("style", "cursor:pointer; fill:none; stroke:" + PathGlobal.lineColor + "; stroke-width:2");
		}
			
		var rectHead = $id(lineId + "lineHead"),
				rectEnd = $id(lineId + "lineEnd"),
				rectMiddle = $id(lineId + "lineMiddle");
			
				rectHead.style.visibility = "hidden";
				rectEnd.style.visibility = "hidden";
				rectMiddle.style.visibility = "hidden";
	
	},
	
	clear : function () {
		
		var global = com.xjwgraph.Global,
		tempLineTool = global.lineTool;
	
		this.forEach(function (lineId) {
			tempLineTool.clearLine(lineId);			
		});
		
		PathGlobal.rightMenu = false;
		
		var lineRightMenu = $id("lineRightMenu");
		lineRightMenu.style.visibility = "hidden";
		
		tempLineTool.tempLine = null;
		
		global.smallTool.clear();
		
	},
	
	setDragPoint : function (line) {
		
		var tempLineTool = com.xjwgraph.Global.lineTool,
				pathStr = tempLineTool.formatPath(tempLineTool.getPath(line)),
				lineId = line.getAttribute("id"),
					
				rectHead = $id(lineId + "lineHead"),
				rectEnd = $id(lineId + "lineEnd"),
				rectMiddle = $id(lineId + "lineMiddle"),
		 			
		 		head = tempLineTool.getLineHead(pathStr),
				end = tempLineTool.getLineEnd(pathStr),
				middle = tempLineTool.getMiddle(pathStr, lineId, true),
	
				headx1 = parseInt(head[0]),
				heady1 = parseInt(head[1]),
		
				endx2 = parseInt(end[0]),
				endy2 = parseInt(end[1]),
				
				lineStyle = line.style;
				
			rectHead.setAttribute("x", (endx2 - PathGlobal.dragPointDec));
			rectHead.setAttribute("y", (endy2 - PathGlobal.dragPointDec));
						
			var rectHeadStyle = rectHead.style;
			rectHeadStyle.left = (endx2 - PathGlobal.dragPointDec) + "px";
			rectHeadStyle.top = (endy2 - PathGlobal.dragPointDec) + "px";
			
			rectEnd.setAttribute("x", (headx1 - PathGlobal.dragPointDec));
			rectEnd.setAttribute("y", (heady1 - PathGlobal.dragPointDec));
			
			var rectEndStyle = rectEnd.style;
			rectEndStyle.left = (headx1 - PathGlobal.dragPointDec) + "px";
			rectEndStyle.top = (heady1 - PathGlobal.dragPointDec) + "px";
			
			rectHeadStyle.zIndex = 1;
			rectMiddle.style.zIndex = 1;
			rectEndStyle.zIndex = 1;
						
			if (tempLineTool.isActiveLine(line)) {

				rectHeadStyle.visibility = "";
				rectEndStyle.visibility = "";
			
			}
		
	},
	
	showProperty : function (event) {
		
		var line = this.tempLine,
				global = com.xjwgraph.Global,
				lineMap = global.lineMap,
				lineObj = lineMap.get(line.getAttribute("id")),
				prop = lineObj.prop,
				propDiv = $id("prop"),
				doc = document,
				tempClientTool = global.clientTool;
		
		propDiv.style.visibility = "";
		propDiv.innerHTML = "";
		
		propDiv.appendChild(tempClientTool.addProItem(prop));
		
		tempClientTool.showDialog(event, PathGlobal.lineProTitle, lineObj);

	},
	
	showMenu : function (event, line) {
	
		PathGlobal.rightMenu = true;
	
		var self = this;
	
		self.tempLine = line;
	
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
				
		var lineRightMenu = $id("lineRightMenu"),
		lineRightMenuStyle = lineRightMenu.style;

		lineRightMenuStyle.top = ty + "px";
		lineRightMenuStyle.left = tx + "px";
		lineRightMenuStyle.visibility = "visible";
		lineRightMenuStyle.zIndex = self.getNextIndex();
	 
	},
	
	showId : function (lineId) {
		this.show($id(lineId));
	},
	
	show : function (line) {
		
		if (this.isVML) {
				line.setAttribute("strokecolor", PathGlobal.lineCheckColor);
		} else if (this.isSVG) {
				line.setAttribute("style", "cursor:pointer;fill:none; stroke:" + PathGlobal.lineCheckColor + "; stroke-width:" + PathGlobal.strokeweight);
		}
		
		this.setDragPoint(line);
		
	},
	
	drag : function (line) {
		
		var global = com.xjwgraph.Global,
				lineId = line.getAttribute("id"),
				rectHead = $id(lineId + "lineHead"),
				rectEnd = $id(lineId + "lineEnd"),
				rectMiddle = $id(lineId + "lineMiddle"),
				tempLineTool = global.lineTool,
				tempPathBody = tempLineTool.pathBody,
				self = this;
		
		global.smallTool.drawLine(line);
	
		line.ondragstart = function () {
			return false;
		};
		
		rectMiddle.oncontextmenu = rectEnd.oncontextmenu = rectHead.oncontextmenu = line.oncontextmenu = function (event) {
			
			tempLineTool.showMenu(event, line);
			return false;
				
		}
		
		rectEnd.onmousedown = rectHead.onmousedown = line.onmousedown = function (event) {
		
			event = event || window.event;
				
			global.modeTool.clear();
			global.lineTool.clear();

			tempLineTool.moveable = true;
		
			var tempSmallTool = global.smallTool,
			oldPath = tempLineTool.getPath(line),
		
			x = event.clientX ? event.clientX : event.offsetX,
			y = event.clientY ? event.clientY : event.offsetY,
			
			leftTops = global.baseTool.sumLeftTop(tempPathBody);
		
			x = x - parseInt(leftTops[0]) + parseInt(tempPathBody.scrollLeft);
			y = y - parseInt(leftTops[1]) + parseInt(tempPathBody.scrollTop);
		
			if (!event.pageX) {
				event.pageX = event.clientX;
			} 
		
   		if (!event.pageY) {
   			event.pageY = event.clientY;
   		}
   	
   		var tx = event.clientX - x,
   				ty = event.clientY - y,
		
			isPoint1 = tempLineTool.distancePoint(x, y, line),
			doc = document;
			
			self.show(line);
		
			doc.onmousemove = function (event) {
			
				event = event || window.event;
			
				if (tempLineTool.moveable) {
			
					var x1 = event.clientX ? event.clientX : event.offsetX;
					var y1 = event.clientY ? event.clientY : event.offsetY;
				
					var leftTops = global.baseTool.sumLeftTop(tempPathBody);
			
					x1 = x1 - parseInt(leftTops[0]) + parseInt(tempPathBody.scrollLeft);
					y1 = y1 - parseInt(leftTops[1]) + parseInt(tempPathBody.scrollTop);
			
					self.pathLine(x1, y1, line, isPoint1);
					self.setDragPoint(line);
				
				}

			}
		
			doc.onmouseup = function (event) {
				
				event = event || window.event;
			
				var x2 = event.clientX ? event.clientX : event.offsetX,
						y2 = event.clientY ? event.clientY : event.offsetY;
			
				var leftTops = global.baseTool.sumLeftTop(tempPathBody);
				x2 = x2 - parseInt(leftTops[0]) + parseInt(tempPathBody.scrollLeft);
				y2 = y2 - parseInt(leftTops[1]) + parseInt(tempPathBody.scrollTop);
			
				tempLineTool.moveable = false;

   			doc.onmousemove = null;
   			doc.onmouseup = null;
   			
   			var newPath = tempLineTool.getPath(line);
   		
   			if (oldPath != newPath) {
   				
   				var oldHead = tempLineTool.getLineHead(oldPath),
							oldEnd = tempLineTool.getLineEnd(oldPath),
	
							oldHeadx1 = parseInt(oldHead[0]),
							oldHeady1 = parseInt(oldHead[1]),
		
							oldEndx2 = parseInt(oldEnd[0]),
							oldEndy2 = parseInt(oldEnd[1]),
							
							newHead = tempLineTool.getLineHead(newPath),
							newEnd = tempLineTool.getLineEnd(newPath),
	
							newHeadx1 = parseInt(newHead[0]),
							newHeady1 = parseInt(newHead[1]),
		
							newEndx2 = parseInt(newEnd[0]),
							newEndy2 = parseInt(newEnd[1]);
							
					if (oldHeadx1 !== newHeadx1 || oldHeady1 !== newHeady1 || oldEndx2 !== newEndx2 || oldEndy2 !== newEndy2) {
						tempLineTool.isCoverBaseMode(x2, y2, line, isPoint1);
					}
   		
   				var undoRedoEvent = new com.xjwgraph.UndoRedoEvent(function () {
  	
						global.lineTool.setPath(line, oldPath);
  					tempSmallTool.drawLine(line);
  					tempLineTool.setDragPoint(line);
					
					}, PathGlobal.lineMove);
			
   				undoRedoEvent.setRedo(function () {
			
  					global.lineTool.setPath(line, newPath);
  					tempSmallTool.drawLine(line);
  					tempLineTool.setDragPoint(line);
		
					});
				
				}
   		
			}
		
		}
		
		rectMiddle.onmousedown = function (event) {
			
			rectEnd.onmousedown(event);
			
			document.onmousemove = function (event) {
				
				event = event || window.event;
						
				if (tempLineTool.moveable) {
			
					var x1 = event.clientX ? event.clientX : event.offsetX;
					var y1 = event.clientY ? event.clientY : event.offsetY;
				
					var leftTops = global.baseTool.sumLeftTop(tempPathBody);
			
					x1 = x1 - parseInt(leftTops[0]) + parseInt(tempPathBody.scrollLeft);
					y1 = y1 - parseInt(leftTops[1]) + parseInt(tempPathBody.scrollTop);
					
					var pathStr = tempLineTool.formatPath(tempLineTool.getPath(line));
					var	head = tempLineTool.getLineHead(pathStr),
							end = tempLineTool.getLineEnd(pathStr),
							rectMiddle = $id(lineId + "lineMiddle"),
							tempSmallTool = global.smallTool;
					
					tempSmallTool.drawLine(line);
										
					var brokenType = line.getAttribute("brokenType");
					self.changeBrokenType(line, x1, y1);
					
					if (brokenType == 3) {
						
						var dragPath = "M " + head[0] + " " + head[1] + " L " + x1 + " " + head[1] + "," + x1 + " " + end[1] + "," + end[0] + " " + end[1] + " z";
						
						tempLineTool.setPath(line, dragPath);
						rectMiddle.setAttribute("x", x1 - PathGlobal.dragPointDec);
						rectMiddle.style.left = x1 - PathGlobal.dragPointDec + "px";
						
					} else if (brokenType == 2) {
						
						var dragPath = "M " + head[0] + " " + head[1] + " L " + head[0] + " " + y1 + "," + end[0] + " " + y1 + "," + end[0] + " " + end[1] + " z";
						
						tempLineTool.setPath(line, dragPath);
						rectMiddle.setAttribute("y", y1 - PathGlobal.dragPointDec);
						rectMiddle.style.top = y1 - PathGlobal.dragPointDec + "px";
						
					}
						
					tempLineTool.setDragPoint(line);
					
				}
				
			}
			
		}
	
	},
		
	changeBrokenType : function (line, x1, y1) {
		
		var pathStr = this.getPath(line),
				brokenType = line.getAttribute("brokenType"),
				head = this.getLineHead(pathStr),
				end = this.getLineEnd(pathStr),
				
				xInArea = (
										parseInt(x1) > parseInt(head[0]) && parseInt(x1) < parseInt(end[0]) || 
										parseInt(x1) < parseInt(head[0]) && parseInt(x1) > parseInt(end[0])
									),
				yInArea = (
										parseInt(y1) > parseInt(head[1]) && parseInt(y1) < parseInt(end[1]) || 
										parseInt(y1) < parseInt(head[1]) && parseInt(y1) > parseInt(end[1])
									),
				xOutArea = (
									 	parseInt(x1) < parseInt(head[0]) && parseInt(x1) < parseInt(end[0]) || 
										parseInt(x1) > parseInt(head[0]) && parseInt(x1) > parseInt(end[0])
									 ) && yInArea,
				yOutArea = (
										parseInt(y1) < parseInt(head[1]) && parseInt(y1) < parseInt(end[1]) || 
										parseInt(y1) > parseInt(head[1]) && parseInt(y1) > parseInt(end[1])
									 ) && xInArea;
		
		if (xOutArea) {
			line.setAttribute("brokenType", 3);
		}	else if (yOutArea) {	
			line.setAttribute("brokenType", 2);
		}
		
	}
	
}