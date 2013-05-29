/**
 * @fileOverview dombuilder.js - JAX - JAk eXtended
 * @author <a href="mailto:jerrymf@gmail.com">Marek Fojtl</a>
 * @version 2.0
 */

/**
 * Pomocník pro vytváření DOM elementů
 * @class JAX.DOMBuilder
 */ 
JAX.DOMBuilder = JAK.ClassMaker.makeClass({
	NAME: "JAX.DOMBuilder",
	VERSION: "2.0"
});

/** 
 * @example 
 * var db = new JAX.DOMBuilder();
 *
 * @param {documentElement} document element, ve kter0m se budou nové elementy vytvářet
 */
JAX.DOMBuilder.prototype.$constructor = function(doc) {
	this._doc = doc || document;
	this._jax = { container: JAX.Node.create(document.createDocumentFragment()) };
	this._pointerJaxNode = null;
	this._stack = [];
};

/**
 * @method Vytvoří nový element a nastaví na něj interně ukazatel, takže další vytvářené elementy se budou přidávat do tohoto elementu
 * @example
 * var db = new JAX.DOMBuilder();
 * db.open("div",{},{width:"100px"});
 * db.add("span");
 * db.close();
 * console.log(db.getContainer());
 *
 * @param {String | HTMLElm | JAX.Node} element řetězec (s kompatibilní syntaxí JAX.make) popisující nový vytvářený tag nebo html element nebo instance JAX.Node
 * @param {Object} attrs asociativní pole atributů tagu
 * @param {Object} styles asociativní pole stylů, které se mají přiřadit do node.style
 * @returns {JAX.Node}
 */
JAX.DOMBuilder.prototype.open = function(element, attributes, styles) {
	if (typeof(element) === "string" || (typeof(element) === "object" && element.nodeType)) {
		this._stack.push(this._pointerJaxNode);
		this._pointerJaxNode = this.add(element, attributes, styles);
		return this._pointerJaxNode;
	}

	throw new Error("First argument must be string with JAX.make compatible definition, node or instance of JAX.Node");
};

/**
 * @method Vytvoří nový element a připojí ho do elementu, na který má nastaven ukazatel
 * @example
 * var db = new JAX.DOMBuilder();
 * db.add("div");
 * db.add("span");
 * console.log(db.getContainer());
 *
 * @param {String | HTMLElm | JAX.Node} element řetězec (s kompatibilní syntaxí JAX.make) popisující nový vytvářený tag nebo html element nebo instance JAX.Node
 * @param {Object} attrs asociativní pole atributů tagu
 * @param {Object} styles asociativní pole stylů, které se mají přiřadit do node.style
 * @returns {JAX.Node}
 */
JAX.DOMBuilder.prototype.add = function(node, attributes, styles) {
	var jaxNode = node;

	if (typeof(node) === "string") {
		jaxNode = JAX.make(node, attributes, styles);
	} else if (typeof(node) === "object" && node.nodeType) {
		jaxNode = JAX(node);
		if (attributes) { jaxNode.attr(attributes); }
		if (styles) { jaxNode.style(styles); }
	}

	if (!(jaxNode instanceof JAX.Node) || jaxNode.jaxNodeType === 9) {
		throw new Error("First argument must be string with JAX.make compatible definition, node or instance of JAX.Node");
	}

	if (attributes) { jaxNode.attr(attributes); }
	if (styles) { jaxNode.css(styles); }

	if (this._pointerJaxNode) {
		this._pointerJaxNode.add(jaxNode);
	} else {
		this._jax.container.add(jaxNode);
	}

	return jaxNode;
};

/**
 * @method Vytvoří nový textový uzel a připojí ho do elementu, na který má nastaven ukazatel
 * @example
 * var db = new JAX.DOMBuilder();
 * db.open("span");
 * db.addText("Hello world");
 * db.close();
 * console.log(db.getContainer());
 *
 * @param {String} txt text, který se má uložit do textového uzlu
 * @returns {JAX.Node}
 */
JAX.DOMBuilder.prototype.addText = function(txt) {
	if (typeof(txt) === "string") {
		var jaxNode = JAX.makeText(txt);

		if (this._pointerJaxNode) {
			this._pointerJaxNode.add(jaxNode);
		} else {
			this._jax.container.add(jaxNode);
		}

		return jaxNode;
	}

	throw new Error("First argument must be a string");
};

/**
 * @method "Uzavře aktuálně otevřený element metodou JAX.DOMBuilder.open". Znamená to, že ukazatel se nastaví na rodičovský prvek tohoto elementu, pokud existuje.
 * @example
 * var db = new JAX.DOMBuilder();
 * db.open("span");
 * db.addText("Hello world");
 * db.close();
 * db.close(); // vyhodí výjimku, snažíme se uzavřít prvek, ale žádný už otevřen není
 * console.log(db.getContainer());
 *
 * @returns {JAX.DOMBuilder}
 */
JAX.DOMBuilder.prototype.close = function() {
	if (this._stack.length) {
		this._pointerJaxNode = this._stack.pop();
		return this;
	}

	throw new Error("There is no opened element so you can not close anything");
};

/**
 * @method Vezme svůj HTML obsah a připne ho do cílového prvku
 * @example
 * var db = new JAX.DOMBuilder();
 * db.open("span");
 * db.addText("Hello world");
 * db.close();
 * db.appendTo(document.body); // pripne vytvoreny span do document.body
 * console.log(db.getContainer());
 *
 * @param {HTMLNode} node prvek, kam se má celý obsah připnout
 * @returns {JAX.DOMBuilder}
 */
JAX.DOMBuilder.prototype.appendTo = function(node) {
	var jaxNode = null;

	if (typeof(node) === "object" && node.nodeType) {
		var jaxNode = JAX(node);
	} else if (node instanceof JAX.Node && node.jaxNodeType === 1) {
		var jaxNode = node;
	} else {
		throw new Error("You are trying to append me to unsupported element. I can be appended only to html element or documentFragment element.");
	}

	this._jax.container.appendTo(jaxNode);
	return this;
};

/**
 * @method Vrací instance JAX.Node s HTML obsahem
 * @example
 * var db = new JAX.DOMBuilder();
 * db.add("span", {innerHTML:"Hello world"});
 * console.log(db.getContainer());
 *
 * @returns {JAX.Node}
 */
JAX.DOMBuilder.prototype.getContainer = function() {
	return this._jax.container;
};

/**
 * @method Vymaže HTML obsah
 * @example
 * var db = new JAX.DOMBuilder();
 * db.add("span", {innerHTML:"Hello world"});
 * console.log(db.getContainer());
 * db.clear();
 * console.log(db.getContainer());
 *
 * @returns {JAX.DOMBuilder}
 */
JAX.DOMBuilder.prototype.clear = function() {
	this._jax.container.clear();
	this._stack = [];
	return this;
};

