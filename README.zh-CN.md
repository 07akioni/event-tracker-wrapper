# ilw · [![npm version](https://badge.fury.io/js/ilw.svg)](https://badge.fury.io/js/ilw)

[English](README.md) | 中文

同构日志打印适配器（Isomorphic logger wrapper）。

- [API](#API)
- [示例](#示例)
- [它是做什么的](#它是做什么的)

## API

### Methods

**ilw<Meta, Events>(options)**

- `options` \<`Object`\>
  - `onLog` \<`OnLog<Meta>`\>
  - `onEvent` \<`OnEvent<Meta, Events>`\>
  - `persist` \<`?boolean`\>
  - `report` \<`?boolean`\>
  - `event` \<`?boolean`\>
  - `meta` \<`?Meta`\>
- 返回:
  - \<`Ilw<Meta, Events>`\>
    - 如果 `options.event` 是 `undefined` 或 `false`
  - \<`EventIlw<Meta, Events>`\>
    - 如果 `options.event` 是 `true`

### Types

**Ilw\<Meta, Events\>**

- `ilw.persist` \<`Ilw<Meta, Events>`\>
- `ilw.report` \<`Ilw<Meta, Events>`\>
- `ilw.event` \<`EventIlw<Meta, Events>`\>
- `ilw.meta` \<`(meta: Meta) => Ilw<Meta, Events>`\>
- `ilw.debug` \<`(...messages: unknown[]) => void`\>
- `ilw.info` \<`(...messages: unknown[]) => void`\>
- `ilw.warn` \<`(...messages: unknown[]) => void`\>
- `ilw.error` \<`(...messages: unknown[]) => void`\>

**EventIlw\<Meta, Events\>**

- `ilw.persist` \<`EventIlw<Meta, Events>`\>
- `ilw.report` \<`EventIlw<Meta, Events>`\>
- `ilw.meta` \<`(meta: Meta) => Ilw<Meta, Events>`\>
- `ilw.debug` \<`(type: keyof Events, value: Events[type]) => void`\>
- `ilw.info` \<`(type: keyof Events, value: Events[type]) => void`\>
- `ilw.warn` \<`(type: keyof Events, value: Events[type]) => void`\>
- `ilw.error` \<`(type: keyof Events, value: Events[type]) => void`\>

**OnLog**

```ts
type OnLog<Meta = unknown> = (
  level: Level,
  messages: unknown[],
  options: OnLogOptions<Meta>
) => void;
```

**OnEvent**

```ts
type OnEvent<
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
```

**OnLogOptions**

```ts
type OnLogOptions<Meta = unknown> = {
  event: boolean;
  report: boolean;
  persist: boolean;
  meta: Meta | undefined;
};
```

## 示例

```ts
import { ilw } from "ilw";

const logger = ilw({
  // 统一的日志调用出口
  // report  - 是否上报
  // persist - 是否持久化
  // meta    - 额外信息
  onLog(level, messages, { report, persist, meta }) {
    if (report) {
      // 以字符串形式上报
      reporter.report(message.map(JSON.stringify).join(","));
    } else if (persist) {
      // 可以是你公司的客户端日志 SDK，比如通过小程序写入客户端
      nativeLogger(...messages);
    } else {
      // 正常的日志打印
      console[level](...messages);
    }
  },
  // 统一的事件调用出口
  // type   - 事件类型
  // detail - 事件参数
  onEvent(level, { type, detail }, { report, persist, meta }) {
    if (report) {
      // 以事件名，事件信息的方式上报
      eventReporter.report(type, detail);
    } else if (persist) {
      // 可以是你公司的客户端日志 SDK，比如通过小程序写入客户端
      nativeLogger("event", type, detail);
    } else {
      // 走一波正常的日志打印
      console[level]("event", type, detail);
    }
  },
});

const {
  log,
  event,
  logTimeline
} = ilw()

log.debug()
log.info()
log.warn()
log.error()

log.eventInfo()
log.eventWarn()
log.eventError()
log.eventDebug()

const timeline = log.timeline()

timeline.markInfo({
  name: XXX,
})
timeline.markError()
timeline.markWarn()
timeline.markDebug()
timeline.invalidate()


const timing = logger.timeline()

timeline.mark.info({
  data: XXX,
  options: {
    
  }
})

timeline.mark.info({})

logger.info({
  data: XXX,
  options: {
    report: true,
    toast: true,
  }
})

logger.event.info({
  name: "eventName",
  data: XXX,
  options: {}
})

// 上报
logger.report.info("xxx", "yyy");
// 持久化
logger.persist.info("xxx", "yyy");
// 事件格式
logger.event.info("eventName", {});
// Meta
logger.meta({ foo: "bar" }).info("xxx");
// 随意组合
logger.persist.report.info("xx", "yyy");

// 也可以利用类似柯里化的方式
const persistLogger = logger.persist;
persistLogger.info("xxx", "yyy");

const operationLogger = logger.meta({ scope: "operation" });
operationLogger.error("oops", new Error());
```

## 它是做什么的

如果你写过相对比较复杂的业务，会发现日志、埋点是不可缺少的部分。

因为代码本身质量受各种因素影响，再不加日志排查的话，后果不堪设想。

但是日志有非常多种情况：

1. 可能需要上报
2. 可能需要在本地持久化，以备未来回捞
3. 可能是 eventName + params 格式，有的时候是 string 格式
4. 可能不想上传
5. 可能需要格式化（从 Error 或 Object 变成 string），也可能不需要格式化（直接通过 console 打出来）
6. 各种情况组合

这些不同的组合可能会调用不同的库，甚至还可能会跨端（多谢小程序），每个人有不同的想法，最终会将代码搅成一锅粥。

如果有人又做了一些隐式的封装，那么事情会变得更难收场，新加入的人会更难理解这段日志打印究竟做了啥。

所以我试图把这些概念通过适配层集中然后抹平，至少要适应多数业务场景。
