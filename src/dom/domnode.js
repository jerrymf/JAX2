/**
 * @fileOverview node.js - JAX - JAk eXtended
 * @author <a href="mailto:jerrymf@gmail.com">Marek Fojtl</a>
 * @version 1.0
 */

/**
 * Třída reprezentující obecny DOM Node (nodeType == 1 || 3 || 8)
 * @class JAX.DOMNode
 */
JAX.DOMNode = JAK.ClassMaker.makeClass({
	NAME: "JAX.DOMNode",
	VERSION: "1.0",
	EXTEND: JAX.Node
});

JAX.DOMNode.prototype.$constructor = function(node) {
	this._node = node;
	this.jaxNodeType = node.nodeType;
};

/**
 * @method přidává do elementu další uzly vždy na konec
 * @example
 * document.body.innerHTML = "<span>Ahoj svete!</span>";
 * var jaxElm = JAX(document.body).add(JAX.make("span")); 
 *
 * @param {String | Node | Node[] | JAX.DOMNodeArray} HTML string | nodes DOM uzel | pole DOM uzlů | instance JAX.DOMNodeArray
 * @returns {JAX.DOMNode}
 */
JAX.DOMNode.prototype.add = function(nodes) {
	if (nodes instanceof JAX.DOMNodeArray) {
		nodes = nodes.items();
	} else if (typeof(nodes) == "string") {
		var div = document.createElement("div");
		div.innerHTML = nodes;
		var nodesLength = div.childNodes.length;
		nodes = new Array(nodesLength);
		for (var i=0, len=nodesLength; i<len; i++) { nodes[i] = div.childNodes[i]; }
	} else if (!(nodes instanceof Array)) { 
		nodes = [].concat(nodes); 
	} 
	
	for (var i=0, len=nodes.length; i<len; i++) {
		var node = nodes[i];
		if ((!node.nodeType && !node.jaxNodeType) || (node.jaxNodeType && node.jaxNodeType < 1)) {
			console.error("For my argument I expected html node, text node, documentFragment or JAX node. You can use also array of them.");
			continue;
		}
		var node = node.jaxNodeType ? node.node() : node;
		this._node.appendChild(node);
	}
	
	return this;
};

/**
 * @method vloží zadaný element jako první
 *
 * @param {Node | JAX.DOMNode | String} node DOM uzel | instance JAX.DOMNode | CSS3 (2.1) selector
 * @returns {JAX.DOMNode}
 */
JAX.DOMNode.prototype.insertFirst = function(node) {
	var node = JAX(node);

	if (node.exists()) {
		var node = node.node();

		if (this._node.childNodes && this._node.firstChild) {
			this._node.insertBefore(node, this._node.firstChild);
		} else if (this._node.childNodes) {
			this._node.appendChild(node);
		} else {
			console.error("Given element can not have child nodes.", this._node);
		}
		
		return this;
	}
	
	console.error("I could not find given element. For first argument I expected html element, text node or JAX node.");
	return this;
};

/**
 * @method přidá do elementu DOM uzel před zadaný uzel
 * @example
 * document.body.innerHTML = "<span>Ahoj svete!</span>";
 * var jaxElm = JAX(document.body).add(JAX.make("span"), document.body.lastChild); // prida span pred posledni prvek v body 
 *
 * @param {Node | JAX.DOMNode} node DOM uzel | instance JAX.DOMNode
 * @param {Node | JAX.DOMNode} nodeBefore DOM uzel | instance JAX.DOMNode
 * @returns {JAX.DOMNode}
 */
JAX.DOMNode.prototype.addBefore = function(node, nodeBefore) {
	if (!node || typeof(node) != "object" || (!node.nodeType && !node.jaxNodeType) || (node.jaxNodeType && node.jaxNodeType < 1)) { 
		console.error("For first argument I expected html element, text node, documentFragment or JAX node.");
		return this;
	}
	if (!nodeBefore || typeof(nodeBefore) != "object" || (!nodeBefore.nodeType && !nodeBefore.jaxNodeType) || (node.jaxNodeType && node.jaxNodeType < 1)) { 
		console.error("For second argument I expected html element, text node or JAX node."); 
		return this;
	}

	var node = node.jaxNodeType ? node.node() : node;
	var nodeBefore = nodeBefore.jaxNodeType ? nodeBefore.node() : nodeBefore;
	
	this._node.insertBefore(node, nodeBefore);
	return this;
};

