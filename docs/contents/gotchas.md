## Gotchas

---

### Setters {#setters}

Setter arguments cannot be omitted. This is intuitive in most cases, but not all:

```
x = [2, 3].cube(0);
```
```
x.$at(0, 1, 7);  //page 7 does not exist
```
```
x.$at(0, 1, null, 7);
```

### Singletons {#singletons}

In general, JavaScript does not handle [singletons](?arguments#singletons) like Data-Cube methods do, so it is important to know what a method returns: 

```
x = 5;
if ([0, null, ''].any()) {  //any truthy entries?
  x = 10;
}
x;
```

In this example, `any` returns `[false]`. This is truthy, so `x` is set to `10`. (Note: [fold methods](?fold) always return a cube &mdash; they only reduce one dimension, so do not always produce a single value.)

Similar issues can arise when entries are arrays/cubes:

```
x = [10, 20, 30, 40];
```
```
y = ['a', 'b', 'a', 'b'];
```
```
totals = x.group(0, y, grp => grp.sum());  //entries are cubes
```
```
totals.unbox();  //probably want this
```

### Arguments {#arguments}

Data-Cube methods 'look inside' arguments. Wrap an argument in an array when this is not the desired behavior:

```
x = [5, 6];
```
```
x.$ent(1, [7, 8]);  //cannot set an entry to two values
```
```
x.$ent(1, [[7, 8]]);  //set entry 1 to the array [7, 8]  
```

### Sparse Arrays {#sparse-arrays}

[`cube`](?create#method_cube) returns a sparse array by default &mdash; each entry is a 'hole'. Data-Cube methods behave as if holes have the value `undefined`, but some native methods ignore holes completely:

```
x = [2].cube();  //sparse
```
```
x.some(val => val === undefined);  //some ignores holes
```

[This page](http://2ality.com/2015/09/holes-arrays-es6.html) summarizes how native methods handle holes. To avoid this issue altogether, simply initialize cube entries, e.g. `[2].cube(0)`. (Note: initializing entries to `undefined` leaves them as holes.)

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
colors.row(results, 'array');  //works
```

```{.no-input .no-output}
deleteVariables('colors', 'results', 'totals', 'x', 'y');
```