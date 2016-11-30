var ContextXML = com.xjwgraph.ContextXML = function () {}

ContextXML.prototype = {
	
	setAttribute : function (name, value) {
		this[name] = value;
	},
	
	view : function () {
	
		var self = this,
		
		contextDiv = document.createElement("div");
		
		for (var item in self) {
			
			if (item == "view" || 
					item == "setAttribute" || 
					item == "style" || 
					item == "modeIds" ||
					item == "lineIds") {
				continue;	
			}
			
			contextDiv.setAttribute(item, self[item]);
		
		}
		
		var global = com.xjwgraph.Global,
		tempModeTool = global.modeTool,
		tempBaseTool = global.baseTool,
		
		contextMap = tempBaseTool.contextMap,
		contextModeMap = new Map(),
		contextLineMap = new Map(),
		
		modeIds = self.modeIds.split(","),
		modeIdsLength = modeIds.length;
		
		for (var i = modeIdsLength; i--;) {
			var modeId = modeIds[i];
			contextModeMap.put(modeId, $id(modeId));
		}
		
		var lineIds = self.lineIds.split(","),
		lineIdsLength = lineIds.length;
		
		for (var i = lineIdsLength; i--;) {
			var lineId = lineIds[i];
			contextLineMap.put(lineId, $id(lineId));
		}
		
		function contextEntry (modeMap, lineMap) {
			this.contextModeMap = modeMap;
			this.contextLineMap = lineMap;
		}
		
		var contextEntry  = new contextEntry(contextModeMap, contextLineMap);
		contextMap.put(self.id, contextEntry);
		contextDiv.style.cssText = self.style;
		
		var tempBaseTool = global.baseTool;
		
		tempBaseTool.pathBody.appendChild(contextDiv);
		tempBaseTool.contextDivDrag(contextDiv, contextEntry);
		
	}
	
}

var LineXML = com.xjwgraph.LineXML = function () {}

LineXML.prototype = {
	
	_lineAttrProp : "attr_prop_",
	
	setAttribute : function (name, value) {

		if (name.indexOf(this._lineAttrProp) > -1) {
			
			if (this['prop'] == null) {
				this['prop'] = {};
			}
			
			name = name.substring(this._lineAttrProp.length);
			this['prop'][name] = value;
			
		} else {
			this[name] = value;
		}
		
	},
	
	view : function () {
	
		var self = this,
		global = com.xjwgraph.Global,		
		tempLineTool = global.lineTool,
		
		line = tempLineTool.createBaseLine(self.id, self.d || self.path, self.brokenType),
		
		lineMode = new BuildLine();
		lineMode.id = line.id;
		
		if (this['prop']) {
			lineMode.prop = this['prop'];
		}
		
		line.style.cssText = self.style;
		line.setAttribute("strokeweight", self.strokeweight);
		line.setAttribute("strokecolor", self.strokecolor);
		line.setAttribute("brokenType", self.brokenType);
		
		var tempModeTool = global.modeTool,
				tempBeanXml = global.beanXml;
		
		if (self.xBaseMode) {
			
			var xDelay = function () {
				
				var xMode = global.modeMap.get(self.xBaseMode);
			
				lineMode.xBaseMode = xMode;
				lineMode.xIndex = self.xIndex;
				
				var modeLine = new BuildLine();
				modeLine.id = self.id;
				modeLine.type = true;
				modeLine.index = self.xIndex;
			
				xMode.lineMap.put(self.id + "-true", modeLine);
			
			}
			
			if (global.modeMap.get(self.xBaseMode)) {
				xDelay();
			} else {
				tempBeanXml.delay[tempBeanXml.delayIndex++] = xDelay;
			}
			
		}
		
		if (self.wBaseMode) {
			
			var yDelay = function () {
			
				var yMode = global.modeMap.get(self.wBaseMode);
			
				lineMode.wBaseMode = yMode;
				lineMode.wIndex = self.wIndex;
				
				var modeLine = new BuildLine();
				modeLine.id = self.id;
				modeLine.type = false;
				modeLine.index = self.wIndex;
				
				yMode.lineMap.put(self.id + "-false", modeLine);
			
			}
			
			if (global.modeMap.get(self.wBaseMode)) {
				yDelay();
			} else {
				tempBeanXml.delay[tempBeanXml.delayIndex++] = yDelay;
			}
			
		}
		
		global.smallTool.drawLine(line);
		global.lineMap.put(lineMode.id, lineMode);
		
		tempLineTool.baseLineIdIndex = parseInt(self.id.substring(4)) + 1;
		
	}

}

