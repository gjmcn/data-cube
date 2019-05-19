## Performance Tips

---

##### Concatenation {#concatenation}

When concatenating multiple arrays/values, use a single method call:

```{.no-exec}
a.horiz(b).horiz(c).horiz(d);  //slower
a.horiz(b, c, d);              //faster
```

##### Subcube types {#subcube-types}

Methods such as [`subcube`](?subcubes#method_subcube){.cake-internal}, [`row`](?subcubes#method_row){.cake-internal} and [`pack`](?concatenate#method_pack){.cake-internal} have an argument that specifies the type of subcube. Where appopriate, pass `'core'` or `'array'` rather than relying on the default `'full'`.

##### Getting keys {#getting-keys}

[`key`](?keys#method_key){.cake-internal} constructs an array from a map each time it is called. Avoid calling `key` inside loops or frequently called functions.

##### Square brackets {#square-brackets}

Square brackets (e.g. `x[5]`) are faster than Data-Cube's entry getters/setters (e.g. `x.ent(5)`). However, square brackets are also [riskier](?length#notes){.cake-internal} and in many cases, much less convenient.

##### Entrywise methods {#entrywise-methods}

When multiple entrywise methods are called in succession, a new cube is created at each step. Consider applying a single function to each entry instead using [`call`](?entrywise#method_call){.cake-internal} or [`$$call`](?entrywise#method_set_set_call){.cake-internal} (which are typically faster than the native [`map`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map) method):

```{.no-exec}
//slower
x.div(y).add(5).sqrt().round();
//faster
x.call((xi, yi) => Math.round(Math.sqrt(xi / yi + 5)), y);
```