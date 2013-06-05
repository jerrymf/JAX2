JAX.Report = JAK.ClassMaker.makeStatic({
	NAME: "JAX.Report",
	VERSION: "1.0"
});

JAX.Report.show = function(type, func, msg, node) {
	console.DEBUG = 1;

	if (console[type]) {
		console[type]("[" + func + "] » " + msg);
		if (node) { console.log("Node: ", node); }
		return;
	}
	throw new Error("Bad console type: " + type); 
};
