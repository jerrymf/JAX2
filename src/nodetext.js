JAX.NodeText = JAK.ClassMaker.makeClass({
	NAME: "JAX.NodeText",
	VERSION: "0.9"
});

JAX.NodeText.prototype.jaxNodeType = 3;

JAX.NodeText.prototype.$constructor = function(node) {
	if (typeof(node) == "object" && node.nodeType && node.nodeType == 3) { 
		this._node = node;
		return;
	}

	new JAX.E({funcName:"JAX.NodeText.$constructor", caller:this.$constructor})
		.expected("first argument", "text node", node)
		.show(); 
};

JAX.NodeText.prototype.node = function() {
	return this._node;
};

JAX.NodeText.prototype.appendTo = function(node) {
	if (typeof(node) == "object" && ((node.nodeType && node.nodeType == 1) || (JAX.isJAXNode(node) && JAX.jaxNodeType == 1))) {
		var node = node.jaxNodeType ? node.node() : node;
		try {
			node.appendChild(this._node);
			return this;
		} catch(e) {}
	}

	new JAX.E({funcName:"JAX.NodeText.appendTo", caller:this.appendTo})
		.expected("first argument", "HTML element, JAX.NodeHTML, JAX.NodeDoc or JAX.NodeDocFrag instance", node)
		.show(); 
};

JAX.NodeText.prototype.appendBefore = function(node) {
	if (typeof(node) == "object" && ((node.nodeType && node.nodeType == 1) || (JAX.isJAXNode(node) && JAX.jaxNodeType == 1))) {
		var node = node.jaxNodeType ? node.node() : node;
		try {
			node.parentNode.insertBefore(this._node, node);
			return this;
		} catch(e) {}
	}

	new JAX.E({funcName:"JAX.NodeText.appendBefore", caller:this.appendBefore})
		.expected("first argument", "HTML element, text node, JAX.NodeHTML, JAX.NodeDoc or JAX.NodeText", node)
		.show();
};

JAX.NodeText.prototype.nSibling = function() {
	return this._node.nextSibling ? JAX.$$(this._node.nextSibling) : null;
};

JAX.NodeText.prototype.pSibling = function() {
	return this._node.previousSibling ? JAX.$$(this._node.previousSibling) : null;
};

JAX.NodeText.prototype.removeFromDOM = function() {
	try {
		this._node.parentNode.removeChild(this._node);
		return this;
	} catch(e) {};
};

JAX.NodeText.prototype.parent = function() {
	if (this._node.parentNode) { return JAX.NodeHTML.create(this._node.parentNode); }
	return null;
};

