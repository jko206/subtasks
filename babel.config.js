module.exports = {
  presets: [
    '@vue/app',
    [
      '@babel/preset-env',
      {
        targets: {
          node: 'current',
        },
      },
    ],
  ],
  // plugins: ['@babel/plugin-transform-modules-commonjs'],
}
