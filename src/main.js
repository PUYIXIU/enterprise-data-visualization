import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import '@/assets/styles/index.scss'
import 'vis-timeline/dist/vis-timeline-graph2d.min.css'
import App from './App.vue'
import router from './router'
import {createPinia} from "pinia";
import {resize} from "@/utils/style.js";

resize().then(res=>{
    const app = createApp(App)
    app.use(router)
    const pinia = createPinia()
    app.use(pinia)
    app.use(ElementPlus)
    app.mount('#app')
})
window.addEventListener('resize',resize)
