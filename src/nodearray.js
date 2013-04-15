JAX.NodeArray = JAK.ClassMaker.makeClass({
	NAME: "JAX.NodeArray",
	VERSION: "0.1"
});


JAX.NodeArray.prototype.length = 0;

JAX.NodeArray.prototype.$constructor = function(JAXNodes) {
	for (var i=0, len=JAXNodes.length; i<len; i++) { 
		var JAXNode = JAXNodes[i];
		if (JAX.isJAXNode(JAXNode)) { this._jaxNodes.push(JAXNode); continue; }
		throw new Error("JAX.NodeArray: " + JAXNode + " is not instance of JAX.Node* class"); 
	}
	this.length = this._jaxNodes.length;
};

JAX.NodeArray.prototype.item = function(index) {
	return this._jaxNodes[index];
};

JAX.NodeArray.prototype.items = function() {
	return this._jaxNodes.slice();
};

JAX.NodeArray.prototype.addClass = function() {
	for (var i=0, len=this._length; i<len; i++) { this._jaxNodes[i].addClass(Array.prototype.slice.call(arguments)); }
	return this;
};

JAX.NodeArray.prototype.removeClass = function() {
	for (var i=0, len=this._length; i<len; i++) { this._jaxNodes[i].removeClass(Array.prototype.slice.call(arguments)); }
	return this;
};

JAX.NodeArray.prototype.displayOn = function(displayValue) {
	for (var i=0, len=this._length; i<len; i++) { this._jaxNodes[i].displayOn(displayValue); }
	return this;
};

JAX.NodeArray.prototype.displayOff = function() {
	for (var i=0, len=this._length; i<len; i++) { this._jaxNodes[i].displayOff(); }
	return this;
};

JAX.NodeArray.prototype.style = function(properties) {
	for (var i=0, len=this._length; i<len; i++) { this._jaxNodes[i].style(properties); }
	return this;	
};

JAX.NodeArray.prototype.attr = function(attributes) {
	for (var i=0, len=this._length; i<len; i++) { this._jaxNodes[i].attr(attributes); }
	return this;	
};

JAX.NodeArray.prototype.appendTo = function(node) {
	for (var i=0, len=this._length; i<len; i++) { this._jaxNodes[i].appendTo(node); }
	return this;
}

JAX.NodeArray.prototype.removeFromDOM = function() {
	for (var i=0, len=this._length; i<len; i++) { this._jaxNodes[i].removeFromDOM(); }
	return this;
}

JAX.NodeArray.prototype.destroyItems = function() {
	for (var i=0, len=this._length; i<len; i++) { this._jaxNodes[i].destroy(); }
	return this;
}

JAX.NodeArray.prototype.forEachItem = function(cbk) {
	this._jaxNodes.forEach(cbk, this);
	return this;
};

JAX.NodeArray.prototype.filterItems = function(func) {
	return new JAX.NodeArray(this._jaxNodes.filter(func));
};

JAX.NodeArray.prototype.pushItem = function(node) {
	var JAXNode = JAX.$$(node);
	this.length++;
	this._jaxNodes.push(JAXNode);
	return this;
};

JAX.NodeArray.prototype.popItem = function() {
	this.length = Math.max(--this.length, 0);
	return this._jaxNodes.pop();
};

JAX.NodeArray.prototype.shiftItem = function() {
	this.length = Math.max(--this.length, 0);
	return this._jaxNodes.shift();
};

JAX.NodeArray.prototype.unshiftItem = function(node) {
	var JAXNode = JAX.$$(node);
	this.length++;
	return this._jaxNodes.unshift(JAXNode);
};

JAX.NodeArray.prototype.fade = function(type, duration, completeCbk) {
	for (var i=0, len=this._jaxNodes.length; i<len; i++) { this._jaxNodes[i].fade(type, duration, completeCbk); }
	return this;
};

JAX.NodeArray.prototype.slide = function(type, duration, completeCbk) {
	for (var i=0, len=this._jaxNodes.length; i<len; i++) { this._jaxNodes[i].slide(type, duration, completeCbk); }
	return this;
};

