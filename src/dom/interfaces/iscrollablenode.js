/**
 * @fileOverview iscrollablenode.js - JAX - JAk eXtended
 * @author <a href="mailto:jerrymf@gmail.com">Marek Fojtl</a>
 * @version 1.0
 */

/**
 * Rozhraní pro nody, u který lze scrollovat obsahem
 * @class
 */
JAX.IScrollableNode = JAK.ClassMaker.makeInterface({
	NAME: "JAX.IScrollableNode",
	VERSION: "1.0"
});

/**
 * @method nascrolluje obsah na zadanou hodnotu. Lze zadat type "left" nebo "top", podle toho, kterým posuvníkem chceme hýbat. Pokud se zadá i duration, scrollování bude animované.
 * @param {string} type "top" nebo "left", podle toho, jestli chceme hýbat s vertikálním nebo horizontálním posuvníkem
 * @param {number} value hodnota v px, kam se má scrollbar posunout
 * @param {string || number} duration délka animace; pokud není zadáno, neanimuje se
 * @returns {object.<JAX.Node> || object.<JAX.FX.Scrolling}
 */
JAX.IScrollableNode.prototype.scroll = function(type, value, duration) {
	if (typeof(type) != "string") {
		console.error("I expected String for my first argument.", this._node);
		type += "";
	}

	var pos = this._getScrollPos();
	var left = pos.left;
	var top = pos.top;

	if (arguments.length == 1) {
		switch(type.toLowerCase()) {
			case "top":
				var retValue = top;
			break;
			case "left":
				var retValue = left;
			break;
			default:
				console.error("You gave me an unsupported type. I expected 'top' or 'left'.", this._node);
				var retValue = 0;
		}

		return retValue;
	}

	var targetValue = parseFloat(value);

	if (!isFinite(targetValue)) {
		console.error("I expected Number or string with number for my second argument.", this._node);
		targetValue = 0;
	}

	var type = type.toLowerCase();

	if (!duration) {
		var pos = {};

		switch(type) {
			case "top":
				pos.top = value;
				pos.left = left;
			break;
			case "left":
				pos.left = value;
				pos.top = top;
			break;
		}

		this._setScrollPos(pos);
		return this;
	}

	var duration = parseFloat(duration);
	if (!isFinite(duration)) {
		console.error("I expected Number or String with number for my third argument.", this._node);
		duration = 1;
	}

	var fx = new JAX.FX.Scrolling(this);
		fx.addProperty(type, value, duration);
		fx.run();
		
	return fx;
};

JAX.IScrollableNode.prototype._getScrollPos = function() {
	if (this.isWindow && "pageXOffset" in this._node) {
		var left = this._node.pageXOffset;
		var top = this._node.pageYOffset;
	} else if (this.isWindow || this.isDocument) {
		var scrollPosDoc = JAK.DOM.getScrollPos();
		var left = scrollPosDoc.x;
		var top = scrollPosDoc.y;
	} else {
		var left = this._node.scrollLeft;
		var top = this._node.scrollTop;
	}

	return {left:left, top:top};
};

JAX.IScrollableNode.prototype._setScrollPos = function(pos) {
	if (this.isWindow) {
		this._node.scrollTo(pos.left, pos.top);
	} else if (this.isDocument) {
		if ("top" in pos) {
			this._node.documentElement.scrollTop = pos.top;
		}

		if ("left" in pos) {
			this._node.documentElement.scrollLeft = pos.left;
		}
	} else {
		if ("top" in pos) {
			this._node.scrollTop = pos.top;
		}

		if ("left" in pos) {
			this._node.scrollLeft = pos.left;
		}
	}
};
