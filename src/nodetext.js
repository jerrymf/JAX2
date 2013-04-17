JAX.NodeText = JAK.ClassMaker.makeClass({
	NAME: "JAX.NodeText",
	VERSION: "0.21"
});

JAX.NodeText.prototype.jaxNodeType = 3;

JAX.NodeText.prototype.$constructor = function(node) {
	if (typeof(node) == "object" && node.nodeType && node.nodeType == 3) { 
		this._node = node;
		return;
	}

	throw new Error("JAX.NodeText constructor accepts only text node as its parameter. See doc for more information.")
};

JAX.NodeText.prototype.node = function() {
	return this._node;
};

JAX.NodeText.prototype.appendTo = function(node) {
	if (typeof(node) == "object" && (node.nodeType || JAX.isJAXNode(node))) {
		var node = node.jaxNodeType ? node.node() : node;
		try {
			node.appendChild(this._node);
			return this;
		} catch(e) {}
	}

	throw new Error("JAX.NodeText.appendTo accepts only HTML element, JAX.NodeHTML or JAX.NodeText instance as its argument. See doc for more information.");
};

JAX.NodeText.prototype.appendBefore = function(node, nodeBefore) {
	if (typeof(node) == "object" && (node.nodeType || JAX.isJAXNode(node))) {
		var node = node.jaxNodeType ? node.node() : node;
		try {
			node.parentNode.insertBefore(this._node, node);
		} catch(e) {}
	}

	throw new Error("JAX.NodeText.appendBefore accepts only HTML element, JAX.NodeHTML or JAX.NodeText instance as its argument. See doc for more information.");
};

JAX.NodeText.prototype.removeFromDOM = function() {
	try {
		this._node.parentNode.removeChild(this._node);
	} catch(e) {}

	return this;
};

JAX.NodeText.prototype.parent = function() {
	if (this._node.parentNode) { return JAX.NodeHTML.create(this._node.parentNode); }
	return null;
};