var ModeXML = com.xjwgraph.ModeXML = function () {
	
	var self = this,
	tempModeTool = com.xjwgraph.Global.modeTool;
	
	self.modeDiv = tempModeTool.createBaseMode(0, 0, "", 0, "50px", "50px");
	self.backImg = tempModeTool.getSonNode(self.modeDiv, "backImg");
	self.title = tempModeTool.getSonNode(self.modeDiv, "title");
	
}

ModeXML.prototype = {
	
	_modeAttrProp : "attr_prop_",
	
	setAttribute : function (name, value) {
	
		var self = this;
		
		if (name == "backImgSrc") {
			self.backImg.src = value;
		} else if (name == "top") {
			self.modeDiv.style.top = value + "px";
		} else if (name == "left") {
			self.modeDiv.style.left = value + "px";
		} else if (name == "width") {
			self.modeDiv.style.widht = value + "px";
			self.backImg.style.width = value + "px";
		} else if (name == "height") {
			self.modeDiv.style.height = value + "px";
			self.backImg.style.height = value + "px";
		} else if (name == "id") {
			com.xjwgraph.Global.modeTool.setIndex(self.modeDiv, value);
		} else if (name == "title") {
			self.title.innerHTML = value;
		} else if (name == "zIndex") {
			self.modeDiv.style.zIndex = value;
		} else if (name.indexOf(this._modeAttrProp) > -1) {
			
			if (this['prop'] == null) {
				this['prop'] = {};
			}
			
			name = name.substring(this._modeAttrProp.length);
			this['prop'][name] = value;
			
		} else {
			self.modeDiv.setAttribute(name, value);
		}
		
	},
	
	view : function () {
	
		var mode = new BaseMode(),
		moduleDiv = this.modeDiv,
		
		global = com.xjwgraph.Global,
		
		tempModeTool = global.modeTool;
		tempModeTool.pathBody.appendChild(moduleDiv);
		
		var modeIndex = tempModeTool.getModeIndex(moduleDiv);
		
		mode.id = moduleDiv.id;
		
		if (this['prop']) {
			mode.prop = this['prop'];
		}
		
		global.modeMap.put(mode.id, mode);
		
		tempModeTool.initEvent(modeIndex);
		tempModeTool.showPointerId(modeIndex);
		tempModeTool.hiddPointer(moduleDiv);
		
		global.smallTool.drawMode(moduleDiv);
		
		tempModeTool.baseModeIdIndex = parseInt(modeIndex) + 1;
		
	}

}

var BeanXML = com.xjwgraph.BeanXML = function () {
	
	var self = this;
	
	self.delay = [];
	self.delayIndex = 0;
	self.doc = null;
	self.create();
	self.root = self.initBeanXML();
	
}

