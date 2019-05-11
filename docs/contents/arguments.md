## Arguments

Passing a 1-entry array to a Data-Cube method is equivalent to passing the entry itself:

```
x = [2, 8].rand(100);
```
```
x.row([0]);
```
```
x.row(0);
```

We refer to 1-entry array arguments and non-array arguments as **singletons**.

Most methods ignore the shape, keys and labels of array arguments:

```
y = [1, 3, 5, 7].$shape(2);
```
```
x.col(y);  //shape of y ignored
```
```
x.$col([4, 6], y);  //shape of y ignored
```

There are some cases where the shape, keys and labels of an argument _are_ significant:

```
z = [2, 4, 6, 8];
```
```
y.horiz(z);  //cannot concatenate
```
```
z.$shape(2);
```
```
y.horiz(z);
```

Many arguments have a __default__ value that is used when the argument is omitted or `undefined`. In many cases, the default value `null` is used to to indicate a default behavior rather than a fixed default value:

```js
x.subcube(null, [0, 4]);  //null indicates all rows
```

```{.no-input .no-output}
deleteVariables('x', 'y', 'z');
```