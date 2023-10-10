import { createEventTracker } from "../src/index";

const tracker = createEventTracker();

tracker.info({
  name: "foo",
  message: "bar",
});
