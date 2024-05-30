<script setup>
import DrawerBox from './DrawerBox'
import TaskHourBar from './TaskHourBar'
import TaskGant from './TaskGant'
import TaskProgress from './TaskProgress'
import gsap from 'gsap'
import {ref, onMounted, getCurrentInstance, watch, onBeforeUnmount,nextTick} from "vue";
import request from '@/utils/request.js'
import {mockData as taskHourBarMockData} from './TaskHourBar/mockData.js'
import {mockData as taskGantMockData} from './TaskGant/mockData.js'
import {colorMap, MockProgressTimelineData as TaskProgressMockData} from './TaskProgress/mockData.js'
import {MockProgressTimelineData} from "@/components/Drawer/TaskProgress/mockData.js";
import {useLocalDataStore} from "@/storage/index.js";
import {filterBarData, filterGantData, filterTimelineData} from "@/utils/dataFilter.js";
import {ElMessage} from "element-plus";
const props = defineProps(['domId'])

const store = useLocalDataStore()
const {proxy} = getCurrentInstance()
const taskGantData = ref(taskGantMockData)
const taskProgressData = ref(TaskProgressMockData)

const visible = ref(false)

// 监听当前选中的项目id
watch(()=>store.selectProjId,(nv,ov)=>{
  if(nv == undefined) return
  setTimeout(()=>{
    !visible.value && expand(nv)
  })
})

// 监听当前详情选中的时间范围
watch(()=>store.infoFilterDay,(nv,ov)=>{
  if(store.selectProjId == undefined || nv == ov ) return // 没有选中id返回
  initAll(store.selectProjId, true)
})

// 获取柱状图数据
const selectProjectBarChartDetails = params => request.get('/erp/visualize/selectProjectBarChartDetails',{params})
function getTaskHourBarData(projId, filterTime){
  // 获取柱状图数据，传项目id 和时间长度
  return selectProjectBarChartDetails({erpProjectId:projId, filterDay:filterTime}).then(res=>{
    res.data = filterBarData(res.data)
    proxy.$refs.TaskHourBarRef.initChart(res.data)
    if(window.debugModeEnable){
      console.group('请求任务详情柱状图数据:',projId)
      console.log(res)
      console.groupEnd()
    }
  })
}

// 获取项目甘特图数据
const selectProjectGanttChartDetails = params => request.get('/erp/visualize/selectProjectGanttChartDetails',{params})
function getTaskGantData(projId){
  return selectProjectGanttChartDetails({erpProjectId:projId}).then(res=>{
    res.data = filterGantData(res.data)
    proxy.$refs.TaskGantRef.dataReady(res.data)
    if(window.debugModeEnable){
      console.group('请求项目甘特图数据:',projId)
      console.log(res)
      console.groupEnd()
    }
  })
}

// 获取任务进度数据
const selectTaskProgress = params => request.get('/erp/visualize/selectTaskProgress',{params})

function getTaskProgressData(projId, filterTime){
  return selectTaskProgress({erpProjectId:projId, filterDay:filterTime}).then(res=>{
    if(window.debugModeEnable){
      console.group('请求任务进度数据:',projId)
      console.log(res)
      console.groupEnd()
    }
    res.data = filterTimelineData(res.data)
    return res.data
  })
}

// 初始化所有数据 projId 项目id， isPartly 是否是局部时间过滤
function initAll(projId, isPartly=false){
  store.loading = true
  let filterTime = isPartly?store.infoFilterDay:store.timeRange
  Promise.all([
    getTaskHourBarData(projId, filterTime),
    isPartly?Promise.resolve():getTaskGantData(projId), // 项目gant图数据，局部刷新时不请求
    getTaskProgressData(projId, filterTime),
  ]).then(res=>{
    proxy.$refs.TaskProgressRef.init(res[2],filterTime)
    store.loading = false
  }).catch(err=>{
    ElMessage({
      type: 'error',
      message: err.message
    })
    store.loading = false
  })
}

function expand(projId){
  visible.value = true
  initAll(projId)
  setTimeout(()=>{
    window.addEventListener('click',clickCheck)
  },300)
}

function collapse(){
  visible.value = false
  store.currentProjectIndex = undefined
  store.selectProjId = undefined
  proxy.$refs.TaskHourBarRef.dispose()
  proxy.$refs.TaskGantRef.dispose()
  proxy.$refs.TaskProgressRef.dispose()
  window.removeEventListener('click',clickCheck)
}

