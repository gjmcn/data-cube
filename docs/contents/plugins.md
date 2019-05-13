## Plugins

Plugins add functionality to Data-Cube by adding new array methods. Some plugins export a function.

The current plugins are:

* [`data-cube-html`](https://github.com/gjmcn/data-cube-html): DOM manipulation functions and methods

* [`data-cube-print-html`](https://github.com/gjmcn/data-cube-print-html): print cubes in HTML documents

* [`data-cube-print-console`](https://github.com/gjmcn/data-cube-print-console): print cubes in the terminal

* [`data-cube-polygon`](https://github.com/gjmcn/data-cube-polygon): polygon methods

* [`data-cube-hull`](https://github.com/gjmcn/data-cube-hull): concave/convex hull

The following sections demonstrate how the `data-cube-html` plugin can be loaded. Use the same approach to load other plugins.

### Node

Data-Cube is a peer dependency of all plugins.

Install:

```{.no-exec}
npm install --save @gjmcn/data-cube-html
```

Load:

```{.no-exec}
const dc = require('@gjmcn/data-cube');
const qa = require('@gjmcn/data-cube-html');
```

### Browser

Via CDN:

```{.no-exec .html}
<script src="https://cdn.jsdelivr.net/npm/@gjmcn/data-cube@0.2"></script>
<script src="https://cdn.jsdelivr.net/npm/@gjmcn/data-cube-html@0.2"></script>
```

When a `<script>` is used, the function exported by the `data-cube-html` plugin is a global variable: `qa`.
