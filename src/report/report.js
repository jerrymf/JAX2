JAX.Report = JAK.ClassMaker.makeStatic({
	NAME: "JAX.Report",
	VERSION: "1.1"
});

JAX.Report.STRICT_MODE = 1;
JAX.Report.STANDARD_MODE = 2;

JAX.Report.MODE = JAX.Report.STANDARD_MODE;

JAX.Report.error = function(msg, node) {
	var stack = JAX.Report._getStack();

	switch (JAX.Report.MODE) {
		case JAX.Report.STRICT_MODE:
			var msg = "[::JAX::] I found error »»» " + msg + "\n";
			if (stack) {
				msg += "[::JAX::] I have stack trace for you: \n";
				msg += "[::JAX::] " + stack.toString().replace(/\n/g, "\n[::JAX::] ") + "»»» End of stack trace «««";
			};
			throw new Error(msg);
		break;
		case JAX.Report.STANDARD_MODE:
			if (console.log && !console.info) { console.info = console.log; }
			if (console.log && !console.error) { console.error = console.log; }

			if (console.error) {
				console.error("[::JAX::] I found error »»» " + msg + " I will continue but my doing is unstable!");

				if (node) { 
					console.info("[::JAX::] around node »»» ", node); 
				}
				
				if (stack) {	
					console.info("[::JAX::] I have stack trace for you: ");
					console.info("[::JAX::] " + stack.toString().replace(/\n/g, "\n[::JAX::] ")  + "»»» End of stack trace «««");
				}
			}
		break;
	}
};

JAX.Report._getStack = function() {
	try {
		throw new Error("");
	} catch(e) {
		return e.stack;
	}
};
