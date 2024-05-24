// baseURL配置
export function getBaseURL(){
    if(import.meta.env.VITE_APP_ENV === 'development'){
        // 本地开发环境 丁坤
        return 'http://10.5.6.66:8011'+import.meta.env.VITE_APP_BASE_API
    }else{
        // 生产环境
        return '/prod-api'
    }
}
export function getEnvURL(){
    if(import.meta.env.VITE_APP_ENV === 'development'){
        return 'http://10.5.6.88:8088'
    }else{
        // 生产环境
        return 'http://47.120.64.178:8100'
    }
}
