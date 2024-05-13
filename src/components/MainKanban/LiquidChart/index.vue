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
import {getLiquidData, handlePieData} from "@/components/MainKanban/LiquidChart/liquidChartData.js";
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
    // top:getpx(0.625),
    top:getpx(1),
    bottom:getpx(2.8125),
    left:getpx(1.875),
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
watch(()=>store.currentProjectIndex,(nv,ov)=>{
  console.log(nv)
  if(nv == undefined){
    pieRendering.value = false
    setTimeout(()=>{
      proxy.$refs.LiquidPieRef.moveOut() // 饼图移出
    },300) // 0.3s后饼图清除
  }
})

// 更新饼图
function updatePie(taskId, seriesList, rect){
  proxy.$refs.LiquidPieRef.updateChart(seriesList, rect)
}

// 获取饼图数据
function getPieData(projData){
  return new Promise((res,rej)=>{
    projData.peopleList = handlePieData(mockPeopleList)
    res(projData)
  })
}

// 渲染水球
function renderLiquidPie(index, seriesList, rect){
  let selectProj = chartData.value[index] // 被选中的数据
  liquidPieColorConfig.value = liquidColorMap[selectProj.type]
  store.selectProjId = selectProj.id // 全局选中id
  getPieData(selectProj).then(res=>{
    liquidPieData.value = res
    pieRendering.value = true
    nextTick(()=>{
      proxy.$refs.LiquidPieRef.initChart(seriesList, rect)
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
    chartData.value = proxy.$refs.AxisRef.convertAxisToPixel(chartData.value) // 计算坐标
    proxy.$refs.LiquidRef.updateChart(chartData.value)
  })

}

defineExpose({
  dataReady
})

</script>

<template>
  <div class="chart-wrapper">
    <div class="nav-head">
      <div class="tooltip-box">
        <p v-for="item in navList">
          <i :style="{'--color':item.color}"></i>
          <span>{{item.label}}</span>
        </p>
      </div>
      <div class="tip-mes">【圆形面积大小代表工时数量】</div>
    </div>
    <div class="canvas">
<!--      坐标系-->
      <Axis ref="AxisRef" dom-id="axisId" :grid="grid" @resize="resize" />
<!--      散点图-->
      <LiquidScatter class="liquid-scatter" :class="{fade:pieRendering}" ref="LiquidRef" dom-id="liquidId" @render-pie="renderLiquidPie" @update-pie="updatePie"/>
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
    }
  }
}
.canvas{
  height:calc(100% - $nav-header-height);
  position:relative;
}
.liquid-scatter{
  opacity:1;
  transition-property: opacity;
  transition-duration: 0.3s;
  transition-timing-function: ease-in-out;
  &.fade{
    opacity: 0.1;
    pointer-events: none;
  }
}
.pie-chart{
  opacity: 1;
  transition-property: opacity;
  transition-duration: 0.3s;
  transition-timing-function: ease-in-out;
  &.fade{
    opacity: 0;
  }
}
</style>
