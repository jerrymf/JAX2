/**
 * @fileOverview event.js - JAX - JAk eXtended
 * @author <a href="mailto:marek.fojtl@firma.seznam.cz">Marek Fojtl</a>
 * @version 1.1
 */

/**
 * @class JAX.Event
 * je třída obalující window.Event pro snadnější práci se stavem událostí
 */

/**
 *
 * @param {object} e událost window.Event
 */
JAX.Event = function(e) {
	this._e = e;
};

/**
 * vrací event object
 *
 * @returns {window.Event}
 */
JAX.Event.prototype.event = function() {
	return this._e;
};

/**
 * zruší výchozí provedení události
 *
 * @returns {JAX.Event}
 */
JAX.Event.prototype.prevent= function() {
	this._e.preventDefault();
	return this;
};

/**
 * stopne probublávání
 *
 * @returns {JAX.Event}
 */
JAX.Event.prototype.stop = function() {
	this._e.stopPropagation();
	return this;
};

/**
 * vrací cílový element
 *
 * @returns {JAX.Node}
 */
JAX.Event.prototype.target = function() {
	return JAX(this._e.target);
};

/**
 * vrací element, na který byla událost zavěšena
 *
 * @returns {JAX.Node}
 */
JAX.Event.prototype.currentTarget = function() {
	return JAX(this._e.currentTarget);
};

/**
 * vrací typ události
 *
 * @returns {string}
 */
JAX.Event.prototype.type = function() {
	return this._e.type;
};
