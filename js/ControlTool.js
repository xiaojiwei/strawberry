var ControlTool = com.xjwgraph.ControlTool = function (mainBody) {
	
	var self = this,
	doc = document;
	self.mainBody = mainBody;
	self.indexId;
	
	var inputFunction = function (inputText, isNoStyle) {
		
		inputText.onkeydown = function (event) {
			
			event = event || window.event;
			
			if (event.keyCode == 13) {
				self.submit();
			}
			
		}
		
		if (isNoStyle) {
			return;
		}
		
		inputText.setAttribute("class", "inputComm");
		inputText.setAttribute("className", "inputComm");
		
		inputText.onclick = function () {
		
			this.setAttribute("class", "inputClick");
			this.setAttribute("className", "inputClick");
		
		}
	
		inputText.onblur = function () {
		
			this.setAttribute("class", "inputComm");
			this.setAttribute("className", "inputComm");
	
		}
		
	}
	
	self.inputTitle = $id("inputTitle");
	inputFunction(self.inputTitle);
	
	self.inputWidth = $id("inputWidth");
	inputFunction(self.inputWidth);
	
	self.inputHeight = $id("inputHeight");
	inputFunction(self.inputHeight);
	
	self.inputTop = $id("inputTop");
	inputFunction(self.inputTop);
	
	self.inputLeft = $id("inputLeft");
	inputFunction(self.inputLeft);
	
	self.inputImgSrc = $id("inputImgSrc");
	inputFunction(self.inputImgSrc);
	
	self.modeContent = $id("modeContent");
	inputFunction(self.modeContent, true);
	
}

