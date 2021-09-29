import {Category,CategoryLogger,CategoryServiceFactory,CategoryConfiguration,LogLevel} from "typescript-logging";

// Optionally change default settings, in this example set default logging to Info.
// Without changing configuration, categories will log to Error.
CategoryServiceFactory.setDefaultConfiguration(new CategoryConfiguration(LogLevel.Info));

export function getLogger(name: string): CategoryLogger {
    // Create categories, they will autoregister themselves, one category without parent (root) and a child category.
    return new Category(name);
}
