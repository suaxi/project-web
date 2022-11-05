import request from "@/utils/request";

export function getChild(id) {
    return request({
        url: `/menu/queryMenuListById?id=${id}`,
        method: 'get'
    })
}