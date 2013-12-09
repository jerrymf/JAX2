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
	VERSION: "1.0",
	IMPLEMENT: [JAX.IIterable]
});

JAX.ListenerArray.prototype.$constructor = function(listeners) {
	this.length = listeners.length;

	for (var i=0; i<this.length; i++) {
		this[i] = listeners[i];
	}
};

JAX.ListenerArray.prototype.unregister = function() {
	for (var i=0; i<this.length; i++) {
		this[i].unregister();
		delete this[i];
	}
};
