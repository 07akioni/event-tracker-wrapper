type IlwLevel = "debug" | "info" | "warn" | "error";

export type Ilw<Meta = unknown, Events = never> = IlwPlainStateMutations<
  Meta,
  Events
> &
  IlwPlainLogger;

export type IlwPlainStateMutations<
  Meta = unknown,
  Events extends Record<string, any> = Record<string, any>
> = {
  report: Ilw<Meta, Events>;
  persist: Ilw<Meta, Events>;
  event: IlwEventStateMutations<Meta> & IlwEventLogger<Events>;
  meta: (meta: Meta) => Ilw<Meta>;
};

export type IlwEventStateMutations<
  Meta = unknown,
  Events extends Record<string, any> = Record<string, any>
> = {
  report: IlwEventStateMutations<Meta> & IlwEventLogger<Events>;
  persist: IlwEventStateMutations<Meta> & IlwEventLogger<Events>;
  event: IlwEventStateMutations<Meta> & IlwEventLogger<Events>;
  meta: (meta: Meta) => IlwEventStateMutations<Meta> & IlwEventLogger<Events>;
};

export type IlwPlainLogger = {
  error: (...data: unknown[]) => void;
  warn: (...data: unknown[]) => void;
  info: (...data: unknown[]) => void;
  debug: (...data: unknown[]) => void;
};

export type IlwEventLogger<
  Events extends Record<string, any> = Record<string, any>
> = {
  error: <T extends keyof Events>(event: T, params: Events[T]) => void;
  warn: <T extends keyof Events>(event: T, params: Events[T]) => void;
  info: <T extends keyof Events>(event: T, params: Events[T]) => void;
  debug: <T extends keyof Events>(event: T, params: Events[T]) => void;
};

type IlwOptions<Meta = unknown> = {
  onLog: (
    level: IlwLevel,
    messages: unknown[],
    options: IlwOnLogOptions<Meta>
  ) => void;
};

type IlwOnLogOptions<Meta = unknown> = {
  type: "plain" | "event";
  report: boolean;
  persist: boolean;
  meta?: Meta;
};

type PlainType = "plain";
type EventType = "event";

type IlwState<Meta = unknown> = {
  report: boolean;
  persist: boolean;
  type: PlainType | EventType;
  meta?: Meta;
};

type IlwPlainState<Meta = unknown> = Omit<IlwState<Meta>, "type"> & {
  type: PlainType;
};

type IlwEventState<Meta = unknown> = Omit<IlwState<Meta>, "type"> & {
  type: EventType;
};

export function ilw<
  Meta = unknown,
  Events extends Record<string, any> = Record<string, any>
>(options: IlwOptions<Meta>): Ilw<Meta, Events> {
  return ilwWithState<Meta, Events>(options, {
    report: false,
    persist: false,
    type: "plain",
  });
}

function ilwWithState<
  Meta = unknown,
  Events extends Record<string, any> = Record<string, any>
>(options: IlwOptions<Meta>, state: IlwPlainState<Meta>): Ilw<Meta, Events>;
function ilwWithState<
  Meta = unknown,
  Events extends Record<string, any> = Record<string, any>
>(
  options: IlwOptions<Meta>,
  state: IlwEventState<Meta>
): IlwEventStateMutations<Meta> & IlwEventLogger<Events>;
function ilwWithState<
  Meta = unknown,
  Events extends Record<string, any> = Record<string, any>
>(
  options: IlwOptions<Meta>,
  state: IlwPlainState<Meta> | IlwEventState<Meta>
): Ilw<Meta, Events> | (IlwEventStateMutations<Meta> & IlwEventLogger<Events>) {
  if (state.type === "plain") {
    return {
      error(...data: unknown[]): void {
        options.onLog("error", data, state);
      },
      warn(...data: unknown[]): void {
        options.onLog("warn", data, state);
      },
      info(...data: unknown[]): void {
        options.onLog("info", data, state);
      },
      debug(...data: unknown[]): void {
        options.onLog("debug", data, state);
      },
      get report() {
        return ilwWithState<Meta, Events>(options, { ...state, report: true });
      },
      get persist() {
        return ilwWithState<Meta, Events>(options, { ...state, persist: true });
      },
      get event() {
        return ilwWithState<Meta, Events>(options, { ...state, type: "event" });
      },
      meta: (meta: Meta) => {
        return ilwWithState<Meta, Events>(options, { ...state, meta });
      },
    };
  } else {
    return {
      error<T extends keyof Events>(event: T, params: Events[T]): void {
        options.onLog("error", [event, params], state);
      },
      warn<T extends keyof Events>(event: T, params: Events[T]): void {
        options.onLog("warn", [event, params], state);
      },
      info<T extends keyof Events>(event: T, params: Events[T]): void {
        options.onLog("info", [event, params], state);
      },
      debug<T extends keyof Events>(event: T, params: Events[T]): void {
        options.onLog("debug", [event, params], state);
      },
      get report() {
        return ilwWithState<Meta, Events>(options, { ...state, report: true });
      },
      get persist() {
        return ilwWithState<Meta, Events>(options, { ...state, persist: true });
      },
      get event() {
        return ilwWithState<Meta, Events>(options, { ...state, type: "event" });
      },
      meta: (meta: Meta) => {
        return ilwWithState<Meta, Events>(options, { ...state, meta });
      },
    };
  }
}
