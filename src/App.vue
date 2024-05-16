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
import {filterMainData} from "@/utils/dataFilter.js";
const store = useLocalDataStore()
const {proxy} = getCurrentInstance()
let app_init = true
const selectProjectPopularity = params => request.get('/erp/visualize/selectProjectPopularity', {params}) // 请求项目热度
const selectDeptList = params => request.get('/erp/visualize/selectDeptList',{params}) // 请求部门信息

// 获取主表格数据
function getMainChartData(params=defaultHotParams){
  !app_init && (store.loading = true)
  return selectProjectPopularity(params).then(res=>{
    !app_init && (store.loading = false)
    res.data = res.data.map(item=>item.map)
    // 数据分发到表格
    const {chartData, tableData, hotData} = filterMainData(res.data)

    console.group('热度、图表数据请求结束')
    console.log(res.data)
    console.group('图表数据')
    console.log(chartData)
    console.groupEnd()
    console.group('表格数据')
    console.log(tableData)
    console.groupEnd()
    console.group('热度数据')
    console.log(hotData)
    console.groupEnd()
    console.groupEnd()

    // 数据分发到项目热度
    proxy.$refs.HotSortRef.dataReady(hotData)
    proxy.$refs.MainChartRef.chartDataReady(chartData)
    proxy.$refs.MainChartRef.tableDataReady(tableData)
  })
}

// 获取部门列表
function getDeptData(){
  return selectDeptList().then(res=>{
    store.deptList = res.data.map(i=>{
      return {
        value:i.map.deptId,
        label:i.map.deptName,
      }
    })
    store.deptList.unshift({label:'所有部门', value:''})
    console.log(store.deptList)
    console.group('部门数据请求结束')
    proxy.$refs.ProjPercentRef.init() // 初始化项目占比
    proxy.$refs.DangerProjRef.init() // 初始化项目占比
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
    console.group('数据准备结束')
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
  <div class="wrapper">
    <Loading :delay="loading_delay" :duration="loading_duration" />
    <div class="head"></div>
    <div class="content">
      <div class="main-content br-box">
<!--        主看板-->
        <main-kanban ref="MainChartRef" />
      </div>
      <div class="sub-content">
<!--        项目热度-->
        <div class="sub-top br-box">
          <hot-sort ref="HotSortRef" @query-change="getMainChartData" />
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
