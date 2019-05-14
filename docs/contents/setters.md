## Setters

---

Data-Cube __setters__ (i.e. methods that change the calling array) are prefixed with `$`. Most setters correspond to **getters** of the same name:

```
x = [2, 3].rand(100);
```
```
x.row(0);  //getter
```
```
x.$row(0, 200);  //setter
```

A `$$` prefix can be used when the new value(s) depend on the current value(s):

```
x.$$row(1, rw => rw.add(100));
```

In the above example, the callback function is passed the result of the corresponding getter (`x.row(1)`). Most `$$`-setters behave in this way, but a few apply the callback entrywise:

```
[ {a: 5}, {a: 6} ]
  .$$prop('b', obj => obj.a + 10)
  .map(obj => JSON.stringify(obj));  //print as strings
```

```{.no-input .no-output}
deleteVariables('x');
```