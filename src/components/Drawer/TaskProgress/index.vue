<script setup>
import {colorList} from "./mockData.js";
import {onMounted, ref,nextTick} from "vue";
import request from '@/utils/request.js'

const props = defineProps(['domId'])

import 'moment/dist/locale/zh-cn.js'
import  'dayjs/locale/zh-cn.js'

import * as vis from "vis-timeline";
import VisData from 'vis-data/dist/esm.js'
import dayjs from "dayjs";
import {filterHourListData} from "@/utils/dataFilter.js";
import QueryBox from "@/components/QueryBox/index.vue";
import WindowLoading from "@/components/Loading/WindowLoading.vue";
import {getpx} from "@/utils/style.js";
import Empty from "@/components/Loading/Empty.vue";
import {useLocalDataStore} from "@/storage/index.js";

const store = useLocalDataStore()

const domId = ref('progress-timeline')
let contentHeight = 0 //动态计算高度

const groupData = new VisData.DataSet()
const itemData = new VisData.DataSet()
let timeline = null
let timeLineData = []
let hourMap = {}

let renderedList = [] //已经渲染的列表
let renderGroupIds = [] // 已经渲染的groupId
let counter = 0
let loading = ref(true)
let isEmpty = ref(false)
let filterDay = null // 接口筛选的时间

// 清空所有数据
function dispose(){
  try{
    timeline && timeline.destroy()
  }catch(e){console.log('销毁vis-timeline时报错')}
  groupData && groupData.clear()
  itemData && itemData.clear()
  timeLineData = []
  renderGroupIds = []
  hourMap = {}
  counter = 0 // id计数器
  contentHeight = 0 // 容器高度需要重新计算
  isEmpty.value = false // 是否为空重新计算
  filterDay = null
}

const progressGroupClassName = 'progress-group' // 进度条分组标识
const barGroupClassName = 'bar-group' // 柱状图分组标识
const progressItemClassName = 'progress-item' // 进度条节点标识
const barItemClassName = 'bar-item' // 柱状图节点标识

// 为bar类型的组添加DataSet
function createBarItemData(groupId, params){
  params.hourList.forEach((day,dayIndex)=>{
    let end = dayjs(day[0]).add(1,'day').format('YYYY-MM-DD')
    let height = Math.min(100,day[1]/params.maxHour*100 + 3) // 根据最大工时，计算百分比
    itemData.add({
      id:`${groupId}-${params.id}-${day[0]}`,
      className:`${barItemClassName} height-${height} id-${groupId}-${params.id}-${dayIndex}`,
      group:groupId,
      start:day[0],
      end:end,
      content:''
    })
  })
}

// 移除所有bar
function removeBarItemData(groupId,params){
  params.hourList.forEach((day,dayIndex)=>{
    itemData.remove(`${groupId}-${params.id}-${params.id}-${day[0]}`)
    let id = `${groupId}-${params.id}-${dayIndex}`
    let index = renderedList.findIndex(i=>i==id)
    renderedList.splice(index,1)
  })

}

// 为progress类型的组添加DataSet
function createProgressItemData(groupId, params){
  let end = dayjs(params.endTime).add(1,'day').format('YYYY-MM-DD')
  itemData.add({
    id:counter++,
    className:`${progressItemClassName}  task-${params.id}`,
    group:groupId,
    start:params.startTime,
    end:end,
    content:""
  })
}

