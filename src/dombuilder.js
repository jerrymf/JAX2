JAX.DOMBuilder = JAK.ClassMaker.makeClass({
	NAME: "JAX.DOMBuilder",
	VERSION: "0.2"
});

JAX.DOMBuilder.prototype.$constructor = function(doc) {
	this._doc = doc || document;
	this._dom = { container: this._doc.createDocumentFragment() };
	this._pointerJaxNode = null;
	this._stack = [];
};

JAX.DOMBuilder.prototype.open = function(element, attributes, styles) {
	var jaxNode = null;

	if (JAX.isString(element)) {
		var jaxNode = JAX.make(element, "", this._doc);
	} else if (element.nodeType) {
		var jaxNode = JAX.$$(element);
	}

	if (jaxNode && jaxNode.jaxNodeType != 9) {
		if (attributes) { jaxNode.attr(attributes); }
		if (style) { jaxNode.style(styles); }
		if (!this._pointerJaxNode) {
			this._stack.push(this._pointerJaxNode);
			this._pointerJaxNode = jaxNode.node();
			this._dom.container.appendChild(jaxNode.node()); 
		} else {
			this._pointerJaxNode.appendChild(jaxNode);
			this._stack.push(this._pointerJaxNode);
			this._pointerJaxNode = jaxNode;
		}
		return jaxNode;
	}

	throw new Error("JAX.DOMBuilder.open: unsupported element");
}

JAX.DOMBuilder.prototype.add = function(node, attributes, styles) {
	if (JAX.isString(node)) {
		var jaxNode = JAX.make(node);
	} else if (node.nodeType) {
		var jaxNode = JAX.$$(node);
	} else if (!JAX.isJAXNode(node) && node.jaxNodeType == 9) {
		throw new Error("JAX.DOMBuilder.add: argument can be only string, node or instance of JAX.NodeHTML or JAX.NodeText");
	}

	if (attributes) { jaxNode.attr(attributes); }
	if (style) { jaxNode.style(styles); }

	if (this._pointerJaxNode) {
		this._pointerJaxNode.add(jaxNode.node());
	} else {
		this._dom.container.appendChild(jaxNode.node());
	}

	return jaxNode;
};

JAX.DOMBuilder.prototype.addText = function(txt) {
	if (JAX.isString(txt)) {
		var jaxNode = JAX.makeText(node);

		if (this._pointerJaxNode) {
			this._pointerJaxNode.add(jaxNode.node());
		} else {
			this._dom.container.appendChild(jaxNode.node());
		}

		return jaxNode;
	}

	throw new Error("JAX.DOMBuilder.addText: argument can be only string");
};

JAX.DOMBuilder.prototype.close = function() {
	if (this._stack.length) {
		this._pointerJaxNode = this._stack.pop();
		return;
	}

	throw new Error("JAX.DOMBuilder.close: there are no opened elements, so you can not close null element");
};

JAX.DOMBuilder.prototype.appendTo = function(node) {
	var jaxNode = null;

	if (node.nodeType) {
		var jaxNode = JAX.$$(node);
	} else if (JAX.isJAXNode(node) && node.jaxNodeType == 1) {
		var jaxNode = node;
	} else {
		throw new Error("JAX.DOMBuilder.appendTo: argument can be only html node or instance of JAX.NodeHTML");
	}

	jaxNode.add(this._dom.container);
};

JAX.DOMBuilder.prototype.getDOM = function() {
	return this._dom.container;
};

JAX.DOMBuilder.prototype.clear = function() {
	JAK.DOM.clear(this._dom.container);
	this._stack = [];
};

