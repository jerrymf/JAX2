JAX = {
	VERSION: "1.97b"
};

JAX.allnodes = [];

JAX.$ = function(selector, srcElement) {
	if (JAX.isString(selector)) {
		var srcElement = srcElement || document;
		var foundElms = srcElement.querySelectorAll(selector);
		var jaxelms = [];

		for (var i=0, len=foundElms.length; i<len; i++) { jaxelms.push(JAX.NodeHTML.create(foundElms[i])); }

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

JAX.make = function(tagString, html, srcDocument) {
	var attributes = html ? {innerHTML:html} : {};
	var tagName = "";
	var type="tagname";
	var currentAttrName = "";
	var inAttributes = false;

	if (!tagString || typeof(tagString) != "string") { 
		new JAX.E({funcName:"JAX.make", value:tagString, caller:this.make.caller})
			.message("first argument", "string", tagString)
			.show(); 
	} else if (html && typeof(html) != "string" && typeof(html) != "number") {
		new JAX.E({funcName:"JAX.make", value:html, caller:this.make.caller})
			.message("second argument", "string or number", html)
			.show(); 
	} else if (".#[=] ".indexOf(tagString[0]) > -1) {
		new JAX.E({funcName:"JAX.make", value:tagString, caller:this.make.caller})
			.message("first argument", "tagname first", tagString)
			.show(); 
	}

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

	var d = srcDocument || document;
	var createdNode = d.createElement(tagName);
	for (var p in attributes) { createdNode[p] = attributes[p]; }

	return JAX.NodeHTML.create(createdNode);
};

JAX.makeText = function(text) {
	return new JAX.NodeText(JAK.ctext(text));
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

