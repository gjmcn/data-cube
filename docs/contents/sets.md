Notes on set theory methods:

* The "SameValueZero" algorithm is used to test for equality; this is the same as `===` except that any two `NaN` values are equal.

* Passing `undefined` (or `[undefined]`) as an argument is *not* the same as omitting the argument &mdash;  `undefined` is a 1-element 'set'.

---

### Basic Set Theory

These methods ignore shape, keys and labels and return a new array with no duplicate entries. The entries of the returned array appear in the same order as they do in the calling array and the arguments (starting with the calling array, then the first argument, ...).

---

<a id="method_unique" href="#method_unique">#</a> **unique:** `Array.prototype.unique()`

Remove duplicates.

---

<a id="method_basic_set_theory" href="#method_basic_set_theory">#</a><br>
**union:** `Array.prototype.union(arg0, arg1, arg2, ...)`<br>
**inter:** `Array.prototype.inter(arg0, arg1, arg2, ...)`<br>
**diff:** `Array.prototype.diff(arg0, arg1, arg2, ...)`<br>

`union`: entries that appear in the calling array _or any_ of the arguments.

`inter` (intersection): entries that appear in the calling array _and all_ of the arguments.

`diff`  (difference): entries that appear in the calling array _and none_ of the arguments.

---

### Other

---

<a id="method_is_unique" href="#method_is_unique">#</a> **isUnique:** `Array.prototype.isUnique()`

Returns `true` if no two entries are equal to each other, otherwise returns `false`.

---

<a id="method_is_in" href="#method_is_in">#</a> **isIn:** `Array.prototype.isIn(arg0, arg1, arg2, ...)`

Returns a new cube with boolean entries and the same shape, keys and labels as the calling array. An entry of the returned cube is `true` if the corresponding entry of the calling array appears _in any_ of the arguments.

---

