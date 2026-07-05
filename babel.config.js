module.exports = function (api) {
  api.cache(true);
  return {
    presets: [['babel-preset-expo', { jsxImportSource: 'nativewind' }], 'nativewind/babel'],
    plugins: [
      // Required by react-native-reanimated v4 to transform worklet functions
      'react-native-worklets/plugin',
    ],
  };
};
