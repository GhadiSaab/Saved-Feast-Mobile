// Polyfills for Node.js compatibility issues
const os = require('os');

// Polyfill for os.availableParallelism (introduced in Node.js 19.0.0)
if (!os.availableParallelism) {
  os.availableParallelism = () => os.cpus().length;
}

// Export the polyfilled os module
module.exports = { os };


