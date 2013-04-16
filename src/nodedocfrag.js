JAX.NodeDocFrag = JAK.ClassMaker.makeClass({
	NAME: "JAX.NodeDocFrag",
	VERSION: "0.1"
});

JAX.NodeDocFrag.prototype.jaxNodeType = 11;

JAX.NodeDocFrag.prototype.$constructor = function(docFrag) {
	if (docFrag && docFrag.nodeType && docFrag.nodeType == 11) {  	
		this._node = docFrag;
		return;
	} else if (docFrag) {
		throw new Error("JAX.NodeDocFrag constructor accepts only documentFragment as its argument. See doc for more information.");
	}
	
	this._node = document.createDocumentFragment();
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
	} else if (JAX.isString(innerHTML)) {
		div.innerHTML = innerHTML;
		while(div.firstChild) { this._node.appendChild(div.firstChild); }
		return this;
	}
	
	throw new Error("JAX.NodeDocFrag.html accepts only string as its argument. See doc for more information. ");	
};

JAX.NodeDocFrag.prototype.add = function() {
	var nodes = Array.prototype.slice.call(arguments);

	if (nodes.length == 1) { nodes = nodes[0]; }

	if (nodes && nodes instanceof Array) { 
		for (var i=0, len=nodes.length; i<len; i++) { this.add(nodes[i]); }
	} else if (nodes && (nodes.nodeType || nodes.jaxNodeType)) {
		try {
			var node = nodes.jaxNodeType ? nodes.node() : nodes;
			this._node.appendChild(node);
			return this;
		} catch(e) {}
	} else if (!nodes) { 
		console.warn("JAX.NodeDocFrag.add is called with no argument, null or undefined."); 
		return this;
	}
	
	throw new Error("JAX.NodeDocFrag.add accepts only HTML node, textnode, JAX.NodeDocFrag or JAX.NodeText instance as its parameter. See doc for more information."); 
};

JAX.NodeDocFrag.prototype.addBefore = function(node, nodeBefore) {
	if (node && (node.nodeType || JAX.isJAXNode(node)) && (nodeBefore.nodeType || JAX.isJAXNode(nodeBefore))) {
		try {
			var node = JAX.isJAXNode(node) ? node.node() : node;
			var nodeBefore = nodeBefore.jaxNodeType ? nodeBefore.node() : nodeBefore;
			this._node.insertBefore(node, nodeBefore);
			return this;
		} catch(e) {}
	}

	throw new Error("JAX.NodeDocFrag.addBefore accepts only HTML element, textnode, JAX.NodeDocFrag or JAX.NodeText instance as its first argument. See doc for more information.");
};

JAX.NodeDocFrag.prototype.appendTo = function(node) {
	if (node && (node.nodeType || JAX.isJAXNode(node))) { 
		try {
			var node = JAX.isJAXNode(node) ? node.node() : node;
			node.appendChild(this._node);
			return this;
		} catch(e) {}
	}

	throw new Error("JAX.NodeDocFrag.appendTo accepts only HTML element, JAX.NodeDocFrag or JAX.NodeText instance as its argument. See doc for more information.");
};

JAX.NodeDocFrag.prototype.appendBefore = function(node) {
	if (node && (node.nodeType || JAX.isJAXNode(node))) {
		try {
			var node = JAX.isJAXNode(node) ? node.node() : node;
			node.parentNode.insertBefore(this._node, node);
		} catch(e) {}
	}

	throw new Error("JAX.NodeDocFrag.appendBefore accepts only HTML element, JAX.NodeDocFrag or JAX.NodeText instance as its argument. See doc for more information."); 
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
	if (node && (node.nodeType || JAX.isJAXNode(node))) {
		var elm = JAX.isJAXNode(node) ? node.node().parentNode : node.parentNode;
		while(elm) {
			if (elm == this._node) { return true; }
			elm = elm.parentNode;
		}
		return false;
	}
	
	throw new Error("JAX.NodeDocFrag.contains accepts only HTML element, JAX.NodeDocFrag or JAX.NodeText instance as its argument. See doc for more information.");
};

