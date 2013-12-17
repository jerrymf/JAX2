/**
 * @fileOverview ilistening.js - JAX - JAk eXtended
 * @author <a href="mailto:jerrymf@gmail.com">Marek Fojtl</a>
 * @version 2.0
 */

/**
 * Rozhrani implementujici praci s navesovanim a odvesovanim udalosti
 * @class JAX.IListening
 */
JAX.IListening = JAK.ClassMaker.makeInterface({
	NAME: "JAX.IListening",
	VERSION: "2.0"
});

JAX.IListening._listeners = {};

/**
 * @method navěsí posluchač události na element a vrátí instanci JAX.Listener. Při vyvolání události pak do funkce předává jako parametr instanci JAX.Event.
 *
 * @param {string} type typ události ("click", "mousedown", ...)
 * @param {object || function} obj objekt, ve kterém se metoda nachází nebo připravená funkce
 * @param {string || function} func název metody nebo instance funkce, která se má zavolat po té ,co je událost vyvolána
 * @param {boolean} useCapture hodnata použitá jako argument capture pro DOM zachytávání
 * @returns {object} JAX.Listener
 */
JAX.IListening.prototype.listen = function(type, obj, func, useCapture) {
	var eventFunc = null;

	if (typeof(type) != "string") {
		console.error("JAX.IListening.listen: The first argument must be string describing event name. I got " + typeof(type));
		type = "";
	}

	if (!obj) {
		console.error("JAX.IListening.listen: The second argument must be object or function. I got " + typeof(obj));
		eventFunc = function() {};
	}

	if (typeof(obj) == "function") {
		eventFunc = obj;
	} else if (typeof(obj) == "object" && !func) {
		eventFunc = obj;
	} else if (typeof(obj) == "object" && typeof(func) == "string") {
		eventFunc = obj[func];

		if (eventFunc) {
			eventFunc = eventFunc.bind(obj);
		} else {
			console.error("JAX.IListening.listen: The third argument must be function or string with function name placed in object of second argument. I got " + func);	
		}
	} else if (typeof(obj) == "object" && typeof(func) == "function") {
		eventFunc = func.bind(obj);
	} else {
		console.error("JAX.IListening.listen: The second argument must be object or function. I got " + typeof(obj));
		eventFunc = function() {};
	}

	if (typeof(eventFunc) == "function") {
		var f = function(e) {
			eventFunc(new JAX.Event(e));
		};
	} else {
		var f = {
			handleEvent: function(e) {
				eventFunc.handleEvent(new JAX.Event(e));
			}
		}
	}
	
	this._node.addEventListener(type, f, useCapture);
	var objListener = new JAX.Listener(this, type, f);

	if (!JAX.IListening._listeners[type]) {
		JAX.IListening._listeners[type] = [];
	}

	JAX.IListening._listeners[type].push(objListener);

	return objListener;
};

/**
 * @method odvěsí posluchač na základě parametru, což může být typ události ("click", "mousedown", ...), případně lze předat instanci JAX.Listener, kterou vrátila metoda listen nebo metodu zavolat bez parametrů a tím se odvěsí všechny posluchaču na elementu navěšené
 *
 * @param {string || object} listener typ události nebo instance JAX.Listener
 * @returns {object} JAX.Node
 */
JAX.IListening.prototype.stopListening = function(listener) {
	if (!listener && arguments.length) {
		console.error("JAX.IListening.stopListening: Argument must be string with event type or instance of JAX.Listener.");
		type = "";
	}

	if (!arguments.length) {
		for (var i in JAX.IListening._listeners) {
			this.stopListening(i);
		}
		return this;
	}

	if (typeof(listener) == "string") {
		var type = listener;
		var listeners = JAX.IListening._listeners[type] || [];
		var deleteIndexes = [];

		for (var i=0, len=listeners.length; i<len; i++) {
			var l = listeners[i];
			if (l.jaxElm().n == this._node) {
				this._node.removeEventListener(type, l.method());
				deleteIndexes.push(i);
			}
		}

		for (var i=0, len=deleteIndexes.length; i<len; i++) {
			var deleteIndex = deleteIndexes[i];
			listeners.splice(deleteIndex, 1);
		}

		return this;
	} 

	if (listener instanceof JAX.Listener && listener.method()) {
		var type = listener.type();
		this._node.removeEventListener(type, listener.method());

		var listeners = JAX.IListening._listeners[type] || [];
		var deleteIndex = listeners.indexOf(listener);

		if (deleteIndex > -1) {
			listeners.splice(deleteIndex, 1);
		} else {
			console.warn("JAX.IListening.stopListening: I did not find given listener object in my storage. You probably called new JAX.Listener in your code and that's not good practice. Use listen and stopListening method all the time.");
		}

		return this;
	}

	console.error("JAX.IListening.stopListening: For the first argument I expected instance of JAX.Listener, string with event type or you can call it without arguments to stop all events listening.");
	return this;
};
