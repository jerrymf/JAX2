/**
 * @fileOverview imoveablenode.js - JAX - JAk eXtended
 * @author <a href="mailto:jerrymf@gmail.com">Marek Fojtl</a>
 * @version 1.0
 */

/**
 * Rozhraní pro nody, které jdou přesouvat v DOMu
 * @class JAX.IMoveableNode
 */
JAX.IMoveableNode = JAK.ClassMaker.makeInterface({
	NAME: "JAX.IMoveableNode",
	VERSION: "1.0"
});

/**
 * @method připne (přesune) element do jiného elementu (na konec)
 * @example
 * document.body.innerHTML = "<span>Ahoj svete!</span>";
 * var jaxElm = JAX.make("span").appendTo(document.body); // pripne span do body
 *
 * @param {Node | JAX.IMoveableNode | String} node DOM uzel | instance JAX.IMoveableNode | CSS 3 (CSS 2.1 selector pro IE8)
 * @returns {JAX.IMoveableNode}
 */
JAX.IMoveableNode.prototype.appendTo = function(node) {
	var jaxNode = JAX(node);

	if (jaxNode.exists()) { 
		jaxNode.node().appendChild(this._node);
		return this;
	}
	
	console.error("JAX.IMoveableNode.append: I could not find given element. For first argument I expected html element, documentFragment or JAX node.");
	return this;
};

/**
 * @method připne (přesune) element před jiný element
 * @example
 * document.body.innerHTML = "<span>Ahoj svete!</span>";
 * var jaxElm = JAX.make("span").before(document.body.lastChild); // pripne span do body pred posledni prvek v body
 *
 * @param {Node | JAX.IMoveableNode} node DOM uzel | instance JAX.IMoveableNode
 * @returns {JAX.IMoveableNode}
 */
JAX.IMoveableNode.prototype.before = function(node) {
	var jaxNode = JAX(node);

	if (jaxNode.exists()) {
		var n = jaxNode.node();
		n.parentNode.insertBefore(this._node, n);
		return this;
	}
	
	console.error("JAX.IMoveableNode.before: I could not find given element. For first argument I expected html element, text node or JAX node.");
	return this;
};

/**
 * @method připne (přesune) element za jiný element
 * @example
 * document.body.innerHTML = "<span>Ahoj svete!</span>";
 * var jaxElm = JAX.make("span").after(document.body.lastChild); // pripne span do body za posledni posledni prvek v body
 *
 * @param {Node | JAX.IMoveableNode} node DOM uzel | instance JAX.IMoveableNode
 * @returns {JAX.IMoveableNode}
 */
JAX.IMoveableNode.prototype.after = function(node) {
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
	
	console.error("JAX.IMoveableNode.after: I could not find given element. For first argument I expected html element, text node or JAX node.");
	return this;
};

