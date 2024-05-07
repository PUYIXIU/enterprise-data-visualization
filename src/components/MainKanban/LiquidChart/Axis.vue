<script setup>
import * as echarts from 'echarts'
import {onMounted,onBeforeUnmount,ref} from "vue";
import {getpx} from "@/utils/style.js";
const props = defineProps(['domId','grid','axisRange'])
let chart
let option
function resize(){
  chart && chart.resize();
}

function initChart(){
  chart = echarts.init(document.getElementById(props.domId))
  option = {
    grid:{
      ...props.grid
    },
    xAxis:[{
      type:'value',
      min:0,
      max:props.axisRange.maxX,
      splitNumber:13,
      boundaryGap:[10,10], // 两侧留白
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
      max:props.axisRange.maxY,
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
  chart.setOption(option)
  window.addEventListener('resize',resize)
}

// 将气泡在坐标系中对应的坐标转换为dom容器下的坐标
function convertAxisToPixel(data){
  return data.map(node=>{
    node.center = chart.convertToPixel(
        {xAxisIndex:0, yAxisIndex:0},
        [node.taskNum, node.peopleNum]
    )
    return node
  })
}

defineExpose({
  convertAxisToPixel,
  initChart
})

onBeforeUnmount(()=>{
  window.removeEventListener('resize',resize)
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
