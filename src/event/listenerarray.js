/**
 * @fileOverview listenerarray.js - JAX - JAk eXtended
 * @author <a href="mailto:jerrymf@gmail.com">Marek Fojtl</a>
 * @version 1.0
 */

/**
 * Třída rezrezentující listener
 * @class JAX.ListenerArray
 */ 
JAX.ListenerArray = JAK.ClassMaker.makeClass({
	NAME: "JAX.ListenerArray",
	VERSION: "1.0"
});

JAX.ListenerArray.prototype.$constructor = function(listeners) {
	this._listeners = listeners;
};

JAX.ListenerArray.prototype.unregister = function() {
	for (var i=0, len=this._listeners.length; i<len; i++) {
		this._listeners[i].unregister();
	}
	this._listeners = [];
};

JAX.ListenerArray.prototype.getListeners = function() {
	return this._listeners.slice();	
};
