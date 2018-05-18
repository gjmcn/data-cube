import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';
import uglify from 'rollup-plugin-uglify';

export default {
  input: 'src/data-cube.js',
  output: {
    extend: false,
    file: 'dist/data-cube.js',
    format: 'umd',
    name: '_data_cube_helper'
  },
  plugins: [
    commonjs({
      sourceMap: false
    }),
    resolve(),
    uglify()
  ]
};