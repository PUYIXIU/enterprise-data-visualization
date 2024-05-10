<script setup>
import * as echarts from "echarts";
import {getpx} from "@/utils/style.js";
import {onBeforeUnmount} from "vue";

const props = defineProps(['domId','data'])

let chart
let option = {
  grid:{
    left:0,
    right:0,
    top:0,
    bottom:getpx(1.38),
  },
  tooltip:{
    show:true,
    trigger:'axis',
    axisPointer:{type:'shadow'},
    formatter:`
      <p style=";height:1.13rem;font-family: SourceHanSansCN-Regular;font-size:0.75rem;color: rgba(29,29,29,0.7);">{b}</p>
      <p style="margin-top:0px;height:1.13rem;color:#87ABFE;font-family: SourceHanSansCN-Regular;font-size:0.88rem;">
       <span style="margin-left:0.2rem;display: inline-block;width:0.69rem;height:0.69rem;background: #87ABFE; border-radius: 50%"></span>
       <span>数据 {c}</span>
       <span>h</span>
      </p>
    `,
    extraCssText:'box-sizing:border-box;height:3.94rem;border-radius:0.63rem;display:flex;flex-direction:column;justify-content:space-between;'
  },
  xAxis:[{
    type:'category',
    axisTick:{show:false},
    axisLabel:{
      interval:0,
      ellipsis:'...',
      overflow:'truncate',
      width:getpx(2.94),
      fontFamily:'SourceHanSansCN-Regular',
      fontSize:getpx(0.75),
      color:'#001133'
    },
    axisLine:{
      lineStyle:{
        color:'rgba(83,91,115,0.5)'
      }
    }
  }],
  yAxis:[{
    type:'value',
    splitLine:{show:false},
  }],
  series:[{
    type:'bar',
    barWidth:getpx(1.13),
    data:[1,2,3],
    itemStyle:{
      color:{type:'linear', x:0,y:0, x2:1,y2:0,
        colorStops:[
            {offset:0, color:'#95b4ff'},
            {offset:1, color:'#719AFE'},
        ]
      }
    },
    label:{
      show:true,
      position:'top',
      color:'#719AFE',
      fontFamily:'SourceHanSansCN-Regular',
      formatter:(params)=>{
        return `${params.data.value}h`
      }
    }
  }]
}

function resize(){
  option.xAxis[0].axisLabel.width = getpx(2.94)
  option.xAxis[0].axisLabel.fontSize = getpx(0.75)
  option.series[0].barWidth = getpx(1.13)
  chart && chart.resize();
  chart && chart.setOption(option,{notMerge:true});
}

function initChart(){
  chart = echarts.init(document.getElementById(props.domId))
  getOption()
  chart.setOption(option)
  window.addEventListener('resize',resize)
}

function getOption(){
  let xAxis = option.xAxis[0]
  xAxis.data = props.data.map(item=>item.name)
  let series = option.series[0]
  series.data = props.data
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
  <div class="bar-chart-wrapper" :id="domId"></div>
</template>

<style scoped lang="scss">
.bar-chart-wrapper{
  width:100%;
  height:calc(13.06rem - 1.5rem);
}
</style>
