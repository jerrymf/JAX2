/**
 * @fileOverview document.js - JAX - JAk eXtended
 * @author <a href="mailto:marek.fojtl@firma.seznam.cz">Marek Fojtl</a>
 * @version 1.1
 */

/**
 * @class JAX.Document
 * je třída reprezentující instanci window.Document. Implementuje následující rozhraní: {@link JAX.IListening}, {@link JAX.IScrollableNode}, {@link JAX.ISearchableNode}
 *
 * @param {object} doc objekt typu window.Document
 */
JAX.Document = function(doc) {
	this.___parent___.call(this, doc);

	this.isDocument = true;

	this.isListenable = true;
	this.isSearchable = true;
	this.isScrollable = true;
};

JAX.extend(JAX.Document, JAX.Node);
JAX.mixin(JAX.Document, [JAX.IListening, JAX.ISearchableNode, JAX.IScrollableNode]);

/** 
 * zjistí, jestli element obsahuje nody podle zadaných kritérií
 *
 * @param {object | string} node HTMLElement || Text ||  CSS 3 (CSS 2.1 pro IE8) selector
 * @returns {boolean}
 */
JAX.Document.prototype.contains = function(node) {
	if (!node) { return false; }

	if (typeof(node) == "string") {
		return !!this.find(node).n;
	}

	var jaxNode = node instanceof JAX.Node ? node : JAX(node);
	if (jaxNode.n) { 
		var n = jaxNode.n;
		return this._node.contains(n);
	}
	
	console.error("JAX.Element.contains: For first argument I expected html element, text node, string with CSS3 compatible selector or JAX.Node.");
	return false;
};

/**
 * zjistí velikost dokumentu dle zadaného typu, tedy šířku nebo výšku
 *
 * @param {string} sizeType "width" nebo "height"
 * @returns {number}
 */
JAX.Document.prototype.size = function(sizeType) {
	if (arguments.length > 1) {
		console.error("I am so sorry, but you can not set " + sizeType + " of document node.", this._node);
		return this;
	}

	switch(sizeType) {
		case "width":
     		 return Math.max(
     		 			this._node.body.scrollWidth, this._node.documentElement.scrollWidth, 
     		 			this._node.body.offsetWidth, this._node.documentElement.offsetWidth, 
     		 			this._node.body.clientWidth, this._node.documentElement.clientWidth
     		 		);
		case "height":
			return Math.max(
     		 			this._node.body.scrollHeight, this._node.documentElement.scrollHeight, 
     		 			this._node.body.offsetHeight, this._node.documentElement.offsetHeight, 
     		 			this._node.body.clientHeight, this._node.documentElement.clientHeight
     		 		);
		default:
			console.error("You gave me an unsupported size type. I expected 'width' or 'height'.", this._node);
			return 0;
	}
};
