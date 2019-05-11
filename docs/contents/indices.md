## Indices and Keys

Rows, columns and pages have **indices** by default. Negative indices count back from the end of the relevant dimension:

```
x = [2, 3].rand(100);
```
```
x.at(1, -1);
```

If a dimension is given **keys**, these are used instead of indices:

```
x.$key(0, ['a', 'b']);  //set keys on dimension 0
```
```
x.at('b', -1);
```

Keys cannot be `undefined` or `null`, and keys on the same dimension must be unique. There are no other restrictions on keys:


```;
d = new Date();
r = /abc/;
s = new Set([1, 2, 3]);
x.$key(1, [d, r, s]);
```
```
x.col(r);
```

Some methods use **vector indices**: a single linear index that counts from the first entry to the last. In this case, negative indices count back from the last entry.

```
x.ent(3);
```

Square brackets can be used to get/set entries as normal. Square brackets use vector indices (though negative indices cannot be used and no error is thrown if an index is out of bounds):

```
x[3];
```

---

__Notes:__

* Integers can be used as keys, but will no longer behave as indices. For example, if `2` is used as a row key, it need not correspond to the third row.

* Unless otherwise stated in the documentation, methods throw an error if passed an unused index or key.

* Indices, dimensions and dimension lengths are numbers &mdash; methods will throw an error if passed non-numbers.


```{.no-input .no-output}
deleteVariables('x', 'd', 'r', 's');
```
