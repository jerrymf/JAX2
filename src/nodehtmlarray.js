JAX.NodeHTMLArray = JAK.ClassMaker.makeClass({
	NAME: "JAX.NodeHTMLArray",
	VERSION: "0.1"
});


JAX.NodeHTMLArray.prototype.length = 0;

JAX.NodeHTMLArray.prototype.$constructor = function(JAXNodes) {
	var JAXNodes = [].concat(JAXNodes);
	for (var i=0, len=JAXNodes.length; i<len; i++) { 
		var JAXNode = JAXNodes[i];
		if (JAXNode instanceof JAX.NodeHTML) { this._jaxNodes.push(JAXNode); continue; }
		throw new Error("JAX.NodeHTMLArray: " + JAXNode + " is not instance of JAX.NodeHTML class"); 
	}
	this.length = this._jaxNodes.length;
};

JAX.NodeHTMLArray.prototype.item = function(index) {
	return this._jaxNodes[index];
};

JAX.NodeHTMLArray.prototype.items = function() {
	return this._jaxNodes.slice();
};

JAX.NodeHTMLArray.prototype.addClass = function() {
	for (var i=0, len=this._length; i<len; i++) { this._jaxNodes[i].addClass(Array.prototype.slice.call(arguments)); }
	return this;
};

JAX.NodeHTMLArray.prototype.removeClass = function() {
	for (var i=0, len=this._length; i<len; i++) { this._jaxNodes[i].removeClass(Array.prototype.slice.call(arguments)); }
	return this;
};

JAX.NodeHTMLArray.prototype.displayOn = function(displayValue) {
	for (var i=0, len=this._length; i<len; i++) { this._jaxNodes[i].displayOn(displayValue); }
	return this;
};

JAX.NodeHTMLArray.prototype.displayOff = function() {
	for (var i=0, len=this._length; i<len; i++) { this._jaxNodes[i].displayOff(); }
	return this;
};

JAX.NodeHTMLArray.prototype.style = function(properties) {
	for (var i=0, len=this._length; i<len; i++) { this._jaxNodes[i].style(properties); }
	return this;	
};

JAX.NodeHTMLArray.prototype.attr = function(attributes) {
	for (var i=0, len=this._length; i<len; i++) { this._jaxNodes[i].attr(attributes); }
	return this;	
};

JAX.NodeHTMLArray.prototype.appendTo = function(node) {
	for (var i=0, len=this._length; i<len; i++) { this._jaxNodes[i].appendTo(node); }
	return this;
}

JAX.NodeHTMLArray.prototype.removeFromDOM = function() {
	for (var i=0, len=this._length; i<len; i++) { this._jaxNodes[i].removeFromDOM(); }
	return this;
}

JAX.NodeHTMLArray.prototype.destroyItems = function() {
	for (var i=0, len=this._length; i<len; i++) { this._jaxNodes[i].destroy(); }
	return this;
}

JAX.NodeHTMLArray.prototype.forEachItem = function(cbk) {
	this._jaxNodes.forEach(cbk, this);
	return this;
};

JAX.NodeHTMLArray.prototype.filterItems = function(func) {
	return new JAX.NodeHTMLArray(this._jaxNodes.filter(func));
};

JAX.NodeHTMLArray.prototype.pushItem = function(node) {
	var JAXNode = JAX.$$(node);
	this.length++;
	this._jaxNodes.push(JAXNode);
	return this;
};

JAX.NodeHTMLArray.prototype.popItem = function() {
	this.length = Math.max(--this.length, 0);
	return this._jaxNodes.pop();
};

JAX.NodeHTMLArray.prototype.shiftItem = function() {
	this.length = Math.max(--this.length, 0);
	return this._jaxNodes.shift();
};

JAX.NodeHTMLArray.prototype.unshiftItem = function(node) {
	var JAXNode = JAX.$$(node);
	this.length++;
	return this._jaxNodes.unshift(JAXNode);
};

JAX.NodeHTMLArray.prototype.fade = function(type, duration, completeCbk) {
	for (var i=0, len=this._jaxNodes.length; i<len; i++) { this._jaxNodes[i].fade(type, duration, completeCbk); }
	return this;
};

JAX.NodeHTMLArray.prototype.slide = function(type, duration, completeCbk) {
	for (var i=0, len=this._jaxNodes.length; i<len; i++) { this._jaxNodes[i].slide(type, duration, completeCbk); }
	return this;
};

