
## Using Data-Cube

---

The Data-Cube module [exports a function](?exported) and adds methods to `Array.prototype`.

### Node

Install:

```{.no-exec}
npm install --save @gjmcn/data-cube
```

Load:

```{.no-exec}
const dc = require('@gjmcn/data-cube');
```

### Browser

The easiest way to use Data-Cube in the browser is via a CDN:

```{.no-exec .html}
<script src="https://cdn.jsdelivr.net/npm/@gjmcn/data-cube@0.2"></script>
```

When a `<script>` is used, the exported function is a global variable: `dc`.