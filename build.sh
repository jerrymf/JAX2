#!/bin/sh
# Zretezeni vsech knihoven do jedne
cd src

cat core.js > ../lib/jax.js
cat event/ilistening.js >> ../lib/jax.js
cat event/event.js >> ../lib/jax.js
cat event/listener.js >> ../lib/jax.js
cat dom/jaxnode.js >> ../lib/jax.js
cat dom/node.js >> ../lib/jax.js
cat dom/element.js >> ../lib/jax.js
cat dom/element-getcomputedstyle.js >> ../lib/jax.js
cat dom/textnode.js >> ../lib/jax.js
cat dom/documentnode.js >> ../lib/jax.js
cat dom/documentfragmentnode.js >> ../lib/jax.js
cat dom/nullnode.js >> ../lib/jax.js
cat dom/nodearray.js >> ../lib/jax.js
cat fx/fx.js >> ../lib/jax.js
cat report/report.js >> ../lib/jax.js
echo "" >> ../lib/jax.js

cp ../dependencies/jak.js ../lib/jak.js
cp ../dependencies/interpolator.js ../lib/interpolator.js
cp ../dependencies/parser.js ../lib/parser.js

java -jar ../bin/compiler.jar --js ../lib/jax.js  --js_output_file ../lib/jax-minified.js

cd ..