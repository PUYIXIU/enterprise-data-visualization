<script setup>
import * as echarts from "echarts";
import {getpx} from "@/utils/style.js";
import {onBeforeUnmount, ref} from "vue";

const props = defineProps(['domId'])

let chart
let dataLength = ref(0)
let pageNum = 1 // 整体页数
let currentPage = 0 // 当前页数
let pageSize = 10 // 一页的个数
let option = {
  grid:{
    left:0,
    right:0,
    top:getpx(1.38),
    bottom:getpx(1.5),
  },
  tooltip:{
    show:true,
    trigger:'axis',
    axisPointer:{
      type:'shadow',
      axis:'x'
    },
    formatter:`
      <p style="line-height:1rem;height:1rem;font-family: SourceHanSansCN-Regular;font-size:0.75rem;color: rgba(29,29,29,0.7);">{b}</p>
      <p style="margin-top:0px;height:1.5rem; line-height:1.5rem;color:#87ABFE;font-family: SourceHanSansCN-Regular;font-size:0.88rem;">
       <span style="margin-left:0.2rem;display: inline-block;width:0.69rem;height:0.69rem;background: #87ABFE; border-radius: 50%"></span>
       <span>数据 {c}</span>
       <span>h</span>
      </p>
    `,
    extraCssText:'box-sizing:border-box;height:3.94rem;border-radius:0.63rem;display:flex;flex-direction:column;justify-content:space-between;'

  },
  dataZoom:[{
    disabled:true,
    type:'inside',
    xAxisIndex:0,
    zoomLock:true,
  }],
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
      fontSize:getpx(0.75),
      fontFamily:'SourceHanSansCN-Regular',
      formatter:(params)=>{
        return `${params.data.value}h`
      }
    }
  }]
}

function resize(){
  option.grid.top = getpx(1.38)
  option.grid.bottom = getpx(1.5)
  option.xAxis[0].axisLabel.fontSize = getpx(0.75)
  option.series[0].barWidth = getpx(1.13)
  option.series[0].label.fontSize = getpx(0.75)
  if(dataLength.value>16){
    option.xAxis[0].axisLabel.width = getpx(2.94)
  }else{
    let canvas = document.getElementById(props.domId)
    let width = canvas.clientWidth / (dataLength.value || 1)
    option.xAxis[0].axisLabel.width = width * 0.8
  }
  chart && chart.resize();
  chart && chart.setOption(option,{notMerge:true});
}

function initChart(data){
  if(!chart){ // 初次创建
    chart = echarts.init(document.getElementById(props.domId))
    window.addEventListener('resize',resize)
  }
  dataLength.value = data.length
  pageNum = Math.ceil(dataLength.value/pageSize) // 计算页数
  currentPage = 0 // 重置当前页
  getOption(data)
  chart.setOption(option,{notMerge:true})
}

function getOption(data){
  let xAxis = option.xAxis[0]
  xAxis.data = data.map(item=>item.name)
  let series = option.series[0]

  if(dataLength.value>pageSize){ // 数据量大于10，启用dataZoom
    option.dataZoom[0].disabled = false
    option.dataZoom[0].startValue = 0
    option.dataZoom[0].endValue = pageSize-1
    option.xAxis[0].axisLabel.width = getpx(4)
  }else{// 数据量不大于16，禁用dataZoom，并且动态计算axis-label
    let canvas = document.getElementById(props.domId)
    let width = canvas.clientWidth / (dataLength.value || 1)
    option.xAxis[0].axisLabel.width = width * 0.8
    option.dataZoom[0].disabled = true
  }
  series.data = data
}

// 换页
function changePage(add){
  let newPage = currentPage + add
  if(newPage<0) newPage = pageNum - 1
  currentPage = newPage%pageNum
  option.dataZoom[0].startValue = pageSize * currentPage
  option.dataZoom[0].endValue = pageSize * (currentPage+1) - 1
  chart.setOption(option,{notMerge:true})
}

// 销毁表格
function dispose(){
  window.removeEventListener('resize',resize)
  chart && chart.dispose()
  chart = null
}

defineExpose({
  initChart,
  dispose
})

</script>

<template>
  <div class="bar-chart-wrapper" :id="domId"></div>
  <svg v-if="dataLength>pageSize" @click="changePage(-1)" class="arrow-icon left" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="100" height="100">
    <path d="M297.813333 491.648l1.365334-1.749333 379.093333-376.149334a38.784 38.784 0 0 1 5.077333-4.096 34.346667 34.346667 0 0 1 14.293334-4.992c2.218667-0.170667 2.176-0.170667 4.394666-0.170666a33.493333 33.493333 0 0 1 14.549334 4.181333c12.330667 6.997333 18.688 21.76 15.274666 35.498667-1.237333 5.077333-7.04 13.44-7.04 13.44l-355.498666 352.853333 354.090666 354.389333s6.272 7.978667 7.893334 12.928a32.213333 32.213333 0 0 1-33.749334 41.557334c-6.656-0.682667-17.749333-7.68-17.749333-7.68l-379.221333-377.984-1.28-1.450667a30.378667 30.378667 0 0 1-7.893334-17.749333 31.018667 31.018667 0 0 1 3.712-18.602667 27.221333 27.221333 0 0 1 2.688-4.224z" p-id="2657"></path>
  </svg>
  <svg v-if="dataLength>pageSize" @click="changePage(1)" class="arrow-icon right" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="100" height="100">
    <path d="M297.813333 491.648l1.365334-1.749333 379.093333-376.149334a38.784 38.784 0 0 1 5.077333-4.096 34.346667 34.346667 0 0 1 14.293334-4.992c2.218667-0.170667 2.176-0.170667 4.394666-0.170666a33.493333 33.493333 0 0 1 14.549334 4.181333c12.330667 6.997333 18.688 21.76 15.274666 35.498667-1.237333 5.077333-7.04 13.44-7.04 13.44l-355.498666 352.853333 354.090666 354.389333s6.272 7.978667 7.893334 12.928a32.213333 32.213333 0 0 1-33.749334 41.557334c-6.656-0.682667-17.749333-7.68-17.749333-7.68l-379.221333-377.984-1.28-1.450667a30.378667 30.378667 0 0 1-7.893334-17.749333 31.018667 31.018667 0 0 1 3.712-18.602667 27.221333 27.221333 0 0 1 2.688-4.224z" p-id="2657"></path>
  </svg>
</template>

<style scoped lang="scss">
.bar-chart-wrapper{
  width:100%;
  height:calc(13.06rem - 1.5rem);
}
$icon-gap:0.75rem;
$icon-size:1.2rem;
.arrow-icon{
  position:absolute;
  top:50%;
  width:$icon-size;
  height:$icon-size;
  cursor: pointer;
  transform-origin: center;
  transition-property: transform;
  transition-duration: 0.1s;
  &.left{
    left:$icon-gap;
    &:hover{
      transform:scale(1.2);
    }
  }
  &.right{
    right:$icon-gap;
    transform:rotateZ(180deg);
    &:hover{
      transform:scale(1.2) rotateZ(180deg);
    }
  }
  path{
    stroke-width:20;
    stroke: #86a9fd;
    fill: #86a9fd;
    transition-property: fill,stroke;
    transition-duration: 0.1s;
  }
  &:hover{
    path{
      stroke: #4b486e;
      fill: #4b486e;

    }
  }
}
</style>
