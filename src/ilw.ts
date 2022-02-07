type IlwLevel = "debug" | "info" | "warn" | "error";

export type Ilw<Meta = unknown> = {
  // state methods
  report: Ilw<Meta>;
  persist: Ilw<Meta>;
  event: Ilw<Meta>;
  meta: (meta: Meta) => Ilw<Meta>;
  // logging methods
  error: (...data: unknown[]) => void;
  warn: (...data: unknown[]) => void;
  info: (...data: unknown[]) => void;
  debug: (...data: unknown[]) => void;
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

type IlwState<Meta = unknown> = {
  report: boolean;
  persist: boolean;
  type: "plain" | "event";
  meta?: Meta;
};

export function ilw<Meta = unknown>(options: IlwOptions<Meta>): Ilw<Meta> {
  return ilwWithState(options, {
    report: false,
    persist: false,
    type: "plain",
  });
}

function ilwWithState<Meta = unknown>(
  options: IlwOptions<Meta>,
  state: IlwState<Meta>
): Ilw<Meta> {
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
      return ilwWithState(options, { ...state, report: true });
    },
    get persist() {
      return ilwWithState(options, { ...state, persist: true });
    },
    get event() {
      return ilwWithState(options, { ...state, type: "event" });
    },
    meta: (meta: Meta) => {
      return ilwWithState(options, { ...state, meta });
    },
  };
}
