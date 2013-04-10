JAX = {
	VERSION: "1.94b"
};

JAX.$ = function(selector, srcElement) {
	if (JAX.isString(selector)) {
		var srcElement = srcElement || document;
		var foundElms = srcElement.querySelectorAll(query);
		var jaxelms = [];

		for (var i=0, len=foundElms.length; i<len; i++) { jaxelms.push(new JAX.HTMLElm(foundElms[i])); }

		return jaxelms;
	} else if ("nodeType" in selector && selector.nodeType == 1) {
		return [new JAX.HTMLElm(selector)];
	} else if ("nodeType" in selector && selector.nodeType == 9) {
		return [new JAX.HTMLDoc(selector)];
	} else if (selector instanceof JAX.HTMLElm) {
		return [new JAX.HTMLElm(selector)];
	}
	
	throw new Error("JAX.$ accepts only String, html element, document or instance of JAX.HTMLElm class as the first argument. See doc for more information."); 
};

JAX.$$ = function(selector, srcElement) {
	if (JAX.isString(selector)) {
		var srcElement = srcElement || document;
		var foundElm = srcElement.querySelector(selector);
		var jaxelm = foundElm ? new JAX.HTMLElm(foundElm) : null;

		return jaxelm;
	} else if ("nodeType" in selector && selector.nodeType == 1) {
		return new JAX.HTMLElm(selector);
	} else if ("nodeType" in selector && selector.nodeType == 9) {
		return new JAX.HTMLDoc(selector);
	} else if (selector instanceof JAX.HTMLElm) {
		return selector;
	}

	throw new Error("JAX.$$ accepts only String, html element, document or instance of JAX.HTMLElm class as the first argument. See doc for more information.");
};

JAX.make = function(tagString, html, srcDocument) {
	var html = html || "";
	var tagName = "";
	var type="tagname";
	var attributes = {innerHTML:html};
	var currentAttrName = "";
	var inAttributes = false;

	if (!JAX.isString(html) && !JAX.isNumber(html)) { throw new Error("JAX.make: Second parameter 'html' must be a string or number"); }
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

	var elm = new JAX.HTMLElm(JAK.mel(tagName, attributes, {}, srcDocument || document));
	return elm;
};

JAX.makeText = function(text) {
	return new JAX.TextNode(JAK.ctext(text));
};

JAX.isNumber = function(value) {
	return typeof(value) == "number";
};

JAX.isNumeric = function(value) {
	var val = parseFloat(value);
	return val === (value * 1) && !isNaN(val) && value != Infinity;
};

JAX.isString = function(value) {
	return typeof(value) == "string";
};

JAX.isArray = function(value) {
	return value instanceof Array;
};

JAX.isFunction = function(value) {
	return value instanceof Function;
};

JAX.isBoolean = function(value) {
	return value === true || value === false;
};

JAX.isDate = function(value) {
	return value instanceof Date;
};

