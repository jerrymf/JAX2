REM Zretezeni vsech knihoven do jedne
@ECHO OFF

type ".\src\core.js" > ".\lib\jax.js"
ECHO. >> ".\lib\jax.js"
type ".\src\node.js" >> ".\lib\jax.js"
ECHO. >> ".\lib\jax.js"
type ".\src\nodearray.js" >> ".\lib\jax.js"
ECHO. >> ".\lib\jax.js"
type ".\src\event.js" >> ".\lib\jax.js"
ECHO. >> ".\lib\jax.js"
type ".\src\listener.js" >> ".\lib\jax.js"
ECHO. >> ".\lib\jax.js"
type ".\src\dombuilder.js" >> ".\lib\jax.js"
ECHO. >> ".\lib\jax.js"
type ".\src\fx.js" >> ".\lib\jax.js"
ECHO. >> ".\lib\jax.js"
type ".\src\report.js" >> ".\lib\jax.js"
ECHO. >> ".\lib\jax.js"

XCOPY /y ".\dependencies\jak.js" ".\lib\jak.js"
XCOPY /y ".\dependencies\interpolator.js" ".\lib\interpolator.js"
XCOPY /y ".\dependencies\parser.js" ".\lib\parser.js"
XCOPY /y ".\dependencies\promise.js" ".\lib\promise.js"

java -jar ".\bin\compiler.jar" --js ".\lib\jax.js"  --js_output_file ".\lib\jax-minified.js"
