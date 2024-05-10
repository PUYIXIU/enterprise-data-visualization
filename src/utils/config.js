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
