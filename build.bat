REM Zretezeni vsech knihoven do jedne
@ECHO OFF

ECHO (function() { > jax.js
ECHO. >> jax.js
type ".\src\core.js" >> jax.js
ECHO. >> jax.js
type ".\src\inode.js" >> jax.js
ECHO. >> jax.js
type ".\src\textnode.js" >> jax.js
ECHO. >> jax.js
type ".\src\htmlelm.js" >> jax.js
ECHO. >> jax.js
type ".\src\htmldoc.js" >> jax.js
ECHO. >> jax.js
type ".\src\animation.js" >> jax.js
ECHO. >> jax.js
ECHO if (!window.JAX) { window.JAX = JAX; } >> jax.js
ECHO. >> jax.js
ECHO })(); >> jax.js

XCOPY /Y jax.js "./lib/jax.js"
DEL jax.js