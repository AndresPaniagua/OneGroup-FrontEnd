import { createApp } from "vue";
import App from "./App.vue";
import axios from "axios";
import VueAxios from "vue-axios";
import ToastPlugin from 'vue-toast-notification';
import {LoadingPlugin} from 'vue-loading-overlay';

import 'vue-toast-notification/dist/theme-bootstrap.css';
import 'vue-loading-overlay/dist/css/index.css';

const app = createApp(App);

app.config.globalProperties.$axios = axios;
app.use(VueAxios, axios);
app.use(ToastPlugin);
app.use(LoadingPlugin);

app.mount("#app");
