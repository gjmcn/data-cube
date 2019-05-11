<b>Data-Cube</b> adds array-oriented programming to JavaScript.{.big}

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

Arrays are easily converted to different formats. For example, we can convert `a` to an array-of-objects using `vble` and plot it using [Vega-Lite](https://vega.github.io/vega-lite/) and [Vizsla](https://github.com/gjmcn/vizsla):


```{.vl-plot}
vz(a.vble(-1))
  .bar()
  .x('entry', 'q', {axis: {title: 'Marks'}})
  .y('Student', 'n')
  .color('Subject', 'n')
  .plot();
```

Plugins add extra functionality to Data-Cube.  This page uses the [print-html plugin](https://github.com/gjmcn/data-cube-print-html) to print arrays. For more general HTML/SVG manipulation, we use the [HTML plugin](https://github.com/gjmcn/data-cube-html). As an example, let's draw the bars from the above plot (ignoring scale). Their colors are:

```{.no-output}
colors = ['#e45756', '#f58518', '#4c78a8'];
```

We can draw tha bars using SVG or HTML:

```{.custom-html}
[rows, boxes] = qa.create('div').encode(a, 'div', 'div');
boxes
  .$style('float', 'left')
  .$style('width', a.flip(1).add('px'))  //flip column order to match plot
  .$style('background-color', colors.tp().tile())
  .$style('height', '18px'); 
rows
  .$style('height', '20px')
  .$style('width', '260px')
  .parent();  //'return' wrapper div so example renders
```

Or we can use a canvas:

 ```{.custom-html}
[canvas, ctx] = [].sketch(260, 40);
a.flip(1).cumuSum(1).wrap(1).forEach((res, i) => {
  ctx.loop(
    ['$fillStyle', colors.flip()],  //use colors from HTML example            
    ['fillRect', 0, i*20, res.flip(1), 18]
  );
});
canvas;  //'return' canvas so example renders
```

```{.no-input .no-output}
deleteVariables('a', 'colors', 'rows', 'boxes', 'canvas', 'ctx');
```