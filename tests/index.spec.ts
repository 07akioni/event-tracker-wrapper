import { createLogger } from "../src";

type Events = {
  event1: number;
  event2: string;
};

type Timelines = {
  document: {
    fcp: undefined;
  };
  detailFetchData: {
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

const log = createLogger<Events, Timelines>();

const timeline = log.timeline({
  name: "detailFetchData",
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

const [fetchProcessRelevantUsersData, fetchDetailData, fetchApprovalData] =
  timeline.all(3);

fetchProcessRelevantUsersData.info({
  name: "fetchProcessRelevantUsersDataSuccess",
  message: "获取流程干系人成功",
});
fetchProcessRelevantUsersData.resolve();

fetchDetailData.info({
  name: "fetchDetailDataSuccess",
  message: "获取表单详情成功",
});
fetchDetailData.resolve();

fetchApprovalData.error({
  name: "fetchApprovalDataFail",
  message: "获取审批组件信息失败",
});
fetchApprovalData.reject();
