export type Level = "debug" | "info" | "warn" | "error";

let _performance: { now: () => number } | undefined;

function perfNow(): number {
  if (!_performance) {
    if (typeof performance === "undefined") {
      try {
        // @ts-ignore
        _performance = require("perf_hooks").performance;
      } catch (_) {
        return Date.now();
      }
    } else {
      _performance = performance;
    }
  }
  return _performance!.now();
}

type DefaultLogMeta = {};
type DefaultEventMeta = {};
type DefaultMarkMeta = {};
export type DefaultMeta = {
  log: DefaultLogMeta;
  event: DefaultEventMeta;
  mark: DefaultMarkMeta;
};

type DefaultLogOptions =
  | undefined
  | {
      persist?: boolean;
      report?: boolean;
    };
type DefaultEventOptions = DefaultLogOptions;
type DefaultMarkOptions = DefaultLogOptions;
export type DefaultOptions = {
  log: DefaultLogOptions;
  event: DefaultEventOptions;
  mark: DefaultMarkOptions;
};

export type OnLogData<Data> = undefined extends Data
  ? { data?: Data }
  : { data: Data };

export type OnLogOptions<Options> = undefined extends Options
  ? { options?: Options }
  : { options: Options };

export type OnLog<Options = DefaultLogOptions, Meta = DefaultLogMeta> = (
  data: {
    level: Level;
    message: string | undefined;
    options: Options;
  } & Meta
) => void;

export type OnEvent<
  Events extends Record<string, unknown> = Record<string, unknown>,
  Options = DefaultEventOptions,
  Meta = DefaultEventMeta
> = (
  data: {
    level: Level;
    event: {
      [Key in keyof Events & string]: {
        name: Key;
        message: string | undefined;
      } & OnLogData<Events[Key]>;
    }[keyof Events & string];
    options: Options;
  } & Meta
) => void;

export type OnMarkData<
  Marks extends Record<string, Record<string, unknown>> = Record<
    string,
    Record<string, unknown>
  >,
  Options = DefaultMarkOptions,
  Meta = DefaultMarkMeta
> = {
  [TimelineName in keyof Marks & string]: {
    level: Level;
    duration: number;
    timeline: {
      name: TimelineName;
    };
    mark: {
      [MarkName in keyof Marks[TimelineName] & string]: {
        name: MarkName;
        message: string | undefined;
      } & OnLogData<Marks[TimelineName][MarkName]>;
    }[keyof Marks[TimelineName] & string];
  } & Meta &
    OnLogOptions<Options>;
}[keyof Marks & string];

export type OnMark<
  Marks extends Record<string, Record<string, unknown>> = Record<
    string,
    Record<string, unknown>
  >,
  Options = DefaultMarkOptions,
  Meta = DefaultMarkMeta
> = (data: OnMarkData<Marks, Options, Meta>) => void;

type Tuple<
  Length extends number,
  Value,
  Ret extends Value[] = []
> = Ret extends { length: Length }
  ? Ret
  : Tuple<Length, Value, [...Ret, Value]>;

export type Timeline<
  Marks extends Record<string, unknown> = Record<string, unknown>,
  Options = DefaultMarkOptions,
  Meta = DefaultMarkMeta,
  Log = (
    data: {
      [MarkName in keyof Marks & string]: {
        name: MarkName;
        message?: string;
      } & OnLogData<Marks[MarkName]> &
        Meta &
        OnLogOptions<Options>;
    }[keyof Marks & string]
  ) => void
> = {
  all: <T extends number>(
    length: T
  ) => Tuple<T, Timeline<Marks, Options, Meta>>;
  race: <T extends number>(
    length: T
  ) => Tuple<T, Timeline<Marks, Options, Meta>>;
  resolve: () => void;
  reject: (reason?: unknown) => void;
  debug: Log;
  info: Log;
  warn: Log;
  error: Log;
};

export type PlainLogger<
  Options = DefaultOptions,
  Meta = DefaultLogMeta,
  Log = (
    data: {
      message?: string;
    } & Meta &
      OnLogOptions<Options>
  ) => void
> = {
  debug: Log;
  info: Log;
  warn: Log;
  error: Log;
};

export type TimelineLogger<
  TimelineMarks extends Record<string, Record<string, unknown>> = Record<
    string,
    Record<string, unknown>
  >,
  Options = DefaultOptions,
  Meta = DefaultMarkMeta
