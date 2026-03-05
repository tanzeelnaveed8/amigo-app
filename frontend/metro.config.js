const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === 'axios') {
    return {
      type: 'sourceFile',
      filePath: require.resolve('axios/dist/browser/axios.cjs'),
    };
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
