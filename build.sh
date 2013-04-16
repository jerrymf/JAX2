#!/bin/sh
# Zretezeni vsech knihoven do jedne
cd src
echo "(function() {" > ../lib/jax.js

cat core.js >> ../lib/jax.js
cat nodehtml.js >> ../lib/jax.js
cat nodetext.js >> ../lib/jax.js
cat nodedoc.js >> ../lib/jax.js
cat nodedocfrag.js >> ../lib/jax.js
cat nodearray.js >> ../lib/jax.js
cat dombuilder.js >> ../lib/jax.js
cat animation.js >> ../lib/jax.js

echo "if (!window.JAX) { window.JAX = JAX; }" >> ../lib/jax.js
echo "" >> ../lib/jax.js
echo "})();" >> ../lib/jax.js

cd ..