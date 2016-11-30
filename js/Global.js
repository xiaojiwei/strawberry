com.xjwgraph.Global = {};

function $id(id) {
	return document.getElementById(id);
}

var stopEvent = false;

String.prototype.replaceAll = function stringReplaceAll (aFindText, aRepText) {
	
	raRegExp = new RegExp(aFindText, "g");
	return this.replace(raRegExp, aRepText);

}

function message(messageStr, isClear) {
	
	var message = $id("message");
		
	if (isClear) {
		message.innerHTML = messageStr;
	} else {
		message.innerHTML += messageStr;
	}
		
}