#!/bin/sh
# Zretezeni vsech knihoven do jedne
cd src
echo "(function() {" > ../lib/jax.js

cat core.js >> ../lib/jax.js
cat node.js >> ../lib/jax.js
cat nodearray.js >> ../lib/jax.js
cat dombuilder.js >> ../lib/jax.js
cat animation.js >> ../lib/jax.js
cat e.js >> ../lib/jax.js
cp ./dependencies/jak.js ../lib/jak.js
cp ./dependencies/interpolator.js ../lib/interpolator.js

echo "if (!window.JAX) { window.JAX = JAX; }" >> ../lib/jax.js
echo "" >> ../lib/jax.js
echo "})();" >> ../lib/jax.js

cat ../lib/jak.js > ../lib/jax-all.js
cat ../lib/interpolator.js >> ../lib/jax-all.js
cat ../lib/jax.js >> ../lib/jax-all.js

java -jar ../bin/compiler.jar --js ../lib/jax-all.js  --js_output_file ../lib/jax-all-minified.js --compilation_level ADVANCED_OPTIMIZATIONS

cd ..