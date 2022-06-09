export type Level = "debug" | "info" | "warn" | "error";

type DefaultMeta = {};
type DefaultOptions =
  | undefined
  | {
      persist?: boolean;
      report?: boolean;
    };

export type OnLogData<Data = undefined> = undefined extends Data
  ? { data?: Data }
  : { data: Data };

export type OnLogOptions<Options = DefaultOptions> = undefined extends Options
  ? { options?: Options }
  : { options: Options };

export type OnLog<Meta = DefaultMeta, Options = DefaultOptions> = (
  data: {
    level: Level;
    message: string | undefined;
    options: Options;
  } & Meta
) => void;

export type OnEvent<
  Events extends Record<string, unknown> = Record<string, unknown>,
  Meta = DefaultMeta,
  Options = DefaultOptions
> = (
  data: {
    level: Level;
    event: {
      [Key in keyof Events]: {
        name: Key;
        message: string | undefined;
      } & OnLogData<Events[Key]>;
    }[keyof Events];
    options: Options;
  } & Meta
) => void;

export type OnMarkData<
  Marks extends Record<string, Record<string, unknown>> = Record<
    string,
    Record<string, unknown>
  >,
  Meta = DefaultMeta,
  Options = DefaultOptions
> = {
  [TimelineName in keyof Marks]: {
    level: Level;
    duration: number;
    timeline: {
      name: TimelineName;
    };
    mark: {
      [MarkName in keyof Marks[TimelineName]]: {
        name: MarkName;
        message: string | undefined;
      } & OnLogData<Marks[TimelineName][MarkName]>;
    }[keyof Marks[TimelineName]];
  } & Meta &
    OnLogOptions<Options>;
}[keyof Marks];

export type OnMark<
  Marks extends Record<string, Record<string, unknown>> = Record<
    string,
    Record<string, unknown>
  >,
  Meta = DefaultMeta,
  Options = DefaultOptions
> = (data: OnMarkData<Marks, Meta, Options>) => void;

type Tuple<
  Length extends number,
  Value,
  Ret extends Value[] = []
> = Ret extends { length: Length }
  ? Ret
  : Tuple<Length, Value, [...Ret, Value]>;

export type Timeline<
  Marks extends Record<string, unknown> = Record<string, unknown>,
  Meta = DefaultMeta,
  Options = DefaultOptions,
  Log = (
    data: {
      [MarkName in keyof Marks]: {
        name: MarkName;
        message?: string;
      } & OnLogData<Marks[MarkName]> &
        Meta &
        OnLogOptions<Options>;
    }[keyof Marks]
  ) => void
> = {
  all: <T extends number>(
    length: T
  ) => Tuple<T, Timeline<Marks, Meta, Options>>;
  race: <T extends number>(
    length: T
  ) => Tuple<T, Timeline<Marks, Meta, Options>>;
  resolve: () => void;
  reject: () => void;
  debug: Log;
  info: Log;
  warn: Log;
  error: Log;
};

export type Logger<
  Meta = DefaultMeta,
  Options = DefaultOptions,
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
  Meta = DefaultMeta,
  Options = DefaultOptions
> = {
  create: <N extends keyof TimelineMarks>(
    name: N,
    listeners?: {
      onResolve?: (self: Timeline<TimelineMarks[N], Meta, Options>) => void;
      onReject?: (self: Timeline<TimelineMarks[N], Meta, Options>) => void;
    }
  ) => Timeline<TimelineMarks[N], Meta, Options>;
};

