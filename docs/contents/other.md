
## Other

---

<a id="method_tp" href="#method_tp">#</a> **tp:** `Array.prototype.tp(perm = [1, 0, 2])`

Transpose.

`perm` is a permutation of `0`, `1` and `2` that specifies how the dimensions are rearranged. The default `[1, 0, 2]` corresponds to swapping rows and columns.

Returns a new cube.

Example:

```
x = [2, 3].rand(100);
```
```
x.tp();
```

---

<a id="method_flip" href="#method_flip">#</a> **flip:** `Array.prototype.flip(dim = 0)`


Reverse the order of dimension `dim`.

Returns a new cube.

Example:

```
x = [2, 4].rand(100);
```
```
x.flip(1);
```
 
---

<a id="method_roll" href="#method_roll">#</a> **roll:** `Array.prototype.roll(dim = 0, shift = 1)`

Circular shift dimension `dim` by `shift`. Use a negative `shift` to shift backwards.

Returns a new cube.

Example:

```
x = [2, 4].rand(100);
```
```
x.roll(1);
```

---

<a id="method_shuffle" href="#method_shuffle">#</a> **shuffle:** `Array.prototype.shuffle(dim = 0, n = null)`


Shuffle dimension `dim`.

`n` is the number of rows (or columns or pages depending on `dim`) in the returned cube. Omit `n` (or pass `undefined` or `null`) to get all rows; pass a number to 'sample without replacement'.

Returns a new cube.

Example:

```
x = [1, 16].seq().$shape(2);
```
```
x.shuffle(1);
```

---

<a id="method_sample" href="#method_sample">#</a> **sample:** `Array.prototype.sample(dim = 0, n = 1, prob = null)`


Sample `n` rows (or columns or pages depending on `dim`) with replacement.

If `prob` is omitted (or `undefined` or `null`), each row is chosen with equal probability. Otherwise, `prob` specifies the probability of each row. The entries of `prob` must be non-negative and finite, but need not sum to 1 (`sample` will normalize them).

Returns a new cube.

Note: the returned cube does not have keys or a label on dimension `dim`.

Example:

```
x = [2, 3].rand(100);
```
```
x.sample(1, 6);
```

---

<a id="method_freq" href="#method_freq">#</a> **freq:** `Array.prototype.freq(ret = 'matrix')`

Count occurrences of each unique value &mdash; the shape, keys and labels of the calling array are ignored.

Entries are compared using the "SameValueZero" algorithm (this is the same as `===` except that any two `NaN` values are equal).

`ret` specifies what to return:

* `'vector'`: vector with the unique values as row keys and the counts as entries

* `'matrix'`: 2-column matrix with column keys `'value'` and `'count'`

The order of the unique values in the returned cube is the same as the order in which the values first appear in the calling array.

Note: `undefined` and `null` cannot be used as keys. If `ret` is `'vector'` and the calling array contains `undefined`, the corresponding row key of the returned cube is the string `'_undefined_'`. Similarly, `'_null_'` is used for `null`.

Example:

```
x = [2, 4].rand(5);
```
```
x.freq();
```

---

<a id="method_has_key" href="#method_has_key">#</a> **hasKey:** `Array.prototype.hasKey(dim = 0, k)`

If `k` is omitted, returns `true` if the calling array has keys on dimension `dim`, otherwise returns `false`.

If `k` is passed, `hasKey` returns `true` if the calling array has the key `k` on dimension `dim`, otherwise `hasKey` returns `false` &mdash; including when the dimension `dim` does not have keys.

`k` must be a singleton, so `hasKey` cannot be used to test multiple keys (use e.g. `['a', 'b'].map(k => x.hasKey(0, k))` or `['a', 'b'].isIn(x.key())`).

Example:

```
x = [2, 3].cube(0).$key(0, ['a', 'b']);
```
```
x.hasKey();
```
```
x.hasKey(0, 'c');
```

---

<a id="method_ind" href="#method_ind">#</a> **ind:** `Array.prototype.ind(dim = 0)`

Indices on dimension `dim`.

Returns a new array with entries _0, 1, 2, ..., n-1_ where _n_ is the length of dimension `dim`.

`ind` returns the 'indices' even when the calling array has keys rather than indices on dimension `dim`.

Example:

```
x = [2, 3].cube(0);
```
```
x.ind(1);
```

---

<a id="method_ind_or_key" href="#method_ind_or_key">#</a> **indOrKey:** `Array.prototype.indOrKey(dim = 0)`

