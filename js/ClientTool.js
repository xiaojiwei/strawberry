var client = com.xjwgraph.ClientTool = function (options) {
	
	this.dialog = $('#' + options.prop);
	$id(options.prop).style.width = options.dialogWidth || 328 + "px"

}

client.prototype = {
	
	_deepCopyProp : function (orgProp) {
		
		var newProp = {};
		
		for (var key in orgProp) {
			newProp[key] = orgProp[key];
		}
		
		return newProp;
		
	},
	
	_isDiffJson : function (oneJson, twoJson) {
		
		var diff = false;
		
		for (var key in oneJson) {
			
			if (oneJson[key] !== twoJson[key]) {
				diff = true;
				break;
			}
			
		}
		
		return diff;
		
	},
	
	_close : function (event) {
		
		var panelClose = $(".panel-tool-close");
		
		if (panelClose.length > 0) {
			panelClose = panelClose[0];
			panelClose.click(event);
		}
	
	},
	
	showDialog : function (event, title, obj) {
		
		var orgProp = this._deepCopyProp(obj.prop),
				self = this;
		
		this.dialog.dialog({
			
			title : title,
    	modal : true,
    	_attri_prop : null,

    	buttons : [
    		{
    			text : 'ok',
    			handler: function() {
    				
    				var prop = obj.prop;
    						
    				for (var key in prop) {
    					
    					var inputText = $id("lineAttr_" + key);
    					prop[key] = inputText.value;
    					
    				}
						
						self._close(event);
						
    				var undoRedoEvent = new com.xjwgraph.UndoRedoEvent(function () {
							obj.prop = orgProp;
						}, PathGlobal.editProp);
			
   					undoRedoEvent.setRedo(function () {
  						obj.prop = prop;
						});
    				
    			}
    		},
    		{
    			text : 'rest',
    			handler : function() {
    				
    				var prop = obj.prop = orgProp;
    						
    				for (var key in prop) {
    					
    					var inputText = $id("lineAttr_" + key);
    					inputText.value = prop[key];
    					
    				}
    				
    			}
    		}
    	]
    	
		}); 
	
	},
	
	addProItem : function (prop) {
		
		var doc = document,
				contextDiv = doc.createElement("div");
		
		var context = '<table>';
		
		for (var key in prop) {
			context += '<tr><td align="right">&nbsp;' + key + '&nbsp;:&nbsp;</td><td><input type="text" id="lineAttr_' + key + '" value="' + prop[key] + '" /></td></tr>';
		}
		
		context += '</table>';
		
		contextDiv.innerHTML = context;
		
		return contextDiv;
		
	}
	
}