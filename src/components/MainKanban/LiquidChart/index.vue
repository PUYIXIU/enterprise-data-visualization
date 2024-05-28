<script setup>
import {ref,onBeforeMount,getCurrentInstance,onMounted,watch,nextTick} from 'vue'
import Axis from './Axis.vue'
import LiquidScatter from './LiquidScatter.vue'
import LiquidPie from './LiquidPie.vue'

import {mock_liquidData,mock_dataTypeDict} from "@/mock/liquidScatterData.js"; // 模拟数据
import {mockPeopleList} from '@/mock/liquidPieData.js'
import {getToolTips, liquidColorMap} from './colorConfig.js'
import {getHSL, getpx} from "@/utils/style.js";
import {useLocalDataStore} from "@/storage/index.js";
import {copy, getLiquidData, handlePieData} from "@/components/MainKanban/LiquidChart/liquidChartData.js";
import request from "@/utils/request.js";
import {filterPieData} from "@/utils/dataFilter.js";
const { proxy } = getCurrentInstance()
const store = useLocalDataStore()
const chartData = ref([]) // 水球数据
const liquidPieData = ref(undefined) // 饼图数据
const liquidPieColorConfig = ref(undefined) // 饼图配色
const navList = ref(getToolTips()) // 图例列表
const grid = ref(getGrid())
const axisRange = ref({
  maxX:0,
  maxY:0,
})
const pieRendering = ref(false)

function getGrid(){
  return { // 坐标系栅格
    top:getpx(1),
    bottom:getpx(2.8125),
    // left:getpx(1.875),
    left:getpx(3),
    right:getpx(0.9375),
  }
}

onMounted(()=>{
  grid.value.top += getpx(2.4)
  proxy.$refs.AxisRef.initChart()
  chartData.value = proxy.$refs.AxisRef.convertAxisToPixel(chartData.value) // 计算坐标
  proxy.$refs.LiquidRef.initChart()
})

// 窗口resize
function resize(){
  grid.value = getGrid()
  // 重新注册坐标
  chartData.value =  proxy.$refs.AxisRef.convertAxisToPixel(chartData.value) // 计算坐标
  proxy.$refs.LiquidRef.updateChartSize() // 更新散点图尺寸
}

// // 监听到有水球被点中了
watch(()=>store.selectProjId,(nv,ov)=>{
  if(nv == undefined){
    store.triggerLeaveChart = false // 重置
    pieRendering.value = false
    proxy.$refs.LiquidPieRef.moveOut() // 饼图移出
  }
})


// 更新饼图
function updatePie(taskId, seriesList, rect){
  proxy.$refs.LiquidPieRef.updateChart(copy(seriesList), rect)
}

const selectProjectDetails = params=>request.get('/erp/visualize/selectProjectDetails',{params})

// 获取饼图数据
function getPieData(projData){
  // 传项目id 和 时间长度
  return selectProjectDetails({erpProjectId:projData.id, filterDay:store.timeRange}).then(res=>{
    res.data = filterPieData(res.data) // 过滤接口数据
    projData.peopleList = handlePieData(res.data) // 处理数据
    if(window.debugModeEnable){
      console.group('请求到环饼图数据')
      console.log(res)
      console.groupEnd()
    }
    return projData
  })
}

// 渲染水球
function renderLiquidPie(index, seriesList, rect){
  let selectProj = chartData.value[index] // 被选中的数据
  liquidPieColorConfig.value = selectProj.color
  store.selectProjId = selectProj.id // 全局选中id
  getPieData(selectProj).then(res=>{
    liquidPieData.value = res
    pieRendering.value = true
    nextTick(()=>{
      proxy.$refs.LiquidPieRef.initChart(copy(seriesList), rect)
    })
  })
}

// 接收到数据
function dataReady(src){
  let canvasDom = document.querySelector('.canvas')
  let data = getLiquidData(src,canvasDom,grid.value)
  chartData.value = data.data
  proxy.$refs.AxisRef.updateChart(
      data.axis_range,
      data.x_category,
      data.y_category
  ).then(res=>{
    grid.value = getGrid()
    chartData.value = proxy.$refs.AxisRef.convertAxisToPixel(chartData.value) // 计算坐标
    proxy.$refs.LiquidRef.updateChart(chartData.value)
  })

}


defineExpose({
  dataReady,
  pieRendering
})

</script>

<template>
  <div class="chart-wrapper">
    <div class="nav-head">
      <div class="tip-mes" :class="{fade:pieRendering}" >【圆形大小代表热度高低】</div>
      <div class="tooltip-box" style="opacity: 0;">
        <p v-for="item in navList">
          <i :style="{'--color':item.color}"></i>
          <span>{{item.label}}</span>
        </p>
      </div>
    </div>
    <div class="canvas">
<!--      坐标系-->
      <Axis ref="AxisRef" class="liquid-axes"  :class="{fade:pieRendering}" dom-id="axisId" :grid="grid" @resize="resize" />
<!--      散点图-->
      <LiquidScatter class="liquid-scatter" :grid="grid" :class="{fade:pieRendering}" ref="LiquidRef" dom-id="liquidId" @render-pie="renderLiquidPie" @update-pie="updatePie"/>
<!--      饼图-->
      <LiquidPie class="pie-chart" :class="{fade:!pieRendering}" ref="LiquidPieRef" :grid="grid" :data="liquidPieData" :color="liquidPieColorConfig" dom-id="liquid-pie-id" pie-dom-id="liquid-circle-pie-id" />
    </div>
  </div>
</template>

<style scoped lang="scss">
$nav-header-height:1rem;
@import '@/assets/styles/global.scss';
$padding-top:1.94rem;
.chart-wrapper{
  background: #0c0c18;
  width: calc(100% - 2.25rem * 2);
  height:calc(100% - $content-header-h - $padding-top);
  background: white;
  padding-top:$padding-top;
  .nav-head{
    height:$nav-header-height;
    display: flex;
    width:100%;
    justify-content: space-between;
    font-family: SourceHanSansCN-Medium;
    color: rgba(0, 17, 51, 0.75);
    font-size: 1rem;
    .tooltip-box{
      display: flex;
      filter:saturate(1.4) contrast(1.2);
      p{
        margin-right:4.75rem;
        height:1rem;
        line-height: 1rem;
        i{
          --collor:red;
          display: inline-block;
          width:1rem;
          height:1rem;
          background-color: var(--color);
          border-radius: 50%;
        }
        span{
          display: inline-block;
          width:3.88rem;
          text-align: right;
        }
      }
    }
    .tip-mes{
      font-family: SourceHanSansCN-Regular;
      opacity:1;
      transition-property: opacity;
      transition-duration: 0.3s;
      transition-timing-function: ease-in-out;
      &.fade{
        opacity: 0.1;
      }
    }
  }
}
.canvas{
  height:calc(100% - $nav-header-height);
  position:relative;
}
.liquid-scatter, .liquid-axes{
  opacity:1;
  transition-property: opacity;
  transition-duration: 0.3s;
  transition-timing-function: ease-in-out;
  &.fade{
    opacity: 0.1 !important;
    pointer-events: none;
  }
}
.pie-chart{
  opacity: 1;
  transition-property: opacity;
  transition-duration: 0.3s;
  transition-timing-function: ease-in-out;
  &.fade{
    opacity: 0 !important;
  }
}
</style>
