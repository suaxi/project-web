import Vue from "vue";
import VueRouter from "vue-router";
import Login from "@/views/login";

Vue.use(VueRouter)

const routes = [
    {
        path: '',
        name: 'Login',
        component: Login
    }
]

const router = new VueRouter({
    mode: 'history',
    base: process.env.VUE_APP_BASE_API,
    routes
})

export default router