> = {
  create: <N extends keyof TimelineMarks>(
    name: N,
    listeners?: {
      onResolve?: (self: Timeline<TimelineMarks[N], Options, Meta>) => void;
      onReject?: (self: Timeline<TimelineMarks[N], Options, Meta>) => void;
    }
  ) => Timeline<TimelineMarks[N], Options, Meta>;
};

export type EventLogger<
  Events extends Record<string, unknown> = Record<string, unknown>,
  Options = DefaultOptions,
  Meta = undefined,
  Log = (
    event: {
      [EventName in keyof Events & string]: {
        name: EventName;
        message?: string;
      } & OnLogData<Events[EventName]> &
        Meta &
        OnLogOptions<Options>;
    }[keyof Events & string]
  ) => void
> = {
  debug: Log;
  info: Log;
  warn: Log;
  error: Log;
};

export type LoggerOptions<
  Events extends Record<string, unknown> = Record<string, unknown>,
  Marks extends Record<string, Record<string, unknown>> = Record<
    string,
    Record<string, unknown>
  >,
  Options extends {
    log: {} | undefined;
    event: {} | undefined;
    mark: {} | undefined;
  } = {
    log: {};
    event: {};
    mark: {};
  },
  Meta extends {
    log: {};
    event: {};
    mark: {};
  } = {
    log: {};
    event: {};
    mark: {};
  }
> = {
  onLog?: OnLog<Options["log"], Meta["log"]>;
  onEvent?: OnEvent<Events, Options["event"], Meta["event"]>;
  onMark?: OnMark<Marks, Options["mark"], Meta["mark"]>;
};

export type Logger<
  Events extends Record<string, unknown> = Record<string, unknown>,
  Marks extends Record<string, Record<string, unknown>> = Record<
    string,
    Record<string, unknown>
  >,
  Meta extends {
    log: {};
    event: {};
    mark: {};
  } = DefaultMeta,
  Options extends {
    log: {} | undefined;
    event: {} | undefined;
    mark: {} | undefined;
  } = DefaultOptions
> = PlainLogger<Options["log"], Meta["log"]> & {
  event: EventLogger<Events, Options["event"], Meta["event"]>;
} & {
  timeline: <T extends keyof Marks & string>(data: {
    name: T;
    onReady?: (self: Timeline<Marks[T], Options["mark"], Meta["mark"]>) => void;
    onResolve?: (
      self: Timeline<Marks[T], Options["mark"], Meta["mark"]>
    ) => void;
    onReject?: (
      self: Timeline<Marks[T], Options["mark"], Meta["mark"]>,
      reason: unknown
    ) => void;
  }) => Timeline<Marks[T], Options["mark"], Meta["mark"]>;
};

export function createLogger<
  Events extends Record<string, unknown> = Record<string, unknown>,
  Marks extends Record<string, Record<string, unknown>> = Record<
    string,
    Record<string, unknown>
  >,
  Options extends {
    log: {} | undefined;
    event: {} | undefined;
    mark: {} | undefined;
  } = DefaultOptions,
  Meta extends {
    log: {};
    event: {};
    mark: {};
  } = DefaultMeta
>({
  onEvent = ({ level, event, options, ...meta }) => {
    console[level](
      `${level.toUpperCase()}_EVENT[${event.name}] `,
      event.message || ""
    );
  },
  onLog = ({ level, message, options, ...meta }) => {
    console[level](`${level.toUpperCase()}`, message);
  },
  onMark = ({ level, mark, timeline, duration, options, ...meta }) => {
    console[level](
      `${level.toUpperCase()}_MARK[${mark.name}] ${mark.message} (at ${
        timeline.name
      } ${duration.toFixed(2)}ms)`
    );
  },
}: LoggerOptions<Events, Marks, Options, Meta> = {}): Logger<
  Events,
  Marks,
  Meta,
  Options
