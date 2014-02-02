/**
 * @fileOverview listenerarray.js - JAX - JAk eXtended
 * @author <a href="mailto:jerrymf@gmail.com">Marek Fojtl</a>
 * @version 1.0
 */

/**
 * Třída rezrezentující pole posluchačů
 * @class JAX.ListenerArray
 * @see JAX.IIterable
 */ 
JAX.ListenerArray = JAK.ClassMaker.makeClass({
	NAME: "JAX.ListenerArray",
	VERSION: "1.0",
	IMPLEMENT: [JAX.IIterable]
});

/**
 * @constructor
 * 
 * @param {array} listeners pole instanci JAX.Listener
 */ 
JAX.ListenerArray.prototype.$constructor = function(listeners) {
	this.length = listeners.length;

	for (var i=0; i<this.length; i++) {
		this[i] = listeners[i];
	}
};

/**
 * @method odregistruje všechny posluchače v poli a z pole je odstraní.
 * 
 * returns {object} JAX.ListenerArray
 */ 
JAX.ListenerArray.prototype.unregister = function() {
	var item = null;

	while(item = this.popItem()) {
		item.unregister();
	}

	return this;
};
