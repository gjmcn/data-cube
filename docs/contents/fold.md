
## Fold and Cumulative

---

The first argument of these methods indicates the dimension to act along. If the dimension argument is `-1`, the shape, keys and labels of the calling array are ignored.

---

### Fold

Fold methods act along a given dimension, reducing it to length 1.

---

<a id="method_fold" href="#method_fold">#</a> **fold:** `Array.prototype.fold(dim = 0, f, init)`

Fold along dimension `dim` using function `f` and initial 'accumulated value' `init`.

`f` is passed the accumulated value, the 'current entry', the 'current index' (even if dimension `dim` has keys) and the calling array. 

`init` must be a singleton so wrap it in an additional array if necessary, e.g. `[[5, 6]]`.

If `init` is omitted, the first entry is used and each fold has one less step.

Returns a new cube.

Notes:

* `fold` uses the original shape of the calling array to access its entries and to construct the returned cube &mdash; if `f` changes the shape of the calling array, the result of `fold` is not affected.

* The relevant keys and labels of the calling array are copied to the returned cube before `f` is used.

* If `f` changes the values of still-to-be-visited entries of the calling array, `fold` *will* see the new values.

* When `init` is an object (rather than a primitive value such as a number or a string), the same object is used for each fold &mdash; i.e. `init` is *not* copied.  Avoid (or be very careful when) using an `f` that mutates `init`.

* Unlike the native array method [`reduce`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/Reduce), `fold` does not skip 'holes'. This is significant since Data-Cube uses sparse arrays (i.e. holes) for uninitialized cubes (e.g. `x = [5].cube()`).

Example:

```
x = [2, 4].rand(10);
```
```
x.fold(1, (a, b) => a + b, 0);
```

---

<a id="method_fold_one" href="#method_fold_one">#</a> **Convenience fold methods**

Name | Description | Initial value
|:--|:--|--:|
`sum` | sum | `0`
`prod` | product | `1`
`all` | all truthy? | `true`
`any` | any truthy? | `false`
`count` | count truthy | `0`
`min` | minimum | `Infinity`
`max` | maximum | `-Infinity`
`minPosn` | index/key of minimum | `null`
`maxPosn` | index/key of maximum | `null`
`mean` | mean | `NaN`
`geoMean` | geometric mean | `NaN`
`range` | range | `-Infinity`
`sameType` | same type? | `null` {.table .table-sm .list}

These methods take the dimension to fold as an argument (default `0`) and return a new cube.

Notes:

* Do not use `sum` to concatenate strings; use [`sew`](#method_sew) or the native array method [`join`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/join).

* `sameType` uses [`typeof`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/typeof). If entries have the same type, the result is a string indicating the type (e.g. `'number'`). Otherwise, the result is `false`.

Example:

```
x = [2, 4].rand(10);
```
```
x.sum(1);
```

---

<a id="method_sew" href="#method_sew">#</a> **sew:** `Array.prototype.sew(dim = 0, sep = ',')`

Like the native array method [`join`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/join), but works along a given dimension.

Returns a new cube.

Example:

```
x = ['a', 'h'].seq().$shape(2);
```
```
x.sew(1);
```

---

<a id="method_var" href="#method_var">#</a><br>
**var:** `Array.prototype.var(dim = 0, delta = 0)`<br>
**sd:** `Array.prototype.sd(dim = 0, delta = 0)`<br>

Variance (`var`) and standard deviation (`sd`).

The denominator in the variance calculation for an array/cube `x` is: `x.n(dim) - delta` (or `x.length - delta` if `dim` is `-1`).

Returns a new cube.

Example:

```
x = [1, 8].seq().$shape(2);
```
```
x.var(1);
```

---

<a id="method_wrap" href="#method_wrap">#</a> **wrap:** `Array.prototype.wrap(dim = 0, sc = 'full')`

Each entry of the returned cube is a subcube of the calling array. For example, the entries of `x.wrap(1)` are 'row vectors'.

`sc` specifies whether each subcube should be a `'full'` subcube, `'core'` subcube or `'array'` (see the `ret` argument of [`subcube`](?subcubes#method_subcube) for details).

Returns a new cube.

Example:

```
x = [2, 3].rand(100);
```
```
w = x.wrap(1);
```
```
w.map(a => JSON.stringify(a));
```

---

### Cumulative

Cumulative methods are like fold methods, but include all intermediate results &mdash; so the given dimension is *not* reduced to length 1.

---

<a id="method_cumu" href="#method_cumu">#</a> **cumu:** `Array.prototype.cumu(dim = 0, f, init)`

As [`fold`](#method_fold), but the returned cube includes all intermediate results.

Returns a new cube with the same shape, keys and labels as the calling array (unless `dim` is `-1`).

Example:

```
x = [2, 4].rand(10);
```
```
x.cumu(1, (a, b) => a + b, 0);
```

---

<a id="method_cumu_one" href="#method_cumu_one">#</a> **Convenience cumulative methods**

Name | Description
|:--|:--|
`cumuSum` | cumulative sum
`cumuProd` | cumulative product
`cumuAll` | cumulative all truthy?
`cumuAny` | cumulative any truthy?
`cumuCount` | cumulative count truthy
`cumuMin` | cumulative min
`cumuMax` | cumulative max
`cumuMinPosn` | cumulative index/key of minimum
`cumuMaxPosn` | cumulative index/key of maximum {.table .table-sm .list}

These methods take the dimension to work along as an argument (default `0`) and return a new cube.

Example:

```
x = [2, 4].rand(10);
```
```
x.cumuSum(1);
```

---

### Related Methods

---

<a id="method_quantile" href="#method_quantile">#</a> **quantile:** `Array.prototype.quantile(dim = 0, prob = [0, 0.25, 0.5, 0.75, 1])`

Quantiles corresponding to the probabilities `prob`.

The entries of the calling array are converted to numbers. If a given set of entries contain a non-finite number, the corresponding quantiles are `NaN`.

As with folding and cumulative methods, `dim` can be `-1`.

The entries of `prob` must convert to numbers between `0` and `1` inclusive.

Where required, linear interpolation is used to estimate quantiles.

Returns a new cube.

Example:

```
x = [1, 20].seq().$shape(10).tp();
```
```
x.quantile(1);
```

---

```{.no-input .no-output}
deleteVariables('w', 'x');
```