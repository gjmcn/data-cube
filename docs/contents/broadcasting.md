## Broadcasting

---

Where appropriate, methods **broadcast** [singletons](?arguments#singletons):

```
x = [2, 3].rand(100);
```
```
x.$col([0,2], 200);  //broadcast 200 to all selected entries
```

Here is another example; [`method`](?entrywise#method_method) broadcasts all of its arguments except the first:

```
s = ['abcd', 'vwxyz'];
```
```
s.method('slice', 1, 3);
```
```
s.method('slice', 1, [3, 4]);
```
```
s.method('slice', [1, 2], [3, 4]);
```

[Operator-like](?entrywise#method_op_like) methods are special since they also broadcast the calling array:

```js
[5].add([10, 20]);
```

---

__Notes__

* Only singletons are broadcast. Use [`tile`](?concatenate#method_tile) or [`tileTo`](?concatenate#method_tile_to) in other cases.

* Singletons are _not_ copied during broadcasting; the same argument is used repeatedly. This is important when array entries are arrays, dates, objects etc.

```{.no-input .no-output}
deleteVariables('x', 's');
```