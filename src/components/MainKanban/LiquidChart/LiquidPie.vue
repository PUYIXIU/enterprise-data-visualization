<script setup>
import * as echarts from 'echarts'
import 'echarts-liquidfill'
import gsap from 'gsap'
import {getHSL, getpx} from "@/utils/style.js";
import {pieOptionTemp} from "@/components/MainKanban/LiquidChart/colorConfig.js";
import {onBeforeUnmount, onMounted} from 'vue'
const props = defineProps(['domId',"color",'data','grid','pieDomId'])
// 水球模版
let liquidFillSeriesOption = [
  {
    type:'liquidFill',
    data:[0.3],
    center:['50%','50%'],
    radius:'42%',
    outline:{show:false},
    itemStyle:{
      color:'#fff',
      opacity:0.2,
    },
    amplitude:10, // 水波曲度
    direction:'right', // 水波方向
    phase:0,
    waveLength:'50%',
    period:1500,
    /** 背景颜色相关 */
    backgroundStyle:{
      shadowColor:'#fff',
      shadowBlur:40,
      shadowOffsetX:-20,
      shadowOffsetY:40,
      color:'#fff',
    },
    label:{
      position:['50%','50%'],
      formatter:null,
      rich:{
        title:{
          color:'#fff',
          fontSize:30,
          fontWeight:'bold',
          textShadowColor:'rgba(0,0,0,0.75)',
          textShadowBlur:3,
          textShadowOffsetY:1,
          lineHeight:40
        },
        subtitle:{
          color:'#fff',
          fontSize:20,
          textShadowColor:'rgba(0,0,0,0.5)',
          textShadowBlur:5,
          textShadowOffsetY:2,
          lineHeight:40
        },
        percent:{
          color:'#fff',
          fontSize:12,
          textShadowColor:'rgba(0,0,0,0.5)',
          textShadowBlur:5,
          textShadowOffsetY:2,
        }
      }
    },
  },
  {
    type:'liquidFill',
    data:[0.3],
    center:['50%','50%'],
    radius:'42%',
    outline:{show:false},
    itemStyle:{
      shadowColor:'#fff',
      opacity:0.2,
    },
    amplitude:10, // 水波曲度
    direction:'right', // 水波方向
    phase:0,
    waveLength:'50%',
    period:1500,
    /** 背景颜色相关 */
    backgroundStyle:{
      shadowColor:'#fff',
      shadowBlur:10,
      shadowOffsetX:0,
      shadowOffsetY:0,
      color:'#fff',
    },
    label:{show:false}
  }
]
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
  getCanvasPieCenter() // 重新获取绘制中心点
}

onBeforeUnmount(()=>{
  window.removeEventListener('resize',resize)
  liquidChart = null
  pieChart = null
})
function initChart(seriesList, rect){
  liquidFillSeriesOption = seriesList
  boundRect = rect
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

// 获取画布饼图展示的中心点 [30%, 50%]
function getCanvasPieCenter(){
  const target = document.getElementById(props.domId)
  const boundBox = target.getBoundingClientRect()
  const {grid} = props
  let canvasWidth = boundBox.width - grid.left - grid.right // 画布宽度
  let canvasHeight = boundBox.height - grid.top - grid.bottom //  画布高度
  canvasSize = [canvasWidth,canvasHeight]
  let halfWidth = canvasWidth * 0.3, halfHeight = canvasHeight * 0.5 // 一半的宽高
  center[0] = halfWidth + boundBox.left + grid.left
  center[1] = halfHeight + boundBox.top + grid.top
}

onMounted(()=>{
  getCanvasPieCenter()
})

function moveIn(){
  // 求取整个画布的中心点
  rectCenter = [
      boundRect.left + boundRect.width/2,
      boundRect.top + boundRect.height/2
  ] // 目标圆当前中心点
  const dX = center[0] - rectCenter[0]
  const dY = center[1] - rectCenter[1]

  const currentRadius = parseFloat(liquidFillSeriesOption[0].radius)
  const scaleLevel = targetRadius / currentRadius

  gsap.set(`#${props.domId} svg`,{
    transformOrigin:'50% 30%',
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
      // 饼图绘制结束后，轻微旋转动画
      const targetDom = document.querySelector(`#${props.pieDomId} svg > g`)
      targetDom.style.transformOrigin = [canvasSize[0]*0.3+props.grid.left+'px', canvasSize[1]*0.5 + 10 + 'px'].join(' ')
      targetDom.classList.add('rotate')
      // gsap.set(`#${props.pieDomId} svg > g`,{
      //   transformOrigin:[canvasSize[0]*0.3+props.grid.left, canvasSize[1]*0.5 + 10].join(' ')
      // })
      // gsap.fromTo(`#${props.pieDomId} svg > g`,{
      //   rotationZ:0,
      // },{
      //   rotationZ:360*5,
      //   duration:1,
      //   ease:'power2.inOut'
      // })
    }
  })
}

