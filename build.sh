#!/bin/sh
# Zretezeni vsech knihoven do jedne
cd src

cat core.js > ../lib/jax.js
cat nodetypes/jaxnode.js >> ../lib/jax.js
cat nodetypes/node.js >> ../lib/jax.js
cat nodetypes/element.js >> ../lib/jax.js
cat nodetypes/element-getcomputedstyle.js >> ../lib/jax.js
cat nodetypes/textnode.js >> ../lib/jax.js
cat nodetypes/nullnode.js >> ../lib/jax.js
cat nodearray.js >> ../lib/jax.js
cat event.js >> ../lib/jax.js
cat listener.js >> ../lib/jax.js
cat dombuilder.js >> ../lib/jax.js
cat fx.js >> ../lib/jax.js
cat report.js >> ../lib/jax.js
echo "" >> ../lib/jax.js

cp ../dependencies/jak.js ../lib/jak.js
cp ../dependencies/interpolator.js ../lib/interpolator.js
cp ../dependencies/parser.js ../lib/parser.js

java -jar ../bin/compiler.jar --js ../lib/jax.js  --js_output_file ../lib/jax-minified.js

cd ..