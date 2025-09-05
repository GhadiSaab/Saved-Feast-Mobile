// Import polyfills first
require('./polyfills');

const { getDefaultConfig } = require('expo/metro-config');
const { os } = require('./polyfills');

const config = getDefaultConfig(__dirname);

// Override maxWorkers to handle Node.js compatibility
config.maxWorkers = Math.max(1, Math.floor(os.availableParallelism() / 2));

module.exports = config;
