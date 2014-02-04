JAX2
====

JAX2 - JAK eXtended ver. 2

JAX je knihovna, která rozšiřuje možnosti knihovny JAK (http://github.com/seznam/JAK) a je na ní přímo závislá. Vylepšuje práci s DOMem a přidává podporu animací i pro starší prohlížeče (IE8 a IE9). Jejím cílem není nahradit knihovnu JAK, nýbrž stavět rozšiřující funkcionalitu nad jejím low-level API.


Základní použití
---

Provedením JAX(selector) získáme první element, který odpovídá zadanému css selectoru. Toto volání nám vrací objekt - obal (wrapper) nad získaným elementem. V praxi to znamená, že pak můžeme na element aplikovat rozšířené metody, např:

Mějme HTML:

<pre>
  &lt;style&gt;
    .greetings { font-weight:bold; }
    .green     { color:green; }
  &lt;/style&gt;
  &lt;body&gt;
    &lt;div class="greetings"&gt;Hello world&lt;/div&gt;
    &lt;div class="text"&gt;Good evening ... infidels&lt;/div&gt;
  &lt;/body&gt;
</pre>

pak, pokud aplikujeme:
<pre>
  &lt;script type="text/javascript"&gt;
    JAX(".greetings").addCLass("green").html("Ahoj světe").css("fontSize", "20px");
  &lt;/script&gt;
</pre>

tak výsledné HTML bude:
<pre>
  &lt;div class="greetings green"&gt;Ahoj světe&lt;/div&gt;
</pre>
a text bude vypsán písmem o velikosti 20px. Druhý div zůstane nezměněn

Pro práci s více elementy najednou se používá JAX.all(selector), což nám získá všechny elementy odpovídající zadanému css selectoru.
Pokud tedy na výše uvedené HTML aplikujeme:
<pre>
 &lt;script type="text/javascript"&gt;
    JAX.all("div").addCLass("green").html("Have a problem, make a point, take it easy, smoke a joint.").css("fontSize", "20px");
  &lt;/script&gt;
</pre>

tak výsledné HTML bude vypadat:
<pre>
  &lt;div class="greetings green"&gt;Have a problem, make a point, take it easy, smoke a joint.&lt;/div&gt;
  &lt;div class="text green"&gt;Have a problem, make a point, take it easy, smoke a joint.&lt;/div&gt;
</pre>

a text bude vypsán písmem o velikosti 20px.
