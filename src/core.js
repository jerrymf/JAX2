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

	if (typeof(selector) == "string") {
		if (arguments.length == 1) { 
			var srcElement = document; 
		} else if (arguments.length > 1 && srcElement) {
			var srcElement = srcElement.jaxNodeType ? srcElement.node() : srcElement;
		} else {
			return new JAX.NullNode();
		}

		var foundElm = srcElement.querySelector(selector);
		var nodeType = foundElm ? foundElm.nodeType : -1;
	} else if (selector && typeof(selector) == "object" && selector.nodeType) {
		var nodeType = selector.nodeType;
		var foundElm = selector;
	} else {
		var nodeType = -1;
		var foundElm = null;
	}

	switch(nodeType) {
		case 1:
			return new JAX.Element(foundElm);
		case 3:
		case 8:
			return new JAX.TextNode(foundElm);
		case 9:
			return new JAX.DocumentNode(foundElm);
		case 11:
			return new JAX.DocumentFragmentNode(foundElm);
	}

	return new JAX.NullNode();
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
	} else if (selector && typeof(selector) == "object" && selector.nodeType) {
		return new JAX.NodeArray(JAX(selector));
	} else if (selector && selector.jaxNodeType) {
		return new JAX.NodeArray(selector);
	}
	
	return JAX.NodeArray(null);
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
