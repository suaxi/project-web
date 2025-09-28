import { createApp } from 'vue'

import App from './App.vue'
import router from './router'
import store from './store'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import '@/assets/styles/index.scss'
import tab from '@/utils/tab'

// svg
import 'virtual:svg-icons-register'
import SvgIcon from '@/components/SvgIcon/index.vue'
import elementIcons from '@/components/SvgIcon/svgicon'

const app = createApp(App)

app.use(router)
app.use(store)
app.use(ElementPlus)
app.use(elementIcons)
app.component('svg-icon', SvgIcon)

// tab
app.config.globalProperties.$tab = tab

app.mount('#app')
