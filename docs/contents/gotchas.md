## Gotchas

---

### Setters {#setters}

Setter arguments cannot be omitted. This is intuitive in most cases, but not all:

```
x = [2, 3].rand(100);
```
```
x.$at(0, 1, 200);  //page 200 does not exist
```
```
x.$at(0, 1, null, 200);
```

### Singletons {#singletons}

In general, JavaScript does not handle [singletons](?arguments#singletons) like Data-Cube methods do. This is most likely to cause a problem where a Data-Cube method is incorrectly assumed to return a non-array. For example:

```
x = 5;
if ([0, null, ''].any()) {  //any truthy entries?
  x = 10;
}
x;
```

Here, `any` returns a 1-entry which is always truthy so `x` is set to `10`. (Note: [fold methods](?fold) always return an array &mdash; they only reduce one dimension so do not always produce a single value.)

A similar issue can arise when array entries are arrays:

```{.no-output}
x = [10, 20, 30, 40];
```
```{.no-output}
y = ['a', 'b', 'a', 'b'];
```
```
totals = x.group(0, y, grp => grp.sum());  //entries are arrays
```
```
totals.unbox();  //probably want this
```

### Array arguments {#array-arguments}

Data-Cube methods 'look inside' array arguments. Wrap an argument to prevent this:

```
x = [5, 6];
```
```
x.$ent(1, [7, 8]);  //cannot set one entry to two values
```
```
x.$ent(1, [[7, 8]]);  //set entry to the array [7, 8]  
```

### Sparse Arrays {#sparse-arrays}

Cubes are sparse arrays by default. This does not cause any strange behavior from Data-Cube methods, but be careful with native methods:

```
x = [2].cube();  //sparse
```
```
x.filter(val => val === undefined);  //filter ignores holes
```

[This page](http://2ality.com/2015/09/holes-arrays-es6.html) summarizes how native methods handle holes. To avoid this issue altogether, initialize cube entries (to something other than `undefined`), e.g. `[2].cube(0)`.

### Duplicate key errors {#duplicate-key-errors}

Avoid duplicate key errors when getting subcubes by dropping the keys:

```
colors = ['pass', 'green', 'fail', 'red'].dict();
```
```
results = ['Alice', 'pass', 'Bob', 'pass', 'Cath', 'fail'].dict();
```
```
colors.row(results);  //duplicate key error
```
```
color.row(results, 'array');  //works
```

```{.no-input .no-output}
deleteVariables('colors', 'results', 'totals', 'x', 'y');
```