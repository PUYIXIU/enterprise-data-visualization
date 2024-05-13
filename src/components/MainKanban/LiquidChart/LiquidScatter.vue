<script setup>
import {onMounted, nextTick, onBeforeUnmount} from "vue";
import * as echarts from 'echarts'
import 'echarts-liquidfill'
import {useLocalDataStore} from "@/storage/index.js";
import {getLiquidOptions} from "@/components/MainKanban/LiquidChart/liquidChartData.js";

const props = defineProps(["domId"])
const store = useLocalDataStore()
const emit = defineEmits(['renderPie','updatePie'])
let data = []
let chart
let option = {
  tooltip:{
    show:false,
    trigger:'axis'
  },
  series:[]
}

// 水球模版
const SeriesOptionTemp = {
  name:'top',
  type:'liquidFill',
  data: [0],
  center:['50%','50%'], // 中心
  radius:'17%', // 半径
  itemStyle:{
    color:'rgba(52,38,246,0.75)',
    opacity:0.2,
  },
  amplitude:10, // 水波曲度
  direction:'right', // 水波方向
  phase:0,
  waveLength:'50%',
  period:1500,
  backgroundStyle:{
    shadowColor:'rgba(99,88,245,0.7)',
    shadowBlur:40,
    shadowOffsetX:-20,
    shadowOffsetY:40,
    color:'rgba(99,88,245,0.3)',
  },
  outline:{
    show:false,
  },
  label:{
    position:['50%','50%'],
    formatter:null,
    rich:{
      title:{
        color:'#fff',
        fontSize:12,
        fontWeight:'bold',
        textShadowColor:'rgba(0,0,0,0.75)',
        textShadowBlur:3,
        textShadowOffsetY:1,
        lineHeight:18,
        fontFamily:'SourceHanSansCN-Heavy',
      },
      subtitle:{
        color:'#fff',
        fontSize:10,
        textShadowColor:'rgba(0,0,0,0.5)',
        textShadowBlur:5,
        textShadowOffsetY:2,
        lineHeight:18,
        fontFamily:'SourceHanSansCN-Normal',
      },
      percent:{
        color:'#fff',
        fontSize:8,
        textShadowColor:'rgba(0,0,0,0.5)',
        textShadowBlur:5,
        textShadowOffsetY:2,
        fontFamily:'SourceHanSansCN-Light',
      }
    }
  },
  silent:true,
  animationDuration: 0,
  animationDurationUpdate: 1000,
  animationEasingUpdate: 'cubicOut',
}

function resize(){
  chart && chart.resize()
}

// 图表内尺寸自适应
function updateChartSize(){
  if(!chart) return
  getOption()
  chart.setOption(option,{notMerge:false})
  // 检查当前是否绘制了饼图，如果绘制了，需要更新饼图的位置
  if(currentSeriesIndex !== undefined && currentSeriesIndex >=0){
    let base_series = option.series[currentSeriesIndex*2] // 指定series
    let series = option.series[currentSeriesIndex*2+1] // 指定series
    emit('updatePie', currentSeriesIndex,  [base_series,series], currentRect)
  }
}

// 初始化
function initChart(){
  const targetDom = document.getElementById(props.domId)
  chart = echarts.init(targetDom,'shine',{renderer:'svg'})
  window.addEventListener('resize',resize)
  const svg = document.querySelector(`#${props.domId} svg`)
  svg.addEventListener('mousemove',liquidHover)
  svg.addEventListener('click',liquidSelect)

}

// 更新
function updateChart(src){
  data = src
  if(!chart) return
  chart.clear()
  const svg = document.querySelector(`#${props.domId} svg`)
  getOption()
  chart.setOption(option,{notMerge:false})
  svgEventHandle(svg)
}

// 对svg事件进行处理 波浪和光晕不可点击
function svgEventHandle(svg){
  const allG = svg.querySelector('g').querySelectorAll('g')
  allG.forEach(g=>g.style.pointerEvents = 'none')
}

let currentSeriesIndex = -1 // 当前系列索引
let currentRect = undefined // 当前包围盒
function liquidSelect(e){
  store.currentProjectIndex = currentSeriesIndex
  if(currentSeriesIndex !== undefined){
    let base_series = option.series[currentSeriesIndex*2] // 指定series
    let series = option.series[currentSeriesIndex*2+1] // 指定series
    emit('renderPie', currentSeriesIndex,  [base_series,series], currentRect)
  }
}

// 水球悬浮
function liquidHover(e){
  const svg = document.querySelector(`#${props.domId} svg`)
  const svg_g = document.querySelector(`#${props.domId} svg g`)
  const svg_children = Array.from(svg_g.children)
  const domNum = 16; // 一个svg包含16个标签
  let index = svg_children.indexOf(e.target)
  if(index<0 && ['path','g'].includes(e.target.tagName)){
    let parent = e.target.parentNode
    index = svg_children.indexOf(parent)
    if(index<0 && ['path','g'].includes(e.target.tagName)){
      let parent = e.target.parentNode.parentNode
      index = svg_children.indexOf(parent)
    }
  }

  currentSeriesIndex = undefined
  currentRect = undefined
  svg.style.cursor = 'default'
  if(index>=0){ // svg dom判断点击到了东西
    let seriesIndex = Math.floor(index/domNum)
    let path = svg_children[seriesIndex * domNum] // 目标series的范围圆
    let rect = path.getBoundingClientRect() // 范围圆的包围盒子
    let x = e.x , y = e.y;
    if(x>=rect.left && x<=rect.right && y>=rect.top && y<=rect.bottom){ // 目标在包围盒子内
      let radius = rect.width/2 // 包围圆半径
      let cx = rect.right - radius, cy = rect.bottom - radius // 圆心绝对位置
      let dx = Math.abs(x - cx) , dy = Math.abs(y - cy)
      let diff = Math.sqrt(dx*dx + dy*dy)
      if(diff <= radius){
        svg.style.cursor = 'pointer'
        currentSeriesIndex = seriesIndex // 当前激活水球
        currentRect = rect // 当前包围盒
      }
    }
  }
}

function getOption(){
  option.series = getLiquidOptions(data,SeriesOptionTemp)
}

defineExpose({
  initChart,
  updateChartSize,
  updateChart
})
onBeforeUnmount(()=>{
  window.removeEventListener('resize',resize)
  chart = null
})
</script>

<template>
  <div :id="props.domId" class="liquid-chart "></div>
</template>

<style scoped lang="scss">
.liquid-chart{
  position:absolute;
  top:1rem;
  left:1.875rem;
  right:0.9375rem;
  bottom:2.8125rem;
  z-index:3;
  filter:saturate(1.4) contrast(1.2);
  cursor: pointer;
}
</style>
