import typescript from 'rollup-plugin-typescript2';
import terser from '@rollup/plugin-terser';

export default {
  input: 'src/index.ts',
  output: {
    file: 'dist/org-info.js',
    format: 'iife',
  },
  plugins: [
    typescript(),
    // terser(),
  ]
}
