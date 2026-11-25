# Grana browser acceptance

Not executed.

The computer image installs Chromium unless `BROWSER=brave`. `infra/sandboxes/computer/rakazo-page-browser` speaks Chrome DevTools Protocol and names `browser_navigate`. No third-party browser API key is required for that path. No page was opened, no element was clicked, and no screenshot was taken.

Graphical tools in the image include Xvfb, Fluxbox, xdotool, and `xcapture.c`. Their runtime behavior is unverified on this machine.
