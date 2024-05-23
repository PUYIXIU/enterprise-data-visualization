<script setup>
import * as echarts from 'echarts'
import 'echarts-liquidfill'
import gsap from 'gsap'
import {getHSL, getpx} from "@/utils/style.js";
import {pieOptionTemp} from "@/components/MainKanban/LiquidChart/colorConfig.js";
import {onBeforeUnmount, onMounted, ref, nextTick, watch} from 'vue'
import {getPieFormatter, getPieOptions, getRich} from "@/components/MainKanban/LiquidChart/liquidChartData.js";
import {useLocalDataStore} from "@/storage/index.js";
const props = defineProps(['domId',"color",'data','grid','pieDomId'])
const store = useLocalDataStore()
// 水球模版
let liquidFillSeriesOption = []
let liquidChart, pieChart
let initCenter, initRadius
let boundRect
let pieOption = { // 饼图option
  series:[]
}
let liquidOption = { // 水球option
  series:[]
}
let center = [0,0] // 画布中心 平移用
let rectCenter = [0,0]// 水球图中心 平移用
let canvasSize = [0,0] // 画布尺寸 缩放用
let targetRadius = 50 // 目标半径 缩放用
function resize(){
  liquidChart && liquidChart.resize()
  pieChart && pieChart.resize()
}

onBeforeUnmount(()=>{
  window.removeEventListener('resize',resize)
  liquidChart = null
  pieChart = null
})


// 来自图表自身的绘制
function initChart(seriesList, rect){
  liquidFillSeriesOption = seriesList // 水球的option = 被点击水球的option
  boundRect = rect // 被点击水球的包围盒，用来平移位置
  initCenter = seriesList[0].center; initRadius = seriesList[0].radius;
  // 初始化水球图
  const chartDom = document.getElementById(props.domId)
  chartDom && (liquidChart = echarts.init(chartDom,'',{renderer:'svg'}))
  // 初始化饼图
  const pieChartDom = document.getElementById(props.pieDomId)
  pieChartDom && (pieChart = echarts.init(pieChartDom,'',{renderer:'svg'}))
  getLiquidOption()
  liquidChart.setOption(liquidOption)
  window.addEventListener('resize',resize)
  setTimeout(()=>{
    moveIn()
  },0)
}

// 更新饼图
function updateChart(seriesList, rect){
  if(!liquidChart) return // 更新中心水球图目的：自适应内部文字
  boundRect = rect // 被点击水球的包围盒，用来平移位置
  let keepCenter = liquidFillSeriesOption[0].center
  liquidFillSeriesOption = seriesList
  getLiquidOption()
  liquidChart.setOption(liquidOption,{notMerge:false})  // 中心水球图更新完毕
  getCanvasPieCenter() // 重新获取绘制中心点
  moveIn() // 更新水球中点
  getPieOption()
  pieChart.setOption(pieOption)
  // 修改整个图表的中心位置


}

// 获取画布饼图展示的中心点 [30%, 50%]
function getCanvasPieCenter(){
  const target = document.getElementById(props.domId)
  const boundBox = target.getBoundingClientRect()
  const grid = props.grid
  let canvasWidth = boundBox.width - grid.left - grid.right // 画布宽度
  let canvasHeight = boundBox.height - grid.top - grid.bottom //  画布高度
  canvasSize = [canvasWidth,canvasHeight]
  let halfWidth = canvasWidth * 0.3, halfHeight = canvasHeight * 0.5 // 一半的宽高
  center[0] = halfWidth + boundBox.left + grid.left
  center[1] = halfHeight + boundBox.top + grid.top + window.scrollY
}


onMounted(()=>{ // 初始化时就获取画布中心点
  getCanvasPieCenter()
})

// 获取偏移量
function getRectCenter(){
  // 当页面垂直滚动时，包围盒中心点会计算会忽略页面滚动值scrollTop
  rectCenter = [ // 包围盒的中心点
    boundRect.left + boundRect.width/2,
    boundRect.top + boundRect.height/2 + window.scrollY
  ] // 目标圆当前中心点
  const dX = center[0] - rectCenter[0]
  const dY = center[1] - rectCenter[1]
  // console.log(`centerX:${center[0]} centerY:${center[1]} rectCenterX:${rectCenter[0]} rectCenterY:${rectCenter[1]} dX:${dX} dY:${dY}`)
  return [dX,dY]
}


