export type Level = "debug" | "info" | "warn" | "error";

export type Ilw<
  Meta = unknown,
  Events extends Record<string, any> = Record<string, any>
> = StateMutations<Meta, Events> & Logger;

export type EventIlw<
  Meta = unknown,
  Events extends Record<string, any> = Record<string, any>
> = EventStateMutations<Meta> & EventLogger<Events>;

export type Logger = {
  error: (...data: unknown[]) => void;
  warn: (...data: unknown[]) => void;
  info: (...data: unknown[]) => void;
  debug: (...data: unknown[]) => void;
};

export type EventLogger<
  Events extends Record<string, any> = Record<string, any>
> = {
  error: <T extends keyof Events>(event: T, params: Events[T]) => void;
  warn: <T extends keyof Events>(event: T, params: Events[T]) => void;
  info: <T extends keyof Events>(event: T, params: Events[T]) => void;
  debug: <T extends keyof Events>(event: T, params: Events[T]) => void;
};

export type StateMutations<
  Meta = unknown,
  Events extends Record<string, any> = Record<string, any>
> = {
  report: Ilw<Meta, Events>;
  persist: Ilw<Meta, Events>;
  event: EventIlw<Meta, Events>;
  meta: (meta: Meta) => StateMutations<Meta, Events> & Logger;
};

export type EventStateMutations<
  Meta = unknown,
  Events extends Record<string, any> = Record<string, any>
> = {
  report: EventIlw<Meta, Events>;
  persist: EventIlw<Meta, Events>;
  meta: (meta: Meta) => EventStateMutations<Meta> & EventLogger<Events>;
};

export type OnLogOptions<Meta = unknown> = {
  event: boolean;
  report: boolean;
  persist: boolean;
  meta: Meta | undefined;
};

export type OnLog<Meta = unknown> = (
  level: Level,
  messages: unknown[],
  options: OnLogOptions<Meta>
) => void;

export type OnEvent<
  Meta = unknown,
  Events extends Record<string, unknown> = Record<string, unknown>
> = <T extends keyof Events>(
  level: Level,
  event: {
    type: T;
    detail: Events[T];
  },
  options: OnLogOptions<Meta>
) => void;

export type IlwOptions<
  Meta = unknown,
  Events extends Record<string, unknown> = Record<string, unknown>
> = {
  onLog?: OnLog<Meta>;
  onEvent?: OnEvent<Meta, Events>;
} & {
  [key in Exclude<
    keyof IlwState<Meta>,
    "_onLog" | "_onEvent"
  >]?: IlwState<Meta>[key];
};

type IlwState<
  Meta = unknown,
  Events extends Record<string, unknown> = Record<string, unknown>
> = {
  report: boolean;
  persist: boolean;
  event: boolean;
  meta: Meta | undefined;
  /** @private */
  _onLog: NonNullable<IlwOptions<Meta>["onLog"]>;
  /** @private */
  _onEvent: NonNullable<IlwOptions<Meta, Events>["onEvent"]>;
};

const ilwPrototype: ThisType<{ _state: IlwState<unknown> }> = {
  debug(...args: any[]): void {
    if (this._state.event) {
      this._state._onEvent(
        "debug",
        { type: args[0], detail: args[1] },
        this._state
      );
    } else {
      this._state._onLog("debug", args, this._state);
    }
  },
  info(...args: any[]): void {
    if (this._state.event) {
      this._state._onEvent(
        "info",
        { type: args[0], detail: args[1] },
        this._state
      );
    } else {
      this._state._onLog("info", args, this._state);
    }
  },
  warn(...args: any[]): void {
    if (this._state.event) {
      this._state._onEvent(
        "warn",
        { type: args[0], detail: args[1] },
        this._state
      );
    } else {
      this._state._onLog("warn", args, this._state);
    }
  },
  error(...args: any[]): void {
    if (this._state.event) {
      this._state._onEvent(
        "error",
        { type: args[0], detail: args[1] },
        this._state
      );
    } else {
      this._state._onLog("error", args, this._state);
    }
  },
  get report() {
    const nextIlw: { _state: IlwState } = Object.create(ilwPrototype);
    const _state = this._state;
    nextIlw._state = {
      report: true,
      persist: _state.persist,
      event: _state.event,
      meta: _state.meta,
      _onLog: _state._onLog,
      _onEvent: _state._onEvent,
    };
    return nextIlw;
  },
  get persist() {
    const nextIlw: { _state: IlwState } = Object.create(ilwPrototype);
    const _state = this._state;
    nextIlw._state = {
      report: _state.report,
      persist: true,
      event: _state.event,
      meta: _state.meta,
      _onLog: _state._onLog,
      _onEvent: _state._onEvent,
    };
    return nextIlw;
  },
  get event() {
    const nextIlw: { _state: IlwState } = Object.create(ilwPrototype);
    const _state = this._state;
    nextIlw._state = {
      report: _state.report,
      persist: _state.persist,
      event: true,
      meta: _state.meta,
      _onLog: _state._onLog,
      _onEvent: _state._onEvent,
    };
    return nextIlw;
  },
  meta(meta: any) {
    const nextIlw: { _state: IlwState } = Object.create(ilwPrototype);
    const _state = this._state;
    nextIlw._state = {
      report: _state.report,
      persist: _state.persist,
      event: _state.event,
      meta: meta,
      _onLog: _state._onLog,
      _onEvent: _state._onEvent,
    };
    return nextIlw;
  },
};

export function ilw<
  Meta = unknown,
  Events extends Record<string, unknown> = Record<string, unknown>
>(
  options: Omit<IlwOptions<Meta, Events>, "event"> & { event?: false }
): Ilw<Meta, Events>;
export function ilw<
  Meta = unknown,
  Events extends Record<string, unknown> = Record<string, unknown>
>(
  options: Omit<IlwOptions<Meta, Events>, "event"> & { event: true }
): EventIlw<Meta, Events>;
export function ilw<
  Meta = unknown,
  Events extends Record<string, unknown> = Record<string, unknown>
>(
  options: IlwOptions<Meta, Events>
): EventIlw<Meta, Events> | Ilw<Meta, Events> {
  const nextIlw: { _state: IlwState<Meta, Events> } =
    Object.create(ilwPrototype);
  nextIlw._state = {
    report: options.report || false,
    persist: options.persist || false,
    event: options.event || false,
    meta: options.meta,
    _onLog:
      options.onLog ||
      (() => {
        throw new Error("[ilw]: options.onLog is not provided");
      }),
    _onEvent:
      options.onEvent ||
      (() => {
        throw new Error("[ilw]: options.onEvent is not provided");
      }),
  };
  return nextIlw as any;
}
