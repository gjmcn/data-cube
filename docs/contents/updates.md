Update functions are called immediately before or after an array/cube is changed. For example:

```js
let results = [3,2].rand(99)
  .$key(0, ['Ali', 'Bob', 'Cath'])
  .$key(1, ['Maths', 'Physics'])
  .$after(r => console.log(`Well done ${r.sum(1).maxPosn()}!`));

results.$row('Bob', 100);  //prints 'Well done Bob!'
```

Notes:

* Updates are triggered by '`$`-setters' such as [[$row|Get-and-Set-Subcubes#method_set_row]] and [[$ent|Get-and-Set-Entries#method_set_ent]]. The only `$`-setters that *do not* trigger updates are [[$before|#method_set_before]] and [[$after|#method_set_after]]. Also, setting properties with [[loop|Entrywise#method_loop]] does not trigger updates.

* `$$`-setters such as [[$$row|Get-and-Set-Subcubes#method_set_set_row]] are convenience methods that call the corresponding getter ([[row|Get-and-Set-Subcubes#method_row]]) then the `$`-setter ([[$row|Get-and-Set-Subcubes#method_set_row]]) and hence, trigger updates. Note that:

  * The new value(s) are computed first &mdash; if the call to `row` throws an error, `$row` is not called and no updates are triggered. 
  
  * The name of the corresponding `$`-setter is passed to update functions (`'$row'`, not `'$$row'`).
  
  * [[$$call|Entrywise#method_set_set_call]] triggers updates even though `$call` does not exist. Update functions are passed the calling array as usual, the setter name `'$call'` (for consistency) and an array containing the result of `call` (the new values).

* Update functions are invisible when _creating_, _copying_, _comparing_ and _converting_ cubes:

  * Methods that produce a new cube do not copy the update functions of the calling array:

    ```js
    let x = [5,6].$after(() => {});   //x has 1 after-update function
    let y = x.add(10);                //y has no update functions
    ```
  
  * [[copy|Create-Copy-and-Convert#method_copy]] does not copy update functions. If required, copy update functions explicitly:

    ````js
    let v = u.copy().$after(u.after());
    ````

  * [[compare|Other#method_compare]] ignores update functions.

  * Methods that convert a cube to a different format (such as [[stringify|Create-Copy-and-Convert#method_stringify]] ignore update functions.

---

<a id="method_set_before" href="#method_set_before">#</a> **$before:** `Array.prototype.$before(f = null)`<br>
<a id="method_set_after" href="#method_set_after">#</a> **$after:** `Array.prototype.$after(f = null)`

Set *before/after update* functions.

When a `$`-setter is called, the cube's *before-update* functions are called before the setter code is executed. The *after-update* functions are called after the setter code has executed, but before the setter returns.

If `f` is `null` (or `undefined` or omitted or an empty array), all *before/after-update* functions are removed. Otherwise, each entry of `f` must be a function. The update functions are called in the order that they appear in `f` and are passed the calling array, the name of the setter called and an array containing the arguments passed to the setter.

`f` can be a cube, so it can have keys:

```js
let x = [10,20];
let y, z;

x.$after([
  'yUpdate', () => y = x[0],
  'zUpdate', () => z = x[1]
].dict());

x.after().at('zUpdate')();   //y is undefined, z is 20
```

---

<a id="method_before" href="#method_before">#</a> **before:** `Array.prototype.before()`<br>
<a id="method_after" href="#method_after">#</a> **after:** `Array.prototype.after()`

Returns a cube containing the before/after-update functions of the calling array &mdash; or an empty cube if there are none.

Note: modifying the returned cube (e.g. changing an entry to a different function) _does not_ affect the update functions of the calling array.

---