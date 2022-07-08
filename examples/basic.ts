import { createLogger } from "../src";

type Events = {
  departmentClick: { departmentId: string };
};

type Timelines = {
  document: {
    fcp: undefined;
  };
  detailFetchData: {
    start: undefined;
    success: undefined;
    fail: Error;
    fetchProcessRelevantUsersDataSuccess: undefined;
    fetchProcessRelevantUsersDataFail: undefined;
    fetchDetailDataSuccess: undefined;
    fetchDetailDataFail: undefined;
    fetchApprovalDataSuccess: undefined;
    fetchApprovalDataFail: undefined;
  };
};

const log = createLogger<
  Events,
  Timelines,
  {
    log: { toast: boolean; showToastIcon?: boolean };
    event: undefined;
    mark: undefined;
  }
>({
  // not required, it has default value
  onLog(data) {
    data.level;
    data.message;
    data.options;
    // do something with data
  },
  // not required, it has default value
  onEvent(data) {
    data.event;
    data.level;
    data.options;
    // do something with data
  },
  // not required, it has default value
  onMark(data) {
    data.duration;
    data.level;
    data.mark;
    data.options;
    data.timeline;
    // do something with data
  },
});

log.event.info({
  name: "departmentClick",
  data: {
    departmentId: "xxx",
  },
});

log.info({
  message: "1234",
  options: { toast: true, showToastIcon: false },
});

const documentTimeline = log.timeline({ name: "document" });

const timeline = log.timeline({
  name: "detailFetchData",
  onReady(self) {
    self.info({
      name: "start",
      message: "开始获取单据详情信息",
    });
  },
  onResolve(self) {
    self.info({
      name: "success",
      message: "单据详情获取成功",
    });
  },
  onReject(self, reason) {
    self.error({
      name: "fail",
      message: "单据详情获取失败",
      data: reason as Error,
    });
  },
});

const [
  fetchProcessRelevantUsersDataTimeline,
  fetchDetailDataTimeline,
  fetchApprovalDataTimeline,
] = timeline.all(3);

fetchProcessRelevantUsersDataTimeline.info({
  name: "fetchProcessRelevantUsersDataSuccess",
  message: "获取流程干系人成功",
});
fetchProcessRelevantUsersDataTimeline.resolve();

fetchDetailDataTimeline.info({
  name: "fetchDetailDataSuccess",
  message: "获取表单详情成功",
});
fetchDetailDataTimeline.resolve();

fetchApprovalDataTimeline.error({
  name: "fetchApprovalDataFail",
  message: "获取审批组件信息失败",
});
fetchApprovalDataTimeline.reject();

documentTimeline.info({
  name: "fcp",
  message: "document fcp",
});
