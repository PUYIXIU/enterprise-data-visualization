import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import '@/assets/styles/index.scss'
import App from './App.vue'
import router from './router'
import {createPinia} from "pinia";
import {resize} from "@/utils/style.js";

const app = createApp(App)
app.use(router)
const pinia = createPinia()
app.use(pinia)
app.use(ElementPlus)
app.mount('#app')

resize()
window.addEventListener('resize',resize)
