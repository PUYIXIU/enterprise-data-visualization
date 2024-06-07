import { defineConfig,loadEnv } from 'vite'
import path from 'path'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/dist/vite'
import Components from 'unplugin-vue-components/dist/vite'
import {ElementPlusResolver} from "unplugin-vue-components/dist/resolvers";
import dayjs from "dayjs";

// https://vitejs.dev/config/
export default defineConfig(({mode, command})=>{
  const env = loadEnv(mode,process.cwd())
  const currentTime = dayjs().format('YYYY-MM-DD')
  // const outputName =
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
    css:{
      preprocessorOptions:{
        scss:{
          additionalData:'@import "@/assets/styles/font.scss";'
        }
      }
    },
    server:{
      port:8089,
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
    ],

    // 打包配置
    build:{
      rollupOptions:{
        output:{
          dir:`dist/OfficeKanBan${currentTime}`,

        }
      }
    }
  }
})
