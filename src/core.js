/**
 * @fileOverview core.js - JAX - JAk eXtended
 * @author <a href="mailto:jerrymf@gmail.com">Marek Fojtl</a>
 * @version 2.11
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
	if (selector && selector.jaxNodeType) {
		return selector;
	}

	if (!selector) {
		return new JAX.NullNode();
	}

	if (typeof(selector) == "string") {
		var srcElement = (srcElement && srcElement.jaxNodeType ? srcElement.node() : srcElement) || document;
		var foundElm = srcElement.querySelector(selector);
		var nodeType = foundElm ? foundElm.nodeType : -1;
	} else if (typeof(selector) == "object" && selector.nodeType) {
		var nodeType = selector.nodeType;
		var foundElm = selector;
	} else if (("window" in selector) && typeof(selector.window) == "object" && ("window" in selector.window)) {
		var nodeType = -2;
		var foundElm = selector;
	} else {
		var nodeType = -1;
		var foundElm = null;
	}

	switch(nodeType) {
		case -2:
			return new JAX.Window(foundElm);
		case -1:
			return new JAX.NullNode();
		case 1:
			return new JAX.Element(foundElm);
		case 3:
		case 8:
			return new JAX.TextNode(foundElm);
		case 9:
			return new JAX.Document(foundElm);
		case 11:
			return new JAX.DocumentFragment(foundElm);
	}
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
	if (!selector) {
		return JAX.NodeArray(null);
	}

	if (typeof(selector) == "string") {
		if (arguments.length == 1) { 
			var srcElement = document; 
		} else if (arguments.length > 1 && srcElement) {
			var srcElement = srcElement.jaxNodeType ? srcElement.node() : srcElement;
		} else {
			return new JAX.NodeArray([]);
		}

		var foundElms = srcElement.querySelectorAll(selector);
		var jaxelms = new Array(foundElms.length);

		for (var i=0, len=foundElms.length; i<len; i++) { jaxelms[i] = JAX(foundElms[i]); }

		return new JAX.NodeArray(jaxelms);
	} else if (typeof(selector) == "object" && selector.nodeType) {
		return new JAX.NodeArray(JAX(selector));
	} else if (selector.jaxNodeType) {
		return new JAX.NodeArray(selector);
	}
	
	return JAX.NodeArray([]);
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
		JAX.Report.error("First argument must be string.");
		return JAX(null); 
	}
	if (typeof(attrs) != "object") { 
		JAX.Report.error("Second argument must be associative array."); 
		attrs = {};
	}
	if (typeof(styles) != "object") { 
		JAX.Report.error("Third argument must be associative array."); 
		styles = {};
	}
	if (typeof(srcDocument) != "object" || !srcDocument.nodeType && [9,11].indexOf(srcDocument.nodeType) == -1) { 
		JAX.Report.error("Fourth argument must be document element."); 
		srcDocument = document;
	}

	var parts = tagString.match(/[#.]?[a-z0-9_-]+/ig) || [];
	var tagName = parts[0];

	if (!tagName || !/^[a-z0-9]+$/ig.test(tagName)) {
		JAX.Report.error("Tagname must be first in element definition.");
		return JAX(null);
	}
	
	for (var i=0, len=parts.length; i<len; i++) {
		var part = parts[i];
		var ch = part.charAt(0);

		if (ch == "#") { 
			attrs["id"] = part.substring(1);
		} else if (ch == ".") { 
			if (attrs["className"]) { 
				attrs["className"] += " ";
				attrs["className"] += part.substring(1);
			} else {
				attrs["className"] = part.substring(1);
			}
		}
	}
	
	var createdNode = srcDocument.createElement(tagName);

	for (var p in attrs) { createdNode[p] = attrs[p]; }
	for (var p in styles) { createdNode.style[p] = styles[p]; }
	
	return new JAX.Element(createdNode);
};

/**
 * @method Vytvoří z HTML elementy a vrátí je jako instance JAX.NodeArray. Zhmotní html string.
 *
 * @param {String} html html, které má být transformováno na uzly
 * @returns {JAX.NodeArray}
 */
JAX.makeFromHTML = function(html) {
	if (!html) { return new JAX.NodeArray([]); }

	var temp = JAX.make("div").html(html);
	var children = temp.children();

	return children;
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
	return new JAX.TextNode((srcDocument || document).createTextNode(text));
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
