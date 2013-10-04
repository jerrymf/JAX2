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
 * @param {String | Node | Node[] | JAX.NodeArray} HTML string | nodes DOM uzel | pole DOM uzlů | instance JAX.NodeArray
 * @returns {JAX.DOMNode}
 */
JAX.DOMNode.prototype.add = function(nodes) {
	if (typeof(nodes) == "string") {
		var jaxNodes = JAX.makeFromHTML(nodes).appendTo(this);
	} else {
		var jaxNodes = JAX.all(nodes).appendTo(this);
	}

	if (!jaxNodes.length) {
		console.error("JAX.DOMNode.add: There was no node added.")
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
	var jaxNode = JAX(node);

	if (jaxNode.exists()) {
		var n = jaxNode.node();

		if (this._node.childNodes && this._node.firstChild) {
			this._node.insertBefore(n, this._node.firstChild);
		} else if (this._node.childNodes) {
			this._node.appendChild(n);
		} else {
			console.error("JAX.DOMNode.insertFirst: Given element can not have child nodes.", this._node);
		}
		
		return this;
	}
	
	console.error("JAX.DOMNode.insertFirst: I could not find given element. For first argument I expected html element, text node or JAX.Node.");
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
	var jaxNode = JAX(node);
	var jaxNodeBefore = JAX(nodeBefore);

	if (!jaxNode.exists()) { 
		console.error("JAX.DOMNode.addBefore: For first argument I expected html element, text node, documentFragment or JAX.Node.");
		return this;
	}
	if (!jaxNodeBefore.exists()) { 
		console.error("JAX.DOMNode.addBefore: For second argument I expected html element, text node or JAX.Node."); 
		return this;
	}
	
	this._node.insertBefore(jaxNode.node(), jaxNodeBefore.node());
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
	var jaxNode = JAX(node);

	if (jaxNode.exists()) { 
		jaxNode.node().appendChild(this._node);
		return this;
	}
	
	console.error("JAX.DOMNode.append: I could not find given element. For first argument I expected html element, documentFragment or JAX node.");
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
	var jaxNode = JAX(node);

	if (jaxNode.exists()) {
		node.parentNode.insertBefore(this._node, jaxNode.node());
		return this;
	}
	
	console.error("JAX.DOMNode.before: I could not find given element. For first argument I expected html element, text node or JAX node.");
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
	var jaxNode = JAX(node);

	if (jaxNode.exists()) {
		var n = jaxNode.node();

		if (n.nextSibling) {
			n.parentNode.insertBefore(this._node, n.nextSibling);
		} else {
			n.parentNode.appendChild(this._node);
		}
		
		return this;
	}
	
	console.error("JAX.DOMNode.after: I could not find given element. For first argument I expected html element, text node or JAX node.");
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
	var jaxNode = JAX(node);

	if (jaxNode.exists()) { 
		var n = jaxNode.node();
		n.parentNode.replaceChild(this._node, n);
		return this;
	}

	console.error("JAX.DOMNode.replaceWith: For first argument I expected html element, text node or JAX node.");
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

	console.error("JAX.DOMNode.swapPlaceWith: For first argument I expected html element, text node or JAX node.");
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
	if (this._node.parentNode) {
		this._node.parentNode.removeChild(this._node);
		return this;
	}

	console.error("JAX.DOMNode.remove: I can not remove node with no parentNode.");
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

	if (typeof(node) == "string") {
		if (/^[#.a-z0-9_-]+$/ig.test(node)) {
			return !!JAK.DOM.findParent(this._node, node);
		}
		return !!JAX.all(node).filterItems(
			function(jaxElm) { return jaxElm.contains(this._node); }.bind(this)
		).length;
	}

	var jaxNode = JAX(node);
	return jaxNode.exists() && jaxNode.contains(this);
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
	return JAX(this._node.parentNode);
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
	return JAX(this._node.nextSibling);
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
	return JAX(this._node.previousSibling);
};
