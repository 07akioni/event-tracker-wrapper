# ilw

Isomorphic logger wrapper.

同构日志打印适配器。

In experimental stage.

试验阶段。

# Why 为什么

If you have made some relative large apps, you will find logging & monitoring are important parts.

如果你写过相对比较复杂的业务，会发现日志、埋点是不可缺少的部分。

Since code quality can be influenced by different reasons, sometimes the only controlled part is logging, it's important to add some logs to your app.

因为代码本身质量受各种因素影响，再不加日志排查的话，后果不堪设想。

However there may be many conditions of logging itself:

1. It may need reporting
2. It may need to be saved locally so you can retrive the log
3. It may be formatted as event name & params, or as string
4. It may not need reporting
5. Its message may need formating (from Error or Object to string), or not (just print from console)
6. Combination of those conditions

但是日志有非常多种情况：

1. 可能需要上报
2. 可能需要在本地持久化，以备未来回捞
3. 可能是 eventName + params 格式，有的时候是 string 格式
4. 可能不想上传
5. 可能需要格式化（从 Error 或 Object 变成 string），也可能不需要格式化（直接通过 console 打出来）
6. 各种情况组合

These different conditions could use different library, or even in different devices. Every collaborator may have his thought. Finally the code becomes messy. 

这些不同的组合可能会调用不同的库，甚至还可能会跨端（多谢小程序），每个人有不同的想法，最终会将代码搅成一锅粥。

If someone does some impilicit encapsulation of logging, it will be hard for new collaborator to understand what happens of the logging code snippet.

如果有人又做了一些隐式的封装，那么事情会变得更难收场，新加入的人会更难理解这段日志打印究竟做了啥。

So I try to merge those conditions in one adapter. At least I hope it can meet most demands.

所以我试图把这些概念通过适配层集中然后抹平，至少要适应多数业务场景。

```ts
import { ilw } from "ilw";

const logger = ilw({
  // unified logging entry
  // 统一的日志调用出口
  // report  - Whether to report
  //           是否上报
  // persist - Whether to persist data
  //           是否持久化
  // type    - type, may be 'plain' or 'event'
  //           类型，可以是 'plain' 或者 'event'
  // meta    - Meta message, anything
  //           额外信息，随便放
  onLog(level, messages, { report, persist, type, meta }) {
    if (report) {
      // Maybe your company's monitoring library
      // 可以是你公司的埋点工具
      if (type === "event") {
        // report by eventName & params
        // 以事件名，事件信息的方式上报
        eventReporter.report(messages[0], messages[1]);
      } else {
        // report by string
        // 以字符串形式上报
        eventReporter.report(message.map(JSON.stringify).join(","));
      }
    } else if (persist) {
      // Maybe your company's client logging SDK
      // 可以是你公司的客户端日志 SDK，比如通过小程序写入客户端
      nativeLogger(...messages);
    } else {
      // Or just print normally.
      // 走一波正常的日志打印
      console[level](...messages);
    }
  },
});

// report 上报
logger.report.info("xxx", "yyy");
// persist 持久化
logger.persist.info("xxx", "yyy");
// event type 事件格式
logger.event.info("eventName", {});
// Meta
logger.meta({ foo: "bar" }).info("xxx");
// any combinations 随意组合
logger.persist.report.info("xx", "yyy");

// Use it like currify a function
// 也可以利用类似柯里化的方式
const persistLogger = logger.persist;
persistLogger.info("xxx", "yyy");

const operationLogger = logger.meta({ scope: "operation" });
operationLogger.error("oops", new Error());
```
