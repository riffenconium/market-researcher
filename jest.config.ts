import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/__tests__"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  // Required for pptxgenjs dynamic import('node:fs') inside Jest's VM sandbox
  testEnvironmentOptions: {
    experimentalVmModules: true,
  },
};

export default config;
