import { createApp } from 'vue'

import App from './App.vue'
import router from './router'
import store from './store'

import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import locale from 'element-plus/es/locale/lang/zh-cn'

import '@/assets/styles/index.scss'

import tab from '@/utils/tab'
import { useDict } from '@/utils/dict'
import vPermission from '@/directive/index'

// svg
import 'virtual:svg-icons-register'
import SvgIcon from '@/components/SvgIcon/index.vue'
import elementIcons from '@/components/SvgIcon/svgicon'

const app = createApp(App)

app.use(router)
app.use(store)
app.use(ElementPlus, {
  locale: locale
})
app.use(elementIcons)
app.component('svg-icon', SvgIcon)

// tab
app.config.globalProperties.$tab = tab
// dict
app.config.globalProperties.useDict = useDict

// v-permission
app.directive('permission', vPermission)

app.mount('#app')
