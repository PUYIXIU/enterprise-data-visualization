import {defineStore} from "pinia";


export const useLocalDataStore = defineStore('local',{
    state:()=>({
        currentProjectId:undefined, // 选中的当前项目Id
    }),
    getters:{},
    actions:{
    }
})
