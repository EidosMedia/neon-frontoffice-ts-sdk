/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
  testEnvironment: "node",
  testPathIgnorePatterns: ["<rootDir>/dist/"],
  transform: {
    "^.+.tsx?$": ["ts-jest",{}],
  },
};