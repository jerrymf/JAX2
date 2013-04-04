#!/bin/sh
# Zretezeni vsech knihoven do jedne
cd src
echo "(function() {" > ../lib/jax.js

cat core.js >> ../lib/jax.js
cat inode.js >> ../lib/jax.js
cat htmlelm.js >> ../lib/jax.js
cat textnode.js >> ../lib/jax.js
cat animation.js >> ../lib/jax.js

echo "if (!window.JAX) { window.JAX = JAX; }" >> ../lib/jax.js
echo "" >> ../lib/jax.js
echo "})();" >> ../lib/jax.js

cd ..