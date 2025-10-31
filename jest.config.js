export default {
  testEnvironment: "node",
  verbose: true,
  forceExit: true,
  clearMocks: true,
  detectOpenHandles: true,
  setupFilesAfterEnv: ["<rootDir>/tests/config/testSetup.js"],
  testTimeout: 30000,
  transform: {},
};
