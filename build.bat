REM Zretezeni vsech knihoven do jedne
@ECHO OFF

ECHO (function() { > ".\lib\jax.js"
ECHO. >> ".\lib\jax.js"
type ".\src\core.js" >> ".\lib\jax.js"
ECHO. >> ".\lib\jax.js"
type ".\src\node.js" >> ".\lib\jax.js"
ECHO. >> ".\lib\jax.js"
type ".\src\nodearray.js" >> ".\lib\jax.js"
ECHO. >> ".\lib\jax.js"
type ".\src\dombuilder.js" >> ".\lib\jax.js"
ECHO. >> ".\lib\jax.js"
type ".\src\fx.js" >> ".\lib\jax.js"
ECHO. >> ".\lib\jax.js"
type ".\src\e.js" >> ".\lib\jax.js"
ECHO. >> ".\lib\jax.js"
type ".\src\common.js" >> ".\lib\jax.js"
ECHO. >> ".\lib\jax.js"
ECHO })(); >> ".\lib\jax.js"

XCOPY /y ".\src\dependencies\jak.js" ".\lib\jak.js"
XCOPY /y ".\src\dependencies\interpolator.js" ".\lib\interpolator.js"

type ".\lib\jak.js" > ".\lib\jax-all.js"
type ".\lib\interpolator.js" >> ".\lib\jax-all.js"
type ".\lib\jax.js" >> ".\lib\jax-all.js"

java -jar ".\bin\compiler.jar" --js ".\lib\jax-all.js"  --js_output_file ".\lib\jax-all-minified.js"
