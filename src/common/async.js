/**
 * @fileOverview asyncsequence.js - JAX - JAk eXtended
 * @author <a href="mailto:marek.fojtl@firma.seznam.cz">Marek Fojtl</a>
 * @version 1.é
 */

/**
 * @class JAX.Async
 * je třída, která umožňuje zpracovat sekvenci nejen Promisů, ale i animací pomocí JAX.FX. Umožňuje tak vývojáři plnou kontrolu nad jejich synchronizací a správnou návazností.
 *
 */

JAX.Async = function() {
	this._running = false;
	this._canceled = false;
	this._pending = false;
	this._waitings = [];
	this._currentPromise = null;
	this._promises = [];
};

/**
 * přidá Promise na konec fronty
 *
 * @param {function | object} item nabindovaná funkce vracející instanci JAK.Promise || instance JAX.FX || instance JAX.Async
 * @returns {JAX.Async}
 */
JAX.Async.prototype.waitFor = function(item) {
	if (this._canceled) { return this; }

	var isSupported = item && (typeof(item) == "function" || item instanceof JAK.Promise || item instanceof JAX.FX || item instanceof JAX.Async);
	if (!isSupported) {
		console.error("JAX.Async: Sorry, but I got unsupported item: " + typeof(item) + ". I expected function, instance of JAK.Promise or instance of JAX.FX.");
		return this;
	}

	this._waitings.push({
		waiting: item,
		thenActions: []
	});

	if (this._running && !this._pending) {
		this._processWaiting();
	}

	return this;
};

/**
 * co se má stát po fulfillnutí a po rejectnutí poslední nastavované Promise. Týká se vždy naposledy předané Promise přes waitFor metodu.
 *
 * @param {function} onFulfill fce se zavolá při fulfillnutí Promise
 * @param {function} onReject fce se zavolá při rejectnutí Promise
 *
 * @returns {JAX.Async}
 */
JAX.Async.prototype.after = function(onFulfill, onReject) {
	if (this._canceled) { return this; }

	var customOnFulfill = function(value) {
		if (this._canceled) { return; }
		if (typeof(onFulfill) == "function") {
			return onFulfill(value);
		}
	}.bind(this);

	var customOnReject = function(value) {
		if (this._canceled) { return; }
		if (typeof(onReject) == "function") {
			return onReject(value);
		}
	}.bind(this);

	var afterAction = {onFulfill:customOnFulfill, onReject:customOnReject};
	var length = this._waitings.length;

	if (length) {
		var lastWaiting = this._waitings[length - 1];
		lastWaiting.thenActions.push(afterAction);
	} else if (this._currentPromise) {
		this._processThenActions([afterAction]);
	}

	return this;
};

/**
 * spustí celou proceduru. Postupně se začnou provádět všechny asynchronní operace. Další operace začne běžet teprve, až se dokončí předchozí.
 *
 * @returns {JAX.Async}
 */
JAX.Async.prototype.run = function() {
	if (this._running || this._canceled) { return this; }
	this._canceled = false;
	this._pending = false;
	this._running = true;
	this._processWaiting();
	return this;
};

/**
 * zastaví čekání na dokončení všech navěšených akcí. Asynchronní operace, které doposud nebyly vykonány již vykonány nebudou.
 *
 * @returns {JAX.Async}
 */
JAX.Async.prototype.cancel = function() {
	this._canceled = true;
	return this;
};

/**
 * je sekvence běžící?
 *
 * @returns {boolean}
 */
JAX.Async.prototype.isRunning = function() {
	return this._running;
};

/**
 * je sekvence zrušena?
 *
 * @returns {boolean}
 */
JAX.Async.prototype.isCanceled = function() {
	return this._canceled;
};

/**
 * čeká se na nějakou asynchronní akce?
 *
 * @returns {boolean}
 */
JAX.Async.prototype.isPending = function() {
	return this._pending;
};

JAX.Async.prototype._processWaiting = function() {
	this._pending = false;

	var waitingData = this._waitings.shift();
	if (!waitingData) { return; }

	var item = waitingData.waiting;

	if (typeof(item) == "function") {
		var promise = item();
	} else {
		var promise = item;
	}

	if (!(promise instanceof JAK.Promise) && !(promise instanceof JAX.FX) && !(promise instanceof JAX.Async)) {
		console.error("JAX.Async: when I tried to process next waiting Promise, I got unsupported stuff", promise);
		return;
	}

	this._currentPromise = promise;
	this._promises.push(promise);

	this._processThenActions(waitingData.thenActions);

	this._pending = true;
};

JAX.Async.prototype._processThenActions = function(thenActions) {
	for (var i=0, len=thenActions.length; i<len; i++) {
		var thenAction = thenActions[i];
		this._addAfterAction(thenAction.onFulfill, thenAction.onReject);
	}

	var finishingAction = function() {
		if (this._canceled) { this._clear(); return; }
		this._processWaiting();
	}.bind(this);

	this._addAfterAction(finishingAction, finishingAction);
};

JAX.Async.prototype._clear = function() {
	this._waitings = [];
	this._currentPromise = null;
	this._promises = [];
	this._running = false;
	this._pending = false;
};

JAX.Async.prototype._addAfterAction = function(onFulfill, onReject) {
	if (this._currentPromise instanceof JAX.Async) {
		this._currentPromise.after(onFulfill, onReject);
		return;
	}
	this._currentPromise.then(onFulfill, onReject);
};
