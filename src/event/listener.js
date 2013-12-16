/**
 * @fileOverview listener.js - JAX - JAk eXtended
 * @author <a href="mailto:jerrymf@gmail.com">Marek Fojtl</a>
 * @version 1.0
 */

/**
 * Třída rezrezentující listener
 * @class JAX.Listener
 */ 
JAX.Listener = JAK.ClassMaker.makeClass({
	NAME: "JAX.Listener",
	VERSION: "1.0"
});

JAX.Listener.prototype.$constructor = function(jaxElm, type, method) {
	this._jaxElm = jaxElm;
	this._type = type;
	this._method = method;
};

JAX.Listener.prototype.unregister = function() {
	if (!this._method) { return; }
	this._jaxElm.stopListening(this);
	this._method = null;
};

JAX.Listener.prototype.jaxElm = function() {
	return this._jaxElm;
};

JAX.Listener.prototype.method = function() {
	return this._method;
};

JAX.Listener.prototype.type = function() {
	return this._type;
};
