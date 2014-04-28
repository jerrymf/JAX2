/**
 * @fileOverview documentfragment.js - JAX - JAk eXtended
 * @author <a href="mailto:marek.fojtl@firma.seznam.cz">Marek Fojtl</a>
 * @version 1.1
 */

/**
 * @class JAX.DocumentFragment
 * je třída reprezentující instanci window.DocumentFragment. Implementuje následující rozhraní: {@link JAX.INodeWithChildren}, {@link JAX.IMoveableNode}, {@link JAX.ISearchableNode}
 *
 * @param {object} doc objekt typu window.DocumentFragment
 */
JAX.DocumentFragment = function(doc) {
	this.___parent___.call(this, doc);

	this.isDocumentFragment = true;

	this.canHaveChildren = true;
	this.isMoveable = true;
	this.isSearchable = true;
};

JAX.extend(JAX.DocumentFragment, JAX.Node);
JAX.mixin(JAX.DocumentFragment, [JAX.INodeWithChildren, JAX.IMoveableNode, JAX.ISearchableNode]);

/** 
 * nepodporováno u window.DocumentFragment
 * @see JAX.IMoveableNode#remove
 *
 * @returns {JAX.Node}
 */
JAX.DocumentFragment.prototype.remove = function() {
	console.error("You can not remove documentFragment node.")

	return this;
};

/**
 * nepodporováno u window.DocumentFragment
 * @see JAX.IMoveableNode#swapPlaceWith
 * @returns {JAX.Node}
 */
JAX.DocumentFragment.prototype.swapPlaceWith = function() {
	console.error("You can not switch place with documentFragment node. Use replaceWith() method instead this.")

	return this;
};

/** 
 * nepodporováno u window.DocumentFragment
 * @see JAX.IMoveableNode#isIn
 * @returns {boolean} false
 */
JAX.DocumentFragment.prototype.isIn = function() {
	console.error("DocumentFragment can not be in DOM. Do not used method isIn().")

	return false;
};

/** 
 * nepodporováno u window.DocumentFragment
 * @see JAX.IMoveableNode#parent
 *
 * @returns {object} null
 */
JAX.DocumentFragment.prototype.parent = function() {
	console.error("DocumentFragment can not be in DOM. Do not used method parent(). It is always null.")

	return null;
};

/** 
 * nepodporováno u window.DocumentFragment
 * @see JAX.IMoveableNode#next
 *
 * @returns {object} null
 */
JAX.DocumentFragment.prototype.next = function() {
	console.error("DocumentFragment can not be in DOM. Do not used method next(). It is always null.")

	return null;
};

/** 
 * nepodporováno u window.DocumentFragment
 * @see JAX.IMoveableNode#previous
 *
 * @returns {object} null
 */
JAX.DocumentFragment.prototype.previous = function() {
	console.error("DocumentFragment can not be in DOM. Do not used method previous(). It is always null.")

	return null;
};
