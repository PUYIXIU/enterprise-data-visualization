<script setup>
import {ref,onBeforeMount,getCurrentInstance,onMounted,watch,nextTick} from 'vue'
import Axis from './Axis.vue'
import LiquidScatter from './LiquidScatter.vue'
import LiquidPie from './LiquidPie.vue'

import {mock_liquidData,mock_dataTypeDict} from "@/mock/liquidScatterData.js"; // 模拟数据
import {mock_liquidPieData} from '@/mock/liquidPieData.js'
import {liquidColorList,liquidPieColor} from './colorConfig.js'
import {getHSL, getpx} from "@/utils/style.js";
import {useLocalDataStore} from "@/storage/index.js";
const { proxy } = getCurrentInstance()
const store = useLocalDataStore()
const navList = ref([]) // 图例列表
const chartData = ref(mock_liquidPieData) // 水球数据
const liquidPieData = ref(undefined) // 饼图数据
const liquidPieColorConfig = ref(undefined) // 饼图配色
const grid = ref(getGrid())
const axisRange = ref({
  maxX:0,
  maxY:0,
})
const pieRendering = ref(false)

function getGrid(){
  return { // 坐标系栅格
    top:getpx(0.625),
    bottom:getpx(2.8125),
    left:getpx(1.875),
    right:getpx(0.9375),
  }
}
/**
 * 初始化
 * 1. 初始化tooltip数据navList
 * 2. 初始化水球图数据（颜色，百分比）
 * 3. 初始化饼图数据，半径权重
 */
function initAll(){
  const targetDom = document.querySelector('.canvas')
  let colorLen = liquidColorList.length;
  navList.value = mock_dataTypeDict.map((item,index)=>{
    let color = liquidColorList[index%colorLen]
    item.color = getHSL(color.color)
    return item
  })
  // 对水球图进行处理
  let xList =  chartData.value.map(i=>i.taskNum) // x
  let yList =  chartData.value.map(i=>i.peopleNum) // y
  let maxX = Math.max(...xList) // 最大x
  let maxY = Math.max(...yList) // 最大y
  // let maxX = 0, maxY = 0
  let contentWidth = targetDom.clientWidth-grid.value.left-grid.value.right
  let contentHeight = targetDom.clientHeight-grid.value.top-grid.value.bottom
  let xUnit = contentWidth/ maxX // x单位 px
  let yUnit = contentHeight / maxY // y单位 px
  // 处理半径
  const maxR = 50, minR = 10 // 半径范围百分比
  let hours = chartData.value.map(i=>i.totalHour) // 总工时
  let minHour = Math.min(...hours)
  let maxHour = Math.max(...hours)
  chartData.value.forEach(item=>{
    item.waveValue = item.progress/100 // 50->0.5
    item.sizeValue = (item.totalHour - minHour) / (maxHour - minHour)
    item.radius = (maxR - minR)*item.sizeValue + minR

    let x = Math.ceil((item.taskNum * xUnit + item.radius/2/100*contentHeight)/xUnit)+2
    axisRange.value.maxX < x && (axisRange.value.maxX = x)

    let y = Math.ceil((item.peopleNum * yUnit + item.radius/2/100*contentHeight)/yUnit)+2
    axisRange.value.maxY < y && (axisRange.value.maxY = y)

    // 处理饼图半径占比
    item.peopleList.sort((a,b)=>a.totalHour - b.totalHour) // 工时排序
    let maxPersonHour = item.peopleList[item.peopleList.length-1].totalHour
    let minPersonHour = item.peopleList[0].totalHour
    let diff = maxPersonHour - minPersonHour
    item.peopleList.forEach(person=>{
      if(diff == 0){
        person.radiusValue = 1
        return
      }
      person.radiusValue = (person.totalHour-minPersonHour)/diff
    })
  })

  // 计算出最上和最右的元素，以此给坐标轴定标
}

onMounted(()=>{
  initAll()
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
  proxy.$refs.LiquidRef.updateChart() // 更新散点图
}

// // 监听到有水球被点中了
watch(()=>store.currentProjectId,(nv,ov)=>{
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

// 渲染水球图
// function renderLiquidPie(taskId, center, radius){
function renderLiquidPie(taskId, seriesList, rect){
  liquidPieData.value = mock_liquidPieData[taskId]
  liquidPieColorConfig.value = liquidPieColor[liquidPieData.value.type]
  pieRendering.value = true
  nextTick(()=>{
    proxy.$refs.LiquidPieRef.initChart(seriesList, rect)
  })
}

</script>

<template>
  <div class="chart-wrapper">
    <div class="nav-head">
      <div class="tooltip-box">
        <p v-for="item in navList">
          <i :style="{'--color':item.color}"></i>
          <span>{{item.dict_label}}</span>
        </p>
      </div>
      <div class="tip-mes">【圆形面积大小代表工时数量】</div>
    </div>
    <div class="canvas">
<!--      坐标系-->
      <Axis ref="AxisRef" dom-id="axisId" :grid="grid" :axis-range="axisRange" @resize="resize" />
<!--      散点图-->
      <LiquidScatter class="liquid-scatter" :class="{fade:pieRendering}" ref="LiquidRef" dom-id="liquidId" :data="chartData" @render-pie="renderLiquidPie" @update-pie="updatePie" />
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
