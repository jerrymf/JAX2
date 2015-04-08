describe("JAX Element", function() {
    var div;

    beforeEach(
        function() {
            div = document.createElement("div");
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

    it("should set attribute 'data-test' with value '1' and return instance of JAX.Element", function() {
        var jaxDiv = JAX(div).attr("data-test", "1");
        expect(div.getAttribute("data-test")).toEqual("1");
        expect(jaxDiv instanceof JAX.Element).toEqual(true);
    });

    it("should get value of attribute 'data-test'", function() {
        var jaxDiv = JAX(div).attr("data-test", "1");
        expect(jaxDiv.attr("data-test")).toEqual("1");
    });

    it("should remove attribute 'data-test'", function() {
        var jaxDiv = JAX(div);
        jaxDiv.attr("data-test", "1");
        jaxDiv.removeAttr("data-test");
        expect(div.hasAttribute("data-test")).toEqual(false);
    });

    it("should return false value because div has not 'data-test' attribute", function() {
        var jaxDiv = JAX(div);
        var result = jaxDiv.hasAttr("data-test");
        expect(result).toEqual(false);
    });

    it("should return true value because div has 'data-test' attribute", function() {
        var jaxDiv = JAX(div).attr("data-test", "1");
        var result = jaxDiv.hasAttr("data-test");
        expect(result).toEqual(true);
    });
});