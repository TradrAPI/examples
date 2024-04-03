# Playground Examples

All the code examples in this directory are meant to be run in the playground. The playground is a web-based environment where you can write and run code without having to install anything on your computer. It's a great way to experiment with the sdk and help users understand how to use the sdk. You can access the playground at [https://tradrapi.com/dashboard/playground](https://tradrapi.com/dashboard/playground).

### Development

- The playground uses TypeScript as the language for writing code. You can learn more about TypeScript at [https://www.typescriptlang.org/](https://www.typescriptlang.org/).

- File names should be in kebab-case and later these gets converted to normal case in the playground. For example, `hello-world.ts` will be displayed as `Hello World` in the playground.

- First line of the file should be a brief description of the code example. This will be displayed as the title of the code example in the playground.

- Describe each block of code with comments. This will help others understand what the code is doing.

- Special code strings will get interpreted by the playground.

  - `<API-KEY>`: This will be replaced with the actual API key when the code is run in the playground.

  ```typescript
  // input
  const apiKey = "<API-KEY>";

  // output
  const apiKey = "user specific api key";
  ```

  - `// <EXCHANGE-CONFIG>`: This will be replaced with the actual exchange configuration when the code is run in the playground.

  ```typescript
  // input
  const config = {
    // <EXCHANGE-CONFIG>
    debug: true,
  };

  // output
  const config = {
    exchange: {
      serviceUrl: "https://dev.tradrapi.com",
      socketUrl: "wss://dev-wss.tradrapi.com",
    },
    debug: true,
  };
  ```

- Use `console.log()` to print output to the console. This will be displayed in the console tab in the playground.
