/**
 * @fileOverview iiterable.js - JAX - JAk eXtended
 * @author <a href="mailto:marek.fojtl@firma.seznam.cz">Marek Fojtl</a>
 * @version 1.1
 */

/**
 * @class JAX.IIterable
 * tvoří rozhraní pro iterovatelé prvky, které je svým chováním velice podobné datovému typu Array
 */

JAX.IIterable = function() {};

/**
 * vrací true v případě, že je pole nenulové
 */
JAX.IIterable.prototype.exist = function() {
	return !!this.length;
};

/**
 * vrací konkrétní prvek v poli určený dle číselného indexu
 *
 * @param {number} index
 * @returns {any}
 */
JAX.IIterable.prototype.item = function(index) {
	var index = index || 0;
	return this[index];
};

/**
 * vrací pole prvků určené rozmezím od - do a to včetně těchto prvků
 *
 * @param {number} from od kterého prvku
 * @param {number} to do kterého prvku
 * @returns {array}
 */
JAX.IIterable.prototype.items = function(from, to) {
	var from = arguments.length ? parseFloat(from) : 0;
	var to = arguments.length > 1 ? parseFloat(to) : this.length;

	from = Math.min(Math.max(from, 0), this.length -1);
	to = Math.max(Math.min(to, this.length - 1), 0);

	from = !isFinite(from) ? 0 : from;
	to = !isFinite(to) ? 0 : to;

	if (from == to) {
		return [this[from]];
	}

	var items = new Array(to-from);

	for (var i=from; i<=to; i++) {
		items[i] = this[i];
	}

	return items;
};

/**
 * vrací první prvek v poli
 *
 * @returns {any}
 */
JAX.IIterable.prototype.firstItem = function() {
	return this[0];
};

/**
 * vrací poslední prvek v poli
 *
 * @returns {any}
 */
JAX.IIterable.prototype.lastItem = function() {
	return this[this.length - 1];
};

/**
 * přidá prvek do pole a umístí ho na konec pole
 *
 * @param {any} item
 * @returns {any}
 */
JAX.IIterable.prototype.pushItem = function(item) {
	this.length++;
	this[this.length - 1] = item;
	return this;
};

/**
 * odebere prvek z konce pole a zmenší velikost pole o 1 prvek
 *
 * @returns {any}
 */
JAX.IIterable.prototype.popItem = function() {
	if (this.length > 0) {
		var item = this[this.length - 1];
		delete this[this.length - 1];
		this.length--;
		return item;
	}
	return null;
};

/**
 * odebere první prvek a zmenší velikost pole o 1 prvek
 *
 * @returns {any}
 */
JAX.IIterable.prototype.shiftItem = function() {
	var item = this[0];
	if (item) {
		this.length--;
		for (var i=0; i<this.length; i++) {
			this[i] = this[i+1];
		}
		return item;
	}

	return null;
};

/**
 * vloží prvek na první místo v poli a zvětší velikost pole o 1 prvek
 *
 * @param {any} item
 * @returns {any}
 */
JAX.IIterable.prototype.unshiftItem = function(item) {
	this.length++;
	for (var i=this.length - 1; i>0; i--) {
		this[i] = this[i - 1];
	}
	this[0] = item;

	return this;
};

/**
 * zjistí, na kolikátém místě se prvek v poli nachází (číslováno od nuly). Pokud nenajde, vrací -1.
 *
 * @param {any} item
 * @returns {number}
 */
JAX.IIterable.prototype.index = function(item) {
	for (var i=0; i<this.length; i++) {
		var myItem = this[i];
		if (myItem == item) { return i; }
	}

	return -1;
};

/**
 * iteruje postupně všechny prvky v poli a volá nad nimi zadanou funkci
 *
 * @param {function} func zadaná funkce
 * @param {object} obj object, v jehož kontextu bude funkce volána
 * @returns {number}
 */
JAX.IIterable.prototype.forEachItem = function(func, obj) {
	var func = obj ? func.bind(obj) : func;

	for (var i=0; i<this.length; i++) {
		func(this[i], i, this);
	}

	return this;
};

/**
 * pomocí zadané funkce vrací vyfiltrované pole. Do funkce jsou prvky v každé iteraci jednotlivě předány a pokud splní podmínku, prvek se do vráceného filtrovaného pole zařadí.
 *
 * @param {function} func zadaná funkce
 * @param {object} obj object, v jehož kontextu bude funkce volána
 * @returns {object}
 */
JAX.IIterable.prototype.filterItems = function(func, obj) {
	var func = obj ? func.bind(obj) : func;
	var filtered = [];

	for (var i=0; i<this.length; i++) {
		if (func(this[i], i, this)) {
			filtered.push(this[i]);
		}
	}

	return JAX.all(filtered);
};