Indices or keys on dimension `dim`.

`indOrKey` is equivalent to `ind` when dimension `dim` of the calling array has indices and is equivalent to `key` otherwise.

Returns a new array.

Example:

```
x = [2, 3].cube(0).$key(0, ['a', 'b']);
```
```
x.indOrKey();
```
```
x.indOrKey(1);
```

---

<a id="method_vec_ind" href="#method_vec_ind">#</a> **vecInd:** `Array.prototype.vecInd(r = null, c = null, p = null)`

Vector indices that correspond to the given row (`r`), column (`c`) and page (`p`) indices/keys.

Omit `r`, `c` or  `p` (or pass `null` or `undefined`) to use the first row, column or page respectively.

All arguments are broadcast.

Returns a new array.

Example:

```
x = [2, 3].cube(0).$key(0, ['a', 'b']);
```
```
x.vecInd('b', [0, 2, 0]);
```

---

<a id="method_posn" href="#method_posn">#</a> **posn:** `Array.prototype.posn(dim = 0, v)`

Indices/keys on dimension `dim` that correspond to the vector indices `v`.

Returns a new array.

Example:

```
x = [2, 3].cube(0).$key(0, ['a', 'b']);
```
```
x.posn(0, [1, 5, 1]);
```
```
x.posn(1, [1, 5, 1]);
```

---

<a id="method_which" href="#method_which">#</a> **which:** `Array.prototype.which(f)`

Vector indices of entries that satisfy a given condition.

If `f` is omitted, `which` returns the vector indices of the truthy entries.

If `f` is a function, it is called once for each entry of the calling array. `f` is passed the entry, the vector index of the entry and the calling array. If the returned value is truthy, the vector index is included in the returned array.

Notes:

* Entries are visited in vector index order.

* If `f` changes the values of still-to-be-visited entries, `which` will see the new values.

* `x.gt(5).which()` is equivalent to `x.which(a => a > 5)`.

* [`where`](?query#method_where) is typically more useful than `which` for getting subtables. For example, to get the rows of a matrix `x` that have a truthy value in column `3`, `x.where(0, x.col(3))` will always work whereas `x.row(x.col(3).which())` will only work if `x` does not have row keys.

Returns a new array.

Example:

```
x = [0, 1, true, false].$shape(2);
```
```
x.which();
```

---

<a id="method_compare" href="#method_compare">#</a> **compare:** `Array.prototype.compare(b, assert = true)`

Test if the calling array is 'the same as' `b`, i.e. has the same shape, keys, labels and entries (`===`).

A cube *can* be the same as a standard array. Specifically, a vector with no keys or labels is the same as a standard array with matching length and entries. (Note that `compare`  converts the calling array to a cube as normal.)

If `assert` is truthy, `compare` returns the calling array if it is the same as `b` and throws an error if it is not the same (the error message indicates the difference).

If `assert` is falsy, `compare` returns the calling array (which is always truthy) if it is the same as `b` and returns `false` if it is not the same.

Example:

```
x = [4, 5, 6, 7].$shape(2);
```
```
y = [4, 5, 66, 7].$shape(2);
```
```
x.compare(y);
```

---

<a id="method_vble" href="#method_vble">#</a> **vble:** `Array.prototype.vble(dim = 0)`

Represent each 'observation' in the calling array by an object. `dim` indicates which dimension represents the 'variables'. For example, if `dim` is `1`, the columns are the variables and there is an object for each row-page pair. Each object indicates the row and page that it corresponds to and the value of each variable.

Notes:

* Properties representing variables are named using the corresponding indices or keys. Keys are converted to strings (unless they are symbols).

* Properties corresponding to dimensions have the dimension labels as names; `'row'`, `'col'` and `'page'` are used where labels do not exist.

* If `dim` is `-1`, each entry of the calling array is an observation; the associated object specifies the row, column and page that the entry corresponds to as well as the entry value.

* `vble` does not check for repeated property names. For example, if multiple keys on dimension `dim` convert to the same string, `vble` will set the same property multiple times.

`vble` returns a new array containing the objects in the intuitive order.

Also see: [`arObj`](?create#method_ar_obj).

Example:

```
x = [2, 3].rand(100);
```
```
y = x.vble(1);
```
```
y.map(obj => JSON.stringify(obj));
```


```{.no-input .no-output}
deleteVariables('x', 'y');
```