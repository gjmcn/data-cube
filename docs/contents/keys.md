
---

<a id="method_key" href="#method_key">#</a> **key:** `Array.prototype.key(dim = 0)`

Returns an array containing the keys on dimension `dim`. The keys are in the same order as in the calling array.

Returns `null` if dimension `dim` does not have keys.

---

<a id="method_set_key" href="#method_set_key">#</a> **$key:** `Array.prototype.$key(dim = 0, val = null)`

Set keys on dimension `dim` to `val`.

To remove the keys on dimension `dim`, pass `null` as `val` (or pass `undefined` or omit `val`).

Returns the modified cube.

---

<a id="method_set_set_key" href="#method_set_set_key">#</a> **$$key:** `Array.prototype.$$key(dim = 0, f)`

Set keys on dimension `dim` using the function `f`.

`x.$$key(dim, f)` is equivalent to `x.$key(dim, f(x.key(dim), x))`.

Returns the modified cube.

---

<a id="method_label" href="#method_label">#</a> **label:** `Array.prototype.label(dim = 0)`

Get label of dimension `dim`. Returns `null` if dimension `dim` does not have a label.

---

<a id="method_set_label" href="#method_set_label">#</a> **$label:** `Array.prototype.$label(dim = 0, val = null)`

Set label of dimension `dim` to `val`.

To remove the label of dimension `dim`, pass `null` as `val` (or pass `undefined` or omit `val`).

Returns the modified cube.

---

<a id="method_set_set_label" href="#method_set_set_label">#</a> **$$label:** `Array.prototype.$$label(dim = 0, f)`

Set label of dimension `dim` using the function `f`.

`x.$$label(dim, f)` is equivalent to `x.$label(dim, f(x.label(dim), x))`.

Returns the modified cube.

---

<a id="method_set_strip" href="#method_set_strip">#</a> **$strip:** `Array.prototype.$strip()`

Remove all keys and labels.

Returns the modified cube.

---