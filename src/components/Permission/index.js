import Vue from 'vue';
import store from '@/store';

const vPermission = Vue.directive('permission', {
    inserted(el, binding) {
        //标签内传入的属性 v-permission[user:add]
        const {value} = binding;
        //当前用户拥有的角色/权限
        const roles = store.state.roles
        if (value && value instanceof Array) {
            //所有标签绑定admin角色
            value.push('admin');
            if (value.length > 0) {
                const permissionRoles = value;
                const hasPermission = roles.some(role => {
                    return permissionRoles.includes(role)
                })
                if (!hasPermission) {
                    el.parentNode && el.parentNode.removeChild(el)
                }
            }
        } else {
            throw new Error(`使用方式：v-permission['admin', 'user:add']`)
        }
    }
})

export default vPermission