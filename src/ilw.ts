export type Level = "debug" | "info" | "warn" | "error";

export type OnLogOptions =
  | {
      report?: boolean;
      persist?: boolean;
    }
  | undefined;

export type OnLogMeta<Meta = undefined> = undefined extends Meta
  ? undefined | { meta?: Meta }
  : { meta: Meta };

export type OnLog<Meta = undefined> = (data: {
  level: Level;
  data: unknown[];
  meta: OnLogMeta<Meta>;
  options: OnLogOptions;
}) => void;

export type OnEvent<
  Meta = undefined,
  Events extends Record<string, unknown> = Record<string, unknown>
> = (data: {
  level: Level;
  event: {
    [Key in keyof Events]: { name: Key; data: Events[Key] };
  }[keyof Events];
  meta: OnLogMeta<Meta>;
  options: OnLogOptions;
}) => void;

export type OnMarkData<
  Meta = undefined,
  Marks extends Record<string, Record<string, unknown>> = Record<
    string,
    Record<string, unknown>
  >
> = {
  [TimelineName in keyof Marks]: {
    level: Level;
    duration: number;
    time: number;
    meta: OnLogMeta<Meta>;
    options: OnLogOptions;
    timelineName: TimelineName;
    mark: {
      [MarkName in keyof Marks[TimelineName]]: {
        name: MarkName;
        data: Marks[TimelineName][MarkName];
      };
    }[keyof Marks[TimelineName]];
  };
}[keyof Marks];

export type OnMark<
  Meta = undefined,
  Marks extends Record<string, Record<string, unknown>> = Record<
    string,
    Record<string, unknown>
  >
> = (data: OnMarkData<Meta, Marks>) => void;

export type Timeline<
  Meta = undefined,
  Marks extends Record<string, unknown> = Record<string, unknown>
> = {
  debug: (
    data: {
      [MarkName in keyof Marks]: {
        name: MarkName;
        data: Marks[MarkName];
        meta: OnLogMeta<Meta>;
        options: OnLogOptions;
      };
    }[keyof Marks]
  ) => void;
  info: (
    data: {
      [MarkName in keyof Marks]: {
        name: MarkName;
        data: Marks[MarkName];
        meta: OnLogMeta<Meta>;
        options: OnLogOptions;
      };
    }[keyof Marks]
  ) => void;
  warn: (
    data: {
      [MarkName in keyof Marks]: {
        name: MarkName;
        data: Marks[MarkName];
        meta: OnLogMeta<Meta>;
        options: OnLogOptions;
      };
    }[keyof Marks]
  ) => void;
  error: (
    data: {
      [MarkName in keyof Marks]: {
        name: MarkName;
        data: Marks[MarkName];
        meta: OnLogMeta<Meta>;
        options: OnLogOptions;
      };
    }[keyof Marks]
  ) => void;
};

export type Logger<Meta = undefined> = {
  debug: (data: {
    data: unknown[];
    meta: OnLogMeta<Meta>;
    options: OnLogOptions;
  }) => void;
  info: (data: {
    data: unknown[];
    meta: OnLogMeta<Meta>;
    options: OnLogOptions;
  }) => void;
  warn: (data: {
    data: unknown[];
    meta: OnLogMeta<Meta>;
    options: OnLogOptions;
  }) => void;
  error: (data: {
    data: unknown[];
    meta: OnLogMeta<Meta>;
    options: OnLogOptions;
  }) => void;
};

export type TimelineLogger<
  Meta = undefined,
  TimelineMarks extends Record<string, Record<string, unknown>> = Record<
    string,
    Record<string, unknown>
  >
> = {
  create: <N extends keyof TimelineMarks>(
    name: N
  ) => Timeline<Meta, TimelineMarks[N]>;
};

export type EventLogger<
  Meta = undefined,
  Events extends Record<string, unknown> = Record<string, unknown>
