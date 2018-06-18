import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';
import uglify from 'rollup-plugin-uglify';

export default {
  input: 'src/data-cube.js',
  output: {
    extend: true,
    file: 'dist/data-cube.js',
    format: 'umd',
    name: 'dc'
  },
  plugins: [
    commonjs({
      sourceMap: false
    }),
    resolve(),
    uglify()
  ]
};