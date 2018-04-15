# DataCube

DataCube manipulates JavaScript's native arrays so that an array behaves both as a normal array and as a *cube*: a 3-dimensional array whose entries and *subcubes* can be accessed using indices or keys. Cubes make it easy to handle data that naturally fit into a multidimensional array or a 'data-table'. Since DataCube manipulates the native array class, the syntax for using cubes is simple and clean, e.g.

```js
[3,4].cube(1);         //3-by-4 matrix, each entry is 1
[5,6,7,8].$shape(2);   //change shape of array to 2-by-2 ($ indicates a setter)
```

Some notes:

* Formally, a cube always has 3 dimensions: rows, columns and pages. However, the following names are useful:
	* matrix: cube with 1 page
	* vector: cube with 1 column and 1 page

* The first argument of many cube methods is the dimension to operate on. Dimensions are referred to by number:
	* `0`: rows/down
	* `1`: columns/across
	* `2`: pages/back

* There many cube methods, for example:
	* get/set entries and subcubes: `at`, `row`, `cube`, ...
	* operators: `add`, `and`, `eq`, ...
	* reduce: `sum`, `mult`, `max`, ...
	* query: `where`, `count`, `order`, ...
	* set theory: `union`, `inter`, `diff`, ...

* There are libraries that add additional cube methods:
	* linear algebra: `det`, `inv`, `svd` ...
	* html: `attr`, `on`, `append`, ...

* Cube methods behave sensibly when passed arrays/cubes or non-arrays. E.g. `lt` is the less-than method:
	```js
	[3,6].lt(5);       //=> [true, false]
	[3,6].lt([5,9]);   //=> [true, true]
	```

* A cube behaves like a standard array in many respects:
	* many native array methods can be used as normal; native methods that would invalidate the cube (e.g. `push`, `pop` and `splice`, see below) will produce an error
	* other syntax such as `+=`, `++`, `...` and `[]` for getting/setting entries can be used as normal

* Setters return the modified cube which allows chaining, e.g. `x.$shape(y).$key(z)`. 

* The number of entries of a cube **cannot** be changed.

## Implementation
To enable writing code such as `[5,6,7,8].$shape(2)`, we add methods to the array prototype rather than creating a subclass (which is problematic with arrays in JavaScript anyway). Standard arrays bahave as normal: any native array method can be used (including `push`, `pop` and `splice`) and the number of entries is not fixed. When a cube method is called, the array is converted to a cube; this involves adding properties to the array instance. The following diagram shows all possible additional properties:

```
array instance
└───_d_c_  //truthy property of this name indicates a cube (object)
│   │   r  //number of rows (integer ≥ 0)
│   │   c  //number of columns (integer ≥ 0)
│   │   p  //number of pages (integer ≥ 0)
│   │
│   └───e //extras, object
│       │   rk  //row keys (object)
│       │   ra  //row keys (array)
│       │   ck  //column keys (object)
│       │   ca  //column keys (array)
│       │   pk  //page keys (object)
│       │   pa  //page keys (array)
│       │   rl  //row label (non-empty string)
│       │   cl  //column label (non-empty string)
│       │   pl  //page label (non-empty string)

```

A cube always has a property `_d_c_`; the `_d_c_` object always has properties `r`, `c` and `p`.

The extras object `e` exists if the cube has, or has ever had, any keys or labels &mdash; cube methods know these need not be considered if this object does not exist.

Properties of the extras object are only truthy if the corresponding keys or labels are in use; otherwise the properties either do not exist or are `undefined`.

If a cube has e.g. row keys, both `rk` and `ra` are used:

* `rk`: each property name is a key, the value is the corresponding row index.

* `ra`: entry *i* is the key of row *i*.

Once an array has been converted to a cube, the `length` property is made non-writable. Native array methods that are not compatible with cubes (such as `push`, `pop` and `splice`) are modified: they behave as normal when called from a standard array, but throw an error when called from a cube.
