## Performance

---

This section lists some tips for gettting the best performance out of Data-Cube. 

Note: most Data-Cube methods are fast; others still need some work. The following advice is unlikely to change as individual methods are improved.

---

__Concatenation__<br>
When concatenating multiple arrays/values, use a single method call:

```{.no-exec}
a.horiz(b).horiz(c).horiz(d);  //slower
a.horiz(b, c, d);              //faster
```

__Subcube types__<br>
Methods such as [`subcube`](?subcubes#method_subcube), [`row`](?subcubes#method_row) and [`pack`](?concatenate#method_pack) have an argument that specifies the type of subcube. Where appopriate, pass `'core'` or `'array'` rather than relying on the default `'full'`.

__Getting keys__<br>
[`key`](?keys#method_key) constructs an array from a map each time it is called. Avoid calling `key` inside loops or frequently called functions.

__Square brackets__<br>
Square brackets (e.g. `x[5]`) are faster than Data-Cube's entry getters/setters (e.g. `x.ent(5)`). However, square brackets are also [riskier](?length#notes) and in many cases, much less convenient.

__Entrywise methods__<br>
When multiple entrywise methods are called in succession, a new cube is created at each step. Consider applying a single function to each entry instead using [`call`](?entrywise#method_call) or [`$$call`](?entrywise#method_set_set_call) (which are typically faster than the native [`map`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map) method):

```{.no-exec}
//slower
x.div(y).add(5).sqrt().round();
//faster
x.call((xi, yi) => Math.round(Math.sqrt(xi / yi + 5)), y);
```