function moveIn(){
  // 求取整个画布的中心点 rectCenter
  const [dX, dY] = getRectCenter()
  gsap.set(`#${props.domId} svg`,{
    transformOrigin:'50% 30%',
  })

  let radius = {value:parseFloat(liquidFillSeriesOption[0].radius)} // 目标半径
  gsap.to(radius,{
    value:20,
    duration:0.25,
    ease:'power2.inOut',
    onUpdate:()=>{
      // 使用效率最低方式——重绘，进行缩放调整
      liquidOption.series[0].radius = `${radius.value}%`
      liquidOption.series[1].radius = `${radius.value}%`
      liquidChart.setOption(liquidOption,{notMerge:false})
    },
    onComplete:()=>{ // 结束后调整字体大小
      getRich(0.5, liquidOption.series[1].label.rich)
      liquidChart.setOption(liquidOption,{notMerge:false})
    }
  })


  // 平移至此
  gsap.to(`#${props.domId} svg`,{
    x:dX,
    y:dY,
    duration:0.3,
    ease:'power2.inOut',
    onComplete:()=>{
      // 平移结束后，设置饼状图的option
      getPieOption()
      pieChart.setOption(pieOption)
      nextTick(()=>{
        // 饼图绘制结束后，轻微旋转动画
        const targetDom = document.querySelector(`#${props.pieDomId} svg > g`)
        targetDom.style.transformOrigin = [canvasSize[0]*0.3+props.grid.left+'px', canvasSize[1]*0.5 + 10 + 'px'].join(' ')
        targetDom.classList.add('rotate')
      })

    }
  })
}

// 移出
function moveOut(){
  gsap.to(`#${props.domId}`,{
    opacity:0,
    duration:0.3,
    onComplete:()=>{
      liquidChart.dispose()
      gsap.set(`#${props.domId}`,{opacity:1})
    }
  })
  gsap.to(`#${props.pieDomId}`,{
    opacity:0,
    duration:0.3,
    onComplete:()=>{
      pieChart.dispose()
      gsap.set(`#${props.pieDomId}`,{opacity:1})
    }
  })
}

// 设置水球图的option
function getLiquidOption(){
  // label字体变化 添加项目负责人字样
  let option = liquidFillSeriesOption[1]
  let {data} = props
  console.log(liquidFillSeriesOption)
  option.label.formatter = getPieFormatter(data)

  // 此处是为了防止画布平移距离过大，导致的阴影出界
  option.backgroundStyle.shadowBlur = 10
  option.backgroundStyle.shadowOffsetY = 0
  option.backgroundStyle.shadowOffsetX = 0
  liquidOption.series = liquidFillSeriesOption
}

// 设置饼图的option
function getPieOption(){
  pieOptionTemp.center = [canvasSize[0]*0.3+props.grid.left, canvasSize[1]*0.5 + getpx(0.625)]
  console.log(props.color)
  pieOption.series = getPieOptions(
      props.data.peopleList,
      props.color,
      pieOptionTemp,
      liquidOption.series[1],
      canvasSize
  )
}

defineExpose({
  initChart,
  updateChart,
  moveOut
})
</script>

<template>
  <div class="pie-wrapper full">
    <!--  中心散点图-->
    <div :id="domId" class="liquid-pie-chart full"></div>
    <!--  中心饼图-->
    <div :id="pieDomId" class="liquid-pie-chart full"></div>
  </div>
</template>

<style scoped lang="scss">
.pie-wrapper{
  pointer-events: none;
  position:relative;
}
.liquid-pie-chart{
  position:absolute;
  z-index:4;
  filter:saturate(1.4) contrast(1.2);
  pointer-events: none;
}
::v-deep(g.rotate){
  transform:rotateZ(-45deg);
  opacity: 0;
  animation: rotate 0.5s forwards ease-in-out;
  animation-delay: 0.3s;
}
@keyframes rotate{
  to{
    opacity: 1;
    transform:rotateZ(0deg);
  }
}
</style>
