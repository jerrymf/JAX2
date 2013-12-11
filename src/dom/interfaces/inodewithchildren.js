/**
 * @fileOverview inodewithchildren.js - JAX - JAk eXtended
 * @author <a href="mailto:jerrymf@gmail.com">Marek Fojtl</a>
 * @version 1.0
 */

/**
 * Rozhraní pro nody, které mohou mít potomky
 * @class
 */
JAX.INodeWithChildren = JAK.ClassMaker.makeInterface({
	NAME: "JAX.INodeWithChildren",
	VERSION: "1.0"
});

/**
 * @method přidává do elementu další uzly vždy na konec
 * @example
 * document.body.innerHTML = "<span>Ahoj svete!</span>";
 * var jaxElm = JAX(document.body).add(JAX.make("span")); 
 *
 * @param {String | Node | Node[] | JAX.NodeArray} HTML string | nodes DOM uzel | pole DOM uzlů | instance JAX.NodeArray
 * @returns {JAX.INodeWithChildren}
 */
JAX.INodeWithChildren.prototype.add = function(nodes) {
	if (typeof(nodes) == "string") {
		if (this._node.insertAdjacentHTML) {
			this._node.insertAdjacentHTML("beforeend", nodes);
		} else {
			JAX.makeFromHTML(nodes).appendTo(this);
		}
	} else {
		JAX.all(nodes).appendTo(this);
	}
	
	return this;
};

/**
 * @method vloží zadaný element jako první
 *
 * @param {Node | JAX.INodeWithChildren | String} node DOM uzel | instance JAX.INodeWithChildren | CSS3 (2.1) selector
 * @returns {JAX.INodeWithChildren}
 */
JAX.INodeWithChildren.prototype.insertFirst = function(node) {
	var jaxNode = JAX(node);

	if (jaxNode.exists()) {
		var n = jaxNode.node();

		if (this._node.childNodes && this._node.firstChild) {
			this._node.insertBefore(n, this._node.firstChild);
		} else if (this._node.childNodes) {
			this._node.appendChild(n);
		} else {
			console.error("JAX.INodeWithChildren.insertFirst: Given element can not have child nodes.", this._node);
		}
		
		return this;
	}
	
	console.error("JAX.INodeWithChildren.insertFirst: I could not find given element. For first argument I expected html element, text node or JAX.Node.");
	return this;
};

/**
 * @method přidá do elementu DOM uzel před zadaný uzel
 * @example
 * document.body.innerHTML = "<span>Ahoj svete!</span>";
 * var jaxElm = JAX(document.body).add(JAX.make("span"), document.body.lastChild); // prida span pred posledni prvek v body 
 *
 * @param {Node | JAX.INodeWithChildren} node DOM uzel | instance JAX.INodeWithChildren
 * @param {Node | JAX.INodeWithChildren} nodeBefore DOM uzel | instance JAX.INodeWithChildren
 * @returns {JAX.INodeWithChildren}
 */
JAX.INodeWithChildren.prototype.addBefore = function(node, nodeBefore) {
	var jaxNode = JAX(node);
	var jaxNodeBefore = JAX(nodeBefore);

	if (!jaxNode.exists()) { 
		console.error("JAX.INodeWithChildren.addBefore: For first argument I expected html element, text node, documentFragment or JAX.Node.");
		return this;
	}
	if (!jaxNodeBefore.exists()) { 
		console.error("JAX.INodeWithChildren.addBefore: For second argument I expected html element, text node or JAX.Node."); 
		return this;
	}
	
	this._node.insertBefore(jaxNode.node(), jaxNodeBefore.node());
	return this;
};

/** 
 * @method zjistí, jestli element obsahuje node podle zadaných kritérií
 * @example
 * document.body.innerHTML = "<div><span>1</span><span>2</span><em>3</em></div>";
 * if (JAX("body").first().contains("em")) { alert("Obsahuje em"); }
 *
 * @param {Node | JAX.Node | String} node uzel | instance JAX.Node | CSS3 (2.1) selector
 * @returns {Boolean}
 */
JAX.INodeWithChildren.prototype.contains = function(node) {
	if (!node) { return false; }

	if (typeof(node) == "string") {
		return !!this.find(node).exists();
	}

	var jaxNode = node instanceof JAX.Node ? node : JAX(node);
	if (jaxNode.exists()) { 
		var n = jaxNode.node();
		if (this._node.contains) {
			return this._node.contains(n);
		} else {
			return this._contains(n);
		}
	}
	
	console.error("JAX.Element.contains: For first argument I expected html element, text node, string with CSS3 compatible selector or JAX.Node.");
	return false;
};

/** 
 * @method vrací instanci JAX.NodeArray, která obsahuje všechny přímé potomky uzlu
 * @example
 * var body = JAX("body").html("<span>Ahoj svete!</span><em>Takze dobry vecer!</em>");
 * console.log(body.children().length);
 *
 * @returns {JAX.NodeArray | null}
 */
JAX.INodeWithChildren.prototype.children = function(index) {
	if (!arguments.length) {
		var nodes = [];
		var childNodes = this._node.childNodes;
		for (var i=0, len=childNodes.length; i<len; i++) {
			nodes.push(JAX(childNodes[i]));
		}
		return new JAX.NodeArray(nodes);
	}

	var child = this._node.childNodes[index];
	if (child) {
		return JAX(child);
	}

	return null;
};

/** 
 * @method vrací první html element (potomka) nebo null, pokud takový není
 * @example
 * var body = JAX("body").html("<span>Ahoj svete!</span><em>Takze dobry vecer!</em>");
 * console.log(JAX("body").first().prop("tagName") == "span");
 *
 * @returns {JAX.Node | null}
 */
JAX.INodeWithChildren.prototype.first = function() {
	if ("firstElementChild" in this._node) {
		return this._node.firstElementChild ? JAX(this._node.firstElementChild) : null;
	}

	if (!this._node.childNodes || !this._node.childNodes.length) { return null; }
	
	for (var i=0, len=this._node.childNodes.length; i<len; i++) {
		var childNode = this._node.childNodes[i];
		if (childNode.nodeType == 1) { return JAX(childNode); }
	}

	return null;
};

/** 
 * @method vrací poslední uzel (potomka) nebo null, pokud takový není
 * @example
 * var body = JAX("body").html("<span>Ahoj svete!</span>");
 * console.log(JAX("body span").last().node() == JAX("body span").first().node();
 *
 * @returns {JAX.Node | null}
 */
JAX.INodeWithChildren.prototype.last = function() {
	if ("lastElementChild" in this._node) {
		return this._node.lastElementChild ? JAX(this._node.lastElementChild) : null;
	}

	if (!this._node.childNodes || !this._node.childNodes.length) { return null; }
	
	for (var i=this._node.childNodes.length - 1; i>-1; i--) {
		var childNode = this._node.childNodes[i];
		if (childNode.nodeType == 1) { return JAX(childNode); }
	}

	return null;
};

/** 
 * @method promaže element
 * @example
 * var body = JAX("body").html("<span>Ahoj svete!</span><em>Takze dobry vecer!</em>");
 * body.clear();
 *
 * @returns {JAX.Node}
 */
JAX.INodeWithChildren.prototype.clear = function() {
	JAK.DOM.clear(this._node);

	return this;
};
