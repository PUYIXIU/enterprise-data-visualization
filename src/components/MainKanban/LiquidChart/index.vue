<script setup>
import {ref,onBeforeMount,getCurrentInstance,onMounted} from 'vue'
import Axis from './Axis.vue'
import LiquidScatter from './LiquidScatter.vue'
import LiquidPie from './LiquidPie.vue'
import {mock_liquidData,mock_dataTypeDict} from "@/mock/liquidScatterData.js"; // 模拟数据
import {liquidColorList} from './colorConfig.js'
import {getHSL, getpx} from "@/utils/style.js";
const { proxy } = getCurrentInstance()
const navList = ref([]) // 图例列表
const chartData = ref(mock_liquidData) // 水球数据
const grid = ref({ // 坐标系栅格
  top:10,
  bottom:45,
  left:30,
  right:15,
})
const axisRange = ref({
  maxX:0,
  maxY:0,
})
/**
 * 初始化
 * 1. 初始化tooltip数据navList
 * 2. 初始化水球图数据（颜色，百分比）
 */
function initAll(){
  const targetDom = document.querySelector('.canvas')
  let colorLen = liquidColorList.length;
  navList.value = mock_dataTypeDict.map((item,index)=>{
    let color = liquidColorList[index%colorLen]
    item.color = getHSL(color.color)
    return item
  })
  // 对水球图进行处理
  let xList =  chartData.value.map(i=>i.taskNum) // x
  let yList =  chartData.value.map(i=>i.peopleNum) // y
  let maxX = Math.max(...xList) // 最大x
  let maxY = Math.max(...yList) // 最大y
  // let maxX = 0, maxY = 0
  let contentWidth = targetDom.clientWidth-grid.value.left-grid.value.right
  let contentHeight = targetDom.clientHeight-grid.value.top-grid.value.bottom
  let xUnit = contentWidth/ maxX // x单位 px
  let yUnit = contentHeight / maxY // y单位 px
  // 处理半径
  const maxR = 50, minR = 10 // 半径范围百分比
  let hours = chartData.value.map(i=>i.totalHour) // 总工时
  let minHour = Math.min(...hours)
  let maxHour = Math.max(...hours)
  chartData.value.forEach(item=>{
    item.waveValue = item.progress/100 // 50->0.5
    item.sizeValue = (item.totalHour - minHour) / (maxHour - minHour)
    item.radius = (maxR - minR)*item.sizeValue + minR

    let x = Math.ceil((item.taskNum * xUnit + item.radius/2/100*contentHeight)/xUnit)+2
    axisRange.value.maxX < x && (axisRange.value.maxX = x)

    let y = Math.ceil((item.peopleNum * yUnit + item.radius/2/100*contentHeight)/yUnit)+2
    axisRange.value.maxY < y && (axisRange.value.maxY = y)
  })

  // 计算出最上和最右的元素，以此给坐标轴定标
}

onMounted(()=>{
  initAll()
  // 延时处理rem单位转换
  setTimeout(()=>{
    grid.value.top += getpx(2.4)
    proxy.$refs.AxisRef.initChart()
    chartData.value = proxy.$refs.AxisRef.convertAxisToPixel(chartData.value)
    proxy.$refs.LiquidRef.initChart()
  },50)
})
</script>

<template>
  <div class="chart-wrapper">
    <div class="nav-head">
      <div class="tooltip-box">
        <p v-for="item in navList">
          <i :style="{'--color':item.color}"></i>
          <span>{{item.dict_label}}</span>
        </p>
      </div>
      <div class="tip-mes">【圆形面积大小代表工时数量】</div>
    </div>
    <div class="canvas">
<!--      坐标系-->
      <Axis ref="AxisRef" dom-id="axisId" :grid="grid" :axis-range="axisRange"/>
<!--      散点图-->
      <LiquidScatter ref="LiquidRef" dom-id="liquidId" :data="chartData" />
<!--      饼图-->
      <LiquidPie/>
    </div>
  </div>
</template>

<style scoped lang="scss">
$nav-header-height:1rem;
@import '@/assets/styles/global.scss';
$padding-top:1.94rem;
.chart-wrapper{
  background: #0c0c18;
  width: 100%;
  height:calc(100% - $content-header-h - $padding-top);
  background: white;
  padding-top:$padding-top;
  .nav-head{
    height:$nav-header-height;
    display: flex;
    width:100%;
    justify-content: space-between;
    font-family: SourceHanSansCN-Normal;
    font-size: 1rem;
    .tooltip-box{
      display: flex;
      filter:saturate(1.4) contrast(1.2);
      p{
        margin-right:4.75rem;
        height:1rem;
        line-height: 1rem;
        i{
          --collor:red;
          display: inline-block;
          width:1rem;
          height:1rem;
          background-color: var(--color);
          border-radius: 50%;
        }
        span{
          color: #001133;
          display: inline-block;
          width:3.88rem;
          text-align: right;
        }
      }
    }
  }
  .canvas{
    height:calc(100% - $nav-header-height);
    position:relative;
  }
}
</style>
