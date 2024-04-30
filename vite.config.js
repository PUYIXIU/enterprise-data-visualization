import { defineConfig,loadEnv } from 'vite'
import path from 'path'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/dist/vite'
import Components from 'unplugin-vue-components/dist/vite'
import {ElementPlusResolver} from "unplugin-vue-components/dist/resolvers";

// https://vitejs.dev/config/
export default defineConfig(({mode, command})=>{
  const env = loadEnv(mode,process.cwd())
  return {
    // base:env.VITE_APP_CONTEXT_PATH,
    base:'./',
    resolve:{
      // https://cn.vitejs.dev/config/#resolve-alias
      alias:{
        '~': path.resolve(__dirname, './'),
        '@': path.resolve(__dirname, './src')
      },
      extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue']
    },
    // css:{
    //   preprocessorOptions:{
    //     scss:{
    //       additionalData:'@import "@/assets/styles/index.scss";'
    //     }
    //   }
    // },
    server:{
      port:8088,
      host:true,
    },
    plugins:[
      vue(),
      AutoImport({
        resolvers: [ElementPlusResolver()]
      }),
      Components({
        resolvers: [ElementPlusResolver()]
      })
    ]
  }
})
