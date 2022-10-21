import Vue from "vue";
import VueRouter from "vue-router";
import Login from "@/views/Login";
import {getToken} from "@/utils/auth";

Vue.use(VueRouter)

const routes = [
    {
        path: '',
        name: 'Login',
        component: Login
    },
    {
        path: '/home',
        name: 'Home',
        component: () => import('@/views/Home')
    }
]

const router = new VueRouter({
    mode: 'history',
    base: process.env.VUE_APP_BASE_API,
    routes
})

router.beforeEach((to, from, next) => {
    if (getToken()) {
        if (to.name === 'Login') {
            //已登录
            next('/home')
        } else {
            next()
        }
    } else if (to.path !== '/') {
        //未登录
        next({path: '/'})
    } else {
        next()
    }
})

export default router