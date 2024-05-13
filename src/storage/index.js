import {defineStore} from "pinia";

export const defaultHotParams = {
    filterDay:3,
    filterType:1
}

export const useLocalDataStore = defineStore('local',{
    state:()=>({
        loading:true, // 主页loading
        mapMode:0, // 0为均匀模式 1为全局模式
        currentProjectIndex:undefined, // 鼠标hover过的球体的inedx
        selectProjId:undefined, // 选中项目的项目id
        showType:0, // 0 图表展示 1 表格展示
        deptList:[], // 部门列表
    }),
    getters:{},
    actions:{
    }
})
