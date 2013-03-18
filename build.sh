#!/bin/sh
# Zretezeni vsech knihoven do jedne
cd src
echo "(function() {" > ../lib/jax.js

cat core.js >> ../lib/jax.js
cat element.js >> ../lib/jax.js
cat elements.js >> ../lib/jax.js
cat animation.js >> ../lib/jax.js

echo "if (!window.JAX) { window.JAX = JAX; }" >> ../lib/jax.js
echo "" >> ../lib/jax.js
echo "})();" >> ../lib/jax.js

cd ..