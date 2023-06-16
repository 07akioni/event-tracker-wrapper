import { createEventTracker } from "../src";

type Events = {
  debug: {};
  info: {
    COMMON_LOG: undefined;
    DEPARTMENT_CLICK: { departmentId: string };
  };
  warn: {};
  error: {};
};

const tracker = createEventTracker<
  Events,
  { api: any },
  { toast: boolean; showToastIcon?: boolean } | undefined
>({
  autostart: false,
  onEvent({ startOptions }) {
    startOptions.api;
  },
});

tracker.info({
  name: "DEPARTMENT_CLICK",
  message: "",
  payload: {
    departmentId: "",
  },
});

tracker.info({
  name: "COMMON_LOG",
  message: "",
});

setTimeout(() => {
  tracker.start({ api: {} });
}, 1000);
