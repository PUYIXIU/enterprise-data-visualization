<script setup>
import * as echarts from 'echarts'
import 'echarts-liquidfill'
import {getHSL} from "@/utils/style.js";
const props = defineProps(['domId',"color",'data'])
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
let chart
let initCenter, initRadius
let pieSeriesOption = []
let option = {
  series:[]
}
function initChart(seriesList){
  liquidFillSeriesOption = seriesList
  initCenter = seriesList[0].center; initRadius = seriesList[0].radius;
  const chartDom = document.getElementById(props.domId)
  chartDom && (chart = echarts.init(chartDom))
  getOption()
  chart.setOption(option)

  setTimeout(()=>{
    updateChart()
  },0)
}

function updateChart(){
  // 更新表
  liquidFillSeriesOption.forEach(item=>{
    item.center = ['35%','50%']
  })
  getOption()
  chart.setOption(option,{notMerge:false})
}

function getOption(){
  // let liquidConfig = liquidFillSeriesOption[0]
  // let baseConfig = liquidFillSeriesOption[1]
  // let color_l = props.color.liquid
  // let data = props.data
  // liquidConfig.label.formatter = `{title|${data.totalHour}h}\n{subtitle|${data.name}}\n{subtitle|${data.progress}}{percent|%}`
  // liquidConfig.data = [data.waveValue]
  // baseConfig.data = [data.waveValue]
  // liquidConfig.center = initCenter
  // baseConfig.center = initCenter
  // liquidConfig.radius = initRadius
  // baseConfig.radius = initRadius
  // liquidConfig.itemStyle.color = getHSL(color_l.color, 100 ,color_l) // 水波颜色
  // liquidConfig.backgroundStyle.shadowColor = getHSL(color_l.color, 100) // 背景阴影颜色
  // liquidConfig.backgroundStyle.color = getHSL(color_l.color, 15) // 背景颜色
  // // 蒙版
  // baseConfig.itemStyle.shadowColor = getHSL(color_l.color, 100, color_l) // 水波阴影颜色
  // baseConfig.backgroundStyle.shadowColor = getHSL(color_l.color, 80) // 背景阴影颜色
  // baseConfig.backgroundStyle.color = getHSL(color_l.color, 15) // 背景颜色

  option.series = [
    ...liquidFillSeriesOption,
    ...pieSeriesOption
  ]
}
defineExpose({
  initChart
})
</script>

<template>
  <div :id="props.domId" class="liquid-pie-chart full"></div>
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
</style>
