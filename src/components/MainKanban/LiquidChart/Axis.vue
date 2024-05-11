<script setup>
import * as echarts from 'echarts'
import {onMounted,onBeforeUnmount,ref} from "vue";
import {getpx} from "@/utils/style.js";
const props = defineProps(['domId','grid'])
const emit = defineEmits(['resize'])
let chart
let option = {
      grid:{
        ...props.grid
      },
      xAxis:[{
        type:'value',
        min:0,
        max:44,
        splitNumber:13,
        boundaryGap:[getpx(0.625),getpx(0.625)], // 两侧留白
        axisTick:{show:false},
        axisLine:{
          lineStyle:{
            color:'rgba(0,0,0,0.3)',
            width: getpx(0.12)
          }
        },
        splitLine:{
          lineStyle:{
            color:'rgba(0,0,0,0.05)',
            width: getpx(0.12)
          }
        },
        axisLabel:{
          margin:getpx(0.5),
          fontSize:getpx(0.84),

          showMaxLabel:false,
          color:'#001133',
          fontFamily:'SourceHanSansCN-Medium'
        }
      }],
      yAxis:[{
        type:'value',
        min:0,
        max:28,
        splitNumber:20,
        axisTick:{show:false},
        axisLine:{
          onZero:false,
          lineStyle:{
            color:'rgba(0,0,0,0.3)',
            width: getpx(0.12)
          }
        },
        splitLine:{
          lineStyle:{
            color:'rgba(0,0,0,0.05)',
            width: getpx(0.12)
          }
        },
        axisLabel:{
          margin:getpx(0.75),
          fontSize:getpx(0.84),

          showMinLabel:false,
          showMaxLabel:false,
          color:'#001133',
          fontFamily:'SourceHanSansCN-Medium'
        }
      }]
    }
function resize(){ // 重置大小
  if(!chart) return
  chart.resize();

  let xAxis = option.xAxis[0]
  let yAxis = option.yAxis[0]
  option.grid = {...props.grid}
  xAxis.boundaryGap = [getpx(0.625),getpx(0.625)]
  xAxis.axisLine.lineStyle.width = getpx(0.12)
  xAxis.splitLine.lineStyle.width = getpx(0.12)
  xAxis.axisLabel.margin = getpx(0.5)
  xAxis.axisLabel.fontSize = getpx(0.84)

  yAxis.boundaryGap = [getpx(0.625),getpx(0.625)]
  yAxis.axisLine.lineStyle.width = getpx(0.12)
  yAxis.splitLine.lineStyle.width = getpx(0.12)
  yAxis.axisLabel.margin = getpx(0.75)
  yAxis.axisLabel.fontSize = getpx(0.84)

  chart.setOption(option,{notMerge:false})

  setTimeout(()=>{
    emit('resize') // 通知重定位
  })
}

// 初始化
function initChart(){
  chart = echarts.init(document.getElementById(props.domId))
  chart.setOption(option)
  window.addEventListener('resize',resize)
}

// 更新图表
function updateChart(axisRange){
  if(!chart) return
  option.xAxis[0].max = axisRange[0]
  option.yAxis[0].max = axisRange[1]
  chart.setOption(option,{notMerge:false})
}

// 将气泡在坐标系中对应的坐标转换为dom容器下的坐标
function convertAxisToPixel(data){
  return data.map(node=>{
    node.center = chart.convertToPixel(
        {xAxisIndex:0, yAxisIndex:0},
        [node.x, node.y]
    )
    return node
  })
}

defineExpose({
  convertAxisToPixel,
  initChart,
  updateChart
})

onBeforeUnmount(()=>{
  window.removeEventListener('resize',resize)
  chart.dispose()
  chart = null
})
</script>

<template>
<!-- 坐标轴 -->
<div class="axis-wrapper full" :id="domId"></div>
  <!-- x轴名称 -->
<span class="axis-name x" :style="{
  '--bottom':grid.bottom + 'px',
  '--right':grid.right + 'px',
}">项目任务数量</span>
<!-- y轴名称 -->
<span class="axis-name y" :style="{
  '--top':grid.top + 'px',
  '--left':grid.left + 'px',
}">参与人数</span>
</template>

<style scoped lang="scss">
.axis-wrapper{
  position:absolute;
  z-index:1;
  top:0;
  left:0;
}
$gap:0.31rem;
.axis-name{
  position:absolute;
  z-index:2;
  font-family: SourceHanSansCN-Medium;
  font-size: 0.72rem;
  color: rgba(0,0,0,0.2);
  &.x{
    bottom:calc(var(--bottom) + $gap);
    right:var(--right);
  }
  &.y{
    top:calc(var(--top) - $gap);
    left:calc(var(--left) + $gap);
  }
}
</style>
