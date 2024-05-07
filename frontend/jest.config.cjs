module.exports = {
  transform: {
    // Transform files with a `.js` or `.jsx` extension using Babel
    '^.+\\.jsx?$': ['babel-jest', {
      presets: [
        ['@babel/preset-env', { targets: { node: 'current' } }], // Target the current version of Node
        '@babel/preset-react' // Add JSX support
      ]
    }]
  },
  setupFilesAfterEnv: ['@testing-library/jest-dom'], // Setup files after environment setup
  testEnvironment: 'jest-environment-jsdom', // Use jsdom as the testing environment
};
