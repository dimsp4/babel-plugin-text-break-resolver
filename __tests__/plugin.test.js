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
      title: 'default - adds only textBreakStrategy',
      code: '<Text>Hello</Text>;',
      snapshot: true,
      babelOptions: { filename: 'test1.js' }
    },
    {
      title: 'with numberOfLines: true - adds numberOfLines',
      code: '<Text>Hello</Text>;',
      pluginOptions: { numberOfLines: true },
      snapshot: true,
      babelOptions: { filename: 'test2.js' }
    },
    {
      title: 'with adjustsFontSizeToFit: true - adds adjustsFontSizeToFit',
      code: '<Text>Hello</Text>;',
      pluginOptions: { adjustsFontSizeToFit: true },
      snapshot: true,
      babelOptions: { filename: 'test3.js' }
    },
    {
      title: 'with both options true - adds both props',
      code: '<Text>Hello</Text>;',
      pluginOptions: { numberOfLines: true, adjustsFontSizeToFit: true },
      snapshot: true,
      babelOptions: { filename: 'test4.js' }
    },
    {
      title: 'does not override existing attributes',
      code: '<Text textBreakStrategy="highQuality">Hello</Text>;',
      output: '<Text textBreakStrategy="highQuality">Hello</Text>;',
      babelOptions: { filename: 'test5.js' }
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
