JAX = {
	VERSION: "1.97b"
};

JAX.TAG_RXP = /^([a-zA-Z]*)/g;
JAX.CLASS_ID_RXP = /([\.#])([^\.#]*)/g;
JAX.allnodes = [];

JAX.$ = function(selector, srcElement) {
	if (JAX.isString(selector)) {
		var srcElement = srcElement || document;
		var foundElms = srcElement.querySelectorAll(selector);
		var jaxelms = new Array(foundElms.length);

		for (var i=0, len=foundElms.length; i<len; i++) { jaxelms[i] = JAX.NodeHTML.create(foundElms[i]); }

		return new JAX.NodeArray(jaxelms);
	} else if (typeof(selector) == "object" && selector.nodeType) {
		switch(selector.nodeType) {
			case 1: return new JAX.NodeArray(JAX.NodeHTML.create(selector));
			case 3: return new JAX.NodeArray(new JAX.NodeText(selector));
			case 9: return new JAX.NodeArray(new JAX.NodeDoc(selector));
			case 11: return new JAX.NodeArray(new JAX.NodeDocFrag(selector));
		}
	} else if (JAX.isJAXNode(selector)) {
		return new JAX.NodeArray(selector);
	}
	
	return false;
};

JAX.$$ = function(selector, srcElement) {
	if (JAX.isString(selector)) {
		var srcElement = srcElement || document;
		var foundElm = srcElement.querySelector(selector);
		var jaxelm = foundElm ? JAX.NodeHTML.create(foundElm) : null;

		return jaxelm;
	} else if (typeof(selector) == "object" && selector.nodeType) {
		switch(selector.nodeType) {
			case 1: return JAX.NodeHTML.create(selector);
			case 3: return new JAX.NodeText(selector);
			case 9: return new JAX.NodeDoc(selector);
			case 11: return new JAX.NodeDocFrag(selector);
		}
	} else if (JAX.isJAXNode(selector)) {
		return selector;
	}

	return false;
};

JAX.make = function(tagString, attrs, styles, srcDocument) {
	var attrs = attrs || {};
	var styles = styles || {};

	if (!tagString || typeof(tagString) != "string") { 
		new JAX.E({funcName:"JAX.make", caller:this.make})
			.expected("first argument", "string", tagString)
			.show(); 
	}

	if (attrs && typeof(attrs) != "object") {
		new JAX.E({funcName:"JAX.make", caller:this.make})
			.expected("second argument", "associative array", attrs)
			.show(); 
	}

	if (styles && typeof(styles) != "object") {
		new JAX.E({funcName:"JAX.make", caller:this.make})
			.expected("third argument", "associative array", styles)
			.show(); 
	}

	if (srcDocument && (typeof(srcDocument) != "object" || (!srcDocument.nodeType || (srcDocument.nodeType != 9 && srcDocument.nodeType != 11)))) {
		new JAX.E({funcName:"JAX.make", caller:this.make})
			.expected("third argument", "associative array", srcDocument)
			.show(); 
	}

	var tagName = tagString.match(JAX.TAG_RXP) || [];

	if (tagName.length == 1) {
		tagName = tagName[0];
		tagString = tagString.substring(tagName.length, tagString.length);
	} else {
		new JAX.E({funcName:"JAX.make", value:tagString, caller:this.make})
			.expected("first argument", "tagname first", tagString)
			.show();
	}

	tagString.replace(JAX.CLASS_ID_RXP, function(match, p1, p2) {
		var property = p1 == "#" ? "id" : "className";

		if (!(property in attrs)) { 
			attrs[property] = ""; 
		} else {
			attrs[property] += " ";
		}

		attrs[property] += p2;
	});

	var createdNode = (srcDocument || document).createElement(tagName);

	for (var p in attrs) { createdNode[p] = attrs[p]; }
	for (var p in styles) { createdNode.style[p] = styles[p]; }

	var f = Object.create(JAX.NodeHTML.prototype);
	f._init(createdNode);
	
	return f;
};

JAX.makeText = function(text, doc) {
	return new JAX.NodeText((doc || document).createTextNode(text));
};

JAX.isNumber = function(value) {
	return typeof(value) == "number";
};

JAX.isNumeric = function(value) {
	var val = parseFloat(value);
	return val === value * 1 && isFinite(val);
};

JAX.isString = function(value) {
	return typeof(value) == "string";
};

JAX.isArray = function(value) {
	return value instanceof Array;
};

JAX.isFunction = function(value) {
	return typeof(value) == "function";
};

JAX.isBoolean = function(value) {
	return value === true || value === false;
};

JAX.isDate = function(value) {
	return value instanceof Date;
};

JAX.isJAXNode = function(node) {
	return node instanceof JAX.NodeHTML || node instanceof JAX.NodeText || node instanceof JAX.NodeDoc || node instanceof JAX.NodeDocFrag;
}

