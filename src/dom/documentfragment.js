/**
 * @fileOverview documentfragment.js - JAX - JAk eXtended
 * @author <a href="mailto:jerrymf@gmail.com">Marek Fojtl</a>
 * @version 1.0
 */

/**
 * Třída reprezentující instanci window.DocumentFragment
 * @class JAX.DocumentFragment
 */
JAX.DocumentFragment = JAK.ClassMaker.makeClass({
	NAME: "JAX.DocumentFragment",
	VERSION: "1.0",
	EXTEND: JAX.Node,
	IMPLEMENT: [JAX.INodeWithChildren, JAX.IMoveableNode, JAX.ISearchableNode]
});

/** 
 * @constructor
 *
 * @param {object} doc objekt typu window.DocumentFragment
 */
JAX.DocumentFragment.prototype.$constructor = function(doc) {
	this.$super(doc);
};

/** 
 * @method nepodporováno u window.DocumentFragment
 * @see JAX.IMoveableNode#remove
 *
 * @returns {object} JAX.Node
 */
JAX.DocumentFragment.prototype.remove = function() {
	console.error("You can not remove documentFragment node.")

	return this;
};

/**
 * @method nepodporováno u window.DocumentFragment
 * @see JAX.IMoveableNode#swapPlaceWith
 * @returns {object} JAX.Node
 */
JAX.DocumentFragment.prototype.swapPlaceWith = function() {
	console.error("You can not switch place with documentFragment node. Use replaceWith() method instead this.")

	return this;
};

/** 
 * @method nepodporováno u window.DocumentFragment
 * @see JAX.IMoveableNode#isIn
 * @returns {boolean} false
 */
JAX.DocumentFragment.prototype.isIn = function() {
	console.error("DocumentFragment can not be in DOM. Do not used method isIn().")

	return false;
};

/** 
 * @method nepodporováno u window.DocumentFragment
 * @see JAX.IMoveableNode#parent
 *
 * @returns {object} null
 */
JAX.DocumentFragment.prototype.parent = function() {
	console.error("DocumentFragment can not be in DOM. Do not used method parent(). It is always null.")

	return null;
};

/** 
 * @method nepodporováno u window.DocumentFragment
 * @see JAX.IMoveableNode#next
 *
 * @returns {object} null
 */
JAX.DocumentFragment.prototype.next = function() {
	console.error("DocumentFragment can not be in DOM. Do not used method next(). It is always null.")

	return null;
};

/** 
 * @method nepodporováno u window.DocumentFragment
 * @see JAX.IMoveableNode#previous
 *
 * @returns {object} null
 */
JAX.DocumentFragment.prototype.previous = function() {
	console.error("DocumentFragment can not be in DOM. Do not used method previous(). It is always null.")

	return null;
};
