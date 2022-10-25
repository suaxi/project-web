import Vue from 'vue'

import App from './App.vue'
import router from "@/router";
import store from './store'

import ElementUI from "element-ui";
import request from "@/utils/request";

import 'element-ui/lib/theme-chalk/index.css';
// global css
import './assets/styles/index.scss'
// global svg
import './assets/icons/index'

Vue.config.productionTip = false
Vue.use(ElementUI)
Vue.prototype.$request = request

new Vue({
  router,
  store,
  render: h => h(App),
}).$mount('#app')
