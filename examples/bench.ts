import { performance } from 'perf_hooks'
import { ilw } from "../src";

type Events = {
  aaa: { value: number };
  bbb: { value: string };
};

const logger = ilw<unknown, Events>({
  onLog(level, messages, { meta, persist, report }) {
    // console[level]({ meta, persist, report }, ...messages);
  },
  onEvent(level, event, { meta, persist, report }) {
    // console[level](
    //   { meta, persist, report },
    //   "event-type",
    //   event.type,
    //   "event-detail",
    //   event.detail
    // );
  },
});

const start1 = performance.now()

for (let i = 0; i < 100000; ++i) {
  logger.meta(1).persist.report.info()
}

const end1 = performance.now()

console.log(end1 - start1)



// logger.persist.info();
// logger.meta({ key: "value" }).error();
// logger.report.info();
// logger.report.event.info("aaa", { value: 123 });
