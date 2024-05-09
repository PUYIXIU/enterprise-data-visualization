<script setup>
import * as echarts from 'echarts'
import {getpx} from "@/utils/style.js";
import {onBeforeUnmount,ref} from "vue";
import {ringPieColorList} from "@/components/ProjPercent/colorConfig.js";
const props = defineProps(['domId','data'])
const totalNum = ref(0)
let chart
let option = {
  grid:{
    top:0,
    bottom:0,
    left:0,
    right:0,
  },
  series:[{
    type:'pie',
    radius:['90%','100%'],
    padAngle:3,
    data:[],
    label:{show:false},
    labelLine:{show:false},
    itemStyle:{
      opacity:0.4,
    }
  }],
}
function resize(){
  chart && chart.resize();
}
function initChart(){
  chart = echarts.init(document.getElementById(props.domId))
  getOption()
  chart.setOption(option)
  window.addEventListener('resize',resize)
}

function getOption(){
  totalNum.value = 0
  const data = props.data.map((item,index)=>{
    totalNum.value += item.taskNum
    return{
      value:item.percent,
      itemStyle:{
        color:ringPieColorList[index]||'#B3B5BB'
      }
    }
  })
  option.series[0].data = data

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
  <div class="pie-wrapper">
    <div class="pie-chart inner" :id="domId">
    </div>
    <div class="pie-title inner">
      <p class="num">{{totalNum}}</p>
      <p class="text">项目总数</p>
    </div>
  </div>
</template>

<style scoped lang="scss">
.pie-wrapper{
  width: 9.25rem;
  height: 9.25rem;
  position:relative;
  .inner{
    width: 100%;
    height:100%;
    position:absolute;
    top:0;
    left:0;
  }
}
.pie-chart{
  z-index:2;
  animation: rotate 60s linear infinite;
}
@keyframes rotate{
  to{
    transform:rotateZ(360deg)
  }
}
.pie-title{
  z-index:3;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color:#001133;
  .num{
    font-size: 1.5rem;
    font-family: D-DINExp;
  }
  .text{
    font-size: 0.88rem;
    font-family: SourceHanSansCN-Medium;
  }
}
</style>
