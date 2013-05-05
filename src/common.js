if (!window.JAX) { 
	window.JAX = JAX; 
} else {
	if (window.console && window.console.warn) { window.console.warn("window.JAX is already defined. You are probably trying to initiate JAX twice or old version is present."); }
	return;
}

if (!window.$ && !window.$$) {
	window.$ = JAX;
	window.$$ = JAX.all;
}

