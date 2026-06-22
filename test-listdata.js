const babel = require('@babel/core');
const plugin = require('./dist/index.js');

const code = `
import React from 'react';
import { View, Text } from 'react-native';

export const ListDataCardRow = () => {
  return (
    <View className="w-full flex-row justify-between px-[10px] py-0.5">
        <View className="mt-[7px]">
            <Text className="font-bold text-[12px] text-[#053362]">
                Name
            </Text>
        </View>
        <View className="mt-[8px]">
            <Text className="text-[12px] text-[#053362]">NIK</Text>
        </View>
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
