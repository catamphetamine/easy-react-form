// import json from 'rollup-plugin-json'
import commonjs from 'rollup-plugin-commonjs'
import resolve from 'rollup-plugin-node-resolve'
import { terser } from 'rollup-plugin-terser'

const resolveModules = resolve()

export default [
  {
    input: 'index.js',
    plugins: [
      resolveModules,
      commonjs(),
      // json(),
      // terser()
    ],
    external: [
      'react',
      'prop-types'
    ],
    output: {
      format: 'umd',
      name: 'EasyReactForm',
      file: 'bundle/easy-react-form.js',
      sourcemap: true,
      globals: {
        'react': 'React',
        'prop-types': 'PropTypes'
      }
    }
  }
]