/**
 * @method připne (přesune) element do jiného elementu (na konec)
 * @example
 * document.body.innerHTML = "<span>Ahoj svete!</span>";
 * var jaxElm = JAX.make("span").appendTo(document.body); // pripne span do body
 *
 * @param {Node | JAX.DOMNode | String} node DOM uzel | instance JAX.DOMNode | CSS 3 (CSS 2.1 selector pro IE8)
 * @returns {JAX.DOMNode}
 */
JAX.DOMNode.prototype.appendTo = function(node) {
	var node = JAX(node);

	if (node.exists()) { 
		var node = node.jaxNodeType ? node.node() : node;
		node.appendChild(this._node);
		return this;
	}
	
	console.error("I could not find given element. For first argument I expected html element, documentFragment or JAX node.");
	return this;
};

/**
 * @method připne (přesune) element před jiný element
 * @example
 * document.body.innerHTML = "<span>Ahoj svete!</span>";
 * var jaxElm = JAX.make("span").before(document.body.lastChild); // pripne span do body pred posledni prvek v body
 *
 * @param {Node | JAX.DOMNode} node DOM uzel | instance JAX.DOMNode
 * @returns {JAX.DOMNode}
 */
JAX.DOMNode.prototype.before = function(node) {
	var node = JAX(node);

	if (node.exists()) {
		var node = node.node();
		node.parentNode.insertBefore(this._node, node);
		return this;
	}
	
	console.error("I could not find given element. For first argument I expected html element, text node or JAX node.");
	return this;
};

/**
 * @method připne (přesune) element za jiný element
 * @example
 * document.body.innerHTML = "<span>Ahoj svete!</span>";
 * var jaxElm = JAX.make("span").after(document.body.lastChild); // pripne span do body za posledni posledni prvek v body
 *
 * @param {Node | JAX.DOMNode} node DOM uzel | instance JAX.DOMNode
 * @returns {JAX.DOMNode}
 */
JAX.DOMNode.prototype.after = function(node) {
	var node = JAX(node);

	if (node.exists()) {
		var node = node.node();

		if (node.nextSibling) {
			node.parentNode.insertBefore(this._node, node.nextSibling);
		} else {
			node.parentNode.appendChild(this._node);
		}
		
		return this;
	}
	
	console.error("I could not find given element. For first argument I expected html element, text node or JAX node.");
	return this;
};

/**
 * @method odstraní zadaný element z DOMu a nahradí ho za sebe
 * @example
 * document.body.innerHTML = "<span>Ahoj svete!</span>";
 * var jaxElm = JAX.make("span.novy").replaceWith(document.body.lastChild); // odstrani prvek a nahradi ho za sebe
 *
 * @param {Node | JAX.DOMNode} node DOM uzel | instance JAX.DOMNode
 * @returns {JAX.DOMNode}
 */
JAX.DOMNode.prototype.replaceWith = function(node) {
	var node = JAX(node);

	if (node.exists()) { 
		var node = node.node();
		node.parentNode.replaceChild(this._node, node);
		return this;
	}

	console.error("For first argument I expected html element, text node or JAX node.");
	return this;
};

JAX.DOMNode.prototype.swapPlaceWith = function(node) {
	var jaxNode = JAX(node);

	if (jaxNode.exists()) { 
		var targetNode = jaxNode.node();
		var targetSiblingNode = targetNode.nextSibling; 
		var targetParentNode = targetNode.parentNode;
		var parent = this._node.parentNode;

		if (parent) {
			this._node.parentNode.replaceChild(targetNode, this._node);
		} else if (targetParentNode) {
			jaxNode.remove();
		}

		if (targetParentNode) {
			if (targetSiblingNode) {
				targetParentNode.insertBefore(this._node, targetSiblingNode);
			} else {
				targetParentNode.appendChild(this._node);
			}
		}

		return this;
	}

	console.error("For first argument I expected html element, text node or JAX node.");
	return this;
};

/**
 * @method odstraní element z DOMu
 * @example
 * document.body.innerHTML = "<span>Ahoj svete!</span>";
 * var jaxElm = JAX(document.body.firstChild).remove(); // pripne span do body pred posledni prvek v body
 *
 * @returns {JAX.DOMNode}
 */
JAX.DOMNode.prototype.remove = function() {
	this._node.parentNode.removeChild(this._node);

	return this;
};

