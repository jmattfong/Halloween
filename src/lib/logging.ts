import {
  Category,
  CategoryLogger,
  CategoryServiceFactory,
  CategoryConfiguration,
  LogLevel,
} from "typescript-logging";

// See https://www.npmjs.com/package/typescript-logging

// Optionally change default settings, in this example set default logging to Info.
// Without changing configuration, categories will log to Error.

export function getLogger(name: string): CategoryLogger {
  // Create categories, they will autoregister themselves, one category without parent (root) and a child category.
  return new Category(name);
}

export function setLogLevel(level: LogLevel) {
  CategoryServiceFactory.setDefaultConfiguration(
    new CategoryConfiguration(level),
  );
}
