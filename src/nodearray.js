JAX.NodeArray = JAK.ClassMaker.makeClass({
	NAME: "JAX.NodeArray",
	VERSION: "1.0"
});

JAX.NodeArray.prototype.$constructor = function(nodes) {
	this.length = 0;

	var nodes = [].concat(nodes);
	var len = nodes.length;
	this._jaxNodes = new Array(len);

	for (var i=0; i<len; i++) { 
		var node = nodes[i];
		if (typeof(node) === "object" && node.nodeType) { this._jaxNodes[i] = JAX(node); continue; }
		if (node instanceof JAX.Node) { this._jaxNodes[i] = node; continue; }

		throw new Error("First argument must be array of JAX.Node instances or html nodes");
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
	var classes = [].slice.call(arguments);
	for (var i=0, len=this._jaxNodes.length; i<len; i++) { 
		var jaxNode = this._jaxNodes[i];
		jaxNode.addClass(classes); 
	}
	return this;
};

JAX.NodeArray.prototype.removeClass = function() {
	var classes = [].slice.call(arguments);
	for (var i=0, len=this._jaxNodes.length; i<len; i++) { 
		var jaxNode = this._jaxNodes[i];
		jaxNode.removeClass(classes); 
	}
	return this;
};

JAX.NodeArray.prototype.displayOn = function(displayValue) {
	for (var i=0, len=this._jaxNodes.length; i<len; i++) { 
		this._jaxNodes[i].displayOn(displayValue); 
	}
	return this;
};

JAX.NodeArray.prototype.displayOff = function() {
	for (var i=0, len=this._jaxNodes.length; i<len; i++) { 
		this._jaxNodes[i].displayOff();
	}
	return this;
};

JAX.NodeArray.prototype.css = function(properties) {
	for (var i=0, len=this._jaxNodes.length; i<len; i++) { 
		this._jaxNodes[i].css(properties);
	}
	return this;	
};

JAX.NodeArray.prototype.attr = function(attributes) {
	for (var i=0, len=this._jaxNodes.length; i<len; i++) { 
		this._jaxNodes[i].attr(attributes); 
	}
	return this;	
};

JAX.NodeArray.prototype.appendTo = function(node) {
	for (var i=0, len=this._jaxNodes.length; i<len; i++) {
		this._jaxNodes[i].appendTo(node);
	}
	return this;
};

JAX.NodeArray.prototype.removeFromDOM = function() {
	for (var i=0, len=this._jaxNodes.length; i<len; i++) { 
		var jaxNode = this._jaxNodes[i];
		jaxNode.removeFromDOM(); 
	}
	return this;
};

JAX.NodeArray.prototype.destroyItems = function() {
	for (var i=0, len=this._jaxNodes.length; i<len; i++) {
		this._jaxNodes[i].destroy(); 
	}
	return this;
};

JAX.NodeArray.prototype.forEachItem = function(cbk) {
	this._jaxNodes.forEach(cbk, this);
	return this;
};

JAX.NodeArray.prototype.filterItems = function(func) {
	return new JAX.NodeArray(this._jaxNodes.filter(func));
};

JAX.NodeArray.prototype.pushItem = function(node) {
	var JAXNode = JAX(node);
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
	var JAXNode = JAX(node);
	this.length++;
	return this._jaxNodes.unshift(JAXNode);
};

JAX.NodeArray.prototype.fade = function(type, duration, whenDone, lockElm) {
	var count = this._jaxNodes.length;

	var f = function() {
		count--;
		if (!count) { whenDone(); }
	};

	for (var i=0, len=this._jaxNodes.length; i<len; i++) {
		var fx = this._jaxNodes[i].fade(type, duration, lockElm);
		if (whenDone) { fx.callWhenDone(f); }
	}
	return this;
};

JAX.NodeArray.prototype.fadeTo = function(opacityValue, duration, whenDone, lockElm) {
	var count = this._jaxNodes.length;

	var f = function() {
		count--;
		if (!count) { whenDone(); }
	};

	for (var i=0, len=this._jaxNodes.length; i<len; i++) {
		var fx = this._jaxNodes[i].fadeTo(opacityValue, duration, lockElm);
		if (whenDone) { fx.callWhenDone(f); }
	}
	return this;
};


JAX.NodeArray.prototype.slide = function(type, duration, whenDone, lockElm) {
	var count = this._jaxNodes.length;

	var f = function() {
		count--;
		if (!count) { whenDone(); }
	};

	for (var i=0, len=this._jaxNodes.length; i<len; i++) {
		var fx = this._jaxNodes[i].slide(type, duration, lockElm);
		if (whenDone) { fx.callWhenDone(f); }
	}
	return this;
};

