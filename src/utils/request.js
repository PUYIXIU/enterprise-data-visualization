import axios from "axios";
import {getBaseURL} from "@/utils/config.js";

axios.defaults.headers['Content-Type'] = 'application/json;charset=utf-8'

const service = axios.create({
    baseURL:getBaseURL(),
    timeout:10000,
})

// 请求拦截器
service.interceptors.request.use(
    config=>{
        // get方法
        if (config.method === 'get' && config.params) {
            let url = config.url + '?' + tansParams(config.params)
            url = url.slice(0, -1)
            config.params = {}
            config.url = url
        }
        // post/put方法
        if (config.method === 'post' || config.method === 'put') {
            const requestObj = {
                url: config.url,
                data: typeof config.data === 'object' ? JSON.stringify(config.data) : config.data,
                time: new Date().getTime(), // 时间戳
            }
        }
        return config
    },
    error => {
        console.log(error)
        Promise.reject(error)
    }
)

// 响应拦截器
service.interceptors.response.use(
    res=>{
        const code = res.data.code || 200
        if(code != 200){
            let errorMessage
            switch (code){
                case 401: errorMessage = '未授权';break;
                case 404: errorMessage = '请求错误';break;
                case 408: errorMessage = '请求超时';break;
                case 500: errorMessage = '服务器出错';break;
                case 502: errorMessage = '网络错误';break;
                case 504: errorMessage = '网络超时';break;
                default: errorMessage = `错误码：${code}`;break;
            }
            console.log(errorMessage)
            return {
                code:0,
                data:[],
                msg:errorMessage
            }
        }else{
            return res.data
        }
    },
    error=>{
        let {message} = error
        console.log('请求失败：'+message)
        return Promise.reject(error)
    }
)

export function tansParams(params) {
    let result = ''
    for (const propName of Object.keys(params)) {
        const value = params[propName]
        var part = encodeURIComponent(propName) + '='
        if (value !== null && value !== '' && typeof value !== 'undefined') {
            if (typeof value === 'object') {
                for (const key of Object.keys(value)) {
                    if (value[key] !== null && value[key] !== '' && typeof value[key] !== 'undefined') {
                        let params = propName + '[' + key + ']'
                        var subPart = encodeURIComponent(params) + '='
                        result += subPart + encodeURIComponent(value[key]) + '&'
                    }
                }
            } else {
                result += part + encodeURIComponent(value) + '&'
            }
        }
    }
    return result
}

export default service
