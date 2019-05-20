## Performance Tips

---

##### Concatenation {#concatenation}

When concatenating multiple arrays/values, use a single method call:

```{.no-exec}
a.horiz(b).horiz(c).horiz(d);  //slower
a.horiz(b, c, d);              //faster
```

##### Subcubes {#subcubes}

Methods such as [`subcube`](?subcubes#method_subcube), [`row`](?subcubes#method_row) and [`pack`](?concatenate#method_pack) take an argument that specifies the type of subcube. Where appopriate, pass `'core'` or `'array'` rather than relying on the default `'full'`.

##### Getting keys {#getting-keys}

[`key`](?keys#method_key) constructs an array from a map each time it is called. Avoid calling `key` inside loops and frequently called functions.

##### Square brackets {#square-brackets}

Square brackets (e.g. `x[5]`) are faster than Data-Cube's entry getters/setters (e.g. `x.ent(5)`). However, square brackets are also [riskier](?length#notes) and in many cases, much less convenient.

##### Entrywise methods {#entrywise-methods}

When entrywise methods are chained, a new cube is created at each step. For longer chains, consider applying a single function to each entry using [`call`](?entrywise#method_call) or [`$$call`](?entrywise#method_set_set_call) (which are typically faster than the native [`map`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map) method):

```{.no-exec}
//slower
x.div(y).add(5).sqrt().round();
//faster
x.call((xi, yi) => Math.round(Math.sqrt(xi / yi + 5)), y);
```