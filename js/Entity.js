var BaseMode = com.xjwgraph.BaseMode = function () {
	
	var self = this;
	
	self.id;
	self.lineMap = new Map();
	
	self.prop = {
			attri1 : '2',
			attri2 : '3',
			attri3 : '4'
	}
	
}

var BuildLine = com.xjwgraph.BuildLine = function () {
	
	var self = this;
	
	self.id;
	self.index;
	self.xIndex;
	self.wIndex;
	self.type;
	self.xBaseMode;
	self.wBaseMode;
	
	self.prop = {
			attri1 : '2',
			attri2 : '3',
			attri3 : '4',
			attri4 : '5'
	}
	
}

var Point = com.xjwgraph.Point = function () {
	
	var self = this;
	
	self.x = 0;
	self.y = 0;
	self.index = 0;

}