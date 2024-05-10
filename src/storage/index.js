import {defineStore} from "pinia";

export const defaultHotParams = {
    filterDay:2,
    filterType:1
}

export const useLocalDataStore = defineStore('local',{
    state:()=>({
        loading:true, // 主页loading
        currentProjectId:undefined, // 选中的当前项目Id
        showType:0, // 0 图表展示 1 表格展示
        deptList:[], // 部门列表
    }),
    getters:{},
    actions:{
    }
})