/**
 * @method naklonuje element i vrátí novou instanci JAX.DOMNode
 * @example
 * document.body.innerHTML = "<span>Ahoj svete!</span>";
 * var jaxElm = JAX(document.body.firstChild).clone(true); // naklonuje element span i s textem Ahoj svete!
 *
 * @param {Boolean} withContent true, pokud se má naklonovat i obsah elementu
 * @returns {JAX.DOMNode}
 */
JAX.DOMNode.prototype.clone = function(withContent) {
	var clone = this._node.cloneNode(!!withContent);

	return new this(clone);
};

/**
 * @method získá nebo nastaví vlastnost elementu
 * @example
 * document.body.innerHTML = "<input type='text' value='aaa'>";
 * var jaxElm = JAX(document.body);
 * console.log(jaxElm.prop("value")); // vraci pole ["mojeId", "demo"]
 * jaxElm.prop("value","bbb"); // nastavi value na "bbb"
 * jaxElm.prop("tagName"); // vrati "input"
 *
 * @param {String | Array | Object} property název vlastnosti | pole názvů vlastností | asociativní pole, např. {id:"mojeId", checked:true}
 * @param {value} value pokud je uvedena a první argument je string, provede se nastavení příslušné vlastnosti na určitou hodnotu
 * @returns {String | Object | JAX.DOMNode}
 */
JAX.DOMNode.prototype.prop = function(property, value) {
	if (typeof(property) == "string") { 
		if (arguments.length == 1) { 
			return this._node[property]; 
		}
		this._node[property] = value;
		return this;
	} else if (property instanceof Array) {
		var props = {};
		for (var i=0, len=property.length; i<len; i++) { 
			var p = property[i];
			props[p] = this._node[p];
		}
		return props;	
	}

	for (var p in property) {
		this._node[p] = property[p];
	}

	return this;
};

/** 
 * @method zjistí, jestli element obsahuje node podle zadaných kritérií
 * @example
 * document.body.innerHTML = "<div><span>1</span><span>2<em>3</em></span></div>";
 * if (JAX("em").isIn("span")) { alert("Span obsahuje em"); }
 *
 * @param {Node | JAX.DOMNode | String} node uzel | instance JAX.DOMNode | CSS3 (2.1) selector
 * @returns {Boolean}
 */
JAX.DOMNode.prototype.isIn = function(node) {
	if (!node) { return false; }

	if (typeof(node) == "object" && (node.nodeType || node.jaxNodeType)) {
		var elm = node.jaxNodeType ? node : JAX(node);
		return elm.exists() ? elm.contains(this) : false;
	} else if (typeof(node) == "string") {
		if (/^[#.a-z0-9_-]+$/ig.test(node)) {
			var parent = JAK.DOM.findParent(this._node, node);
			return !!parent;
		}
		return !!JAX.all(node).filterItems(
			function(jaxElm) { return jaxElm.contains(this._node); }.bind(this)
		).length;
	}
	
	console.error("For first argument I expected html element, JAX node or CSS3 (2.1) selector.");
	return false;
};

/** 
 * @method vrací rodičovský prvek
 * @example
 * var body = JAX("body").html("<span>Ahoj svete!</span>");
 * console.log(JAX("body span").parent() == body);
 *
 * @returns {JAX.DOMNode | null}
 */
JAX.DOMNode.prototype.parent = function() {
	if (this._node.parentNode) { return JAX(this._node.parentNode); }
	return new JAX.NullNode();
};

/** 
 * @method vrací následující prvek nebo null, pokud takový není
 * @example
 * var body = JAX("body").html("<span>Ahoj svete!</span><em>Takze dobry vecer!</em>");
 * if (JAX("body span").next()) { console.log("tag SPAN ma souseda"); }
 *
 * @returns {JAX.DOMNode | null}
 */
JAX.DOMNode.prototype.next = function() {
	return this._node.nextSibling ? JAX(this._node.nextSibling) : new JAX.NullNode();
};

/** 
 * @method vrací předcházející prvek nebo null, pokud takový není
 * @example
 * var body = JAX("body").html("<span>Ahoj svete!</span><em>Takze dobry vecer!</em>");
 * if (JAX("body em").previous()) { console.log("tag EM ma souseda"); }
 *
 * @returns {JAX.DOMNode | null}
 */
JAX.DOMNode.prototype.previous = function() {
	return this._node.previousSibling ? JAX(this._node.previousSibling) : new JAX.NullNode();
};
