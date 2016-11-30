var Map = com.xjwgraph.Map = function () {
	
	var self = this;
	
	self.map = new Object();
	self.length = 0;

}

Map.prototype = {
	
	size : function() {
		return this.length;
	},
	
	clear : function() {
	
		var self = this;
		
		self.map = new Object();
		self.length = 0;
	
	},
	
	put : function(key, value) {

		var self = this;
		
		if (!self.map['_' + key]) {
			++self.length;
		}
	      
		self.map['_' + key] = value;
	
	},
	
	putAll : function (objMap) {
	
		var keys = objMap.getKeys(),
		keyLength = keys.length,
		
		self = this;
		
		for (var i = keyLength; i--;) {
			var k = keys[i];
			self.put(k, objMap.get(k));
		}
		
	},
	
	remove : function(key) {
  
	  var self = this;
	  
		if (self.map['_' + key]) { 
			--self.length;
			return delete self.map['_' + key];
		} else {
			return false;
		}
			
	},
	
	containsKey : function(key) {
		return this.map['_' + key] ? true:false;
	},
    
	get : function(key) {
		var self = this;
		return self.map['_' + key] ? self.map['_' + key]:null;
	},

	inspect : function() {
       	
		var str = '',
	  self = this;
	  
		for (var each in self.map) {
			str+= '\n'+ each + '  Value:'+ self.map[each];
		}
	  
	  return str;
	},
       
	getKeys : function() {
          
		var kyeArray = new Array(),
		i = 0,
	  
	  self = this;
	           
		for (var each in self.map) {      
			kyeArray[i++] = each.replace('_', '');
		}
			
		return kyeArray;
		
	}

}