// 设置bar类型的样式
function setBarStyle(){
  const groups = document.querySelectorAll(`.vis-foreground .vis-group.${barGroupClassName}:not(.expand)`)

  for(let i =0; i<groups.length;i++){
    let group = groups[i]
    group.classList.add('expand')
    let color = Array.from(group.classList)
        .find(i=>/color/.test(i))
        .split('-')[1]
    group.style.setProperty('--bar-top-color',setOpacity(color,0.9))
    group.style.setProperty('--bar-bottom-color',setOpacity(color,0.1))

    const nodes = group.querySelectorAll(`.${barItemClassName}`)
    if(!nodes.length) break; // 当前元素没渲染出来
    // let showNodeLength = 0  // 真正进行展示的元素数量
    // for(let i = 0;i<nodes.length;i++){
    //   let node = nodes[i]
    //   let x = parseFloat(node.style.transform.split('(')[1])
    //   // if(x<-2.73254) break
    //   if(x>=0) showNodeLength++
    // }
    let showNodeLength = nodes.length // 真正进行展示的元素数量

    for(let i =0; i<nodes.length;i++){
      let node = nodes[i]
      let id = Array.from(node.classList).
      find(i=>/id-/.test(i))
      let height =Number(
          Array.from(node.classList).
          find(i=>/height/.test(i)).
          split('-')[1]
      )
      node.style.height = `${height}%`

      if(renderedList.includes(id)){
        // 已经绘制，检测是否是最后一个元素
        if(i<showNodeLength-1){ // 不是最后一个元素但有label
          let label = node.querySelector('.label')
          label && label.remove()
        }
        continue;
      }
      renderedList.push(id)
      if(i == showNodeLength-1){ // 最后一个
        let info = Array.from(group.classList).find(i=>/person/.test(i)).split('-')
        let name = info[1]
        let hour = info[2]
        let label = getDiv('label')
        label.innerHTML = `${name} <p>${hour}<span>h</span></p>`
        node.append(label)
      }
    }
  }
}

// 自定义表头样式
function setHeadStyle(){
// 添加任务进度和任务名称字样
  const node = document.querySelector('.vis-timeline')
  const headWrapper = getDiv('head-wrapper')
  const headTitle = getDiv('head-title')
  const headText = getDiv('head-text')
  headText.innerHTML = '任务名称'
  headWrapper.append(headTitle)
  headTitle.append(headText)
  node.append(headWrapper)
}

function getDiv(className){
  const dom =  document.createElement('div')
  dom.className = className
  return dom
}

function setOpacity(color, opacity){
  return `${color}${Math.ceil(255*opacity).toString(16)}`
}

// 获取进度条Dom
function getProgressDom(param){
  let progressWrapper = getDiv('progress-wrapper')
  let backProgress =  getDiv('back-progress')
  let backRow1 =  getDiv('back-row-1')
  let backRow2 =  getDiv('back-row-2')
  let foreProgress =  getDiv('fore-progress')
  let foreRow1 =  getDiv('fore-row-1')
  let foreRow2 =  getDiv('fore-row-2')
  backProgress.append(backRow1, backRow2) // 进度基底
  foreProgress.append(foreRow1,foreRow2) // 进度前景
  progressWrapper.append(backProgress, foreProgress) // 整个进度容器

  progressWrapper.style.setProperty(
      '--back-row-1-bg',
      setOpacity(param.color.mainColor,0.3)
  )
  progressWrapper.style.setProperty(
      '--back-row-2-bg',
      setOpacity(param.color.mainColor,0.6)
  )
  progressWrapper.style.setProperty(
      '--fore-row-1-bg',
      setOpacity(param.color.mainColor,0.8)
  )

  foreProgress.style.width = `${param.progress}%` // 实际进度百分比
  // param.children.forEach(person=>{
  //   let foreCell = getDiv('fore-cell')
  //   foreRow2.append(foreCell)
  //   foreCell.style.width = `${person.percent}%` // 工时占比
  //   foreCell.style.setProperty(
  //       '--fore-cell-bg',
  //       setOpacity(person.color,0.9)
  //   )
  // })

  return progressWrapper
}

// 根据任务id请求任务进度人员详情
const selectTaskProgressStaffDetails = params => request.get('/erp/visualize/selectTaskProgressStaffDetails',{params})
function getHourListByTaskId(id){
  if(hourMap[id]) return Promise.resolve(hourMap[id])
  return selectTaskProgressStaffDetails({taskId:id,filterDay:filterDay}).then(res=>{
    if(window.debugModeEnable){

    }
    res.data = filterHourListData(res.data)
    hourMap[id] = res.data
    if(window.debugModeEnable){
      console.group('请求任务进度人员详情',id)
      console.log(res.data)
      console.groupEnd()
    }
    return hourMap[id]
  })
}