> = {
  debug: (
    event: {
      [EventName in keyof Events]: {
        name: EventName;
        data: Events[EventName];
        meta: OnLogMeta<Meta>;
        options: OnLogOptions;
      };
    }[keyof Events]
  ) => void;
  info: (
    event: {
      [EventName in keyof Events]: {
        name: EventName;
        data: Events[EventName];
        meta: OnLogMeta<Meta>;
        options: OnLogOptions;
      };
    }[keyof Events]
  ) => void;
  warn: (
    event: {
      [EventName in keyof Events]: {
        name: EventName;
        data: Events[EventName];
        meta: OnLogMeta<Meta>;
        options: OnLogOptions;
      };
    }[keyof Events]
  ) => void;
  error: (
    event: {
      [EventName in keyof Events]: {
        name: EventName;
        data: Events[EventName];
        meta: OnLogMeta<Meta>;
        options: OnLogOptions;
      };
    }[keyof Events]
  ) => void;
};

export type LoggerOptions<
  Meta = undefined,
  Events extends Record<string, unknown> = Record<string, unknown>,
  Marks extends Record<string, Record<string, unknown>> = Record<
    string,
    Record<string, unknown>
  >
> = {
  onLog: OnLog<Meta>;
  onEvent: OnEvent<Meta, Events>;
  onMark: OnMark<Meta, Marks>;
};

export function createLogger<
  Meta = undefined,
  Events extends Record<string, unknown> = Record<string, unknown>,
  Marks extends Record<string, Record<string, unknown>> = Record<
    string,
    Record<string, unknown>
  >
>(
  loggerOptions: LoggerOptions<Meta, Events, Marks>
): {
  logger: Logger<Meta>;
  eventLogger: EventLogger<Meta, Events>;
  timeline: {
    create: <T extends keyof Marks>(name: T) => Timeline<Meta, Marks[T]>;
  };
} {
  const createLogger = (level: Level) => {
    return ({
      data,
      options,
      meta,
    }: {
      data: unknown[];
      meta: OnLogMeta<Meta>;
      options: OnLogOptions;
    }) => {
      loggerOptions.onLog({
        level,
        data,
        options,
        meta,
      });
    };
  };
  const createEventLogger = (level: Level) => {
    return ({
      name,
      data,
      meta,
      options,
    }: {
      [EventName in keyof Events]: {
        name: EventName;
        data: Events[EventName];
        meta: OnLogMeta<Meta>;
        options: OnLogOptions;
      };
    }[keyof Events]) => {
      loggerOptions.onEvent({
        level,
        event: {
          name,
          data,
        },
        options,
        meta,
      });
    };
  };
  return {
    logger: {
      debug: createLogger("debug"),
      info: createLogger("info"),
      warn: createLogger("warn"),
      error: createLogger("error"),
    },
    eventLogger: {
      debug: createEventLogger("debug"),
      info: createEventLogger("info"),
      warn: createEventLogger("warn"),
      error: createEventLogger("error"),
    },
    timeline: {
      create: (timelineName) => {
        let startTime: number | undefined = undefined;
        const history: Array<OnMarkData<Meta, Marks>> = [];
        type N = typeof timelineName;
        const createTimelineLogger: (level: Level) => (
          mark: {
            [MarkName in keyof Marks[N]]: {
              name: MarkName;
              data: Marks[N][MarkName];
              meta: OnLogMeta<Meta>;
              options: OnLogOptions;
            };
          }[keyof Marks[N]]
        ) => void = (level) => {
          return ({ name, data, meta, options }) => {
            if (startTime === undefined) {
              startTime = performance.now();
            }
            const onMarkData: OnMarkData<Meta, Marks> = {
              timelineName,
              level,
              meta,
              mark: { name, data } as any,
              options,
              duration: performance.now() - startTime,
              time: Date.now(),
            };
            loggerOptions.onMark(
              Object.assign({ history: Array.from(history) }, onMarkData)
            );
            history.push(onMarkData);
          };
        };
        return {
          debug: createTimelineLogger("debug"),
          info: createTimelineLogger("info"),
          warn: createTimelineLogger("warn"),
          error: createTimelineLogger("error"),
        };
      },
    },
  };
}
