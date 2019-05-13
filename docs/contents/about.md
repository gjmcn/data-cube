__Data-Cube__ adds array-oriented programming to JavaScript.{.big}

A native array:

```{.no-output}
a = [44, 84, 73, 59, 91, 70];
```

can behave as a multidimensional array:

```
a.$shape(2);  //$ for 'set'
```

Dimensions can have indices or keys (of any type). They can also have labels:

```
a.$key(0, ['Alice', 'Bob'])
 .$key(1, ['biology', 'chemistry', 'physics'])
 .$label(0, 'Student')
 .$label(1, 'Subject');
```

Data-Cube adds lots of new array methods. For example:

```
a.mean(1).round();
```

```
a.col(['biology', 'physics']);
```

```
a.$col('physics', 100);
```

```
a.order(1, a.row('Alice'), 'desc');  //order columns on Alice's results
```

Note that `a` is still just an array and we can call native array methods on it:

```
a.join();
```

Data is easily loaded and converted from/to different formats. Let's load the well-known [Iris dataset](https://en.wikipedia.org/wiki/Iris_flower_data_set) from a JSON file. We can use the `fetchMatrix` method, but since this returns a promise (and examples are simply evaluated and the result printed), we'll first create a `<div>`:

```{.custom-html}
div = qa.create('div');  //use the html plugin, see below
```

and then load the data and print the first few rows to the `<div>`:{.indent}

```
dc.fetchMatrix('data/iris.json')
  .then(m => m.head(3).print({to: div}));
```

[Plugins](?plugins) add extra functionality to Data-Cube. For example, this page uses the [print-html plugin](https://github.com/gjmcn/data-cube-print-html) to print arrays and we use the [html plugin](https://github.com/gjmcn/data-cube-html) above to create a `<div>`.

```{.no-input .no-output}
deleteVariables('a');
```