ControlTool.prototype = {
	
	submit : function () {
	
		var global = com.xjwgraph.Global,
		tempControlTool = global.controlTool;
		
		if (!$id("module" + tempControlTool.indexId)) {
			return;
		}
		
		var mode = $id("module" + tempControlTool.indexId),
		modeStyle = mode.style,
		
		img = $id("backImg" + tempControlTool.indexId),
		imgStyle = img.style,
		
		content = $id("content" + tempControlTool.indexId),
		contentStyle = content.style,
		
		title = $id("title" + tempControlTool.indexId),
		titleStyle = title.style,
		
		modeWidth = parseInt(mode.offsetWidth),
		modeHeight = parseInt(mode.offsetHeight),
		modeTop = parseInt(modeStyle.top),
		modeLeft = parseInt(modeStyle.left),
		
		imgWidth = parseInt(img.offsetWidth),
		imgHeight = parseInt(img.offsetHeight),
		imgTop = parseInt(imgStyle.top),
		imgLeft = parseInt(imgStyle.left),
		imgSrc = img.src,
		
		contentWidth = parseInt(content.offsetWidth),
		contentHeight = parseInt(content.offsetHeight),
		contentTop = parseInt(contentStyle.top),
		contentLeft = parseInt(contentStyle.left),
		
		modeContent = mode.getAttribute("modeContent"),
		
		titleInnerHTML = title.innerHTML,
		
		tempModeTool = global.modeTool;
		
		var undoRedoEvent = new com.xjwgraph.UndoRedoEvent(function () {
	
			if (modeWidth) {
				modeStyle.width = modeWidth + "px";
			}
			
			if (modeHeight) {
				modeStyle.height = modeHeight + "px";
			}
			
			if (modeTop) {
				modeStyle.top = modeTop + "px";
			}
			
			if (modeLeft) {
				modeStyle.left = modeLeft + "px";
			}
		
			if (imgWidth) {
				imgStyle.width = imgWidth + "px";
			}
			
			if (imgHeight) {
				imgStyle.height = imgHeight + "px";
			}
			
			if (imgTop) {
				imgStyle.top = imgTop + "px";
			}
			
			if (imgLeft) {
				imgStyle.left = imgLeft + "px";
			}
			
			if (imgSrc) {
				img.src = imgSrc;
			}
			
			if (contentWidth) {
				contentStyle.width = contentWidth + "px";
			}
			
			if (contentHeight) {
				contentStyle.height = contentHeight + "px";
			}
			
			if (contentTop) {
				contentStyle.top = contentTop + "px";
			}
			
			if (contentLeft) {
				contentStyle.left = contentLeft + "px";
			}
			
			if (modeContent) {
				mode.setAttribute("modeContent", modeContent);
			}
			
			tempModeTool.showPointer(mode);
			tempModeTool.changeBaseModeAndLine(mode, true);
			
			title.innerHTML = titleInnerHTML;
			
			global.smallTool.drawMode(mode);
				
		}, PathGlobal.updateMode);
		
		modeStyle.width = tempControlTool.inputWidth.value + "px";
		modeStyle.height = tempControlTool.inputHeight.value + "px";
		modeStyle.top = tempControlTool.inputTop.value + "px";
		modeStyle.left = tempControlTool.inputLeft.value + "px";
		
		imgStyle.width = tempControlTool.inputWidth.value + "px";
		imgStyle.height = tempControlTool.inputHeight.value + "px";
		imgStyle.top = tempControlTool.inputTop.value + "px";
		imgStyle.left = tempControlTool.inputLeft.value + "px";
		img.src = tempControlTool.inputImgSrc.value;
		
		contentStyle.width = tempControlTool.inputWidth.value + "px";
		contentStyle.height = tempControlTool.inputHeight.value + "px";
		contentStyle.top = tempControlTool.inputTop.value + "px";
		contentStyle.left = tempControlTool.inputLeft.value + "px";
		
		mode.setAttribute("modeContent", tempControlTool.modeContent.value);
		
		tempModeTool.isModeCross(mode);
	  tempModeTool.changeBaseModeAndLine(mode, true);
	  
		title.innerHTML = "";
		
		tempModeTool.flip(tempModeTool.getModeIndex(mode), tempControlTool.inputTitle.value);
		
	  global.smallTool.drawMode(mode);
	  
	  var afterModeWidth = parseInt(mode.offsetWidth),
		afterModeHeight = parseInt(mode.offsetHeight),
		afterModeTop = parseInt(modeStyle.top),
		afterModeLeft = parseInt(modeStyle.left),
		
		afterImgWidth = parseInt(img.offsetWidth),
		afterImgHeight = parseInt(img.offsetHeight),
		afterImgTop = parseInt(imgStyle.top),
		afterImgLeft = parseInt(imgStyle.left),
		afterImgSrc = img.src,
		
		afterContentWidth = parseInt(content.offsetWidth),
		afterContentHeight = parseInt(content.offsetHeight),
		afterContentTop = parseInt(contentStyle.top),
		afterContentLeft = parseInt(contentStyle.left),
		
		afterModeContent = tempControlTool.modeContent.value,
		
		afterTitleInnerHTML = tempControlTool.inputTitle.value;
	  
	  undoRedoEvent.setRedo(function () {
			
			modeStyle.width = afterModeWidth + "px";
			modeStyle.height = afterModeHeight + "px";
			modeStyle.top = afterModeTop + "px";
			modeStyle.left = afterModeLeft + "px";
		
			imgStyle.width = afterImgWidth + "px";
			imgStyle.height = afterImgHeight + "px";
			imgStyle.top = afterImgTop + "px";
			imgStyle.left = afterImgLeft + "px";
			img.src = afterImgSrc;
		
			contentStyle.width = afterContentWidth + "px";
			contentStyle.height = afterContentHeight + "px";
			contentStyle.top = afterContentTop + "px";
			contentStyle.left = afterContentLeft + "px";
			
			mode.setAttribute("modeContent", afterModeContent);
	
			tempModeTool.showPointer(mode);
			tempModeTool.changeBaseModeAndLine(mode, true);
			
			title.innerHTML = afterTitleInnerHTML;
			
			global.smallTool.drawMode(mode);
	    	
		});
	
	},
	
	reBack : function () {
	},
	
	print : function (indexId) {
	
		var mode = $id("module" + indexId),
		modeStyle = mode.style,
		
		img = $id("backImg" + indexId),
		title = $id("title" + indexId),
		
		self = this;
		
		self.indexId = indexId;
		
		self.inputWidth.value = parseInt(mode.offsetWidth) - 2;
		self.inputHeight.value = parseInt(mode.offsetHeight) - 2;
		self.inputTop.value = parseInt(modeStyle.top);
		self.inputLeft.value = parseInt(modeStyle.left);
		self.inputImgSrc.value = img.src;
		self.inputTitle.value = title.innerHTML;
		self.modeContent.value = mode.getAttribute("modeContent") || '';
	}

}