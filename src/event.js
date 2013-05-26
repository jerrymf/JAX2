JAX.Event = JAK.ClassMaker.makeClass({
	NAME: "JAX.Event",
	VERSION: "1.0"
});

JAX.Event.prototype.$constructor = function(e) {
	this._e = e;
};

JAX.Event.prototype.event = function() {
	return this._e;
};

JAX.Event.prototype.cancel = function() {
	JAK.Events.cancelDef(this._e);
};

JAX.Event.prototype.stop = function() {
	JAK.Events.stopEvent(this._e);
};

JAX.Event.prototype.target = function() {
	return JAX(JAK.Events.getTarget(this._e));
};

JAX.Event.prototype.type = function() {
	return this._e.type;
};
