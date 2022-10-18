import Vue from 'vue'

import App from './App.vue'
import router from "@/router";
import store from 'vuex'

import ElementUI from "element-ui";
import axios from "axios";

import 'element-ui/lib/theme-chalk/index.css';
// global css
import './assets/styles/index.scss'

Vue.config.productionTip = false
Vue.use(ElementUI)

Vue.prototype.$axios = axios

new Vue({
  router,
  store,
  render: h => h(App),
}).$mount('#app')