> {
  const createLogger = (level: Level) => {
    return ({
      message,
      options,
      ...meta
    }: {
      message?: string;
    } & Meta["log"] &
      OnLogOptions<Options["log"]>) => {
      onLog({
        ...meta,
        level,
        message,
        options,
      });
    };
  };
  const createEventLogger = (level: Level) => {
    return ({
      name,
      message,
      data,
      options,
      ...meta
    }: {
      [EventName in keyof Events & string]: {
        name: EventName;
        message?: string;
      } & OnLogData<Events[EventName]> &
        Meta["event"] &
        OnLogOptions<Options["event"]>;
    }[keyof Events & string]) => {
      onEvent({
        ...(meta as unknown as Meta),
        level,
        event: {
          name,
          message,
          data: data as any,
        },
        options,
      });
    };
  };
  return {
    debug: createLogger("debug"),
    info: createLogger("info"),
    warn: createLogger("warn"),
    error: createLogger("error"),
    event: {
      debug: createEventLogger("debug"),
      info: createEventLogger("info"),
      warn: createEventLogger("warn"),
      error: createEventLogger("error"),
    },
    timeline: ({ name: timelineName, onReady, onReject, onResolve }) => {
      let inReadyScope = true;
      type N = typeof timelineName;
      const createTimelineLogger: (level: Level) => (
        mark: {
          [MarkName in keyof Marks[N] & string]: {
            name: MarkName;
            message?: string;
          } & OnLogData<Marks[N][MarkName]> &
            OnLogOptions<Options["mark"]> &
            Meta["mark"];
        }[keyof Marks[N] & string]
      ) => void = (level) => {
        return ({ name, data, message, options, ...meta }) => {
          const onMarkData: OnMarkData<Marks, Options["mark"], Meta["mark"]> = {
            ...(meta as unknown as Meta["mark"]),
            timeline: {
              name: timelineName,
            },
            level,
            mark: { name, message, data } as any,
            options,
            duration: inReadyScope ? 0 : perfNow() - startTime,
          };
          onMark(onMarkData);
        };
      };
      type InnerTimeline = Timeline<Marks[N], Options["mark"], Meta["mark"]>;
      const createTimeline = (parentHandle: {
        resolve: (timeline: InnerTimeline) => void;
        reject: (timeline: InnerTimeline, reason: unknown) => void;
      }): InnerTimeline => {
        let forked = false;
        let settled = false;
        const timeline: InnerTimeline = {
          all: (length: number) => {
            if (!forked) {
              forked = true;
              let ret: InnerTimeline[] = [];
              let resolvedCount = 0;
              for (let i = 0; i < length; ++i) {
                ret.push(
                  createTimeline({
                    resolve: (t) => {
                      if (!settled) {
                        resolvedCount += 1;
                        if (resolvedCount === length) {
                          settled = true;
                          parentHandle.resolve(t);
                        }
                      }
                    },
                    reject: (t, reason) => {
                      if (!settled) {
                        settled = true;
                        parentHandle.reject(t, reason);
                      }
                    },
                  })
                );
              }
              return ret as any;
            } else {
              if (!settled) {
                throw new Error(
                  "[ilw]: resolve or reject is already called on timeline, all can't be called"
                );
              } else {
                throw new Error(
                  "[ilw]: all or race is already called on timeline, it can't be called twice"
                );
              }
            }
          },
          race: (length: number) => {
            if (!forked) {
              forked = true;
              let ret: InnerTimeline[] = [];
              for (let i = 0; i < length; ++i) {
                ret.push(
                  createTimeline({
                    resolve: (t) => {
                      if (!settled) {
                        settled = true;
                        parentHandle.resolve(t);
                      }
                    },
                    reject: (t, reason) => {
                      if (!settled) {
                        settled = true;
                        parentHandle.reject(t, reason);
                      }
                    },
                  })
                );
              }
              return ret as any;
            } else {
              if (!settled) {
                throw new Error(
                  "[ilw]: resolve or reject is already called on timeline, race can't be called"
                );
              } else {
                throw new Error(
                  "[ilw]: all or race is already called on timeline, it can't be called twice"
                );
              }
            }
          },
          resolve: () => {
            if (forked) {
              throw new Error(
                "[ilw]: timeline has called all or race, resolve can't be called"
              );
            }
            settled = true;
            parentHandle.resolve(timeline);
          },
          reject: (reason?: unknown) => {
            if (forked) {
              throw new Error(
                "[ilw]: timeline has called all or race, reject can't be called"
              );
            }
            settled = true;
            parentHandle.reject(timeline, reason);
          },
          debug: createTimelineLogger("debug"),
          info: createTimelineLogger("info"),
          warn: createTimelineLogger("warn"),
          error: createTimelineLogger("error"),
        };
        return timeline;
      };
      const timeline = createTimeline({
        resolve: (timeline) => {
          onResolve?.(timeline);
        },
        reject: (timeline, reason) => {
          onReject?.(timeline, reason);
        },
      });
      const startTime = perfNow();
      if (onReady) {
        onReady(timeline);
      }
      inReadyScope = false;
      return timeline;
    },
  };
}
