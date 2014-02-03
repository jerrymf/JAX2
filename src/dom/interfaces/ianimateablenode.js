/**
 * @fileOverview ianimateablenode.js - JAX - JAk eXtended
 * @author <a href="mailto:marek.fojtl@firma.seznam.cz">Marek Fojtl</a>
 * @version 1.0
 */

/**
 * @class JAX.IAnimateableNode
 * tvoří rozhraní pro nody, které lze animovat
 */
JAX.IAnimateableNode = JAK.ClassMaker.makeInterface({
	NAME: "JAX.IAnimateableNode",
	VERSION: "1.0"
});

/**
 * animuje konkrétní css vlastnost
 * @param {string} property css vlastnost, která se má animovat
 * @param {string || number} duration délka animace - lze zadat i jednotky s nebo ms (výchozí jsou ms)
 * @param {string || number} start počáteční hodnota - je dobré k ní uvést vždy i jednotky (pokud jde o číselnou hodnotu) a jako výchozí se používají px
 * @param {string || number} end koncová hodnota - je dobré k ní uvést vždy i jednotky (pokud jde o číselnou hodnotu) a jako výchozí se používají px
 * @param {string} method css transformační metoda (ease, linear, ease-in, ease-out, ... ) více na <a href="http://www.w3.org/TR/2009/WD-css3-transitions-20090320/#transition-timing-function_tag">webu W3C</a>, pozn.: pokud prohlížeč neumí transitions, je použito js řešení a metoda je vždy LINEAR
 * @returns {JAX.FX}
 */
JAX.IAnimateableNode.prototype.animate = function(property, duration, start, end, method) {
	if (typeof(property) != "string") {
		type += "";
		console.error("For first argument I expected string.", this._node); 
	}

	var fx = new JAX.FX(this);
	fx.addProperty.apply(fx, arguments);
	fx.run();

	return fx;
};

/**
 * animuje průhlednost
 * @param {string} type "in" (od 0 do 1) nebo "out" (od 1 do 0)
 * @param {string || number} duration délka animace - lze zadat i jednotky s nebo ms (výchozí jsou ms)
 * @param {string} method css transformační metoda (ease, linear, ease-in, ease-out, ... ) více na <a href="http://www.w3.org/TR/2009/WD-css3-transitions-20090320/#transition-timing-function_tag">webu W3C</a>, pozn.: pokud prohlížeč neumí transitions, je použito js řešení a metoda je vždy LINEAR
 * @returns {JAX.FX}
 */
JAX.IAnimateableNode.prototype.fade = function(type, duration, method) {
	if (typeof(type) != "string") {
		type += "";
		console.error("For first argument I expected string.", this._node); 
	}

	switch(type) {
		case "in":
			return this.animate("opacity", duration, 0, 1, method);
		break;
		case "out":
			return this.animate("opacity", duration, 1, 0, method);
		break;
		default:
			console.error("I got unsupported type '" + type + "'.", this._node);
			var fx = new JAX.FX(null);
			fx.run();
			return fx;
	}
};

/**
 * animuje průhlednost do určité hodnoty
 * @param {string || number} opacityValue hodnota průhlednosti, do které se má animovat. Jako výchozí se bere aktuální hodnota
 * @param {string || number} duration délka animace - lze zadat i jednotky s nebo ms (výchozí jsou ms)
 * @param {string} method css transformační metoda (ease, linear, ease-in, ease-out, ... ) více na <a href="http://www.w3.org/TR/2009/WD-css3-transitions-20090320/#transition-timing-function_tag">webu W3C</a>, pozn.: pokud prohlížeč neumí transitions, je použito js řešení a metoda je vždy LINEAR
 * @returns {JAX.FX}
 */
JAX.IAnimateableNode.prototype.fadeTo = function(opacityValue, duration, method) {
	var opacityValue = parseFloat(opacityValue) || 0;

	if (opacityValue<0) {
		opacityValue = 0;
		console.error("For first argument I expected positive number, but I got negative. I set zero value.", this._node); 
	}

	return this.animate("opacity", duration, null, opacityValue, method);
};

/**
 * zobrazí element pomocí animace výšky nebo šířky
 * @param {string} type "down" nebo "up" pro animaci výšky nebo "left", "right" pro animaci šířky
 * @param {string || number} duration délka animace - lze zadat i jednotky s nebo ms (výchozí jsou ms)
 * @param {string} method css transformační metoda (ease, linear, ease-in, ease-out, ... ) více na <a href="http://www.w3.org/TR/2009/WD-css3-transitions-20090320/#transition-timing-function_tag">webu W3C</a>, pozn.: pokud prohlížeč neumí transitions, je použito js řešení a metoda je vždy LINEAR
 * @returns {JAX.FX}
 */
JAX.IAnimateableNode.prototype.slide = function(type, duration, method) {
	if (typeof(type) != "string") {
		type += "";
		console.error("For first argument I expected string.", this._node);
	}

	var backupStyles = {};
	switch(type) {
		case "down":
			backupStyles = this.css(["overflow", "height"]);
			var property = "height";
			var start = 0;
			var end = null;
		break;
		case "up":
			var property = "height";
			var start = null
			var end = 0;
		break;
		case "left":
			var property = "width";
			var start = null;
			var end = 0;
		break;
		case "right":
			backupStyles = this.css(["overflow", "width"]);
			var property = "width";
			var start = 0;
			var end = null;
		break;
		default:
			console.error("I got unsupported type '" + type + "'.", this._node);
			var fx = new JAX.FX(null);
			fx.run();
			return fx;
	}

	this.css("overflow", "hidden");

	var func = function() { this.css(backupStyles); }.bind(this);
	var fx = this.animate(property, duration, start, end, method);
	fx.then(func);

	return fx;
};
