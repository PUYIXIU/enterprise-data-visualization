<script setup>
import {onMounted, nextTick, onBeforeUnmount} from "vue";
import * as echarts from 'echarts'
import 'echarts-liquidfill'
import {getHSL} from "@/utils/style.js";
import {liquidColorList} from "@/components/MainKanban/LiquidChart/colorConfig.js";
const props = defineProps(["data","domId"])

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
  // silent:true,
  itemStyle:{
    color:'rgba(52,38,246,0.75)',
    opacity:0.2,
  },
  // emphasis:{
  //   itemStyle:{
  //     opacity:1,
  //   },
  // },
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
  animationDuration: 0,
  animationDurationUpdate: 1000,
  animationEasingUpdate: 'cubicOut',
}


function resize(){
  chart && chart.resize()
}


// 初始化
function initChart(){
  const targetDom = document.getElementById(props.domId)
  chart = echarts.init(targetDom,'shine',{
    renderer:'svg'
  })
  getOption()
  chart.setOption(option)
  window.addEventListener('resize',resize)
  const svg = document.querySelector(`#${props.domId} svg`)
  svg.addEventListener('mousemove',liquidHover)
  svg.addEventListener('click',liquidSelect)
}

let lastSeriesIndex = -1
let currentSeriesIndex = -1
function liquidSelect(e){
  console.log(`选中第个${currentSeriesIndex}水球`)
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
  if(index>=0){
    svg.style.cursor = 'pointer'
    let seriesIndex = Math.floor(index/domNum)
    lastSeriesIndex = currentSeriesIndex<0?seriesIndex:currentSeriesIndex // 上一个水球
    currentSeriesIndex = seriesIndex // 当前激活水球
  }else{
    svg.style.cursor = 'default'
  }
}

function getOption(){
  option.series = []
  props.data.forEach((node,index)=>{
    let seriesOption = JSON.parse(JSON.stringify(SeriesOptionTemp))
    seriesOption.label.formatter =
        `{title|${node.totalHour}h}\n{subtitle|${node.name}}\n{subtitle|${node.progress}}{percent|%}`
    /** 计算坐标位置 */
    seriesOption.center = node.center

    /** 计算半径 */
   // 半径范围 15%-45% 为0不展示
    const maxR = 50, minR = 10
    seriesOption.radius = `${(maxR - minR)*node.sizeValue + minR}%`

    /** 计算字体 */
    // 标题字体范围：30-12
    // 副标题字体范围：22-10
    // 百分号字体范围： 12-8
    // lineHeight范围 40-18
    const maxT = 30, minT = 12
    const maxS = 22, minS = 8
    const maxP = 12, minP = 8
    const maxL = 40, minL = 18
    seriesOption.label.rich.title.fontSize = (maxT - minT)*node.sizeValue + minT
    seriesOption.label.rich.subtitle.fontSize = (maxS - minS)*node.sizeValue + minS
    seriesOption.label.rich.percent.fontSize = (maxP - minP)*node.sizeValue + minP

    seriesOption.label.rich.title.lineHeight = (maxL - minL)*node.sizeValue + minL
    seriesOption.label.rich.subtitle.lineHeight = (maxL - minL)*node.sizeValue + minL

    /** 水波进度 */
    seriesOption.data = [node.waveValue]
    seriesOption.silent = true

    /** 波浪颜色 */
    const {color,h_add,s_add,l_add} = liquidColorList[node.type]
    seriesOption.itemStyle.color = getHSL(color, 100,{h_add,s_add,l_add})
    seriesOption.backgroundStyle.shadowColor = getHSL(color, 100)
    seriesOption.backgroundStyle.color = getHSL(color, 20)

    // 基底蒙版
    const baseOption = JSON.parse(JSON.stringify(seriesOption))
    baseOption.name = 'base'
    baseOption.backgroundStyle.color = getHSL(color, 20,{h_add,s_add,l_add})
    baseOption.backgroundStyle.shadowColor =  getHSL(color, 100,{h_add,s_add,l_add})
    baseOption.backgroundStyle.shadowOffsetX = 0
    baseOption.backgroundStyle.shadowOffsetY = 0
    baseOption.backgroundStyle.shadowBlur = 15
    baseOption.label = {show:false}
    baseOption.data = [node.waveValue]
    baseOption.silent = true
    // 根据排列顺序渲染层级
    seriesOption.z = index
    baseOption.z = index
    option.series.push(baseOption)
    option.series.push(seriesOption)
  })
}

defineExpose({
  initChart
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
  top:0;
  left:0;
  z-index:3;
  filter:saturate(1.4) contrast(1.2);
  cursor: pointer;
}
</style>