let barRowHeightRem = 1.5
// 返回进度条被点击的回调函数
function progressClick(data){
  return async (e)=>{
    loading.value = true
    nextTick(async ()=>{
      let index = renderGroupIds.findIndex(i=>i == data.id)
      let barHeight = getpx(barRowHeightRem)
      if(index>=0){
        renderGroupIds.splice(index,1) // 删掉这个id
        let hourData = hourMap[data.id]
        hourData.forEach(person=>{
          groupData.remove(`${data.id}-${person.id}`)
          removeBarItemData(data.id,person)
        })
        setContentHeight(contentHeight - barHeight * hourData.length)
        timeline.setGroups(groupData)
        removeProgressForeRow2(data.id)
        loading.value = false
        return
      }
      let hourData = await getHourListByTaskId(data.id)
      renderGroupIds.push(data.id)
      let subColor = data.color.subColor
      hourData.forEach((person,personIndex)=>{
        const color = subColor[personIndex % subColor.length]
        person.color = color
        person.value = data.value + personIndex + 1
        const groupOption = {
          id:`${data.id}-${person.id}`,
          value:person.value,
          className:`
          ${barGroupClassName}
          person-${person.name}-${person.totalHour}
          color-${person.color}
          `,
          content:``,
        }
        groupData.add(groupOption)
        createBarItemData(groupOption.id, person)
      })
      timeline.setGroups(groupData)
      timeline.on('changed',hourListExpand)
      refreshProgressStyle(data.id, hourData) // 更新进度条样式
      setContentHeight(contentHeight + barHeight * hourData.length)
    })
  }
}

// 设置progress类型的样式
function setProgressStyle(){
  const nodes = document.querySelectorAll(`.${progressItemClassName}`)
  for(let i =0; i<nodes.length;i++){
    let node = nodes[i]
    let id =Array.from(node.classList).
    find(i=>/task/.test(i)).
    split('-')[1]
    let data = timeLineData.find(i=>i.id == id) // 找到对应数据
    const nodeContent = node.querySelector('.vis-item-content')
    const content = getProgressDom(data)
    nodeContent.innerHTML = ''
    nodeContent.append(content)
    nodeContent.onclick = progressClick(data)  // 绑定进度条被点击函数
    nodeContent.onmouseenter = progressHover(data) // 绑定进度条被hover事件
    nodeContent.onmousemove = progressMove // 进度条随鼠标移动
    nodeContent.onmouseleave = progressLeave // 进度条随鼠标移动
    const label = getDiv('label')
    label.innerHTML = `${data.erpTaskTotalHours} <span>h</span>`
    node.append(label)
  }
}

function removeProgressForeRow2(id){
  let wrapper = document.querySelector(`.${progressItemClassName}.task-${id}`)
  let foreRow2 = wrapper.querySelector('.fore-row-2') // 目标容器
  foreRow2.innerHTML = ''
}

// 更新progress类型的样式
function refreshProgressStyle(id, params){
  // progress-item  task-1787287822901403649
  let wrapper = document.querySelector(`.${progressItemClassName}.task-${id}`)
  let foreRow2 = wrapper.querySelector('.fore-row-2') // 目标容器
  params.forEach(person=>{
      let foreCell = getDiv('fore-cell')
      foreRow2.append(foreCell)
      foreCell.style.width = `${person.percent}%` // 工时占比
      foreCell.style.setProperty(
          '--fore-cell-bg',
          setOpacity(person.color,0.9)
      )
  })
}

// 某个工时被点开了
function hourListExpand(){
  setBarStyle() // 更新柱状图样式
  timeline.off('changed',hourListExpand) // 卸载事件
  loading.value = false
}

const toolTipData = ref({
  show:false,
  predictProgress:0, // 预计进度
  participantCount:0, // 参与人数
  progress:0, // 实际进度
  left:0, // 左侧
  top:0, // 右侧
})
function progressHover(data){
  return e=>{
    toolTipData.value.show = true
    toolTipData.value.predictProgress = data.predictProgress
    toolTipData.value.participantCount = data.participantCount
    toolTipData.value.progress = data.progress
  }
}
function progressMove(e){
  // 任务进度的外层定位容器
  let wrapper = document.querySelector('#progress-wrapper-dom')
  let rect = wrapper.getBoundingClientRect()
  let baseTop = rect.top
  let baseLeft = rect.left
  toolTipData.value.top = e.clientY - baseTop
  toolTipData.value.left = e.x - baseLeft
}
function progressLeave(e){
  toolTipData.value.show = false
}

