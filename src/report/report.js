JAX.Report = JAK.ClassMaker.makeStatic({
	NAME: "JAX.Report",
	VERSION: "1.0"
});

JAX.Report.error = function(msg, node) {
	if (console.error) {
		console.error("[::JAX::] Found error »»» " + msg + " I will continue but my doing is unstable!");
		if (node) { console.log("[::JAX::] Problem node »»» ", node); }
	}
};
