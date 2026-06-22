const assert = require('assert/strict');
const { transformSync } = require('@babel/core');
const plugin = require('../src/index');

function runTransform(code, pluginOptions = {}, babelOptions = {}) {
  return transformSync(code, {
    filename: babelOptions.filename || 'test.js',
    babelrc: false,
    configFile: false,
    parserOpts: { plugins: ['jsx'] },
    plugins: [[plugin, pluginOptions]],
    generatorOpts: {
      retainLines: false,
      concise: false,
    },
  }).code;
}

const normalize = (value) => value.replace(/\n\s*/g, '');

const cases = [
  [
    'default - adds textBreakStrategy and trailing spaces',
    () => runTransform('<Text>Hello</Text>;'),
    '<Text textBreakStrategy={"simple"}>Hello{"  "}</Text>;',
  ],
  [
    'centered text - adds spaces on both sides',
    () => runTransform('<Text className="text-center">Hello</Text>;'),
    '<Text className="text-center" textBreakStrategy={"simple"}>{"  "}Hello{"  "}</Text>;',
  ],
  [
    'left aligned text - adds trailing spaces only',
    () => runTransform('<Text className="text-left">Hello</Text>;'),
    '<Text className="text-left" textBreakStrategy={"simple"}>Hello{"  "}</Text>;',
  ],
  [
    'right aligned text - adds leading spaces only',
    () => runTransform('<Text className="text-right">Hello</Text>;'),
    '<Text className="text-right" textBreakStrategy={"simple"}>{"  "}Hello</Text>;',
  ],
  [
    'interactive centered wrapper - adds spaces on both sides',
    () => runTransform('<TouchableOpacity style={{ alignItems: "center", justifyContent: "center" }}><Text>+</Text></TouchableOpacity>;'),
    '<TouchableOpacity style={{ alignItems: "center", justifyContent: "center" }}><Text textBreakStrategy={"simple"}>{"  "}+{"  "}</Text></TouchableOpacity>;',
  ],
  [
    'centered stack card - adds spaces on both sides',
    () => runTransform('<TouchableOpacity className="my-4 items-center self-center w-1/2 h-auto bg-white rounded-[20px] elevation-md py-3"><Text className="text-[#333E63] font-bold text-[16px]">Total PTM</Text><Text className="text-[#0462C5] text-[20px] font-bold">{summaryChannel?.CountPtm || "-"}</Text></TouchableOpacity>;'),
    '<TouchableOpacity className="my-4 items-center self-center w-1/2 h-auto bg-white rounded-[20px] elevation-md py-3"><Text className="text-[#333E63] font-bold text-[16px]" textBreakStrategy={"simple"}>{"  "}Total PTM{"  "}</Text><Text className="text-[#0462C5] text-[20px] font-bold" textBreakStrategy={"simple"}>{"  "}{summaryChannel?.CountPtm || "-"}{"  "}</Text></TouchableOpacity>;',
  ],
  [
    'aliased react-native imports - still transforms text',
    () => runTransform('import { Text as RNText, TouchableOpacity as RNTouchableOpacity } from "react-native";\n<RNTouchableOpacity style={{ alignItems: "center", justifyContent: "center" }}><RNText>Hello</RNText></RNTouchableOpacity>;'),
    'import { Text as RNText, TouchableOpacity as RNTouchableOpacity } from "react-native";<RNTouchableOpacity style={{ alignItems: "center", justifyContent: "center" }}><RNText textBreakStrategy={"simple"}>{"  "}Hello{"  "}</RNText></RNTouchableOpacity>;',
  ],
  [
    'textBreakBuffer="start" - strips prop and adds leading spaces',
    () => runTransform('<Text textBreakBuffer="start">Hello</Text>;'),
    '<Text textBreakStrategy={"simple"}>{"  "}Hello</Text>;',
  ],
  [
    'noTrailingSpaces attribute - strips and no buffer injected',
    () => runTransform('<Text noTrailingSpaces>Hello</Text>;'),
    '<Text textBreakStrategy={"simple"}>Hello</Text>;',
  ],
  [
    'with trailingSpaces: false - no spaces appended',
    () => runTransform('<Text>Hello</Text>;', { trailingSpaces: false }),
    '<Text textBreakStrategy={"simple"}>Hello</Text>;',
  ],
  [
    'expression child - appends trailing spaces',
    () => runTransform('<Text>{variable}</Text>;'),
    '<Text textBreakStrategy={"simple"}>{variable}{"  "}</Text>;',
  ],
  [
    'element child - appends trailing spaces',
    () => runTransform('<Text><Bold>x</Bold></Text>;'),
    '<Text textBreakStrategy={"simple"}><Bold>x</Bold>{"  "}</Text>;',
  ],
  [
    'mixed children - appends trailing spaces',
    () => runTransform('<Text>{greeting} world</Text>;'),
    '<Text textBreakStrategy={"simple"}>{greeting} world{"  "}</Text>;',
  ],
  [
    'with both options true - adds both props',
    () => runTransform('<Text>Hello</Text>;', { numberOfLines: true, adjustsFontSizeToFit: true }),
    '<Text textBreakStrategy={"simple"} numberOfLines={1} adjustsFontSizeToFit={true}>Hello{"  "}</Text>;',
  ],
  [
    'does not override existing attributes but adds trailing spaces',
    () => runTransform('<Text textBreakStrategy="highQuality">Hello</Text>;'),
    '<Text textBreakStrategy="highQuality">Hello{"  "}</Text>;',
  ],
  [
    'ignores non-Text elements',
    () => runTransform('<View>Hello</View>;'),
    '<View>Hello</View>;',
  ],
  [
    'ignores self-closing Text',
    () => runTransform('<Text />;'),
    '<Text />;',
  ],
];

for (const [title, actual, expected] of cases) {
  assert.equal(normalize(actual()), normalize(expected), title);
}

console.log('plugin transform tests passed');
