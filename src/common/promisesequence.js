/**
 * @fileOverview promisesequence.js - JAX - JAk eXtended
 * @author <a href="mailto:marek.fojtl@firma.seznam.cz">Marek Fojtl</a>
 * @version 1.0
 */

/**
 * @class JAX.PromiseSequence
 * je třída, která umožňuje zpracovat sekvenci Promisů. Umožňuje tak vývojáři plnou kontrolu nad jejich synchronizací a správnou návazností.
 *
 */

JAX.PromiseSequence = function() {
	this._running = false;
	this._canceled = false;
	this._waitings = [];
	this._currentPromise = null;
	this._promises = [];
};

/**
 * přidá Promise na konec fronty
 *
 * @param {function || object} item nabindovaná funkce vracející instanci JAK.Promise || instance JAK.Promise || instance JAX.FX || instance JAK.PromiseSequence
 * @returns {JAX.PromiseSequence}
 */
JAX.PromiseSequence.prototype.waitFor = function(item) {
	var isSupported = item && (typeof(item) == "function" || item instanceof JAK.Promise || item instanceof JAX.FX || item instanceof JAX.PromiseSequence);
	if (!isSupported) {
		console.error("JAX.PromiseSequence: Sorry, but I got unsupported item: " + typeof(item) + ". I expected function, instance of JAK.Promise or instance of JAX.FX.");
		return this;
	}

	this._waitings.push({
		waiting: item,
		thenActions: []
	});

	return this;
};

/**
 * co se má stát po fulfillnutí a po rejectnutí poslední nastavované Promise. Týká se vždy naposledy předané Promise přes waitFor metodu.
 *
 * @param {function} onFulfill fce se zavolá při fulfillnutí Promise
 * @param {function} onReject fce se zavolá při rejectnutí Promise
 *
 * @returns {JAX.PromiseSequence}
 */
JAX.PromiseSequence.prototype.then = function(onFulfill, onReject) {
	this._running = false;

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

	var length = this._waitings.length;

	if (length) {
		var lastWaiting = this._waitings[length - 1];
		lastWaiting.thenActions.push({onFulfill:customOnFulfill, onReject:customOnReject});
	}

	return this;
};

/**
 * spustí celou proceduru. Postupně se začnou provádět všechny asynchronní operace. Další operace začne běžet teprve, až se dokončí předchozí.
 *
 * @returns {JAX.PromiseSequence}
 */
JAX.PromiseSequence.prototype.run = function() {
	if (this._running) { return this; }
	this._processWaiting();
	return this;
};

/**
 * zastaví celou proceduru. Asynchronní operace, které doposud nebyly dokončeny již nebudou dále vykonány.
 *
 * @returns {JAX.PromiseSequence}
 */
JAX.PromiseSequence.prototype.cancel = function() {
	this._canceled = true;
	return this;
};

/**
 * je sekvence běžící?
 *
 * @returns {boolean}
 */
JAX.PromiseSequence.prototype.isRunning = function() {
	this._canceled = true;
	return this;
};

/**
 * je sekvence zrušena?
 *
 * @returns {boolean}
 */
JAX.PromiseSequence.prototype.isCanceled = function() {
	this._canceled = true;
	return this;
};

JAX.PromiseSequence.prototype._processWaiting = function() {
	var waitingData = this._waitings.shift();
	if (!waitingData) { return; }

	var item = waitingData.waiting;

	if (typeof(item) == "function") {
		var promise = item();
	} else {
		var promise = item;
	}

	this._currentPromise = promise;
	this._promises.push(promise);

	var thenActions = waitingData.thenActions;

	for (var i=0, len=thenActions.length; i<len; i++) {
		var thenAction = thenActions[i];
		this._currentPromise.then(thenAction.onFulfill, thenAction.onReject);
	}
	
	var finishingAction = function() {
		if (this._canceled) { this._clear(); return; }
		this._processWaiting();
	}.bind(this);

	this._currentPromise.then(finishingAction, finishingAction);

	this._running = true;
};

JAX.PromiseSequence.prototype._clear = function() {
	this._waitings = [];
	this._currentPromise = null;
	this._promises = [];
};
