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
  mergePayloadObjectWith: (
    payload: unknown
  ) => EventTracker<Events, StartOptions, EventOptions>;
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
  let startOptions: StartOptions;
  let started = autostart;
  const queuedArgs: Array<{ level: Level; event: unknown }> = [];
  const createTrackMethod = <L extends Level>(
    level: L,
    payloadToBeMerged: unknown
  ) => {
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
      onEvent({
        level,
        event: {
          name,
          message,
          payload:
            payloadToBeMerged === undefined
              ? payload
              : Object.assign({}, payloadToBeMerged, payload as any),
        },
        options: options as EventOptions,
        startOptions,
      });
    };
  };
  function createApi(
    payloadToBeMerged: unknown
  ): EventTracker<Events, StartOptions, EventOptions> {
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
      debug: createTrackMethod("debug", payloadToBeMerged),
      info: createTrackMethod("info", payloadToBeMerged),
      warn: createTrackMethod("warn", payloadToBeMerged),
      error: createTrackMethod("error", payloadToBeMerged),
      mergePayloadObjectWith: (payload) => createApi(payload),
    };
    return api;
  }
  return createApi(undefined);
}