// 移出
function moveOut(){
  liquidChart.dispose()
  pieChart.dispose()
}

// 设置水球图的option
function getLiquidOption(){
  // label字体变化 添加项目负责人字样
  let option = liquidFillSeriesOption[1]
  let {data} = props
  option.label.formatter =
      `{title|${data.totalHour}h}\n{subtitle|${data.name}}\n{subtitle|${data.progress}}{percent|%}\n{subtitle|${data.commander.join(' ')}}`
  liquidOption.series = liquidFillSeriesOption
}

// 设置饼图的option
function getPieOption(){
  let {series} = pieOption
  let {peopleList:data}  = props.data
  console.log(props.grid.top)
  series = []
  const innerRadius = parseFloat(liquidOption.series[1].radius) // 水球图的半径
  // const center = liquidOption.series[1].center //水球的中心点
  pieOptionTemp.center = [canvasSize[0]*0.3+props.grid.left, canvasSize[1]*0.5 + 10]
  pieOptionTemp.radius[0] = `${innerRadius+3}%`
  pieOptionTemp.label.rich.num.fontSize=getpx(1.5)
  pieOptionTemp.label.rich.unit.fontSize=getpx(0.8)
  pieOptionTemp.label.rich.name.fontSize=getpx(1.5)
  const gap = 3 // 角度间隔
  const r_gap = 2 // 边缘间隔
  const r_width = 4 // 边沿宽度
  const pieNum = data.length // 弧形个数
  const start = 80  // 开始角度
  const angle = 360 / pieNum - gap // 一个弧形的弧度
  const minR = innerRadius+30, maxR = 90 // 半径范围 50+20
  const PieColor = props.color.pie
  data.forEach((node,index)=>{
    let temp = [0,1].includes(index)?(index+1):index
    const i = (temp+1)%PieColor.length
    const color = PieColor[i]

    const pieOption = JSON.parse(JSON.stringify(pieOptionTemp))

    /** 计算label */
    pieOption.label.formatter = (param)=>`{num|120}{unit|h} {name|${node.name}}`

    /** 计算外半径 */
    const outerRadius = node.radiusValue*(maxR - minR) + minR
    pieOption.radius[1] = `${outerRadius}%`

    /** 计算起始角度 */
    pieOption.startAngle = -index * (angle + gap)
    pieOption.endAngle = -index * (angle + gap) - angle
    let middle = (pieOption.endAngle + pieOption.startAngle)/2

    /** 计算渐变 */
    let x = Math.cos(-middle/180*Math.PI)
    let y = Math.sin(-middle/180*Math.PI)
    pieOption.itemStyle.color.x = x/2+0.5
    pieOption.itemStyle.color.y = y/2+0.5
    pieOption.itemStyle.color.x2 = -x/2+0.5
    pieOption.itemStyle.color.y2 = -y/2+0.5
    // 外圈颜色
    pieOption.itemStyle.color.colorStops[0].color = getHSL(color.color, color.alpha)
    // 内圈颜色
    pieOption.itemStyle.color.colorStops[1].color = getHSL(color.color, 30)

    // pieOption.endAngle = -index * (angle + gap) - angle*0.5
    if(angle>20){
      pieOption.endAngle = -index * (angle + gap) - 20
    }

    series.push(pieOption)


  })
  pieOption.series = series
}

defineExpose({
  initChart,
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

.liquid-pie-chart{
  position:absolute;
  top:0;
  left:0;
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
