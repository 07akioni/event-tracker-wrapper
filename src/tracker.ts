export type Level = "debug" | "info" | "warn" | "error";

type EventsConstraint = Record<Level, Record<string, unknown>>;
type MetaConstraint = {};
type OptionsConstraint = {} | undefined;
type DefaultMeta = {};
type DefaultOptions = undefined;

export type OnEventPayload<Payload> = undefined extends Payload
  ? { payload?: Payload }
  : { payload: Payload };

export type OnEventOptions<Options> = undefined extends Options
  ? { options?: Options }
  : { options: Options };

export type OnEvent<
  Events extends EventsConstraint,
  Options extends OptionsConstraint = DefaultOptions,
  Meta extends MetaConstraint = DefaultMeta
> = <L extends Level>(
  payload: {
    level: L;
    event: {
      [Key in keyof Events & string]: {
        name: Key;
        message: string;
      } & OnEventPayload<Events[L][Key]>;
    }[keyof Events[L] & string];
    options: Options;
  } & Meta
) => void;

export type EventTracker<
  Events extends EventsConstraint,
  Options extends OptionsConstraint = DefaultOptions,
  Meta extends MetaConstraint = DefaultMeta
> = {
  [K in Level]: (
    event: {
      [EventName in keyof Events[K]]: {
        name: EventName;
        message: string;
      } & OnEventPayload<Events[K][EventName]> &
        Meta &
        OnEventOptions<Options>;
    }[keyof Events[K] & string]
  ) => void;
} & {
  start: () => void;
};

export type EventTrackerOptions<
  Events extends EventsConstraint,
  Options extends OptionsConstraint = DefaultOptions,
  Meta extends MetaConstraint = DefaultMeta
> = {
  autostart?: boolean;
  onEvent?: OnEvent<Events, Options, Meta>;
};

export function createEventTracker<
  Events extends EventsConstraint,
  Options extends OptionsConstraint = DefaultOptions,
  Meta extends MetaConstraint = DefaultMeta
>({
  autostart = true,
  onEvent = ({ level, event }) => {
    console[level](`[${level}] ${event.name}:`, event.message || "");
  },
}: EventTrackerOptions<Events, Options, Meta> = {}): EventTracker<
  Events,
  Options,
  Meta
> {
  let started = autostart;
  const queuedArgs: Array<{ level: Level; arg: unknown }> = [];
  const createTrackMethod = <L extends Level>(level: L) => {
    return (
      arg: {
        [EventName in keyof Events[L] & string]: {
          name: EventName;
          message: string;
        } & OnEventPayload<Events[L][EventName]> &
          Meta &
          OnEventOptions<Options>;
      }[keyof Events & string]
    ): void => {
      if (!started) {
        queuedArgs.push({ level, arg });
        return;
      }
      const { name, message, payload, options, ...meta } = arg;
      onEvent({
        ...(meta as unknown as Meta),
        level,
        event: {
          name,
          message,
          payload: payload as any,
        },
        options: options as Options,
      });
    };
  };
  const api = {
    start: () => {
      if (!started) {
        started = true;
        queuedArgs.forEach(({ level, arg }) => {
          api[level](arg as any);
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
