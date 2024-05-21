import {defineStore} from "pinia";

export const defaultHotParams = {
    filterDay:1,
    filterType:1
}


const timeScale = 1000 * 60 * 60 * 8 // 8个小时
export const useLocalDataStore = defineStore('local',{
    state:()=>({
        timeTrigger:0, // 定时触发器，每8个小时改变一次
        loading:true, // 主页loading
        mapMode:0, // 0为均匀模式 1为全局模式
        currentProjectIndex:undefined, // 鼠标hover过的球体的inedx
        selectProjId:undefined, // 选中项目的项目id
        showType:0, // 0 图表展示 1 表格展示
        timeRange:defaultHotParams.filterDay, // 筛选时间长度，用于查询项目详情传参，在项目热度中修改
        deptList:[], // 部门列表
    }),
    getters:{},
    actions:{
        startTimeCount(){
            setInterval(()=>{
                this.timeTrigger ++
            },timeScale)
        }
    }
})
