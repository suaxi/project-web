import axios from 'axios';
import ElementUI from "element-ui";
import {getToken} from "@/utils/auth";

let request = axios.create()

//响应拦截器
request.interceptors.response.use(response => {
        return response.data
    },
    error => {
        ElementUI.Message.error(error)
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
        return Promise.reject(error)
    })

export default request