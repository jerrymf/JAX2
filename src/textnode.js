JAX.TextNode = JAK.ClassMaker.makeClass({
	NAME: "JAX.TextNode",
	VERSION: "0.2",
	IMPLEMENT:JAX.INode
});

JAX.TextNode.prototype.jaxNodeType = 3;

JAX.TextNode.prototype.$constructor = function(node) {
	if (node && "nodeType" in node && node.nodeType == 3) { 
		this._node = node;
		return;
	}

	throw new Error("JAX.TextNode constructor accepts only text node as its parameter. See doc for more information.")
};

JAX.TextNode.prototype.node = function() {
	return this._node;
};

JAX.TextNode.prototype.appendTo = function(node) {
	if (node && (node.nodeType || node.jaxNodeType)) {
		try {
			var node = node.jaxNodeType ? node.node() : node;
			node.appendChild(this._node);
			return this;
		} catch(e) {}
	}

	throw new Error("JAX.TextNode.appendTo accepts only HTML element, JAX.HTMLElm or JAX.TextNode instance as its argument. See doc for more information.");
};

JAX.TextNode.prototype.appendBefore = function(node, nodeBefore) {
	if (node && (node.nodeType || node.jaxNodeType)) {
		try {
			var node = node.jaxNodeType ? node.node() : node;
			node.parentNode.insertBefore(this._node, node);
		} catch(e) {}
	}

	throw new Error("JAX.TextNode.appendBefore accepts only HTML element, JAX.HTMLElm or JAX.TextNode instance as its argument. See doc for more information.");
};

JAX.TextNode.prototype.removeFromDOM = function() {
	try {
		this._node.parentNode.removeChild(this._node);
	} catch(e) {}

	return this;
};

JAX.TextNode.prototype.parent = function() {
	if (this._node.parentNode) { return JAX.HTMLElm.create(this._node.parentNode); }
	return null;
};

