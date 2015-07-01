/**
 * @fileOverview inodewithchildren.js - JAX - JAk eXtended
 * @author <a href="mailto:marek.fojtl@firma.seznam.cz">Marek Fojtl</a>
 * @version 1.1
 */

/**
 * @class JAX.INodeWithChildren
 * tvoří rozhraní pro nody, které mohou mít potomky
 */
JAX.INodeWithChildren = function() {};

/**
 * přidává do elementu další uzly vždy na konec, lze zadat i jako html string, který se následně připne
 *
 * @param {string | object | array} nodes HTML string || HTMLElement || Text || HTMLDocumetFragment || pole elementů || instance JAX.NodeArray
 * @returns {JAX.Node}
 */
JAX.INodeWithChildren.prototype.add = function(nodes) {
	if (!this._node.childNodes) {
		console.error("JAX.INodeWithChildren.add: My element can not have children.", this._node);
		return this;
	}

	if (typeof(nodes) == "string") {
		if (this._node.insertAdjacentHTML) {
			this._node.insertAdjacentHTML("beforeend", nodes);
			return this;
		}
		
		JAX.makeFromHTML(nodes).appendTo(this);
		return this;
	}
		
	JAX.all(nodes).appendTo(this);
	
	return this;
};

/**
 * vloží zadané uzly před první uzel v elementu, lze zadat i jako html string, který se následně připne před první element
 *
 * @param {string | object | array} nodes HTML string || HTMLElement || Text || HTMLDocumetFragment || pole elementů || instance JAX.NodeArray
 * @returns {JAX.Node}
 */
JAX.INodeWithChildren.prototype.insertFirst = function(nodes) {
	if (!this._node.childNodes) {
		console.error("JAX.INodeWithChildren.insertFirst: My element can not have children.", this._node);
		return this;
	}

	if (typeof(nodes) == "string") {
		if (this._node.insertAdjacentHTML) {
			this._node.insertAdjacentHTML("afterbegin", nodes);
			return this;
		} 
	}

	if (typeof(nodes) == "string") {
		var jaxNodes = JAX.makeFromHTML(nodes);
	} else {
		var jaxNodes = JAX.all(nodes);
	}

	if (!jaxNodes.length) {
		return this;
	}

	for (var i=0;i<jaxNodes.length; i++) {
		var n = jaxNodes[i].n;

		if (this._node.firstChild) {
			this._node.insertBefore(n, this._node.firstChild);
		} else {
			this._node.appendChild(n);
		}
	}
	
	return this;
};

/**
 * vloží uzel před jiný
 *
 * @param {object | string} node element nebo css selector, jak se k elementu dostat
 * @param {object | string} nodeBefore element nebo css selector, jak se k elementu dostat
 * @returns {JAX.Node}
 */
JAX.INodeWithChildren.prototype.addBefore = function(node, nodeBefore) {
	if (!this._node.childNodes) {
		console.error("JAX.INodeWithChildren.addBefore: My element can not have children.", this._node);
		return this;
	}

	var jaxNode = node instanceof JAX.Node ? node : JAX(node);
	var jaxNodeBefore = nodeBefore instanceof JAX.Node ? nodeBefore : JAX(nodeBefore);

	if (!jaxNode.n) { 
		console.error("JAX.INodeWithChildren.addBefore: For first argument I expected html element, text node, documentFragment or JAX.Node.");
		return this;
	}
	if (!jaxNodeBefore.n) { 
		console.error("JAX.INodeWithChildren.addBefore: For second argument I expected html element, text node or JAX.Node."); 
		return this;
	}
	
	this._node.insertBefore(jaxNode.n, jaxNodeBefore.n);
	return this;
};

/** 
 * zjistí, jestli element obsahuje nody podle zadaných kritérií
 *
 * @param {object | string} nodes HTMLElement || Text || pole elementů || instance JAX.NodeArray || CSS 3 (CSS 2.1 pro IE8) selector
 * @returns {boolean}
 */
