import { createApp } from "vue";
import App from "./App.vue";

// createApp(App).mount("#app");

kintone.events.on("app.record.index.show", (event) => {
  if (event.viewId !== 6060171) return;
  createApp(App).mount("#app");
});
