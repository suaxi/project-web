import axios from 'axios';
import ElementUI from "element-ui";
import {getToken, removeToken} from "@/utils/auth";
import router from "@/router";
import * as Config from "@/settings"

let request = axios.create({
    baseURL: process.env.VUE_APP_BASE_API,
    timeout: Config.timeout
})

//响应拦截器
request.interceptors.response.use(response => {
        return response.data
    },
    error => {
        ElementUI.Message.error(error.response.data.message)
        let code = error.response.data.status;
        if (code === 401) {
            //后台认证信息过期，浏览器cookie还存有token时，清除cookie，重定向回登录页
            removeToken();
            router.replace('/').then(() => {})
        }
        return Promise.reject(error)
    })

//请求拦截器
request.interceptors.request.use(config => {
        if (getToken()) {
            config.headers['Authorization'] = getToken()
        }
        return config
    },
    error => {
        ElementUI.Message.error(error.response.data.message)
        return Promise.reject(error)
    })

export default request