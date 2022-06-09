import { createLogger } from "../src";

type Events = {
  event1: number;
  event2: string;
};

type Timelines = {
  document: {
    fcp: undefined;
  };
  approvalRecordGetData: {
    success: undefined;
    error: undefined;
  };
};

const log = createLogger<Events, Timelines>({
  onEvent: ({ level, event, options: {} }) => {
    console[level]("[event]", event);
  },
  onLog: ({ level, message, options: {} }) => {
    console[level]("[log]", message);
  },
  onMark: ({ level, mark, timeline, duration, options }) => {
    console[level]("[mark]", {
      timeline,
      mark,
      duration,
      options,
    });
  },
});

log.info({
  message: "",
});

log.event.info({
  name: "event1",
  data: 1,
});

const timeline = log.timeline({
  name: "approvalRecordGetData",
  onResolve: (self) => {
    console.log("resolve");
    self.error({
      name: "success",
    });
  },
  onReject: (self) => {
    console.log("resolve");
    self.error({
      name: "success",
    });
  },
});

const [timelineForked1, timelineForked2] = timeline.all(2);
timelineForked1.resolve();
timelineForked2.resolve();
