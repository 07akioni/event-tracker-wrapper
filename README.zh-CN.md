# event-tracker-wrapper

[English](README.md) | 中文

## API

### Methods

注意，类型仅供参考，和实际类型有偏差

#### `createEventTracker`

```ts
function createEventTracker<Events, Options, Meta>(
  options: EventTrackerOptions<Events, Options, Meta>
): EventTracker<Events, Options, Meta>;

type EventTrackerOptions<Events, Options, Meta> = {
  autostart?: boolean;
  onEvent?: (
    options: {
      level: "debug" | "info" | "warn" | "error";
      name: string;
      message: string;
      payload: unknown;
      options: Options;
    } & Meta
  ) => void;
};

type EventTracker<Events, Options, Meta> = {
  start: () => void;
  debug: (
    options: {
      name: string;
      message: string;
      payload: unknown;
      options: Options;
    } & Meta
  ) => void;
  info: Function; // same as debug
  warn: Function; // same as debug
  error: Function; // same as debug
};
```

## FAQ

1. `event-tracker-wrapper` 只封装了事件上报，对于普通的日志应该怎么办？

普通的日志也是一种特殊的事件，可以进行如下封装：

```ts
import { createEventTracker } from "event-tracker-wrapper";

type Events = {
  debug: {
    LOG: undefined;
  };
  info: {
    LOG: undefined;
  };
  warn: {
    LOG: undefined;
  };
  error: {
    LOG: undefined;
  };
};

const tracker = createEventTracker<Events>();

tracker.info({
  name: "LOG",
  message: "info log",
});
```

2. 如何延时上报？为什么需要延时上报？

```ts
const tracker = createEventTracker<Events>({
  autostart: false,
});

setTimeout(() => {
  tracker.start();
}, 1000);
```
