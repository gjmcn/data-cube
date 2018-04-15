const helper = require('./helper.js');
const bench = f => console.log(helper.timer(f));

let i, j, n, f, g, x, y, z, a, b, c, test1, test2;


n = 1e7;
x = new Array(n);
y = new Array(n);

f = () => 5


test1 = () => {
  //for (i=0; i<n; i++) x[i] = i;
}

test2 = () => {
  for (let i=0; i<n; i++) y[i] = i;
}
    


bench(test1);
bench(test2);  