JAX.INodeWithChildren.prototype.contains = function(nodes) {
	if (!nodes) { return false; }

	if (typeof(nodes) == "string") {
		return !!this.find(nodes).n;
	}

	var jaxNodes = JAX.all([].concat(nodes));

	if (!jaxNodes.length) { return false; }

	for (var i=0, len=jaxNodes.length; i<len; i++) {
		var n = jaxNodes[i].n;
		if (!n) { return false; }

		if (this._node.contains && !this._node.contains(n)) {
			return false;
		} else {
			if (!this._contains(n)) {
				return false;
			}
		}
	}
	
	return true;
};

/** 
 * vrací JAXové pole (JAX.NodeArray) přímých potomků; pokud je ale zadán parametr index, vrací právě jeden JAXový node
 *
 * @param {number | undefined} index číselný index požadovaného potomku
 * @returns {JAX.Node | JAX.NodeArray | null}
 */
JAX.INodeWithChildren.prototype.children = function(index) {
	if (!this._node.childNodes) {
		console.error("JAX.INodeWithChildren.children: My element can not have children.", this._node);
		return new JAX.NodeArray([]);
	}

	if (!arguments.length) {
		var childNodes = this._node.childNodes;
		var length = childNodes.length;
		var nodes = new Array(length);
		
		for (var i=0; i<length; i++) {
			nodes[i] = JAX(childNodes[i]);
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
 * vrací JAXové pole (JAX.NodeArray) přímých elementů (node.nodeType == 1); pokud je ale zadán parametr index, vrací právě jeden JAXový element
 *
 * @param {number | undefined} index číselný index požadovaného elementu
 * @returns {JAX.Node | JAX.NodeArray | null}
 */
JAX.INodeWithChildren.prototype.elements = function(index) {
	if (!this._node.children && !this._node.childNodes) {
		console.error("JAX.INodeWithChildren.elements: My element can not have any element.", this._node);
		return new JAX.NodeArray([]);
	}

	var children = this._node.children || this._node.childNodes; /* IE8 - zahrnuje comment nody do children, Safari na mobilu nepodporuje u documentFragmentu children */
	var length = children.length;

	if (!arguments.length) {	
		var elms = [];
		
		for (var i=0; i<length; i++) {
			var child = children[i];
			if (child.nodeType == 1) { elms.push(JAX(child)); }
		}

		return new JAX.NodeArray(elms);
	}

	var counter = 0;
	for (var i=0; i<length; i++) {
		var child = children[i];
		if (counter == index) {
			return JAX(child);
		}
		counter++;
	}

	return null;
};

/** 
 * vrací první HTMLElement jako JAXový node
 *
 * @returns {JAX.Node | null}
 */
JAX.INodeWithChildren.prototype.first = function() {
	if (!this._node.childNodes) {
		console.error("JAX.INodeWithChildren.first: My element can not have children.", this._node);
		return null;
	}

	return this._node.firstElementChild ? JAX(this._node.firstElementChild) : null;
};

/** 
 * vrací poslední HTMLElement jako JAXový node
 *
 * @returns {JAX.Node | null}
 */
JAX.INodeWithChildren.prototype.last = function() {
	if (!this._node.childNodes) {
		console.error("JAX.INodeWithChildren.last: My element can not have children.", this._node);
		return null;
	}

	return this._node.lastElementChild ? JAX(this._node.lastElementChild) : null;
};

/** 
 * promaže element, odstraní jeho přímé potomky
 *
 * @returns {JAX.Node}
 */
JAX.INodeWithChildren.prototype.clear = function() {
	if (!this._node.childNodes) {
		console.error("JAX.INodeWithChildren.clear: My element can not have children.", this._node);
		return this;
	}

	JAK.DOM.clear(this._node);

	return this;
};

JAX.INodeWithChildren.prototype._contains = function(node) {
	var n = node;

	while(n && n.nodeType != 11 && n.nodeType != 9) {
		if (n == this._node) { return true; }
		n = n.parentNode;
	}

	return false;
};
