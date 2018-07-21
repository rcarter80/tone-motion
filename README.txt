Plan to keep ToneMotion pieces “sandboxed” from other pages and resources on ryancarter.org (for maximum portability).

Include all resources in /TMbundle
Include all shared assets in /TMbundle/TMassets
Include local copies of JQuery and Tone.js

Do NOT include any dependencies outside this bundle. It would be nice to have a project that will not fall victim to shifting dependencies in the future. As long as browsers render HTML, CSS, and Javascript in the same way, this should all just keep working.