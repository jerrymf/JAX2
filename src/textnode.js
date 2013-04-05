JAX.TextNode = JAK.ClassMaker.makeClass({
	NAME: "JAX.TextNode",
	VERSION: "0.1",
	IMPLEMENTS:JAX.INode
});

JAX.TextNode.prototype.$constructor = function(node) {
	if (!("nodeType" in node) || node.nodeType != 3) { throw new Error("JAX.TextNode constructor accepts only HTML node as its parameter. See doc for more information.") }
	this.NODE = node;
};

JAX.TextNode.prototype.appendTo = function(node) {
	var node = node instanceof JAX.HTMLElm ? node.NODE : node;
	node.appendChild(this.NODE);
	return this;
};

JAX.TextNode.prototype.appendBefore = function(node) {
	var node = node instanceof JAX.HTMLElm ? node.NODE : node;
	node.parentNode.insertBefore(this.NODE, node);
	return this;
};

JAX.TextNode.prototype.removeFromDOM = function() {
	try {
		this.NODE.parentNode.removeChild(this.NODE);
	} catch(e) {};
	return this;
};

JAX.TextNode.prototype.getParent = function() {
	if (this.NODE.parentNode) { return new JAX.HTMLElm(this.NODE.parentNode); }
	return null;
};

