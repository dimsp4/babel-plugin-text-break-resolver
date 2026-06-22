const babel = require('@babel/core');
const plugin = require('./dist/index.js');

const code = `
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

const PlusSquare = () => <View />;

export const AddDataButton = () => {
  return (
    <TouchableOpacity className="w-full flex-row items-center justify-center py-2 self-end rounded bg-[#002F5F]">
        <Text className="text-white font-bold text-[11px] text-center mr-[5px]">Tambah Data Baru</Text>
        <PlusSquare size={14} color="#038801" />
    </TouchableOpacity>
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