// 绑定事件
function addEvent(){
  let content = document.querySelector('.vis-timeline')
  let originHeight = parseFloat(content.style.height); // 原始高度
  contentHeight = Math.max( getpx(4) * 5 ,originHeight)
  content.style.setProperty('--content-height',contentHeight + 'px')
  content.classList.add('fix-height')
}

function setContentHeight(height){
  let content = document.querySelector('.vis-timeline')
  contentHeight = height
  content.style.setProperty('--content-height',contentHeight + 'px')
}
// 初始化时间轴表格
function init(src,filterTime){
  dispose()
  filterDay = filterTime
  timeLineData = src
  if(src.length == 0){
    isEmpty.value = true
    loading.value = false
    return
  }
  isEmpty.value = false
  const targetDom = document.getElementById(domId.value)
  let baseValue = 1000 // 用于做基类，方便在group基值之间插入新组
  let min = dayjs() // 最早时间
  let max = dayjs()  // 最晚时间
  timeLineData.forEach((task,taskIndex)=>{
    // 添加总进度条
    const mainColor = colorList[taskIndex%colorList.length] // 领取颜色
    task.color = mainColor
    task.value = baseValue * taskIndex

    let groupStart = dayjs(task.startTime)
    let groupEnd = dayjs(task.endTime)

    if(groupStart.isBefore(min)) min = groupStart
    if(groupEnd.isAfter(max)) max = groupEnd

    const groupOption = {
      id:task.id,
      className:`${progressGroupClassName}`,
      content:task.taskName,
      value:task.value
    }
    groupData.add(groupOption)
    createProgressItemData(groupOption.id, task) // 创建任务进度条group

  })
  let start = min.clone(), end = max.clone()
  let axisUnit = 'month'
  let step = 1
  let diffMonth = Math.abs(min.diff(max))/ (1000 * 60 * 60 * 24 * 30) // 如果时间范围比一个月还小，时间单位以天获取
  let diff = Math.abs(min.diff(max))/ (1000 * 60 * 60 * 24 * 365.25)
  if(diff>1){ // 相差年限大于1年，显示最近1年
    // start = end.subtract(1,'year')
    max = max.add(3,'month') // 结尾增加三个月用于展示结尾label
    step = 3
  }else{
    if(diffMonth>1){
      max = max.add(1,'month') // 结尾增加半个月用于展示结尾label
      if(diffMonth>6){
        step = 2
      }
    }else{
      axisUnit = 'day'
      if(diffMonth>0.5){
        step = 2
      }
      max = max.add(3,'day') // 结尾增加3天用于展示结尾label
    }
  }

  if(window.debugModeEnable){
    console.log('相差年数：'+diff)
    console.log('最早和最晚时间：',min.format('YYYY-MM-DD'),max.format('YYYY-MM-DD'))
  }
  let options = {
    stack: false, // 堆叠
    onInitialDrawComplete:()=>{  // 绘制结束的回调
      setProgressStyle() // 自定义进度图样式
      setHeadStyle() // 自定义表头样式
      addEvent() // 添加事件
      loading.value = false
    },
    autoResize:true, // 自动缩放
    locale:'zh-cn',
    selectable:false, // 节点可选

    timeAxis:{
      scale:axisUnit, // 固定缩放单位月
      step:step
    },
    // zoomKey: "ctrlKey",
    zoomKey: "shiftKey",
    // start: start.format('YYYY-MM-DD'), // 开始
    min:min.format('YYYY-MM-DD'), // 最小时间
    // end: end.format('YYYY-MM-DD'), // 结束
    max: max.format('YYYY-MM-DD'), // 最大时间
    snap:null, // 吸附
    margin: {
      item: 10, // minimal margin between items
      axis: 50, // minimal margin between items and the axis
    },
    orientation: "top",
    groupOrder:(a,b)=>a.value - b.value
  }
  timeline = new vis.Timeline(targetDom, itemData, groupData, options)
}

