# ilw · [![npm version](https://badge.fury.io/js/ilw.svg)](https://badge.fury.io/js/ilw)

English | [中文](README.zh-CN.md)

Isomorphic logger wrapper.

- [API](#API)
- [Example](#Example)
- [What is it for](#What-is-it-for)

## API

### Methods

**ilw<Meta, Events>(options)**

- `options` \<`Object`\>
  - `onLog` \<`OnLog<Meta>`\>
  - `onEvent` \<`OnEvent<Meta, Events>`\>
  - `persist` \<`?boolean`\>
  - `report` \<`?boolean`\>
  - `event` \<`?boolean`\>
  - `meta` \<`?Meta`\>
- returns:
  - \<`Ilw<Meta, Events>`\>
    - if `options.event` is falsy
  - \<`EventIlw<Meta, Events>`\>
    - if `options.event` is true

### Types

**Ilw\<Meta, Events\>**

- `ilw.persist` \<`Ilw<Meta, Events>`\>
- `ilw.report` \<`Ilw<Meta, Events>`\>
- `ilw.event` \<`EventIlw<Meta, Events>`\>
- `ilw.meta` \<`(meta: Meta) => Ilw<Meta, Events>`\>
- `ilw.debug` \<`(...messages: unknown[]) => void`\>
- `ilw.info` \<`(...messages: unknown[]) => void`\>
- `ilw.warn` \<`(...messages: unknown[]) => void`\>
- `ilw.error` \<`(...messages: unknown[]) => void`\>

**EventIlw\<Meta, Events\>**

- `ilw.persist` \<`EventIlw<Meta, Events>`\>
- `ilw.report` \<`EventIlw<Meta, Events>`\>
- `ilw.meta` \<`(meta: Meta) => Ilw<Meta, Events>`\>
- `ilw.debug` \<`(type: keyof Events, value: Events[type]) => void`\>
- `ilw.info` \<`(type: keyof Events, value: Events[type]) => void`\>
- `ilw.warn` \<`(type: keyof Events, value: Events[type]) => void`\>
- `ilw.error` \<`(type: keyof Events, value: Events[type]) => void`\>

**OnLog**

```ts
type OnLog<Meta = unknown> = (
  level: Level,
  messages: unknown[],
  options: OnLogOptions<Meta>
) => void;
```

**OnEvent**

```ts
type OnEvent<
  Meta = unknown,
  Events extends Record<string, unknown> = Record<string, unknown>
> = <T extends keyof Events>(
  level: Level,
  event: {
    type: T;
    detail: Events[T];
  },
  options: OnLogOptions<Meta>
) => void;
```

**OnLogOptions**

```ts
type OnLogOptions<Meta = unknown> = {
  event: boolean;
  report: boolean;
  persist: boolean;
  meta: Meta | undefined;
};
```

## Example

```ts
import { ilw } from "ilw";

const logger = ilw({
  // unified logging entry
  // report  - Whether to report
  // persist - Whether to persist data
  // meta    - Meta message, anything
  onLog(level, messages, { report, persist, meta }) {
    if (report) {
      // report by string
      reporter.report(message.map(JSON.stringify).join(","));
    } else if (persist) {
      // Maybe your company's client logging SDK
      nativeLogger(...messages);
    } else {
      // Or just print normally.
      console[level](...messages);
    }
  },
  // unified event logging entry
  // type   - Event type
  // detail - Event detail
  onEvent(level, { type, detail }, { report, persist, meta }) {
    if (report) {
      // report by eventName & params
      eventReporter.report(type, detail);
    } else if (persist) {
      // Maybe your company's client logging SDK
      nativeLogger("event", type, detail);
    } else {
      // Or just print normally.
      console[level]("event", type, detail);
    }
  },
});

// report
logger.report.info("xxx", "yyy");
// persist
logger.persist.info("xxx", "yyy");
// event type
logger.event.info("eventName", {});
// Meta
logger.meta({ foo: "bar" }).info("xxx");
// any combinations
logger.persist.report.info("xx", "yyy");

// Use it like currify a function
const persistLogger = logger.persist;
persistLogger.info("xxx", "yyy");

const operationLogger = logger.meta({ scope: "operation" });
operationLogger.error("oops", new Error());
```

## What is it for

If you have made some relative complex apps, you will find logging & monitoring are important parts.

Since code quality can be influenced by different reasons, sometimes the only controlled part is logging, it's important to logging your app.

However there may be many conditions of logging itself:

1. It may need reporting
2. It may need to be saved locally so you can retrive the log
3. It may be formatted as event name & params, or as string
4. It may not need reporting
5. Its message may need formating (from Error or Object to string), or not (just print from console)
6. Combination of those conditions

These different conditions could use different library, or even in different devices. Every collaborator may have his thought. Finally the code will become messy.

If someone does some impilicit encapsulation of logging, it will be hard for new collaborators to understand what happens inside the logging code snippet.

So I try to merge those conditions into one adapter. At least I hope it can satisfy most demands.
