const babel = require('@babel/core');
const plugin = require('./dist/index.js');

const code = `
import React from 'react';
import { View, Text } from 'react-native';

export const DistLayout = () => {
  return (
    <View className="justify-between flex-row">
      <Text>Left</Text>
      <Text>Right</Text>
    </View>
  );
};

export const MiddleDistLayout = () => {
  return (
    <View style={{ justifyContent: 'space-around' }}>
      <Text>First</Text>
      <View>
         <Text>Middle</Text>
      </View>
      <Text>Last</Text>
    </View>
  );
};
`;

babel.transform(code, {
  presets: ['@babel/preset-react'],
  plugins: [[plugin, { trailingSpaces: true }]]
}, (err, result) => {
  if (err) {
    console.error(err);
  } else {
    console.log(result.code);
  }
});
