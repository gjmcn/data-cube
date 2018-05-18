import commonjs from 'rollup-plugin-commonjs';
import uglify from 'rollup-plugin-uglify';

export default {
  input: 'src/data-cube.js',
  output: {
    extend: false,
    file: 'dist/index.js',
    format: 'umd',
    name: '_data_cube_helper'
  },
  plugins: [
    uglify(),
    commonjs({
      sourceMap: false
    })
  ]
};