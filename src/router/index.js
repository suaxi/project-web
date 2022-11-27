import Vue from "vue";
import VueRouter from "vue-router";
import Login from "@/views/login";
import {getToken} from "@/utils/auth";
import User from "@/views/system/user";
import Role from "@/views/system/role";
import Menu from "@/views/system/menu";

Vue.use(VueRouter)

const routes = [
    {
        path: '/login',
        name: 'Login',
        component: Login
    },
    {
        path: '/',
        name: 'Home',
        component: () => import('@/views/home'),
        children: [
            {
                path: 'system/user',
                name: 'User',
                component: User
            },
            {
                path: 'system/role',
                name: 'Role',
                component: Role
            },
            {
                path: 'system/menu',
                name: 'Menu',
                component: Menu
            }
        ]
    }
]

const router = new VueRouter({
    mode: 'history',
    routes
})

router.beforeEach((to, from, next) => {
    if (getToken()) {
        if (to.name === 'Login') {
            //已登录
            next('/')
        } else {
            next()
        }
    } else if (to.name !== 'Login') {
        //未登录
        next({name: 'Login'})
    } else {
        next()
    }
})

export default router