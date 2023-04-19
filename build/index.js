const esbuild = require('esbuild')
const { dtsPlugin } = require('esbuild-plugin-d.ts')

const common = {
  target: 'esnext',
  entryPoints: [
    { in: 'src/index.ts', out: 'index' }
  ],
  plugins: [
    dtsPlugin()
  ]
}

esbuild.build({
  ...common,
  outdir: 'dist/esm',
  bundle: true,
  format: 'esm',
})

esbuild.build({
  ...common,
  outdir: 'dist/cjs',
  bundle: true,
  format: 'cjs',
})
