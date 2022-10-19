import axios from 'axios';
import ElementUI from "element-ui";

let request = axios.create()

request.interceptors.response.use(response => {
        return response
    },
    error => {
        ElementUI.Message.error(error)
        return Promise.reject(error)
    })

export default request