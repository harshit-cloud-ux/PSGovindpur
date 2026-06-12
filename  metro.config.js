const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Firebase + Hermes fix — forces Metro to use the React Native compatible
// build of packages instead of the modern browser build that uses
// unsupported syntax (#private fields)
config.resolver.unstable_enablePackageExports = false;

module.exports = config;