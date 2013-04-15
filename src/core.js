JAX = {
	VERSION: "1.96b"
};

JAX.allnodes = {};

JAX.$ = function(selector, srcElement) {
	if (JAX.isString(selector)) {
		var srcElement = srcElement || document;
		var foundElms = srcElement.querySelectorAll(selector);
		var jaxelms = [];

		for (var i=0, len=foundElms.length; i<len; i++) { jaxelms.push(JAX.NodeHTML.create(foundElms[i])); }

		return new JAX.NodeArray(jaxelms);
	} else if ("nodeType" in selector) {
		switch(selector.nodeType) {
			case 1: return new JAX.NodeArray(JAX.NodeHTML.create(selector));
			case 3: return new JAX.NodeArray(new JAX.NodeText(selector));
			case 9: return new JAX.NodeArray(new JAX.NodeDoc(selector));
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
	} else if ("nodeType" in selector) {
		switch(selector.nodeType) {
			case 1: return JAX.NodeHTML.create(selector);
			case 3: return new JAX.NodeText(selector);
			case 9: return new JAX.NodeDoc(selector);
		}
	} else if (JAX.isJAXNode(selector)) {
		return selector;
	}

	return false;
};

JAX.make = function(tagString, html, srcDocument) {
	var attributes = html ? {innerHTML:html} : {};
	var tagName = "";
	var type="tagname";
	var currentAttrName = "";
	var inAttributes = false;

	if (html && !JAX.isString(html) && !JAX.isNumber(html)) { throw new Error("JAX.make: Second parameter 'html' must be a string or number"); }
	if (tagString.length && ".#[=] ".indexOf(tagString[0]) > -1) { throw new Error("JAX.make: Tagname must be first."); }

	for (var i=0, len=tagString.length; i<len; i++) {
		var character = tagString[i];

		switch(character) {
			case ".":
				if (inAttributes && type == "attribute-value") { break; }

				if (!("className" in attributes)) { 
					attributes["className"] = ""; 
				} else {
					attributes["className"] += " "; 
				}

				type="attribute-value"; 
				currentAttrName = "className";
				continue;
			break;
			case "#":
				if (inAttributes && type == "attribute-value") { break; }

				if (!("id" in attributes)) {
					attributes["id"] = "";
				} else {	
					attributes["id"] += " ";
				}

				type="attribute-value"; 
				currentAttrName = "id";
				continue;
			break;
			case "[":
				type="attribute-name"; 
				currentAttrName = "";
				inAttributes = true;
				continue;
			break;
			case "=":
				if (type != "attribute-name") { break; }
				attributes[currentAttrName] = "";
				type="attribute-value";
				continue; 
			break;
			case "]":
				type="";
				inAttributes = false;
				continue;
			break;
			case " ":
				if (type != "attribute-value") { continue; }
			break;
		}

		switch(type) {
			case "tagname": 
				tagName += (character + ""); 
			break;
			case "attribute-name":
				currentAttrName += (character + "");
			break;
			case "attribute-value":
				attributes[currentAttrName] += (character + "");
			break;
		}

	}

	var elm = JAX.NodeHTML.create(JAK.mel(tagName, attributes, {}, srcDocument || document));
	return elm;
};

JAX.makeText = function(text) {
	return new JAX.NodeText(JAK.ctext(text));
};

JAX.isNumber = function(value) {
	return typeof(value) == "number";
};

JAX.isNumeric = function(value) {
	return isFinite(value);
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
	return node instanceof JAX.NodeHTML || node instanceof JAX.NodeText || node instanceof JAX.NodeDoc;
}

