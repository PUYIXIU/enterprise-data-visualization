<script setup>
import DrawerBox from './DrawerBox'
import TaskHourBar from './TaskHourBar'
import TaskGant from './TaskGant'
import TaskProgress from './TaskProgress'
import gsap from 'gsap'
import {ref, onMounted, getCurrentInstance, watch, onBeforeUnmount,nextTick} from "vue";

import {mockData as taskHourBarMockData} from './TaskHourBar/mockData.js'
import {mockData as taskGantMockData} from './TaskGant/mockData.js'
import {MockProgressTimelineData as TaskProgressMockData} from './TaskProgress/mockData.js'
import {MockProgressTimelineData} from "@/components/Drawer/TaskProgress/mockData.js";
import {useLocalDataStore} from "@/storage/index.js";
const props = defineProps(['domId'])

const store = useLocalDataStore()
const {proxy} = getCurrentInstance()
const taskHourBarData = ref(taskHourBarMockData)
const taskGantData = ref(taskGantMockData)
const taskProgressData = ref(TaskProgressMockData)

const visible = ref(false)
onMounted(()=>{
  proxy.$refs.TaskHourBarRef.initChart()
  proxy.$refs.TaskProgressRef.init()
})

watch(()=>store.currentProjectIndex,(nv,ov)=>{
  if(nv == undefined) return
  setTimeout(()=>{
    !visible.value && expand()
  })
})


function expand(){
  console.log('展开')
  visible.value = true
  setTimeout(()=>{
    window.addEventListener('click',clickCheck)
  },300)
}

function collapse(){
  console.log('收回')
  visible.value = false
  store.currentProjectIndex = undefined
  window.removeEventListener('click',clickCheck)
}

function clickCheck(e){
  const target = document.getElementById(props.domId)
  const r = target.getBoundingClientRect() // 获取包围盒
  const x = e.x, y = e.y;
  if(x >= r.left && x <= r.right){ // 鼠标在x范围内
    if(y>= r.top && y<= r.bottom){ // 鼠标在y范围内
      console.log('抽屉收回')
      return
    }
  }
  collapse()
}

</script>

<template>
  <div class="drawer-wrapper" :class="{'expand':visible}" :id="domId">
    <h3>项目详情</h3>
    <drawer-box title="任务工时" height="15.69rem">
      <task-hour-bar ref="TaskHourBarRef" :data="taskHourBarData" dom-id="task-hour-bar-id" />
    </drawer-box>
    <drawer-box title="任务甘特图" height="11.19rem">
      <task-gant ref="TaskGantRef" :data="taskGantData" dom-id="task-gant-id" />
    </drawer-box>
    <drawer-box title="任务进度" height="24.5rem" style="background-color:rgba(255, 255, 255)">
      <task-progress ref="TaskProgressRef" :data="taskProgressData" dom-id="task-progress-id" />
    </drawer-box>
  </div>
</template>

<style scoped lang="scss">
.drawer-wrapper{
  &.expand{
    transform: translateX(0%);
  }
  transition-property: transform;
  transition-duration: 0.3s;
  transition-timing-function: ease-in-out;
  transform: translateX(100%);
  position:absolute;
  z-index:4;
  right:0.38rem;
  top:4.22rem;
  width: 60rem;
  height: 58.44rem;
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

  overflow: hidden;
}

h3{
  color: #001133;
  font-weight: 400;
  font-size: 1.5rem;
  font-family: 时尚中黑简体;
  margin-bottom: 1.5rem;
  padding-left:0.75rem;
}
</style>
