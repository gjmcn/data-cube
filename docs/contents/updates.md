
## Updates

---

Update functions are called immediately before or after a cube is changed.

Example:

```
celsius = ['London', 0, 'Madrid', 0, 'Paris', 0].dict()
  .$after(c => fahrenheit = c.mul(9/5).add(32).round())
  .$row(null, [15, 21, 17]);
```
```
fahrenheit;
```
```
celsius.$row('Paris', 20);
```
```
fahrenheit;
```

Notes:

* Updates are triggered by '`$`-setters' such as [`$row`](?subcubes#method_set_row) and [`$ent`](?entries#method_set_ent). The only `$`-setters that *do not* trigger updates are [`$before`](#method_set_before) and [`$after`](#method_set_after).

* `$$`-setters such as [`$$row`](?subcubes#method_set_set_row) are convenience methods that call the corresponding getter ([`row`](?subcubes#method_row)) then the `$`-setter ([`$row`](?subcubes#method_set_row)) and hence, trigger updates. Note that:

  * The new value(s) are computed first &mdash; if the call to `row` throws an error, `$row` is not called and no updates are triggered. 
  
  * The name of the corresponding `$`-setter is passed to update functions (`'$row'`, not `'$$row'`).
  
  * [`$$call`](?entrywise#method_set_set_call) triggers updates even though `$call` does not exist. Update functions are passed the calling array as usual, the setter name `'$call'` (for consistency) and an array containing the result of `call` (the new values).

* Update functions are invisible when _creating_, _copying_, _comparing_ and _converting_:

  * Methods that create a new array do not copy the update functions of the calling array.
  
  * [`copy`](?create#method_copy) does not copy update functions. If required, copy update functions explicitly:

    ```` {.no-exec}
    y = x.copy().$after(x.after());
    ````

  * [`compare`](?other#method_compare) ignores update functions.

  * Methods that convert a cube to a different format (such as [`stringify`](?create#method_stringify)) ignore update functions.

---

<a id="method_set_before" href="#method_set_before">#</a> **$before:** `Array.prototype.$before(f = null)`<br>
<a id="method_set_after" href="#method_set_after">#</a> **$after:** `Array.prototype.$after(f = null)`

Set *before/after-update* functions.

When a `$`-setter is called, the cube's *before-update* functions are called before the setter code is executed. The *after-update* functions are called after the setter code has executed, but before the setter returns.

If `f` is `null` (or `undefined` or omitted or an empty array), all *before/after-update* functions are removed. Otherwise, each entry of `f` must be a function. The update functions are called in the order that they appear in `f` and are passed the calling array, the name of the setter called and an array containing the arguments passed to the setter.

`f` can be a cube. The shape, keys and labels of `f` do not affect the behavior of updates, but keys can be useful for keeping track of what each function does &mdash; when constructing `f` or when retrieving it with [`before`](#method_before)/[`after`](#method_after).

Note: `$before` and `$after` copy `f`, so subsequent changes to `f` do not affect the calling array.

Returns the calling array.

---

<a id="method_before" href="#method_before">#</a> **before:** `Array.prototype.before()`<br>
<a id="method_after" href="#method_after">#</a> **after:** `Array.prototype.after()`

Returns a cube containing the before/after-update functions of the calling array &mdash; or an empty cube if there are none.

Note: changing the returned cube does not affect the calling array.

---

```{.no-input .no-output}
deleteVariables('celsius', 'fahrenheit');
```