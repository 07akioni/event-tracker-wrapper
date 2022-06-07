import { createLogger } from "../src";

type Events = {
  event1: number;
  event2: string;
};

type Timelines = {
  timeline1: {
    timeline1Event1: number;
    timeline1Event2: string;
  };
  timeline2: {
    timeline2Event1: string;
    timeline2Event2: number;
  };
};

const {
  logger,
  eventLogger,
  timeline
} = createLogger<undefined, Events, Timelines>({
  onEvent: () => {},
  onLog: () => {},
  onMark: () => {},
});

const timeEvent = timeline.create('timeline1')

// logger.event.info(undefined, { name: "event1", data: 1 });
// logger.event.info(undefined, { name: "event1", data: 1 });

// const timeline = logger.createTimeline("timeline1");
// timeline.info(
//   {},
//   {
//     name: "timeline1Event1",
//     data: 1,
//   }
// );
