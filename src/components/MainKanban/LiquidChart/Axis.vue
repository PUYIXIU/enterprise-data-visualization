<script setup>
import * as echarts from 'echarts'
import {onBeforeUnmount} from "vue";
import {getpx} from "@/utils/style.js";
import {useLocalDataStore} from "@/storage/index.js";
const store = useLocalDataStore()
const props = defineProps(['domId','grid'])
const emit = defineEmits(['resize'])
let chart
let option = {
      grid:{
        ...props.grid
      },
      xAxis:[{
        type:['category','value'][store.mapMode],
        min:0,
        max:44,
        splitNumber:13,
        boundaryGap:[getpx(0.625),getpx(0.625)], // 两侧留白
        axisTick:{show:false},
        data:[],
        axisLine:{
          lineStyle:{
            color:'rgba(0,0,0,0.3)',
            width: getpx(0.12)
          }
        },
        splitLine:{
          show:true,
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
        type:['category','value'][store.mapMode],
        min:0,
        max:28,
        splitNumber:20,
        axisTick:{show:false},
        data:[],
        axisLine:{
          onZero:false,
          lineStyle:{
            color:'rgba(0,0,0,0.3)',
            width: getpx(0.12)
          }
        },
        splitLine:{
          show:true,
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



function getOption(axisRange,x_category,y_category){
  let xAxis = option.xAxis[0]
  let yAxis = option.yAxis[0]
  option.grid = {
    ...props.grid
  }
  if(store.mapMode == 0){ // 均匀模式
    xAxis.type = yAxis.type = 'category'
    xAxis.axisLabel.showMaxLabel = yAxis.axisLabel.showMaxLabel = yAxis.axisLabel.showMaxLabel = true
    xAxis.data = x_category
    yAxis.data = y_category
    xAxis.max = yAxis.max = xAxis.min = yAxis.min = undefined
    xAxis.data.length == 0 && (xAxis.data = new Array(20).fill(' '))
    yAxis.data.length == 0 && (yAxis.data = new Array(20).fill(' '))
  }else{ // 全局模式
    xAxis.type = yAxis.type = 'value'
    xAxis.axisLabel.showMaxLabel = yAxis.axisLabel.showMaxLabel = yAxis.axisLabel.showMaxLabel = false
    xAxis.data = []
    yAxis.data = []
    xAxis.min = axisRange.x[0]
    xAxis.max = axisRange.x[1]
    yAxis.min = axisRange.y[0]
    yAxis.max = axisRange.y[1]

    xAxis.max == 0 && (xAxis.max = 20)
    yAxis.max == 0 && (yAxis.max = 20)

  }
}

// 更新图表
function updateChart(axisRange,x_category,y_category){
  return new Promise((resolve,reject)=>{
    if(!chart) return
    getOption(axisRange,x_category,y_category)
    chart.setOption(option,{notMerge:false})
    resolve()
  })

}

// 将气泡在坐标系中对应的坐标转换为dom容器下的坐标
function convertAxisToPixel(data){
  return data.map(node=>{
    let {x,y} = node
    if(store.mapMode == 0){ // 均匀模式
      let xValues =  option.xAxis[0].data
      let yValues =  option.yAxis[0].data
      x = xValues.findIndex(i=>i===x)
      y = yValues.findIndex(i=>i===y)
    }
    node.center = chart.convertToPixel(
        {xAxisIndex:0, yAxisIndex:0},
        [x, y]
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
  chart && chart.dispose()
  chart = null
})
</script>

<template>
<div class="axis-content-wrapper full">
  <!-- 坐标轴 -->
  <div class="axis-wrapper full" :id="domId"></div>
  <!-- x轴名称 -->
  <span class="axis-name x" :style="{
  '--bottom':grid.bottom + 'px',
  '--right':grid.right + 'px',
}">项目提交次数</span>
  <!-- y轴名称 -->
  <span class="axis-name y" :style="{
  '--top':grid.top + 'px',
  '--left':grid.left + 'px',
}" >工时</span>
</div>
</template>

<style scoped lang="scss">
.axis-wrapper,.axis-content-wrapper{
  position:absolute;
  z-index:1;
  top:0;
  left:0;
}
$gap:0.5rem;
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
    top:var(--top);
    left:calc(var(--left) + $gap);
  }
}
</style>