function clickCheck(e){
  const target = document.getElementById(props.domId)
  const r = target.getBoundingClientRect() // 获取包围盒
  const x = e.x, y = e.y;
  // 鼠标在抽屉内
  if(x >= r.left && x <= r.right){ // 鼠标在x范围内
    if(y>= r.top && y<= r.bottom){ // 鼠标在y范围内
      return
    }
  }
  // 鼠标在版头内
  const navHeadDom = document.getElementById("nav-head-dom")
  if(navHeadDom.contains(e.target)) return
  collapse()
}

onMounted(()=>{
  // expand(123)
})

</script>

<template>
  <div class="drawer-wrapper" :class="{'expand':visible}" :id="domId">
    <p class="tooltip-p">（可点击空白区域退出）</p>
    <div class="drawer-inner full">
      <h3>项目详情</h3>
      <drawer-box class="gant-box" title="项目甘特图" height="9.5rem">
        <task-gant ref="TaskGantRef" dom-id="task-gant-id" />
      </drawer-box>
      <drawer-box title="任务工时" height="15.69rem">
        <task-hour-bar ref="TaskHourBarRef" dom-id="task-hour-bar-id" />
      </drawer-box>
      <drawer-box id="progress-wrapper-dom" title="任务进度" height="30.5rem"  :tooltip="{width:400, context:'按住Shift+滚轮缩放，左右拖动查看更多数据'}" style="background-color:rgba(255, 255, 255)">
        <div class="progress-tooltip-box">
          <p class="tool-tip-item"
             v-for="([key,value]) in Object.entries(colorMap)"
             :style="{
               '--color':value.mainColor,
               '--color1':value.mainColor+'77',
             }">
            <span class="tool-tip-icon"></span>
            <span class="tool-tip-text">{{key}}</span>
          </p>
        </div>
        <task-progress ref="TaskProgressRef" dom-id="task-progress-id" />
      </drawer-box>
    </div>
  </div>
</template>

<style scoped lang="scss">
@import '@/assets/styles/global.scss';
.drawer-wrapper{
  &.expand{
    transform: translateX(0%);
    .tooltip-p{
      position:absolute;
      left:-2rem;
      top:1rem;
      transform:translateX(-100%);
      color: #4971D7;
      font-size: 1rem;
      font-family: SourceHanSansCN-Regular;
      opacity: 1;
    }
  }
  .tooltip-p{
    opacity: 0;
  }
  transition-property: transform;
  transition-duration: 0.3s;
  transition-timing-function: ease-in-out;
  transform: translateX(100%);
  position:absolute;
  z-index:998;
  right:0.38rem;
  top:4.22rem;
  width: 60rem;
  width: 60rem;
  //height: 58.44rem;
  height: $main-kanban-h;
}
.drawer-inner{
  overflow: hidden;
  background: linear-gradient( 90deg, #e6ecfc 0%, rgba(33, 51, 98, 0) 100%);
  backdrop-filter: blur(0.75rem);
  filter:drop-shadow(-1px 0px 0.5rem rgba(217, 226, 255, 0.2));
  box-shadow:
      0rem 0rem 0.1rem 0.05rem rgba(230, 235, 255, 0.8),
      0.1rem 0rem 0.3rem 0rem rgba(153, 182, 250, 0.5),
      0.2rem 0.25rem 1.25rem 0rem rgba(145, 177, 255, 0.25),
      0.4rem 0.25rem 2.5rem 0rem rgba(149, 179, 253, 0.15);
  border-radius: 1rem 0.1rem 0.1rem 1rem;

  box-sizing: border-box;
  padding-top:1.06rem;
  padding-left:1.88rem;
  padding-right:1.13rem;
  padding-bottom:1.19rem;
}

h3{
  color: #001133;
  font-weight: 400;
  font-size: 1.4rem;
  font-family: SourceHanSansCN-Regular;
  margin-bottom: 0.75rem;
  padding-left:0.75rem;
}

.gant-box{
  padding-top:1rem !important;
}

$tip-size:0.75rem;
.progress-tooltip-box{
  position:absolute;
  z-index:998;
  display: flex;
  transform:translateY(-100%);
  right:1.5rem;
  .tool-tip-item{
    display: flex;
    align-items: center;
    font-size: $tip-size;
    margin-left:2rem;
    span{display: inline-block}
    .tool-tip-icon{
      background: linear-gradient(-45deg, var(--color), var(--color1));
      width:$tip-size;
      height:$tip-size;
      margin-right:0.25rem;
      border-radius: 30%;
    }
    .tool-tip-text{
      color:var(--color);
      font-family: SourceHanSansCN-Normal;
    }
  }
}
</style>
