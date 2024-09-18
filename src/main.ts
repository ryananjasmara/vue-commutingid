import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";
import i18n from "./i18n";
import Button from "./components/Button.vue";
import Select from "./components/Select.vue";
createApp(App)
  .use(i18n)
  .component("Button", Button)
  .component("Select", Select)
  .mount("#app");