JAX.IMoveableNode.prototype.insertFirstTo = function(node) {
	var jaxNode = JAX(node);

	if (jaxNode.exists()) {
		var n = jaxNode.node();

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
 * @method odstraní zadaný element z DOMu a nahradí ho za sebe
 * @example
 * document.body.innerHTML = "<span>Ahoj svete!</span>";
 * var jaxElm = JAX.make("span.novy").replaceWith(document.body.lastChild); // odstrani prvek a nahradi ho za sebe
 *
 * @param {Node | JAX.IMoveableNode} node DOM uzel | instance JAX.IMoveableNode
 * @returns {JAX.IMoveableNode}
 */
JAX.IMoveableNode.prototype.replaceWith = function(node) {
	var jaxNode = JAX(node);

	if (jaxNode.exists()) { 
		var n = jaxNode.node();
		n.parentNode.replaceChild(this._node, n);
		return this;
	}

	console.error("JAX.IMoveableNode.replaceWith: For first argument I expected html element, text node or JAX node.");
	return this;
};

JAX.IMoveableNode.prototype.swapPlaceWith = function(node) {
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

	console.error("JAX.IMoveableNode.swapPlaceWith: For first argument I expected html element, text node or JAX node.");
	return this;
};

/**
 * @method odstraní element z DOMu
 * @example
 * document.body.innerHTML = "<span>Ahoj svete!</span>";
 * var jaxElm = JAX(document.body.firstChild).remove(); // pripne span do body pred posledni prvek v body
 *
 * @returns {JAX.IMoveableNode}
 */
JAX.IMoveableNode.prototype.remove = function() {
	if (this._node.parentNode) {
		this._node.parentNode.removeChild(this._node);
		return this;
	}

	console.error("JAX.IMoveableNode.remove: I can not remove node with no parentNode.");
	return this;
};

/**
 * @method naklonuje element i vrátí novou instanci JAX.IMoveableNode
 * @example
 * document.body.innerHTML = "<span>Ahoj svete!</span>";
 * var jaxElm = JAX(document.body.firstChild).clone(true); // naklonuje element span i s textem Ahoj svete!
 *
 * @param {Boolean} withContent true, pokud se má naklonovat i obsah elementu
 * @returns {JAX.IMoveableNode}
 */
JAX.IMoveableNode.prototype.clone = function(withContent) {
	var clone = this._node.cloneNode(!!withContent);

	return new this.constructor(clone);
};

/** 
 * @method zjistí, jestli element obsahuje node podle zadaných kritérií
 * @example
 * document.body.innerHTML = "<div><span>1</span><span>2<em>3</em></span></div>";
 * if (JAX("em").isIn("span")) { alert("Span obsahuje em"); }
 *
 * @param {Node | JAX.IMoveableNode | String} node uzel | instance JAX.IMoveableNode | CSS3 (2.1) selector
 * @returns {Boolean}
 */
JAX.IMoveableNode.prototype.isIn = function(node) {
	if (!node) { return false; }

	if (typeof(node) == "string") {
		if (/^[#.a-z0-9_-]+$/ig.test(node)) {
			return !!JAK.DOM.findParent(this._node, node);
		}
		return !!JAX.all(node).filterItems(jaxElm.contains.bind(this, this)).length;
	}

	var jaxNode = node instanceof JAX.Node ? node : JAX(node);
	return jaxNode.exists() && jaxNode.contains(this);
};

/** 
 * @method vrací rodičovský prvek
 * @example
 * var body = JAX("body").html("<span>Ahoj svete!</span>");
 * console.log(JAX("body span").parent() == body);
 *
 * @returns {JAX.IMoveableNode | null}
 */
JAX.IMoveableNode.prototype.parent = function(selector) {
	if (selector && typeof(selector) == "string") {
		if (/^[#.a-z0-9_-]+$/ig.test(selector)) {
			var node = JAK.DOM.findParent(this._node, selector);
			return node ? JAX(node) : null;
		}
	}
	
	var jaxNode = JAX(this._node.parentNode);
	return jaxNode.exists() ? jaxNode : null;
};

/** 
 * @method vrací následující prvek nebo null, pokud takový není
 * @example
 * var body = JAX("body").html("<span>Ahoj svete!</span><em>Takze dobry vecer!</em>");
 * if (JAX("body span").next()) { console.log("tag SPAN ma souseda"); }
 *
 * @returns {JAX.IMoveableNode | null}
 */
JAX.IMoveableNode.prototype.next = function() {
	var jaxNode = JAX(this._node.nextSibling)
	return jaxNode.exists() ? jaxNode : null;
};

/** 
 * @method vrací předcházející prvek nebo null, pokud takový není
 * @example
 * var body = JAX("body").html("<span>Ahoj svete!</span><em>Takze dobry vecer!</em>");
 * if (JAX("body em").previous()) { console.log("tag EM ma souseda"); }
 *
 * @returns {JAX.IMoveableNode | null}
 */
JAX.IMoveableNode.prototype.previous = function() {
	var jaxNode = JAX(this._node.previousSibling);
	return jaxNode.exists() ? jaxNode : null;
};
