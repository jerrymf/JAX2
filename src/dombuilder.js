JAX.DOMBuilder = JAK.ClassMaker.makeClass({
	NAME: "JAX.DOMBuilder",
	VERSION: "0.1"
});

JAX.DOMBuilder.prototype.$constructor = function(doc) {
	this._doc = doc || document;
	this._container = document.createDocumentFragment();
	this._pointerJaxNode = null;
	this._stack = [];
};


JAX.DOMBuilder.prototype.open = function(element) {
	var jaxNode = null;

	if (JAX.isString(element)) {
		var jaxNode = JAX.make(element, "", this._doc);
	} else if (element.nodeType) {
		var jaxNode = JAX.$$(element);
	}

	if (jaxNode && jaxNode.nodeType != 9) { 
		if (!this._pointerJaxNode) {
			this._stack.push(this._pointerJaxNode);
			this._pointerJaxNode = jaxNode.node();
			this._container.appendChild(jaxNode.node()); 
			return;
		}
		this._pointerJaxNode.appendChild(jaxNode);
		this._stack.push(this._pointerJaxNode);
		this._pointerJaxNode = jaxNode;
		return;
	}

	throw new Error("JAX.DOMBuilder.open: unsupported element");
}

JAX.DOMBuilder.prototype.add = function() {
	if (this._pointerJaxNode) {
		this._pointerJaxNode.add(Array.prototype.slice.call(arguments));
	}
};

JAX.DOMBuilder.prototype.addText = function(txt) {
	if (this._pointerJaxNode) {
		this._pointerJaxNode.add(JAX.makeText(txt));
	}
};

JAX.DOMBuilder.prototype.close = function() {
	if (this._stack.length) {
		this._pointerJaxNode = this._stack.pop();
		return;
	}

	throw new Error("JAX.DOMBuilder.close: there are no opened elements, so you can not close null element");
};

