/**
 * @fileOverview nullnode.js - JAX - JAk eXtended
 * @author <a href="mailto:jerrymf@gmail.com">Marek Fojtl</a>
 * @version 1.0
 */

/**
 * Třída reprezentující nullový node - návrhový vzor Null object
 * @class JAX.NullNode
 */
JAX.NullNode = JAK.ClassMaker.makeClass({
	NAME: "JAX.NullNode",
	VERSION: "1.0",
	EXTEND: JAX.Node
});

JAX.NullNode.prototype.$constructor = function(selector) {
	this._selector = selector || "";
	this._node = null;
	this.jaxNodeType = -1;
};

JAX.NullNode.prototype._showMessage = function(method) {
	if (this._selector) {
		console.error("You are trying to work with null node. There is no match for your selector: '" + this._selector + "'.");
	} else {
		console.error("Hello! I am null node. It means you are trying to work with not existing node. Be careful what you do. Try to use JAX.Node.exists method for checking if element is found.");
	}
};
