describe("JAX Core", function() {
	beforeEach(
		function() {
			var div = document.createElement("div");
			div.id = "jax-element";
			div.className = "jax-element-class";
			document.body.appendChild(div);
		}
	);
	
	afterEach(
		function() {
			var testBox = document.querySelector("#jax-element");
			if (testBox) { testBox.parentNode.removeChild(testBox); }
		}
	);

    it("should find JAX in window", function() {
		var type = typeof(window.JAX);
		expect(type).toEqual("function");
	});

    it("should return instance of JAX.NullNode", function() {
		var elmNull = JAX(null);
		var elmNumber = JAX(1);
		var elmArray = JAX([]);
		var elmBool = JAX(true);
		var elmUndefined = JAX(undefined);
		var elmNotExisting = JAX("#not-existing-element");

		expect(elmNull instanceof JAX.NullNode).toEqual(true);
		expect(elmNumber instanceof JAX.NullNode).toEqual(true);
		expect(elmArray instanceof JAX.NullNode).toEqual(true);
		expect(elmBool instanceof JAX.NullNode).toEqual(true);
		expect(elmUndefined instanceof JAX.NullNode).toEqual(true);
		expect(elmNotExisting instanceof JAX.NullNode).toEqual(true);
	});

	it("should return instance of JAX.Element", function() {
		var elmId = JAX("#jax-element");
		var elmObj = JAX(document.getElementById("jax-element"));
		var elmJax = JAX(elmId);

		expect(elmId instanceof JAX.Element).toEqual(true);
		expect(elmObj instanceof JAX.Element).toEqual(true);
		expect(elmJax instanceof JAX.Element).toEqual(true);
	});

	it("should return instance of JAX.TextNode", function() {
		var elm = JAX(document.createTextNode("x"));

		expect(elm instanceof JAX.TextNode).toEqual(true);
	});

	it("should return instance of JAX.DocumentFragment", function() {
		var elm = JAX(document.createDocumentFragment());

		expect(elm instanceof JAX.DocumentFragment).toEqual(true);
	});

	it("should return instance of JAX.Document", function() {
		var elm = JAX(document);

		expect(elm instanceof JAX.Document).toEqual(true);
	});

	it("should return instance of JAX.Window", function() {
		var elm = JAX(window);

		expect(elm instanceof JAX.Window).toEqual(true);
	});

	it("should create div with given className and id and return instance of JAX.Element", function() {
		var elm = JAX.make("div#jax-id.jax-class.jax-class-second");
		var node = elm.node();

		expect(elm instanceof JAX.Element).toEqual(true);
		expect(typeof(node)).toEqual("object");
		expect(node.nodeType).toEqual(1);
		expect(node.tagName.toLowerCase()).toEqual("div");
		expect(node.id).toEqual("jax-id");
		expect(node.classList.contains("jax-class")).toEqual(true);
		expect(node.classList.contains("jax-class-second")).toEqual(true);
	});

	it("should create div with given attributes and return instance of JAX.Element", function() {
		var elm = JAX.make("input", {id:"jax-id", className:"jax-class", type:"text", value:"text"});
		var node = elm.node();

		expect(elm instanceof JAX.Element).toEqual(true);
		expect(typeof(node)).toEqual("object");
		expect(node.nodeType).toEqual(1);
		expect(node.tagName.toLowerCase()).toEqual("input");
		expect(node.id).toEqual("jax-id");
		expect(node.classList.contains("jax-class")).toEqual(true);
		expect(node.type).toEqual("text");
		expect(node.value).toEqual("text");
	});

	it("should create div with given style properties and return instance of JAX.Element", function() {
		var elm = JAX.make("div", null, {width:"100px", height:"100px"});
		var node = elm.node();

		expect(elm instanceof JAX.Element).toEqual(true);
		expect(typeof(node)).toEqual("object");
		expect(node.nodeType).toEqual(1);
		expect(node.tagName.toLowerCase()).toEqual("div");
		expect(node.style.width).toEqual("100px");
		expect(node.style.height).toEqual("100px");
	});

	it("should create text node and return instance of JAX.TextNode", function() {
		var elm = JAX.makeText("x");
		var node = elm.node();

		expect(elm instanceof JAX.TextNode).toEqual(true);
		expect(typeof(node)).toEqual("object");
		expect(node.nodeType).toEqual(3);
		expect(node.nodeValue).toEqual("x");
	});
});