export type EventLogger<
  Events extends Record<string, unknown> = Record<string, unknown>,
  Meta = undefined,
  Options = DefaultOptions,
  Log = (
    event: {
      [EventName in keyof Events]: {
        name: EventName;
        message?: string;
      } & OnLogData<Events[EventName]> &
        Meta &
        OnLogOptions<Options>;
    }[keyof Events]
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
  Meta extends {
    log: {};
    event: {};
    mark: {};
  } = {
    log: {};
    event: {};
    mark: {};
  },
  Options extends {
    log: {} | undefined;
    event: {} | undefined;
    mark: {} | undefined;
  } = {
    log: {};
    event: {};
    mark: {};
  }
> = {
  onLog: OnLog<Meta["log"], Options["log"]>;
  onEvent: OnEvent<Events, Meta["event"], Options["event"]>;
  onMark: OnMark<Marks, Meta["mark"], Options["mark"]>;
};

export function createLogger<
  Events extends Record<string, unknown> = Record<string, unknown>,
  Marks extends Record<string, Record<string, unknown>> = Record<
    string,
    Record<string, unknown>
  >,
  Meta extends {
    log: {};
    event: {};
    mark: {};
  } = {
    log: DefaultMeta;
    event: DefaultMeta;
    mark: DefaultMeta;
  },
  Options extends {
    log: {} | undefined;
    event: {} | undefined;
    mark: {} | undefined;
  } = {
    log: DefaultOptions;
    event: DefaultOptions;
    mark: DefaultOptions;
  }
>(
  loggerOptions: LoggerOptions<Events, Marks, Meta, Options> = {
    onEvent: ({ level, event, options, ...meta }) => {
      console[level]("[ilw/event]:", { event, options, meta });
    },
    onLog: ({ level, message, options, ...meta }) => {
      console[level]("[ilw/log]:", { message, options, meta });
    },
    onMark: ({ level, mark, timeline, duration, options, ...meta }) => {
      console[level]("[ilw/mark]:", {
        timeline,
        mark,
        duration,
        options,
        meta,
      });
    },
  }
): Logger<Meta["log"], Options["log"]> & {
  event: EventLogger<Events, Meta["event"], Options["event"]>;
} & {
  timeline: <T extends keyof Marks>(data: {
    name: T;
    onResolve?: (
      self: Timeline<Marks[T], Meta["mark"], Options["mark"]>
    ) => void;
    onReject?: (
      self: Timeline<Marks[T], Meta["mark"], Options["mark"]>
    ) => void;
  }) => Timeline<Marks[T], Meta["mark"], Options["mark"]>;
} {
  const createLogger = (level: Level) => {
    return ({
      message,
      options,
      ...meta
    }: {
      message?: string;
    } & Meta["log"] &
      OnLogOptions<Options["log"]>) => {
      loggerOptions.onLog({
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
      [EventName in keyof Events]: {
        name: EventName;
        message?: string;
      } & OnLogData<Events[EventName]> &
        Meta["event"] &
        OnLogOptions<Options["event"]>;
    }[keyof Events]) => {
      loggerOptions.onEvent({
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
    timeline: ({ name: timelineName, onReject, onResolve }) => {
      let startTime: number | undefined = undefined;
      type N = typeof timelineName;
      const createTimelineLogger: (level: Level) => (
        mark: {
          [MarkName in keyof Marks[N]]: {
            name: MarkName;
            message?: string;
          } & OnLogData<Marks[N][MarkName]> &
            OnLogOptions<Options["mark"]> &
            Meta["mark"];
        }[keyof Marks[N]]
      ) => void = (level) => {
        return ({ name, data, message, options, ...meta }) => {
          if (startTime === undefined) {
            startTime = performance.now();
          }
          const onMarkData: OnMarkData<Marks, Meta["mark"], Options["mark"]> = {
            ...(meta as unknown as Meta["mark"]),
            timeline: {
              name: timelineName,
            },
            level,
            mark: { name, message, data } as any,
            options,
            duration: performance.now() - startTime,
            time: Date.now(),
          };
        };
      };
      type InnerTimeline = Timeline<Marks[N], Meta["mark"], Options["mark"]>;
      const createTimeline = (parentHandle: {
        resolve: (timeline: InnerTimeline) => void;
        reject: (timeline: InnerTimeline) => void;
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
                    reject: (t) => {
                      if (!settled) {
                        settled = true;
                        parentHandle.reject(t);
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
                    reject: (t) => {
                      if (!settled) {
                        settled = true;
                        parentHandle.reject(t);
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
          reject: () => {
            if (forked) {
              throw new Error(
                "[ilw]: timeline has called all or race, reject can't be called"
              );
            }
            settled = true;
            parentHandle.reject(timeline);
          },
          debug: createTimelineLogger("debug"),
          info: createTimelineLogger("info"),
          warn: createTimelineLogger("warn"),
          error: createTimelineLogger("error"),
        };
        return timeline;
      };
      return createTimeline({
        resolve: (timeline) => {
          onResolve?.(timeline);
        },
        reject: (timeline) => {
          onReject?.(timeline);
        },
      });
    },
  };
}
