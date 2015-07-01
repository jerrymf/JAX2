/**
 * @fileOverview imoveablenode.js - JAX - JAk eXtended
 * @author <a href="mailto:marek.fojtl@firma.seznam.cz">Marek Fojtl</a>
 * @version 1.1.1
 */

/**
 * @class JAX.IMoveableNode
 * tvoří rozhraní pro nody, kterými jde manipulovat v rámci DOMu
 */
JAX.IMoveableNode = function() {};

/**
 * přesune element na konec zadaného elementu
 *
 * @param {string | object} node řetězec splňující pravidla css3 (pro IE8 css2.1) selectoru | HTMLElement | Text | HTMLDocument | Window | JAX.Node
 * @returns {JAX.Node}
 */
JAX.IMoveableNode.prototype.appendTo = function(node) {
	var jaxNode = node instanceof JAX.Node ? node : JAX(node);

	if (jaxNode.n) { 
		jaxNode.n.appendChild(this._node);
		return this;
	}
	
	console.error("JAX.IMoveableNode.append: I could not find given element. For first argument I expected html element, documentFragment or JAX node.");
	return this;
};

/**
 * přesune element před zadaný element
 *
 * @param {string | object} node řetězec splňující pravidla css3 (pro IE8 css2.1) selectoru | HTMLElement | Text | HTMLDocument | Window | JAX.Node
 * @returns {JAX.Node}
 */
JAX.IMoveableNode.prototype.before = function(node) {
	var jaxNode = node instanceof JAX.Node ? node : JAX(node);

	if (jaxNode.n) {
		var n = jaxNode.n;
		n.parentNode.insertBefore(this._node, n);
		return this;
	}
	
	console.error("JAX.IMoveableNode.before: I could not find given element. For first argument I expected html element, text node or JAX node.");
	return this;
};

/**
 * přesune element za zadaný element
 *
 * @param {string | object} node řetězec splňující pravidla css3 (pro IE8 css2.1) selectoru | HTMLElement | Text | HTMLDocument | Window | JAX.Node
 * @returns {JAX.Node}
 */
JAX.IMoveableNode.prototype.after = function(node) {
	var jaxNode = node instanceof JAX.Node ? node : JAX(node);

	if (jaxNode.n) {
		var n = jaxNode.n;

		if (n.nextSibling) {
			n.parentNode.insertBefore(this._node, n.nextSibling);
		} else {
			n.parentNode.appendChild(this._node);
		}
		
		return this;
	}
	
	console.error("JAX.IMoveableNode.after: I could not find given element. For first argument I expected html element, text node or JAX node.");
	return this;
};

/**
 * vloží element do zadaného elementu na první místo
 *
 * @param {string | object} node řetězec splňující pravidla css3 (pro IE8 css2.1) selectoru | HTMLElement | Text | HTMLDocument | Window | JAX.Node
 * @returns {JAX.Node}
 */
JAX.IMoveableNode.prototype.insertFirstTo = function(node) {
	var jaxNode = node instanceof JAX.Node ? node : JAX(node);

	if (jaxNode.n) {
		var n = jaxNode.n;

		if (n.childNodes && n.firstChild) {
			n.insertBefore(this._node, n.firstChild);
		} else if (n.childNodes) {
			n.appendChild(this._node);
		} else {
			console.error("JAX.IMoveableNode.insertFirstTo: Given element can not have child nodes.", this._node);
		}

		return this;
	}

	console.error("JAX.IMoveableNode.insertFirstTo: I could not find given element. For first argument I expected html element or JAX node.");
	return this;
};

/**
 * vymění element za zadaný element v DOMu a původní element z DOMu smaže
 *
 * @param {string | object} node řetězec splňující pravidla css3 (pro IE8 css2.1) selectoru | HTMLElement | Text | HTMLDocument | Window | JAX.Node
 * @returns {JAX.Node}
 */
JAX.IMoveableNode.prototype.replaceWith = function(node) {
	var jaxNode = node instanceof JAX.Node ? node : JAX(node);

	if (jaxNode.n) { 
		var n = jaxNode.n;
		n.parentNode.replaceChild(this._node, n);
		return this;
	}

	console.error("JAX.IMoveableNode.replaceWith: For first argument I expected html element, text node or JAX node.");
	return this;
};

/**
 * vymění element za zadaný element v DOMu, prohodí si místa
 *
 * @param {string | object} node řetězec splňující pravidla css3 (pro IE8 css2.1) selectoru | HTMLElement | Text | HTMLDocument | Window | JAX.Node
 * @returns {JAX.Node}
 */
