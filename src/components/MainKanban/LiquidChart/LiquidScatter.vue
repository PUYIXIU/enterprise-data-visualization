<script setup>
import {onMounted, nextTick, onBeforeUnmount, watch} from "vue";
import * as echarts from 'echarts'
import 'echarts-liquidfill'
import {useLocalDataStore} from "@/storage/index.js";
import {getLiquidOptions, resetLabel} from "@/components/MainKanban/LiquidChart/liquidChartData.js";
import {getpx} from "@/utils/style.js";

const props = defineProps(["domId",'grid'])
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
    opacity:0.15,
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
        textShadowColor:'rgba(0,0,0,0.3)',
        textShadowBlur:5,
        textShadowOffsetY:1,
        lineHeight:18,
        fontFamily:'SourceHanSansCN-Heavy',
      },
      subtitle:{
        color:'#fff',
        fontSize:10,
        textShadowColor:'rgba(0,0,0,0.3)',
        textShadowBlur:5,
        textShadowOffsetY:2,
        lineHeight:18,
        fontFamily:'SourceHanSansCN-Normal',
      },
      percent:{
        color:'#fff',
        fontSize:8,
        textShadowColor:'rgba(0,0,0,0.3)',
        textShadowBlur:5,
        textShadowOffsetY:2,
        fontFamily:'SourceHanSansCN-Light',
      },
      right:{
        color:'#00000000',
        height:20,
        backgroundColor:{
          image:'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjUiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNSAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGcgaWQ9Ikh1Z2UtaWNvbi9hcnJvd3Mvb3V0bGluZS9hcnJvdy1yaWdodCI+CjxwYXRoIGlkPSJWZWN0b3IgMTkwIiBkPSJNMTQuMzczIDE2TDE4LjM3MyAxMk0xOC4zNzMgMTJMMTQuMzczIDhNMTguMzczIDEyTDYuMzczMDUgMTIiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPC9nPgo8L3N2Zz4K'
        }
      }
    }
  },
  silent:true,
  animationDuration: 0,
  animationDurationUpdate: 1000,
  animationEasingUpdate: 'cubicOut',
  blendMode:'lighter',
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
    getCurrentPathRect() // 重新计算包围盒
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
let currentPathIndex = undefined // 当前计算包围盒的path，用于在resize时更新包围盒的尺寸
function liquidSelect(e){
  store.currentProjectIndex = currentSeriesIndex
  if(currentSeriesIndex !== undefined){
    let base_series = option.series[currentSeriesIndex*2] // 指定series
    let series = option.series[currentSeriesIndex*2+1] // 指定series
    emit('renderPie', currentSeriesIndex,  [base_series,series], currentRect)
  }
}

watch(()=>store.selectProjId,(nv,ov)=>{
  if(nv == undefined || store.showType == 0) return // 仅对表格点击有效
  // 找到currentSeriesIndex， 和它的包围盒
  currentSeriesIndex = option.series.findIndex(o=>o.uuid == nv)/2
  if(currentSeriesIndex>-1){
    // 找到目标sereis
    let base_series = option.series[currentSeriesIndex*2] // 指定series
    let series = option.series[currentSeriesIndex*2+1] // 指定series

    // 找到目标包围盒
    const svg_g = document.querySelector(`#${props.domId} svg g`)
    const svg_children = Array.from(svg_g.children)
    let path = svg_children[currentSeriesIndex * domNum] // 目标series的范围圆
    let rect = path.getBoundingClientRect() // 范围圆的包围盒子
    currentRect = rect

    emit('renderPie', currentSeriesIndex,  [base_series,series], currentRect)
  }
})

// 刷新当前目标的包围盒
function getCurrentPathRect(){
  const svg_g = document.querySelector(`#${props.domId} svg g`)
  const svg_children = Array.from(svg_g.children)
  let path = svg_children[currentPathIndex] // 目标series的范围圆
  currentRect = path.getBoundingClientRect() // 范围圆的包围盒子
}

const domNum = 21; // 一个svg包含21个标签
// 水球悬浮
function liquidHover(e){
  const svg = document.querySelector(`#${props.domId} svg`)
  const svg_g = document.querySelector(`#${props.domId} svg g`)
  const svg_children = Array.from(svg_g.children)
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
  currentPathIndex = undefined
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
        currentPathIndex = seriesIndex * domNum // 当前包围盒依赖的path在children中的index
      }
    }
  }
}

function getOption(){
  const targetDom = document.getElementById(props.domId)
  option.series = getLiquidOptions(data,SeriesOptionTemp,targetDom,props.grid)
}

// 切换模式
watch(()=>store.visitMode,(nv,ov)=>{
  if(nv==ov) return
  option.series = resetLabel(data, option.series)
  chart.setOption(option,{notMerge:false})
  console.log(option)
})

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
  <div :id="props.domId" class="liquid-chart full"></div>
</template>

<style scoped lang="scss">
.liquid-chart{
  position:absolute;
  //top:1rem;
  //left:1.875rem;
  //right:0.9375rem;
  //bottom:2.8125rem;
  z-index:3;
  filter:saturate(1.4) contrast(1.2);
  cursor: pointer;
}
</style>
