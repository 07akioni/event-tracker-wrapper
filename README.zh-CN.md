# event-tracker-wrapper

[English](README.md) | 中文

## API

### Methods

注意，类型仅供参考，和实际类型有偏差

#### `createEventTracker`

```ts
function createEventTracker<Events, StartOptions, EventOptions>(
  options: EventTrackerOptions<Events, StartOptions, EventOptions>
): EventTracker<Events, StartOptions, EventOptions>;

type EventTrackerOptions<Events, StartOptions, EventOptions> = {
  autostart?: boolean;
  onEvent?: (arg: {
    level: "debug" | "info" | "warn" | "error";
    name: string;
    message: string;
    payload: unknown;
    options: EventOptions;
    startOptions: StartOptions;
  }) => void;
};

type EventTracker<Events, StartOptions, EventOptions> = {
  start: () => void;
  debug: (event: {
    name: string;
    message: string;
    payload: unknown;
    options: EventOptions;
  }) => void;
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
import type { Reporter } from "takes-long-time-to-import-reporter";

// in package-a
export const tracker = createEventTracker<Events, Reporter>({
  autostart: false,
});

// in package-b
import { tracker } from "package-a";

// after TTI
{
  import("takes-long-time-to-import-reporter").then((reporter) => {
    tracker.start(reporter);
  });
}
```
