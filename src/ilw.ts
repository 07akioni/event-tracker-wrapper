export type Level = "debug" | "info" | "warn" | "error";

export type OnLogOptions<Meta = undefined> = {
  report: boolean;
  persist: boolean;
  meta: Meta | undefined;
};

export type OnLog<Meta = undefined> = (data: {
  level: Level;
  data: unknown[];
  options: OnLogOptions<Meta>;
}) => void;

export type OnEvent<
  Meta = undefined,
  Events extends Record<string, unknown> = Record<string, unknown>
> = <T extends keyof Events>(data: {
  level: Level;
  event: {
    type: T;
    data: Events[T];
  };
  options: OnLogOptions<Meta>;
}) => void;

export type OnMarkData<Meta, Mark> = {
  level: Level;
  /**
   * duration after timeline is created
   */
  duration: number;
  time: number;
  mark: Mark;
  options: OnLogOptions<Meta>;
};

export type OnMark<
  Meta = undefined,
  Marks extends Record<string, unknown> = Record<string, unknown>
> = <T extends keyof Marks>(
  data: OnMarkData<
    Meta,
    {
      type: T;
      data: Marks[T];
    }
  > & {
    history: Array<
      {
        [Key in keyof Marks]: Marks[Key];
      }[keyof Marks]
    >;
  }
) => void;

export type Timeline<
  Meta = undefined,
  Marks extends Record<string, unknown> = Record<string, unknown>
> = {
  markDebug: <T extends keyof Marks>(
    event: EventParam<{ type: T; data: Marks[T] }, Meta>
  ) => void;
  markInfo: <T extends keyof Marks>(
    event: EventParam<{ type: T; data: Marks[T] }, Meta>
  ) => void;
  markWarn: <T extends keyof Marks>(
    event: EventParam<{ type: T; data: Marks[T] }, Meta>
  ) => void;
  markError: <T extends keyof Marks>(
    event: EventParam<{ type: T; data: Marks[T] }, Meta>
  ) => void;
  invalidate: () => void;
};

export type EventParam<Event, Meta = undefined> = Event &
  (undefined extends Meta ? { meta?: Meta } : { meta: Meta });

export type LogParam<Meta = undefined> = {
  data: unknown[];
} & (undefined extends Meta ? { meta?: Meta } : { meta: Meta });

export type Logger<
  Meta = undefined,
  Events extends Record<string, unknown> = Record<string, unknown>,
  TimelineMarks extends Record<string, Record<string, unknown>> = Record<
    string,
    Record<string, unknown>
  >
> = {
  eventDebug: <T extends keyof Events>(
    event: EventParam<{ type: T; data: Events[T] }, Meta>
  ) => void;
  eventInfo: <T extends keyof Events>(
    event: EventParam<{ type: T; data: Events[T] }, Meta>
  ) => void;
  eventWarn: <T extends keyof Events>(
    event: EventParam<{ type: T; data: Events[T] }, Meta>
  ) => void;
  eventError: <T extends keyof Events>(
    event: EventParam<{ type: T; data: Events[T] }, Meta>
  ) => void;
  debug: (param: LogParam<Meta>) => void;
  info: (param: LogParam<Meta>) => void;
  warn: (param: LogParam<Meta>) => void;
  error: (param: LogParam<Meta>) => void;
  createTimeline: <T extends keyof TimelineMarks>(
    type: T
  ) => Timeline<Meta, TimelineMarks[T]>;
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
  onMark: OnMark<Marks>;
};

export function createLogger<
  Meta = undefined,
  Events extends Record<string, unknown> = Record<string, unknown>,
  Marks extends Record<string, Record<string, unknown>> = Record<
    string,
    Record<string, unknown>
  >
>(
  options: LoggerOptions<Meta, Events, Marks>
): LoggerOptions<Meta, Events, Marks> {
  return {} as any;
}