defineExpose({
  init,
  dispose
})

</script>

<template>
  <div :id="domId" class="timeline-wrapper"></div>
  <empty :show-div="!loading && isEmpty" />
  <window-loading class="progress-window-loading" :loading="loading"/>
  <div id="timeline-tooltip" :style="{
    '--left':toolTipData.left + 'px',
    '--top':toolTipData.top + 'px',
  }" :class="{
    show:toolTipData.show
  }">
    <p>
      <span>任务成员（共{{toolTipData.participantCount}}人）</span>
      <span>[ 点击查看详情 ]</span>
    </p>
    <p>
      <span class="tip-icon red"></span>
      <span class="tip-text red">预计进度 {{toolTipData.predictProgress}}%</span>
      <span class="tip-icon blue"></span>
      <span class="tip-text blue">实际进度 {{toolTipData.progress}}%</span>
    </p>
  </div>
</template>

<style scoped lang="scss">

$majar-title-height:1.875rem;
$minor-title-height:1.625rem;
$majar-border-bottom-width:0.1875rem;
$majar-margin-bottom:0.3125rem;
$draw-padding-top:1.5rem;
$text-height:1.13rem;
#timeline-tooltip{
  pointer-events: none;
  position:absolute;
  z-index:99;
  top:calc(
      var(--top)
  );
  left:var(--left);
  opacity: 0;transition-property: opacit;transition-timing-function: ease-in-out;
  transition-duration: 0.2s;
  transform:translateX(-50%) translateY(-100%);
  width: fit-content;
  height: 3.44rem;
  padding:0.5rem;
  box-sizing: border-box;
  background: #FFFFFF;
  box-shadow: 0rem 0.25rem 1.25rem 0rem rgba(149,172,231,0.25);
  border-radius: 0.63rem 0.63rem 0.63rem 0.63rem;
  &.show{
    opacity: 1;
  }
  p{
    white-space: nowrap;
    &:nth-child(1){
      color: rgba(28, 28, 28, 0.7);
      font-size: 0.75rem;
      margin-bottom:0.25rem;
      //display: flex;
      //justify-content: space-between;
      span:last-child{
        opacity: 0.7;
      }
    }
    &:nth-child(2){
      font-family: SourceHanSansCN-Medium;
      display: flex;
      align-items: center;
      span{
        margin-right: 0.25rem;
        &:last-child{margin-right: 0rem}
      }
      .tip-icon{
        display: inline-block;
        width: 0.69rem;
        height: 0.69rem;
        background: linear-gradient( 180deg, #DDE7FF 0%, #487DFE 100%);
        border-radius: 50%;
        &.red{
          background: linear-gradient( 180deg, #FFD4D8 0%, #FF505D 100%);
        }
      }
      .tip-text{
        font-size: 0.88rem;
        background:linear-gradient(90deg,#7AA1FEcc 0%, #487DFEcc 50%, #6E64F6 100%);
        background-clip: text;
        color:transparent;
        &.red{
          background:linear-gradient(90deg, rgba(254, 122, 133, 0.8) 0%, rgba(254, 72, 72, 0.8) 50%, #f66464 100%);
          background-clip: text;
          color:transparent;
        }
      }
    }
  }
}

.progress-window-loading{
  border-radius: 1.25rem;
}
</style>

<style scoped lang="scss">
@import '@/assets/styles/global.scss';
$progress-group-height:2.5rem; // 进度条高度
$progress-item-height:1.31rem; // 进度条高度

$majar-title-height:1.875rem;
$minor-title-height:1.625rem;
$majar-border-bottom-width:0.1875rem;
$majar-margin-bottom:0.3125rem;
$left-width:9.6625rem; // 左侧狼的宽度

.timeline-wrapper{
  width:100%;
  height:100%;
  position:relative;
  overflow-y: scroll;
  //background-color: rgba(255, 255, 255, 0.5);
  &::-webkit-scrollbar{width:0;}
}

// 表头
::v-deep(.vis-label){
  border-bottom: none;
  font-family: SourceHanSansCN-Medium;
  font-size: 1rem;
  color:#001133cc;
  .vis-inner{
    width:$left-width;
    overflow-x: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    box-sizing: border-box;
  }
  &.progress-group{
    height:$progress-group-height !important;
    display: flex;
    align-items: center;
    margin-top:1px;
  }
  &.bar-group{
    margin-top:0.75rem;
    height:1rem !important;
  }
}

// 表组
::v-deep(.vis-group){
  border-bottom: none ;
  &.progress-group{
    margin-top:1px;
    height:$progress-group-height !important;
  }
  &.bar-group{
    --bar-top-color:#FB9B61;
    --bar-bottom-color:#FB9B6122;
    height:1rem !important;
    margin-top:0.75rem;
    transform:translateY(calc(($progress-item-height - $progress-group-height) / 2));
    .group-label{
      height: 100%;
      display: flex;
      align-items: center;
      font-size: 14px;
      word-spacing: 5px;
      span{
        font-size: 10px;
      }
    }
  }
}
// 节点
::v-deep(.vis-item) {
  border-width:0px;
  border-radius: 0px;
  &.bar-item{
    top:initial !important;
    bottom:0px;
    background:
        linear-gradient(
                180deg,
                var(--bar-top-color) 0%,
                var(--bar-bottom-color) 100%);
    .label{
      display: flex;
      align-items: center;
      font-size: 0.75rem;
      color: rgba(29,29,29,0.7);
      font-family: SourceHanSansCN-Regular;
      position:absolute;
      bottom:0rem;
      right:-0.7rem;
      transform:translateX(100%);
      white-space: nowrap;
      p{
        margin-left:0.2rem;
        font-family: D-DINExp;
        transform: translateY(0.05rem);
      }
    }
  }
  // 进度条
  &.progress-item{
    cursor:pointer;
    //background-color: red !important;
    top:calc(($progress-group-height - $progress-item-height) / 2) !important;
    height:$progress-item-height;
    bottom:calc(($progress-group-height - $progress-item-height) / 2) !important;
    background-color: transparent;
    .label{
      color: rgba(29,29,29,0.7);
      font-family: D-DINExp;
      font-size: 1rem;
      position:absolute;
      top:0;
      right:-0.7rem;
      transform:translateX(100%);
      white-space: nowrap;
      span{
        font-size: 0.75rem;
      }
    }
    .vis-item-content{
      width:100%;
      height:100%;
      transform:translateX(0px) !important;
      .progress-wrapper{
        --back-row-1-bg:#F16A6A33; // 第一行背景色
        --back-row-2-bg:#F16A6A66; // 第二行背景色
        --fore-row-1-bg:#F16A6A; // 第二行背景色
        width: 100%;
        height:100%;
        .label{
          font-size: 14px;
          position:absolute;
          right:-10px;
          top:50%;
          transform: translateX(100%) translateY(-50%);
          span{
            font-size: 10px;
          }
        }
        .back-progress{
          z-index:0;
          position: absolute;
          top:0;
          left:0;
          width: 100%;
          height:100%;
          .back-row-1{
            width: 100%;
            height:70%;
            background-color: var(--back-row-1-bg);
          }
          .back-row-2{
            width: 100%;
            height:30%;
            background-color:  var(--back-row-2-bg);
          }
        }
        .fore-progress{
          z-index:1;
          position: absolute;
          top:0;
          left:0;
          height:100%;
          border-top:2px solid #ffffff66;
          border-right:2px solid #ffffff66;
          box-sizing: border-box;
          border-image-source:
              linear-gradient(to right,var(--fore-row-1-bg), #ffffff66 50%);
          border-image-slice: 1;

          .fore-row-1{
            width: 100%;
            height:70%;
            background-color:  var(--fore-row-1-bg);
          }
          .fore-row-2{
            width: 100%;
            height:30%;
            display: flex;

            .fore-cell{
              --fore-cell-bg: #D82B39;
              height:100%;
              background-color:  var(--fore-cell-bg);
            }
          }
        }
      }
    }
  }
}


// 主标题 显示年
::v-deep(.vis-major){
  width: 100%;
  padding:0px;
  height:$minor-title-height;
  z-index:2;
  div{
    height:100%;
    text-align: center;
    line-height:$minor-title-height;
    font-family: SourceHanSansCN-Medium;
    color: rgba(18, 27, 56, 0.82);
    font-size: 1rem;
  }
}

$minor-title-width:3.8125rem;
// 副标题 显示月
::v-deep(.vis-text.vis-minor){
  box-sizing: border-box;
  border-top:$majar-border-bottom-width solid #ffffff;
  background-color: #ffffff;
  height:calc($majar-title-height + 3px);
  box-shadow:0px -3px 0px 0px #847CF0;
  line-height:$minor-title-height;
  overflow: visible ;
  text-align: center;
  padding:0px;
  padding-left:1.875rem;
  display: flex;
  //margin-top:calc($majar-margin-bottom + $majar-border-bottom-width);
  margin-right:-1px;
  margin-top:3px;
  font-family: D-DINExp;
  color:#001133;
  font-size: 0.88rem;
  // 跟在月份后面的矢量图片
  &:after{
    content:'123';
    color:transparent;
    display: block;
    width:100%;
    margin-left:30px;
    background-color: #EFEEFF;
    background-image: $split-icon;
    background-repeat: no-repeat;
    background-position: center;
  }
}

// 主表体 absolute定位
::v-deep(.vis-center){
  z-index:2;
  left:$left-width !important;
  border:none;
  top:calc(
      $majar-title-height +
      $minor-title-height +
      $majar-border-bottom-width +
      $majar-margin-bottom
  ) !important;
  height:calc(100% -
  $majar-title-height -
  $minor-title-height -
  $majar-border-bottom-width -
  $majar-margin-bottom) !important;
}

// 左表体
::v-deep(.vis-left){
  border:none;
  top:calc(
      $majar-title-height +
      $minor-title-height +
      $majar-border-bottom-width +
      $majar-margin-bottom
  ) !important;
}

// 背景
::v-deep(.vis-background){
  &.vis-panel{
    top:calc(
        $minor-title-height +
        $majar-border-bottom-width +
        $majar-margin-bottom
    ) !important;
  }
}
// 表头样式
::v-deep(.vis-top){
  background-color: rgb(255, 255, 255);
  z-index:2;
  box-shadow: 0px 6px 10px rgb(238 235 243 / 60%);
  position:fixed;
  top:unset !important;
  left:unset !important;
  margin-top:-1px;
  margin-left:calc($left-width );
  border: none;
  height:calc(
      $majar-title-height +
      $minor-title-height +
      $majar-border-bottom-width +
      $majar-margin-bottom - 1px
  ) !important;
  .vis-time-axis{
    height:100% !important;
  }
  &.vis-shadow{
    height:1px !important;
  }
}

::v-deep(.vis-timeline){
  --content-height:0px;
  border:none !important;
  &.fix-height{
    // 固定高度
    height:var(--content-height) !important;
  }
  .head-wrapper{
    background-color: rgb(255, 255, 255);
    box-shadow: 0px 6px 10px rgb(238 235 243 / 60%);
    position:fixed;
    //top:0;
    box-sizing: border-box;
    width:$left-width;
    //height:calc(
    //    $minor-title-height +
    //    $majar-border-bottom-width +
    //    $majar-margin-bottom + $majar-title-height
    //);
    .head-title{
      background: #ffffff;
      //border-top:$majar-border-bottom-width solid #847CF0;
      margin-top:calc($majar-title-height - $majar-border-bottom-width);
      .head-text{
        border-top:$majar-border-bottom-width solid #ffffff;
        box-shadow:0px -3px 0px 0px #847CF0;
        background: #ebeafb;
        height:$majar-title-height;
        line-height:$minor-title-height;
        margin-top:$majar-margin-bottom;
        padding-left:2.8125rem;
        font-size: 0.88rem;
        color: #001133;
        font-family: SourceHanSansCN-Normal;
      }
    }
  }
}

::v-deep(.vis-current-time){
  background-color:#847CF0
}

::v-deep(.vis-time-axis .vis-grid.vis-vertical){
  border-left:2px  solid rgba(215, 217, 224, 0.64) !important;
}

::v-deep(.vis-foreground){
  box-shadow:inset 6px 0px 10px rgb(238 235 243 / 60%);
}
</style>
