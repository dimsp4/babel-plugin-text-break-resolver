const pluginTester = require('babel-plugin-tester').default;
const plugin = require('../src/index');

pluginTester({
  plugin,
  pluginName: 'babel-plugin-text-break-resolver',
  babelOptions: {
    plugins: ['@babel/plugin-syntax-jsx'],
  },
  tests: [
    {
      title: 'adds attributes to simple Text',
      code: '<Text>Hello</Text>;',
      snapshot: true,
      babelOptions: { filename: 'test1.js' }
    },
    {
      title: 'does not override existing attributes',
      code: '<Text textBreakStrategy="highQuality">Hello</Text>;',
      snapshot: true,
      babelOptions: { filename: 'test2.js' }
    },
    {
      title: 'ignores non-Text elements',
      code: '<View>Hello</View>;',
      output: '<View>Hello</View>;',
    },
    {
      title: 'ignores self-closing Text',
      code: '<Text />;',
      output: '<Text />;',
    }
  ],
});
