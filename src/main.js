import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import '@/assets/styles/index.scss'
import App from './App.vue'
import router from './router'
import {createPinia} from "pinia";

const app = createApp(App)
app.use(router)
const pinia = createPinia()
app.use(pinia)
app.use(ElementPlus)
app.mount('#app')

export function resize(){
    let rootWidth = document.documentElement.clientWidth || document.body.clientWidth
    let rootDom = document.querySelector('html')
    // 根据窗口大小，调整字体大小  1920 16px    y=kx
    // y = kx + b
    // 16 = 1920k + b
    // 12 = 1024k + b
    // 4 = 896k
    // k = 0.00446
    // 16 =
    let k = 4/896
    let b = 16 - 1920*k
    rootDom.style.fontSize = (k*rootWidth+b) + 'px'
}
resize()
