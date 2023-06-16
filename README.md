# event-tracker-wrapper

[English](README.md) | 中文

## API

### Methods

Please note that types are for reference only. They are not the actual types.

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

1. `event-tracker-wrapper` seems only work for event track. How to deal with normal log?

Normal log can be viewed as event, you can do like this:

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

2. How to delay event tracking?

```ts
const tracker = createEventTracker<Events>({
  autostart: false,
});

setTimeout(() => {
  tracker.start();
}, 1000);
```
