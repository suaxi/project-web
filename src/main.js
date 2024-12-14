import Vue from 'vue'

import App from './App.vue'
import router from '@/router'
import store from './store'

import ElementUI from 'element-ui'
import request from '@/utils/request'
import permission from '@/components/Permission'

import 'element-ui/lib/theme-chalk/index.css'
// global css
import './assets/styles/index.scss'
// global svg
import './assets/icons/index'
// vform
import vform from '@/components/workflow/vform/VFormDesigner.umd.min'
import '@/components/workflow/vform/VFormDesigner.css'
import modelerStore from '@/components/workflow/Process/common/global'

Vue.config.productionTip = false
Vue.use(ElementUI)
Vue.use(vform)
Vue.use(permission)
Vue.prototype.$request = request
Vue.prototype.modelerStore = modelerStore

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
