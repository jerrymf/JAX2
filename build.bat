REM Zretezeni vsech knihoven do jedne
@ECHO OFF

type ".\src\core.js" > ".\lib\jax.js"
ECHO. >> ".\lib\jax.js"
type ".\src\event\ilistening.js" >> ".\lib\jax.js"
ECHO. >> ".\lib\jax.js"
type ".\src\event\event.js" >> ".\lib\jax.js"
ECHO. >> ".\lib\jax.js"
type ".\src\event\listener.js" >> ".\lib\jax.js"
ECHO. >> ".\lib\jax.js"
type ".\src\dom\inode.js" >> ".\lib\jax.js"
ECHO. >> ".\lib\jax.js"
type ".\src\dom\node.js" >> ".\lib\jax.js"
ECHO. >> ".\lib\jax.js"
type ".\src\dom\element.js" >> ".\lib\jax.js"
ECHO. >> ".\lib\jax.js"
type ".\src\dom\element-getcomputedstyle.js" >> ".\lib\jax.js"
ECHO. >> ".\lib\jax.js"
type ".\src\dom\element-fx.js" >> ".\lib\jax.js"
ECHO. >> ".\lib\jax.js"
type ".\src\dom\textnode.js" >> ".\lib\jax.js"
ECHO. >> ".\lib\jax.js"
type ".\src\dom\document.js" >> ".\lib\jax.js"
ECHO. >> ".\lib\jax.js"
type ".\src\dom\documentfragment.js" >> ".\lib\jax.js"
ECHO. >> ".\lib\jax.js"
type ".\src\dom\nullnode.js" >> ".\lib\jax.js"
ECHO. >> ".\lib\jax.js"
type ".\src\dom\window.js" >> ".\lib\jax.js"
ECHO. >> ".\lib\jax.js"
type ".\src\dom\nodearray.js" >> ".\lib\jax.js"
ECHO. >> ".\lib\jax.js"
type ".\src\dom\nodearray-fx.js" >> ".\lib\jax.js"
ECHO. >> ".\lib\jax.js"
type ".\src\fx\fx.js" >> ".\lib\jax.js"
ECHO. >> ".\lib\jax.js"
type ".\src\report\report.js" >> ".\lib\jax.js"
ECHO. >> ".\lib\jax.js"

XCOPY /y ".\dependencies\jak.js" ".\lib\jak.js"
XCOPY /y ".\dependencies\interpolator.js" ".\lib\interpolator.js"
XCOPY /y ".\dependencies\parser.js" ".\lib\parser.js"

java -jar ".\bin\compiler.jar" --js ".\lib\jax.js"  --js_output_file ".\lib\jax-minified.js"
