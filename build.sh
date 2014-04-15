#!/bin/sh
# Zretezeni vsech knihoven do jedne
cd src

cat polyfills/getcomputedstyle.js > ../lib/jax.js
cat polyfills/ie8-elements.js >> ../lib/jax.js
cat jax.js >> ../lib/jax.js
cat common/interfaces/iiterable.js >> ../lib/jax.js
cat common/async.js >> ../lib/jax.js
cat event/interfaces/ilistening.js >> ../lib/jax.js
cat event/event.js >> ../lib/jax.js
cat event/listener.js >> ../lib/jax.js
cat event/listenerarray.js >> ../lib/jax.js
cat dom/interfaces/imoveablenode.js >> ../lib/jax.js
cat dom/interfaces/inodewithchildren.js >> ../lib/jax.js
cat dom/interfaces/isearchablenode.js >> ../lib/jax.js
cat dom/interfaces/ianimateablenode.js >> ../lib/jax.js
cat dom/interfaces/iscrollablenode.js >> ../lib/jax.js
cat dom/node.js >> ../lib/jax.js
cat dom/element.js >> ../lib/jax.js
cat dom/textnode.js >> ../lib/jax.js
cat dom/document.js >> ../lib/jax.js
cat dom/documentfragment.js >> ../lib/jax.js
cat dom/nullnode.js >> ../lib/jax.js
cat dom/window.js >> ../lib/jax.js
cat dom/nodearray.js >> ../lib/jax.js
cat fx/fx.js >> ../lib/jax.js
cat fx/fxarray.js >> ../lib/jax.js
cat fx/fx-css3.js >> ../lib/jax.js
cat fx/fx-interpolator.js >> ../lib/jax.js
cat fx/fx-scrolling.js >> ../lib/jax.js
echo "" >> ../lib/jax.js

cp ../dependencies/jak.js ../lib/jak.js
cp ../dependencies/interpolator.js ../lib/interpolator.js
cp ../dependencies/parser.js ../lib/parser.js

java -jar ../bin/compiler.jar --js ../lib/jax.js  --js_output_file ../lib/jax-minified.js

cd ..