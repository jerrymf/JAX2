JAX.MagicTools = JAK.ClassMaker.makeSingleton({
	NAME:"JAX.MagicTools",
	VERSION:"0.1"
});

JAX.MagicTools.prototype.$constructor = function() {
	this._dom = {};
	this._ec = [];

	/* vytvoreni zakladnich kontejneru */
	this._dom.container = JAX.make("div#JAX-MagicTools");
	this._dom.tabs = JAX.make("div.jaxmt-tabs").appendTo(this._dom.container);
	this._dom.content = JAX.make("div.jaxmt-content").appendTo(this._dom.container);

	this._active = false;
	this._activateKeys = [73,68,68,81,68]; /* aktivace pred iddqd */
	this._typedKeys = [];

	/* naveseni udalosti pro zobrazeni tools */
	var body = new JAX.HTMLElm(document.body);
	this._ec.push(body.listen("keydown", "_handleKey", this));
};

JAX.MagicTools.prototype.activate = function() {
	if (this._active) { return; }
	this._dom.container.appendTo(document.body);
};

JAX.MagicTools.prototype.deactivate = function() {
	if (!this._active) { return; }
	this._dom.container.removeFromDOM();
};

JAX.MagicTools.prototype._handleKey = function(e, elm) {
	if (this._active)  { return; }

	var key = e.keyCode;
	this._typedKeys.push(key);

	if (this._typedKeys.length < 5) { return; }

	for (var i=0, len=this._typedKeys.length; i<len; i++) {
		var typedKey = this._typedKeys[i];
		if (typedKey != this._activateKeys[i]) { this._typeKeys = []; return; }
	}

	this.activate();
};

JAK.Events.onDomReady(window, function() { JAX.MagicTools.getInstance() });

