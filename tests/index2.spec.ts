import { createEventTracker } from "../src";

type Events = {
  debug: {
    LOG: undefined;
  };
  info: {
    LOG: undefined;
  };
  warn: {
    LOG: undefined;
  };
  error: {
    LOG: undefined;
  };
};

function ensureReporter(): any {}

const tracker = createEventTracker<Events>({
  autostart: false,
  onEvent(arg) {
    ensureReporter().report(arg);
  },
});

tracker.info({
  name: "LOG",
  message: "info log",
});
