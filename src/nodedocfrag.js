JAX.NodeDocFrag = JAK.ClassMaker.makeClass({
	NAME: "JAX.NodeDocFrag",
	VERSION: "0.9"
});

JAX.NodeDocFrag.prototype.jaxNodeType = 11;

JAX.NodeDocFrag.prototype.$constructor = function(doc) {
	if (typeof(doc) == "object" && doc.nodeType && (doc.nodeType == 9 || doc.nodeType == 11)) {
		switch(doc.nodeType) {
			case 9:
				this._doc = doc;
				this._node = this._doc.createDocumentFragment();
			break;
			case 11:
				this._node = doc;
				this._doc = doc.ownerDocument;
			break;			
		}
	}

	new JAX.E({funcName:"JAX.NodeDocFrag.$constructor", caller:this.$constructor})
		.expected("first argument", "document element or documentFragment element", doc)
		.show();

};

JAX.NodeDocFrag.prototype.$destructor = function() {
	this.clear();
	this._node = null;
};

JAX.NodeDocFrag.prototype.node = function() {
	return this._node;
};

JAX.NodeDocFrag.prototype.$ = function(selector) {
	return JAX.$(selector, this._node);
};

JAX.NodeDocFrag.prototype.$$ = function(selector) {
	return JAX.$$(selector, this._node);
};

JAX.NodeDocFrag.prototype.html = function(innerHTML) {
	var div = document.createElement("div");

	if (!arguments.length) { 
		return div.appendChild(this._node).innerHTML;
	} else if (typeof(innerHTML) == "string") {
		div.innerHTML = innerHTML;
		while(div.firstChild) { this._node.appendChild(div.firstChild); }
		return this;
	}
	
	new JAX.E({funcName:"JAX.NodeDocFrag.html", caller:this.html})
		.expected("first argument", "string", innerHTML)
		.message("You can call it with no argmuments. Then it will return string with html.")
		.show();
};

JAX.NodeDocFrag.prototype.add = function() {
	var nodes = [].slice.call(arguments);

	if (nodes.length == 1) { nodes = nodes[0]; }

	if (nodes && nodes instanceof Array) { 
		for (var i=0, len=nodes.length; i<len; i++) { this.add(nodes[i]); }
	} else if (nodes && (nodes.nodeType || nodes.jaxNodeType)) {
		var node = nodes.jaxNodeType ? nodes.node() : nodes;
		try {
			this._node.appendChild(node);
			return this;
		} catch(e) {}
	}
	
	new JAX.E({funcName:"JAX.NodeDocFrag.add", caller:this.add})
		.expected("arguments", "HTML node, textnode, JAX.NodeHTML, JAX.NodeDocFrag or JAX.NodeText instance", innerHTML)
		.show();
};

JAX.NodeDocFrag.prototype.addBefore = function(node, nodeBefore) {
	var error = 3;

	if (typeof(node) == "object" && (node.nodeType || JAX.isJAXNode(node))) { var node = node.jaxNodeType ? node.node() : node; error -= 1;}
	if (typeof(nodeBefore) == "object" && (nodeBefore.nodeType || JAX.isJAXNode(nodeBefore))) { var nodeBefore = nodeBefore.jaxNodeType ? nodeBefore.node() : nodeBefore; error -= 2;}

	if (error) {
		var e = new JAX.E({funcName:"JAX.NodeDocFrag.addBefore", caller:this.addBefore});
		if (error & 1) { e.expected("first argument", "HTML element, textnode, JAX.nodeHTML, JAX.NodeDocFrag or JAX.NodeText instance", node); }
		if (error & 2) { e.expected("second argument", "HTML node, textnode, JAX.NodeHTML or JAX.NodeText instance", nodeBefore); }
		e.show();
	}

	try {
		this._node.insertBefore(node, nodeBefore);
		return this;
	} catch(e) {}
};

JAX.NodeDocFrag.prototype.appendTo = function(node) {
	if (typeof(node) == "object" && (node.nodeType || JAX.isJAXNode(node))) { 
		var node = node.jaxNodeType ? node.node() : node;
		try {
			node.appendChild(this._node);
			return this;
		} catch(e) {}
	}

	new JAX.E({funcName:"JAX.NodeDocFrag.appendTo", caller:this.appendTo})
		.expected("first argument", "HTML element, JAX.NodeHTML or JAX.NodeDocFrag instance", node)
		.show();
};

JAX.NodeDocFrag.prototype.appendBefore = function(node) {
	if (typeof(node) == "object" && (node.nodeType || JAX.isJAXNode(node))) {
		var node = node.jaxNodeType ? node.node() : node;
		try {
			node.parentNode.insertBefore(this._node, node);
		} catch(e) {}
	}

	new JAX.E({funcName:"JAX.NodeDocFrag.appendBefore", caller:this.appendBefore})
		.expected("first argument", "HTML element, text node, JAX.NodeHTML, or JAX.NodeText instance", node)
		.show();
};

JAX.NodeDocFrag.prototype.childs = function() {
	var nodes = [];
	for (var i=0, len=this._node.childNodes.length; i<len; i++) {
		var childNode = this._node.childNodes[i];
		if (childNode.nodeType == 3) { nodes.push(new JAX.NodeText(childNode)); continue; }
		nodes.push(JAX.NodeHTML.create(childNode));
	}
	return nodes;
};

JAX.NodeDocFrag.prototype.clear = function() {
	JAK.DOM.clear(this._node);
	return this;
};

JAX.NodeDocFrag.prototype.contains = function(node) {
	if (typeof(node) == "object" && (node.nodeType || JAX.isJAXNode(node))) {
		var elm = JAX.isJAXNode(node) ? node.node().parentNode : node.parentNode;
		while(elm) {
			if (elm == this._node) { return true; }
			elm = elm.parentNode;
		}
		return false;
	}
	
	new JAX.E({funcName:"JAX.NodeDocFrag.contains", caller:this.contains})
		.expected("first argument", "HTML element, text node, JAX.NodeHTML, or JAX.NodeText instance", node)
		.show();
};

