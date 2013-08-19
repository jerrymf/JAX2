JAX.Report = JAK.ClassMaker.makeStatic({
	NAME: "JAX.Report",
	VERSION: "1.0"
});

JAX.Report.error = function(msg, node) {
	if (console.error) {
		console.error("[::JAX::] I found error »»» " + msg + " I will continue but my doing is unstable!");

		if (node) { 
			console.info("[::JAX::] around node »»» ", node); 
		}
	}
};
