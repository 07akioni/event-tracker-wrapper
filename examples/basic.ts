import { performance } from "perf_hooks";
import { ilw } from "../src";

type Events = {
  aaa: { value: number };
  bbb: { value: string };
};

const logger = ilw<unknown, Events>({
  onLog(level, messages, { meta, persist, report }) {
    console[level](level, { meta, persist, report }, ...messages);
  },
  onEvent(level, event, { meta, persist, report }) {
    console[level](
      level,
      { meta, persist, report },
      "event-type",
      event.type,
      "event-detail",
      event.detail
    );
  },
});

// report 上报
logger.report.info("xxx", "yyy");
// persist 持久化
logger.persist.info("xxx", "yyy");
// event type 事件格式
logger.event.info("aaa", { value: 2 });
// Meta
logger.meta({ foo: "bar" }).info("xxx");
// any combinations 随意组合
logger.persist.report.info("xx", "yyy");

// Use it like currify a function
// 也可以利用类似柯里化的方式
const persistLogger = logger.persist;
persistLogger.info("xxx", "yyy");

const operationLogger = logger.meta({ scope: "operation" });
operationLogger.error("oops", "Error");
