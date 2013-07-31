/**
 * @fileOverview core.js - JAX - JAk eXtended
 * @author <a href="mailto:jerrymf@gmail.com">Marek Fojtl</a>
 * @version 2.09
 */

/**
 * @method Najde element, který odpovídá selector a vrátí instanci JAX.Node
 * @example
 * var jaxNode = JAX("#ads"); // vrati element s id ads
 *
 * @param {String|Node|JAX.Node} selector Řetězec splňující pravidla css3 (pro IE8 css2.1) selectoru, node nebo instance JAX.Node
 * @param {Node} [srcElement=window.document] node ve kterém se má hledat
 * @returns {JAX.Node}
 */
var JAX = function(selector, srcElement) {
	if (typeof(selector) == "string") {
		var srcElement = srcElement && srcElement.jaxNodeType ? srcElement.node() : srcElement;
			srcElement = srcElement || document;
		var foundElm = srcElement.querySelector(selector);
		var jaxelm = new JAX.Node(foundElm);

		return jaxelm;
	} else if (selector && typeof(selector) == "object" && selector.nodeType) {
		return new JAX.Node(selector);
	} else if (selector instanceof JAX.Node) {
		return selector;
	}

	return new JAX.Node(null);
};

/**
 * @method Najde elementy, které odpovídají selectoru a vrátí instanci JAX.NodeArray
 * @example
 * var jaxNodes = JAX.all("div.example"); // najde vsechny divy s className example a vrati instanci JAX.NodeArray
 *
 * @param {String|Node|JAX.Node} selector řetězec splňující pravidla css3 (pro IE8 css2.1) selectoru, node nebo instance JAX.Node
 * @param {Node} [srcElement=window.document] node ve kterém se má hledat
 * @returns {JAX.NodeArray}
 */
JAX.all = function(selector, srcElement) {
	if (typeof(selector) == "string") {
		var srcElement = srcElement && srcElement.jaxNodeType ? srcElement.node() : srcElement;
			srcElement = srcElement || document;
		var foundElms = srcElement.querySelectorAll(selector);
		var jaxelms = new Array(foundElms.length);

		for (var i=0, len=foundElms.length; i<len; i++) { jaxelms[i] = new JAX.Node(foundElms[i]); }

		return new JAX.NodeArray(jaxelms);
	} else if (selector && typeof(selector) == "object" && selector.nodeType) {
		return new JAX.NodeArray(new JAX.Node(selector));
	} else if (selector && selector instanceof JAX.Node) {
		return new JAX.NodeArray(selector);
	}
	
	return JAX.NodeArray(new JAX.Node(null));
};

/**
 * @method Vytvoří element na základě zadaných parametrů a vrátí JAX.Node instanci
 * @example
 * var elm = JAX.make("div#ads.column"); // vytvori element div s id ads a className column
 *
 * @param {String} tagString řetězec definující název tagu (lze přidat i název tříd(y) a id, se kterými se má vytvořit)
 * @param {Object} attrs asociativní pole atributů tagu
 * @param {Object} styles asociativní pole stylů, které se mají přiřadit do node.style
 * @param {documentElement} [srcDocument=window.document] document node, ve kterém se má vytvářet
 * @returns {JAX.Node}
 */
JAX.make = function(tagString, attrs, styles, srcDocument) {
	var attrs = attrs || {};
	var styles = styles || {};
	var srcDocument = srcDocument || document;

	if (!tagString || typeof(tagString) != "string") { 
		throw new Error("First argument must be string."); 
	}
	if (typeof(attrs) != "object") { 
		throw new Error("Second argument must be associative array."); 
	}
	if (typeof(styles) != "object") { 
		throw new Error("Third argument must be associative array."); 
	}
	if (typeof(srcDocument) != "object" || !srcDocument.nodeType && [9,11].indexOf(srcDocument.nodeType) == -1) { 
		throw new Error("Fourth argument must be document element."); 
	}

	var tagName = tagString.match(/^([a-zA-Z]+[a-zA-Z0-9]*)/g) || [];

	if (tagName.length == 1) {
		tagString = tagString.substring(tagName[0].length, tagString.length);
	} else {
		throw new Error("Tagname must be first in element definition");
	}
	
	var attrType = "";
	for (var i=0, len=tagString.length; i<len; i++) {
		var ch = tagString[i];
		if (ch == "#") { 
			attrType = "id"; 
			attrs["id"] = "";
		} else if (ch == ".") { 
			attrType = "className";
			if (attrs["className"]) { 
				attrs["className"] += " ";
			} else {
				attrs["className"] = "";
			}
		} else if (attrType) {
			attrs[attrType] += ch;
		}	
	}
	
	var createdNode = srcDocument.createElement(tagName);

	for (var p in attrs) { createdNode[p] = attrs[p]; }
	for (var p in styles) { createdNode.style[p] = styles[p]; }
	
	return new JAX.Node(createdNode);
};

/**
 * @method Vytvoří textový uzel a vrátí JAX.Node instanci
 * @example
 * var textNode = JAX.makeText("Hellow world");
 *
 * @param {String} text text, který má uzel obsahovat
 * @param {documentElement} [srcDocument=window.document] document node, ve kterém se má vytvářet
 * @returns {JAX.Node}
 */
JAX.makeText = function(text, srcDocument) {
	return new JAX.Node((srcDocument || document).createTextNode(text));
};

/**
 * @method Zjistí, jakého typu je zadaný parametr
 * @example
 * console.log(JAX.getTypeOf(10)); // vrati "number"
 * console.log(JAX.getTypeOf("10")); // vrati "string"
 *
 * @param value testovana hodnota
 * @param {documentElement} [srcDocument=window.document] document node, ve kterém se má vytvářet
 * @returns {string}
 */
JAX.getTypeOf = function(value) {
	if (typeof(value) == "number") {
		return "number";
	} else if (typeof(value) == "string") {
		return "string";
	} else if (typeof(value) == "undefined") {
		return "undefined";
	} else if (typeof(value) == "function") {
		return "function";
	} else if (value === true || value === false) {
		return "boolean";
	} else if (value === null) {
		return "null";
	}

	var toStringResult = Object.prototype.toString.call(value);

	if (toStringResult == "[object Array]") {
		return "array";	
	} else if (toStringResult == "[object Date]") {
		return "date";
	}

	return "object";
};