BeanXML.prototype = {
	
	create : function () {
	
		var self = this;
		self.doc = null;
		
		if (document.all) {
			
			var xmlVersions = ["Msxml2.DOMDocument.6.0",
												 "Msxml2.DOMDocument.5.0", 
												 "Msxml2.DOMDocument.4.0", 
												 "Msxml2.DOMDocument.3.0", 
												 "MSXML2.DOMDocument", 
												 "MSXML.DOMDocument", 
												 "Microsoft.XMLDOM"];
												 
			var xmlVersionLength = xmlVersions.length;
			
			for (var i = xmlVersionLength; i--;) {
				
				try {
					self.doc = new ActiveXObject(xmlVersions[i]);
					break;
				} catch (err) {
					continue;
				}
				
			}
		
		} else {
			self.doc =  document.implementation.createDocument('', '', null);
		}
		
	},

	initBeanXML : function () {
 	
	 	var self = this,
	 	
		headFile = self.doc.createProcessingInstruction("xml", "version='1.0' encoding='utf8'");
		self.doc.appendChild(headFile);
	  		
		var root = self.doc.createElement("modes");
		self.doc.appendChild(root);
		
		return root;
	 	
	},

	getNodeAttribute : function (iNode) {
	
		var nodeText = [],
		k = 0,
				
		attributes = iNode.attributes,
		attributesLength = attributes.length;
				
		for (var i = attributesLength; i--;) {
					
			var attribute = attributes[i];
			
			nodeText[k++] = " ";		
			nodeText[k++] = attribute.nodeName;
			nodeText[k++] = "=\"";
			nodeText[k++] = attribute.nodeValue;
			nodeText[k++] = "\"";
	
		}
		
		return nodeText.join("");
			
	},

	getText : function (iNode, isTitle) {
	
		var nodeText = [],
		k = 0,
		
		self = this;
		
		if (isTitle) {
			
			nodeText[k++] = "<";
			nodeText[k++] = iNode.nodeName;
		
		}
	
		var childNodes = iNode.childNodes,
		childNodesLength = childNodes.length;
		
		for (var i = childNodesLength; i--;) {
			
			var node = childNodes[i];
			
			nodeText[k++] = "<";
			nodeText[k++] = node.nodeName;
			
			if (node.nodeType == 1) {
				nodeText[k++] = self.getNodeAttribute(node);
			}
			
			nodeText[k++] = ">";
			
			if (node.hasChildNodes()) {
				nodeText[k++] = self.getText(node, false);
			} 
			
			nodeText[k++] = "</";
			nodeText[k++] = node.nodeName;
			nodeText[k++] = ">";
			
	  }
	  
	  if (isTitle) {
	  	
	  	nodeText[k++] = "</";
			nodeText[k++] = iNode.nodeName;
			nodeText[k++] = ">";
	  
		}
		
		return nodeText.join("");
		
	},

	createNode : function (type, fNode) {
 	
	 	var self = this,
	 	
		node = self.doc.createElement(type);
	    
		if (fNode) {
			fNode.appendChild(node);
		} else {
			self.root.appendChild(node);
		}
	    
		return node;
	
	},

	clearNode : function () {
	
		var self = this;
		
		if (self.root) {
			
			var childNodes = self.root.childNodes,
			childNodesLength = childNodes.length;
		
			for (var i = childNodesLength; i--;) {
			
				self.root.removeChild(childNodes[i]);	
			
			}
			
		}	
		
	},
	
	_formatValue : function (value) {
		
		value = value.replaceAll("&", "&amp;");
		value = value.replaceAll("'", "&apos;");
		value = value.replaceAll('"', "&quot;");
		value = value.replaceAll('>', "&gt;");
		value = value.replaceAll('<', "&lt;");
		
		return value;
		
	},

	toXML : function () {
	
		var self = this;
		self.clearNode();
		
		var global = com.xjwgraph.Global,
		
		tempBaseTool = global.baseTool,
		contextMap = tempBaseTool.contextMap;
		
		tempBaseTool.forEach(contextMap, function (contextId) {
			
			var node = self.createNode("context"),
			context = $id(contextId),
			
			attributes = context.attributes,
			attributeLength = attributes.length;
			
			for (var i = attributeLength;i--;) {
				
				var attribute = attributes[i];
							
				if (attribute.nodeValue) {
					node.setAttribute(attribute.name, attribute.nodeValue);
				}
				
			}
			
			node.setAttribute("style", context.style.cssText);
			
			var contextEntry = contextMap.get(contextId),
					
					contextModeMap = contextEntry.contextModeMap,
					contextLineMap = contextEntry.contextLineMap,
					
					contextModeMapKeys = contextModeMap.getKeys(),
					contextLineMapKeys = contextLineMap.getKeys(),
					
					contextModeMapKeyLength = contextModeMapKeys.length,
					contextLineMapKeyLength = contextLineMapKeys.length,
					
					modeIds = [],
					lineIds = [],
					index = 0;
			
			for (var i = contextModeMapKeyLength; i--;) {
				modeIds[index++] = contextModeMapKeys[i];
			}
			
			node.setAttribute("modeIds", modeIds.join(","));
			index = 0;
			
			for (var i = contextLineMapKeyLength; i--;) {
				lineIds[index++] = contextLineMapKeys[i];
			}
			
			node.setAttribute("lineIds", lineIds.join(","));
			
		});
		
		tempBaseTool.forEach(global.modeMap, function (modeId) {
			
			var mode = $id(modeId),
			modeStyle = mode.style,
			attributes = mode.attributes,
			attributeLength = attributes.length,
			
			node = self.createNode("mode");
			
			for (var i = attributeLength;i--;) {
				
				var attribute = attributes[i];
				
				if (attribute.name == 'style' || 
							attribute.name == 'id') {
					continue;
				}
					
				if (attribute.nodeValue) {
					node.setAttribute(attribute.name, attribute.nodeValue);
				}
				
			}
			
			var modeObj = global.modeMap.get(modeId);
			var modeProp = modeObj['prop'];
				
			for (var modeKey in modeProp) {
				node.setAttribute("attr_prop_" + modeKey, modeProp[modeKey]);
			}
			
			var modeIndex = global.modeTool.getModeIndex(mode);
			node.setAttribute("id", modeIndex);
			
			var title = $id("title" + modeIndex).innerHTML;
			node.setAttribute("title", title);
			
			var backImg = $id("backImg" + modeIndex),
			backImgSrc = backImg.src;
			
			node.setAttribute("backImgSrc", backImgSrc);
			node.setAttribute("top", parseInt(modeStyle.top));
			node.setAttribute("left", parseInt(modeStyle.left));
			node.setAttribute("zIndex", parseInt(modeStyle.zIndex));
			node.setAttribute("width", parseInt(backImg.offsetWidth));
			node.setAttribute("height", parseInt(backImg.offsetHeight));
			
		});
		
		tempBaseTool.forEach(global.lineMap, function (lineId) {
			
			var line = $id(lineId),
			
			node = self.createNode("line"),
			attributes = line.attributes,
			attributeLength = attributes.length,
			lineStyle = line.style;
			
			var strokeweight = line.getAttribute("strokeweight"),
					strokecolor = line.getAttribute("strokecolor");
			
			node.setAttribute("strokeweight", strokeweight || lineStyle.strokeWidth);
			node.setAttribute("strokecolor", strokecolor || lineStyle.stroke);
			
			for (var i = attributeLength;i--;) {
				
				var attribute = attributes[i];
				
				if (attribute.name == 'style' ||
						attribute.name == 'marker-end') {
					continue;
				}
				
				if (attribute.nodeValue) {
					node.setAttribute(attribute.name, attribute.nodeValue);
				}
				
			}
			
			var cssText = lineStyle.strokeWidth ? '' : ';fill: none; stroke: ' + strokecolor + '; stroke-width: ' + (strokeweight + 0.45);
			
			node.setAttribute("style", lineStyle.cssText + cssText);
			node.setAttribute("marker-end", "url(#arrow)");
			
			var buildLine = global.lineMap.get(line.id);
			
			for (var item in buildLine) {
				
				if (item === "prop") {
					continue;
				}
				
				if (typeof(buildLine[item]) == "string" || 
							typeof(buildLine[item]) == "number") {
					node.setAttribute(item, buildLine[item]);
				} else if (typeof(buildLine[item]) == "object") {
					node.setAttribute(item, buildLine[item] && buildLine[item].id ? buildLine[item].id : '');
				} else {
					node.setAttribute(item, buildLine[item] + " is unSupport");
				}
				
			}
			
			if (buildLine && buildLine['prop']) {
				
				var prop = buildLine['prop'];
				
				for (var key in prop) {
					node.setAttribute("attr_prop_" + key, prop[key]);
				}
				
			}
			
		});
		
		var textXml = self.getTextXml(self.doc);
		
		self.viewTextXml(textXml);
		
	},
	
	loadXmlText : function () {
		
		if (document.all && window.ActiveXObject) {
			
			var self = this;
	
			return function(xml) {
					
				var xmlVersions = ["Msxml2.DOMDocument.6.0",
												 	 "Msxml2.DOMDocument.5.0", 
												 	 "Msxml2.DOMDocument.4.0", 
												 	 "Msxml2.DOMDocument.3.0", 
												   "MSXML2.DOMDocument", 
												   "MSXML.DOMDocument", 
												   "Microsoft.XMLDOM"];
												 
				var xmlVersionLength = xmlVersions.length;
				var result = null;
				
				for (var i = xmlVersionLength; i--;) {
				
					try {
						result = new ActiveXObject(xmlVersions[i]);
						break;
					} catch (err) {
						continue;
					}
				
				}
				
				result.async = 'false';
				result.loadXML(xml);
				
				return result;
		
			};
	
		} else { 
		
			return function(xml) { 				
				return new DOMParser().parseFromString(xml, 'text/xml');
			};
			
		}
		
	}(),
	
	viewTextXml : function (textXml) {
			
		textXml = textXml.replaceAll("<", "&lt").replaceAll(">", "&gt");

		var viewHTML = window.open('saveXml.html', '', ''),
		i = 0,
		viewHTMLBuffer = [];
		
		viewHTMLBuffer[i++] = '<html>';
		viewHTMLBuffer[i++] = '<head>';
		viewHTMLBuffer[i++] = '<link href="css/flowPath.css" type="text/css" rel="stylesheet" />';
		viewHTMLBuffer[i++] = '<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />';
		viewHTMLBuffer[i++] = '<title></title>';
		viewHTMLBuffer[i++] = '</head>';
		viewHTMLBuffer[i++] = '<body>';
		
		viewHTMLBuffer[i++] = textXml;
		
		viewHTMLBuffer[i++] = '</body></html>';
		
		viewHTML.document.write(viewHTMLBuffer.join(""));
	
		viewHTML.document.close();

	},
	
	getTextXml : function (node) {
	
		var xml = '';
	
		if (node) {
		
			xml = node.xml;
		
			if (!xml) { 
			
				if (node.innerHTML) {
					xml = node.innerHTML;
				} else {
				
					var xmlSerializer = new XMLSerializer();
					xml = xmlSerializer.serializeToString(node);
			
				}
		
			} else {
				xml = xml.replace(/\r\n\t[\t]*/g, '').replace(/>\r\n/g, '>').replace(/\r\n/g, '\n');
			}
	
		}
	
		xml = xml.replace(/\n/g, '');
		
		xml = this._formatValue(xml);
	
		return xml;

	},

	clearHTML : function () {
		
		var global = com.xjwgraph.Global;
		
		global.undoRedoEventFactory.clear();
		global.lineTool.removeAll();
		global.modeTool.removeAll()
		global.baseTool.removeAll();
		
	},

	toHTML : function () {
	
		var self = this;
		
		self.clearHTML();
		
		if (!self.doc) {
			return;
		}
		
		var docChildNodes = self.doc.childNodes,
		docChildNodesLength = docChildNodes.length;
		
		for (var i = docChildNodesLength; i--;) {
			
			if (docChildNodes[i].nodeName == 'modes') {
				self.root = self.doc.childNodes[i];
				break;
			}
			
		}
		
		if (self.root) {
			
			var childNodes = self.root.childNodes,
			childNodesLength = childNodes.length;
		
			for (var i = childNodesLength; i--;) {
			
				var node = childNodes[i],
				nodeName = node.nodeName,
				
				attributes = node.attributes,
				attributesLength = attributes.length,
				
				xml;
				
				if (nodeName == "mode") {
					xml = new ModeXML();
				} else if (nodeName == "line") {
					xml = new LineXML();
				}	else if (nodeName == "context") {
					xml = new ContextXML();
				}
				
				for (var j = attributesLength; j--;) {
					
					var attribute = attributes[j];
					xml.setAttribute(attribute.name, attribute.value);
					
				}
				
				xml.view();
			
			}
			
			var delays = self.delay,
			delayLength = delays.length;
			
			for (var i = delayLength; i--;) {
				delays[i]();
			}
			
			delete self.delay;
			
			self.delay = [];
			self.delayIndex = 0;
			
		}	
		
	}

}