/**
 * @fileOverview documentnode.js - JAX - JAk eXtended
 * @author <a href="mailto:jerrymf@gmail.com">Marek Fojtl</a>
 * @version 1.0
 */

/**
 * Třída reprezentující document node
 * @class JAX.DocumentNode
 */
JAX.DocumentNode = JAK.ClassMaker.makeClass({
	NAME: "JAX.DocumentNode",
	VERSION: "1.0",
	EXTEND: JAX.JAXNode,
	IMPLEMENT: JAX.IListening
});

JAX.DocumentNode.prototype.$constructor = function(doc) {
	this._node = doc;
	this.jaxNodeType = doc.nodeType;
};

JAX.DocumentNode.prototype.find = function(selector) {
	return JAX(selector, this._node);
};

JAX.DocumentNode.prototype.findAll = function(selector) {
	return JAX.all(selector, this._node);
};

JAX.DocumentNode.prototype.size = function(sizeType) {
	if (arguments.length > 1) {
		JAX.Report.error("I am so sorry, but you can not set " + sizeType + " of document node.", this._node);
		return this;
	}

	switch(sizeType) {
		case "width":
			return document.documentElement.clientWidth;
		case "height":
			return document.documentElement.clientHeight;
		default:
			JAX.Report.error("You gave me an unsupported size type. I expected 'width' or 'height'.", this._node);
			return 0;
	}
};

JAX.DocumentNode.prototype.fullSize = function(sizeType) {
	if (arguments.length > 1) {
		JAX.Report.error("I am so sorry, but you can not set " + sizeType + " of document node.", this._node);
		return this;
	}

	return this.size(sizeType);
}