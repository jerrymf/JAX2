/**
 * @fileOverview event.js - JAX - JAk eXtended
 * @author <a href="mailto:jerrymf@gmail.com">Marek Fojtl</a>
 * @version 1.0
 */

/**
 * Třída obalující window.Event pro snadnější práci se stavem událostí
 * @class JAX.Event
 */ 
JAX.Event = JAK.ClassMaker.makeClass({
	NAME: "JAX.Event",
	VERSION: "1.0"
});

/**
 * @method $constructor
 *
 * @param {object} e událost window.Event
 */
JAX.Event.prototype.$constructor = function(e) {
	this._e = e;
};

/**
 * @method vrací event object
 *
 * @returns {object} window.Event
 */
JAX.Event.prototype.event = function() {
	return this._e;
};

/**
 * @method zruší výchozí provedení události
 *
 * @returns {object} JAX.Event
 */
JAX.Event.prototype.prevent= function() {
	this._e.preventDefault();
	return this;
};

/**
 * @method stopne probublávání
 *
 * @returns {object} JAX.Event
 */
JAX.Event.prototype.stop = function() {
	this._e.stopPropagation();
	return this;
};

/**
 * @method vrací cílový element
 *
 * @returns {object} JAX.Node
 */
JAX.Event.prototype.target = function() {
	return JAX(this._e.target);
};

/**
 * @method vrací element, na který byla událost zavěšena
 *
 * @returns {object} JAX.Node
 */
JAX.Event.prototype.currentTarget = function() {
	return JAX(this._e.currentTarget);
};

/**
 * @method vrací typ události
 *
 * @returns {string}
 */
JAX.Event.prototype.type = function() {
	return this._e.type;
};
