import {createRouter, createWebHashHistory} from "vue-router";

export const routes = [
    // {
    //     path:'/',
    //     // redirect: 'examples',
    //     component: ()=> import('@/views/Home/index')
    // },
]

const router = createRouter({
    history: createWebHashHistory(),
    routes
})

export default router
