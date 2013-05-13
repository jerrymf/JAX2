/* version 1.99 */

var JAX = function(selector, srcElement) {
	if (typeof(selector) == "string") {
		var srcElement = srcElement || document;
		var foundElm = srcElement.querySelector(selector);
		var jaxelm = foundElm ? JAX.Node.create(foundElm) : null;

		return jaxelm;
	} else if (typeof(selector) == "object" && selector.nodeType) {
		return JAX.Node.create(selector);
	} else if (selector instanceof JAX.Node) {
		return selector;
	}

	return false;
};

JAX.all = function(selector, srcElement) {
	if (typeof(selector) == "string") {
		var srcElement = srcElement || document;
		var foundElms = srcElement.querySelectorAll(selector);
		var jaxelms = new Array(foundElms.length);

		for (var i=0, len=foundElms.length; i<len; i++) { jaxelms[i] = JAX.Node.create(foundElms[i]); }

		return new JAX.NodeArray(jaxelms);
	} else if (typeof(selector) == "object" && selector.nodeType) {
		return new JAX.NodeArray(JAX.Node.create(selector));
	} else if (selector instanceof JAX.Node) {
		return new JAX.NodeArray(selector);
	}
	
	return false;
};

JAX.TAG_RXP = /^([a-zA-Z]+[a-zA-Z0-9]*)/g;
JAX.CLASS_ID_RXP = /([\.#])([^\.#]*)/g;

JAX.make = function(tagString, attrs, styles, srcDocument) {
	var attrs = attrs || {};
	var styles = styles || {};
	var srcDocument = srcDocument || document;

	if (!tagString || typeof(tagString) != "string") { throw new Error("First argument must be string."); }
	if (typeof(attrs) != "object") { throw new Error("Second argument must be associative array."); }
	if (typeof(styles) != "object") { throw new Error("Third argument must be associative array."); }
	if (typeof(srcDocument) != "object" || !srcDocument.nodeType && [9,11].indexOf(srcDocument.nodeType) == -1) { throw new Error("Fourth argument must be document element."); }

	var tagName = tagString.match(JAX.TAG_RXP) || [];

	if (tagName.length == 1) {
		tagName = tagName[0];
		tagString = tagString.substring(tagName.length, tagString.length);
	} else {
		throw new Error("Tagname must be first in element definition");
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

	var createdNode = srcDocument.createElement(tagName);

	for (var p in attrs) { createdNode[p] = attrs[p]; }
	for (var p in styles) { createdNode.style[p] = styles[p]; }

	var f = Object.create(JAX.Node.prototype);
	f._init(createdNode);
	
	return f;
};

JAX.makeText = function(text, doc) {
	return JAX.Node.create((doc || document).createTextNode(text));
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
	return Object.prototype.toString.call(value) == "[object Array]";
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
	return node instanceof JAX.Node;
}