JAX.IMoveableNode.prototype.swapPlaceWith = function(node) {
	var jaxNode = node instanceof JAX.Node ? node : JAX(node);

	if (jaxNode.n) { 
		var targetNode = jaxNode.n;
		var targetSiblingNode = targetNode.nextSibling; 
		var targetParentNode = targetNode.parentNode;
		var thisParent = this._node.parentNode;
		var thisSiblingNode = this._node.nextSibling;

		this.remove();
		jaxNode.remove();

		if (thisParent) {
			if (thisSiblingNode) {
				thisParent.insertBefore(targetNode, thisSiblingNode);
			} else {
				thisParent.appendChild(targetNode);
			}
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

	console.error("JAX.IMoveableNode.swapPlaceWith: For first argument I expected html element, text node or JAX node.");
	return this;
};

/**
 * odstraní element z DOMu
 *
 * @returns {JAX.Node}
 */
JAX.IMoveableNode.prototype.remove = function() {
	if (this._node.parentNode && this._node.parentNode.nodeType != 11) {
		this._node.parentNode.removeChild(this._node);
		return this;
	}

	console.error("JAX.IMoveableNode.remove: I can not remove node with no parentNode.");
	return this;
};

/**
 * naklonuje element a vrátí ho jako JAXový node
 *
 * @param {boolean} withContent mám naklonovat včet obsahu včetně obsahu
 * @returns {JAX.Node}
 */
JAX.IMoveableNode.prototype.clone = function(withContent) {
	var clone = this._node.cloneNode(!!withContent);
	
	return new this.constructor(clone);
};

/**
 * zjistí, jestli je element umístěn v zadaném elementu
 *
 * @param {string | object} node řetězec splňující pravidla css3 (pro IE8 css2.1) selectoru | HTMLElement | Text | HTMLDocument | Window | JAX.Node
 * @returns {boolean}
 */
JAX.IMoveableNode.prototype.isIn = function(node) {
	if (!node) { return false; }

	if (typeof(node) == "string") {
		if (/^[#.a-z0-9_-]+$/ig.test(node)) {
			try {
				var result = !!JAK.DOM.findParent(this._node, node); // FIXME - opravit v JAKu pro IE8
				return result;
			} catch(e) {
				return false;
			}
		}
		return !!JAX.all(node).filterItems(jaxElm.contains.bind(this, this)).length;
	}

	var jaxNode = node instanceof JAX.Node ? node : JAX(node);
	return jaxNode.n && jaxNode.contains(this);
};

/**
 * bez zadaného parametru vrací přímo rodiče; se zadaným zjednodušeným css selectorem vrací rodiče, který jako první odpovídá pravidlu
 *
 * @param {string | undefined} selector řetězec splňující pravidla: tag#id.trida, kde id a třída mohou být zadány vícenásobně nebo vůbec | HTMLElement | JAX.Node
 * @returns {JAX.Node | null}
 */
JAX.IMoveableNode.prototype.parent = function(selector) {
	if (selector && typeof(selector) == "string") {
		if (/^[#.a-z0-9_-]+$/ig.test(selector)) {
			try {
				var node = JAK.DOM.findParent(this._node, selector); // FIXME - opravit v JAKu pro IE8
				return node ? JAX(node) : null;
			} catch(e) {
				return null;
			}
		}
	}

	var jaxNode = JAX(this._node.parentNode);
	return jaxNode.n ? jaxNode : null;
};

/** 
 * vrací následující node
 *
 * @param {string | number | undefined} selector řetězec splňující pravidla: tag#id.trida (lze zada více id i tříd) || požadovaný nodeType
 * @returns {JAX.Node | null}
 */
JAX.IMoveableNode.prototype.next = function(selector) {
	if (typeof(selector) == "number") {
		var n = this._node.nextSibling;
		while(n) {
			if (n.nodeType == selector) {
				return JAX(n);
			}
			n = n.nextSibling;
		}
		return null;
	} else if (typeof(selector) == "string") {
		var n = this._node.nextElementSibling;
		if (/^[#.a-z0-9_-]+$/ig.test(selector)) {
			while(n) { 
				if (this._matches(n, selector)) {
					return JAX(n);
				}
				n = n.nextElementSibling;
			}
		}
		return null;
	}

	var n = this._node.nextSibling;
	return n ? JAX(n) : null;
};

/**
 * vrací předchazející node
 *
 * @param {string | number | undefined} selector řetězec splňující pravidla: tag#id.trida (lze zada více id i tříd) || požadovaný nodeType
 * @returns {JAX.Node | null}
 */
JAX.IMoveableNode.prototype.previous = function(selector) {
	if (typeof(selector) == "number") {
		var n = this._node.previousSibling;
		while(n) {
			if (n.nodeType == selector) {
				return JAX(n);
			}
			n = n.previousSibling;
		}
		return null;
	} else if (typeof(selector) == "string") {
		var n = this._node.previousElementSibling;
		if (/^[#.a-z0-9_-]+$/ig.test(selector)) {
			while(n) { 
				if (this._matches(n, selector)) {
					return JAX(n);
				}
				n = n.previousElementSibling;
			}
		}
		return null;
	}

	var n = this._node.previousSibling;
	return n ? JAX(n) : null;
};

JAX.IMoveableNode.prototype._matches = function(n, selector) {
	var parts = (selector || "").match(/[#.]?[a-z0-9_-]+/ig) || [];
	var ok = true;

	for (var i=0;i<parts.length;i++) {
		var part = parts[i];
		switch (part.charAt(0)) {
			case "#":
				if (n.id != part.substring(1)) { ok = false; }
			break;
			case ".":
				if (!JAK.DOM.hasClass(n, part.substring(1))) { ok = false; }
			break;
			default:
				if (n.nodeName.toLowerCase() != part.toLowerCase()) { ok = false; }
			break;
		}
	}
	

	return ok;
};

