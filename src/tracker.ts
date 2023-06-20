export type Level = "debug" | "info" | "warn" | "error";

type EventsConstraint = Record<Level, Record<string, unknown>>;
type EventOptionsConstraint = {} | undefined;
type DefaultStartOptions = undefined;
type DefaultEventOptions = undefined;

export type OnEventPayload<Payload> = undefined extends Payload
  ? { payload?: Payload }
  : { payload: Payload };

export type OnEventOptions<EventOptions> = undefined extends EventOptions
  ? { options?: EventOptions }
  : { options: EventOptions };

export type OnEvent<
  StartOptions = DefaultStartOptions,
  EventOptions extends EventOptionsConstraint = DefaultEventOptions
> = (arg: {
  level: Level;
  event: {
    name: string;
    message: string;
    payload: unknown;
  };
  options: EventOptions;
  startOptions: StartOptions;
}) => void;

export type EventTracker<
  Events extends EventsConstraint,
  StartOptions = DefaultStartOptions,
  EventOptions extends EventOptionsConstraint = DefaultEventOptions
> = {
  [K in Level]: (
    event: {
      [EventName in keyof Events[K]]: {
        name: EventName;
        message: string;
      } & OnEventPayload<Events[K][EventName]> &
        OnEventOptions<EventOptions>;
    }[keyof Events[K] & string]
  ) => void;
} & {
  start: (options: StartOptions) => void;
};

export type EventTrackerOptions<
  Events extends EventsConstraint,
  StartOptions = DefaultStartOptions,
  EventOptions extends EventOptionsConstraint = DefaultEventOptions
> = {
  autostart?: boolean;
  onEvent?: OnEvent<StartOptions, EventOptions>;
  onStart?: (
    startOptions: StartOptions,
    tracker: EventTracker<Events, StartOptions, EventOptions>
  ) => void;
};

export function createEventTracker<
  Events extends EventsConstraint,
  StartOptions = DefaultStartOptions,
  EventOptions extends EventOptionsConstraint = DefaultEventOptions
>({
  autostart = true,
  onEvent = ({ level, event }) => {
    console[level](`[${level}] ${event.name}:`, event.message || "");
  },
  onStart = () => {
    console.log("start tracking events");
  },
}: EventTrackerOptions<Events, StartOptions, EventOptions> = {}): EventTracker<
  Events,
  StartOptions,
  EventOptions
> {
  let startOptions: StartOptions | "__notInitialized__" = "__notInitialized__";
  let started = autostart;
  const queuedArgs: Array<{ level: Level; event: unknown }> = [];
  const createTrackMethod = <L extends Level>(level: L) => {
    return (
      event: {
        [EventName in keyof Events[L] & string]: {
          name: EventName;
          message: string;
        } & OnEventPayload<Events[L][EventName]> &
          OnEventOptions<EventOptions>;
      }[keyof Events & string]
    ): void => {
      if (!started) {
        queuedArgs.push({ level, event });
        return;
      }
      const { name, message, payload, options } = event;
      if (startOptions === "__notInitialized__")
        throw new Error(
          "[event-tracker-wrapper]: `startOptions` is not initialized."
        );
      onEvent({
        level,
        event: {
          name,
          message,
          payload: payload as any,
        },
        options: options as EventOptions,
        startOptions,
      });
    };
  };
  const api: EventTracker<Events, StartOptions, EventOptions> = {
    start: (options) => {
      startOptions = options;
      if (!started) {
        started = true;
        onStart?.(options, api);
        queuedArgs.forEach(({ level, event }) => {
          api[level](event as any);
        });
        queuedArgs.length = 0;
      }
    },
    debug: createTrackMethod("debug"),
    info: createTrackMethod("info"),
    warn: createTrackMethod("warn"),
    error: createTrackMethod("error"),
  };
  return api;
}

export function withPayload<T extends EventTracker<any, any, any>>(
  tracker: T,
  payload: any
): T {
  return {
    start() {
      throw new Error(
        "[event-tracker-wrapper]: please don't call `start` in a tracker created by `withPayload`"
      );
    },
    debug: (event) => {
      tracker.debug({
        name: event.name,
        message: event.message,
        options: event.options,
        payload: {
          ...payload,
          ...event.payload,
        },
      });
    },
    info: (event) => {
      tracker.info({
        name: event.name,
        message: event.message,
        options: event.options,
        payload: {
          ...payload,
          ...event.payload,
        },
      });
    },
    warn: (event) => {
      tracker.warn({
        name: event.name,
        message: event.message,
        options: event.options,
        payload: {
          ...payload,
          ...event.payload,
        },
      });
    },
    error: (event) => {
      tracker.error({
        name: event.name,
        message: event.message,
        options: event.options,
        payload: {
          ...payload,
          ...event.payload,
        },
      });
    },
  } satisfies EventTracker<any, any, any> as unknown as T;
}
