import request from "@/utils/request";

export function getDeptList(params) {
    return request({
        url: '/dept/queryChildListByPid',
        method: 'get',
        params
    })
}