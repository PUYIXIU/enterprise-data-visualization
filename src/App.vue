<script setup>
import MainKanban from '@/components/MainKanban'
import HotSort from '@/components/HotSort'
import ProjPercent from '@/components/ProjPercent'
import DangerProj from '@/components/DangerProj'
import Drawer from '@/components/Drawer'
import Loading from "@/components/Loading/Loading.vue";
import {defaultHotParams, useLocalDataStore} from "@/storage/index.js";
import {onMounted,getCurrentInstance,ref} from 'vue'
import request from '@/utils/request.js'
const store = useLocalDataStore()
const {proxy} = getCurrentInstance()
let app_init = true
const selectProjectPopularity = params => request.get('/erp/visualize/selectProjectPopularity', {params}) // 请求项目热度

// 获取主表格数据
function getMainChartData(params=defaultHotParams){
  !app_init && (store.loading = true)
  console.log(store.loading)
  return selectProjectPopularity(params).then(res=>{
    !app_init && (store.loading = false)
    console.log(store.loading)
    console.log(res)
  })
}

// 获取部门列表
function getDeptData(){
  return new Promise((resolve,reject)=>{
    store.deptList = [
      {value:0,label:'所有部门'},
      {value:1,label:'综合部'},
      {value:2,label:'商务部'},
      {value:3,label:'财务部'},
      {value:4,label:'工业设计部'},
      {value:5,label:'多媒体事业部'},
      {value:6,label:'产品测试部'},
      {value:7,label:'软件开发部'},
      {value:8,label:'AI部'},
    ]
    console.log('获取部门数据')
    proxy.$refs.ProjPercentRef.init() // 初始化项目占比
    proxy.$refs.DangerProjRef.init() // 初始化项目占比
    resolve()
  })
}

const loading_delay = ref(0)  // loading消失延迟
const loading_duration = ref(0.5) // loading消失持续时间
const total_time = loading_delay.value + loading_duration.value
function init(){
  Promise.all([
      getMainChartData(), // 准备主屏数据
      getDeptData(), // 准备部门数据
  ]).then(res=>{
    console.log('数据准备结束')
    app_init = false // 初始化结束
    store.loading = false // 数据准备结束
    setTimeout(()=>{ // 执行入场动画的效果
      proxy.$refs.DangerProjRef.ready() // 初始化项目占比
    },(total_time-0.2)*1000)
  })
}

onMounted(()=>{
  init()
})


</script>

<template>
  <Loading :delay="loading_delay" :duration="loading_duration" />
  <div class="wrapper">
    <div class="head"></div>
    <div class="content">
      <div class="main-content br-box">
<!--        主看板-->
<!--        <main-kanban/>-->
      </div>
      <div class="sub-content">
<!--        项目热度-->
        <div class="sub-top br-box">
          <hot-sort @query-change="getMainChartData" />
        </div>
<!--        项目占比 -->
        <div class="sub-middle br-box">
          <proj-percent ref="ProjPercentRef" />
        </div>
<!--        风险项目-->
        <div class="sub-bottom br-box">
          <danger-proj ref="DangerProjRef" />
        </div>
      </div>
    </div>
<!--    右侧抽屉-->
    <drawer dom-id="right-drawer-id" />
  </div>
</template>

<style scoped lang="scss">
@import '@/assets/styles/fun.scss';
@import '@/assets/styles/global.scss';
.wrapper{
  background: #e9effa;
  width: 100%;
  height:67.5rem;
  min-width: 1024px;
  min-height:768px;
  max-width: 3840px;
  max-height:1838px;
  display: flex;
  flex-direction: column;
  position:absolute;
  overflow-x: hidden;
}
.head{
  background: #fff;
  height:3.81rem;
  font-size: 1rem;
}
.content{
  flex:1;
  padding: 0.75rem;
  padding-right: 1.5rem;
  display: flex;
  // 主界面
  .main-content{
    width:86.56rem;
    margin-right:0.75rem;
    height:100%;
    height:$main-kanban-h;
  }
  // 侧边
  .sub-content{
    width:30.44rem;
    display: flex;
    flex-direction: column;
    .sub-top{
      height:22rem;
      margin-bottom:0.75rem;
    }
    .sub-middle{
      height:15.56rem;
      margin-bottom: 0.75rem;
    }
    .sub-bottom{
      //flex:1
      height:23.13rem;
    }
  }
}
// 圆角盒子
.br-box{
  background: white;
  border-radius: 0.625rem;
  box-shadow: 0px 0px 3px 0px rgba(149,172,231,0.25);
}
</style>
