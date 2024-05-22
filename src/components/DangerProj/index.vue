<script setup>
import {ref, onMounted, reactive, watch, getCurrentInstance,nextTick} from 'vue'
import ContentHeader from '@/components/ContentHeader'
import {mockData} from './mockData.js'
import {getpx} from "@/utils/style.js";
import QueryBox from "@/components/QueryBox/index.vue";
import {useLocalDataStore} from "@/storage/index.js";
import request from "@/utils/request.js";
import {filterDangerProjData} from "@/utils/dataFilter.js";
import WindowLoading from "@/components/Loading/WindowLoading.vue";
import gsap from "gsap";
import Empty from "@/components/Loading/Empty.vue";
const {proxy} = getCurrentInstance()
const store = useLocalDataStore()
const colorList = [
  '#FF505D',
  '#6459F4',
  '#A26CE6',
]
const data = ref([])

const queryParams = reactive({
  department:undefined
})
const btnList = ref([
  {
    name:'所有部门',
    class:'expand',
    deactiveIconStyle:{transform:'rotateZ(-180deg)'},
    active:false,
    id:'danger-proj-select-btn',
    onclick:()=>{
      proxy.$refs.DangerProjQueryRef.expand()
    }
  },
])
function getChangeFun(index){
  return function(visible){
    btnList.value[index].active = visible
  }
}
const loading = ref(true)
const selectRiskyProject = params => request.get('/erp/visualize/selectRiskyProject', {params}) // 请求项目占比数据
// 获取风险项目数据
function getDangerProjData(){
  return selectRiskyProject({deptId:queryParams.department}).then(res=>{
    data.value = filterDangerProjData(res.data)
    if(data.value.length>=5){
      data.value = data.value.concat(data.value.slice(0,5))
    }

    if(window.debugModeEnable){
      console.group('获取风险项目数据')
      console.log(data.value)
      console.groupEnd()
    }
    nextTick(()=> loading.value = false)
  })
}
watch(()=>[queryParams.department,store.timeTrigger],(nv,ov)=>{
  let auto  = nv[0] == ov[0] && nv[1] !== ov[1] // 自动触发
  !auto && (loading.value = true) // 自动触发不loading
  getDangerProjData()
  let label = store.deptList.find(o=>o.value == queryParams.department).label
  btnList.value[0].name = btnList.value[0].deactiveName = label
})

function init(){
  queryParams.department = store.deptList[0].value
}
function ready(){
  loading.value = false;
}

let tween
watch(loading,(nv,ov)=>{
  let dom = document.querySelector('#danger-kanban')
  if(nv == false){
    dom.scrollTop = 0
    let scroll_h = dom.scrollHeight
    let dom_h = dom.clientHeight
    let offset = scroll_h - dom_h
    let delay = 5
    let duration = 30
    if(offset>0){
      let initTweenOption = {
        scrollTop:offset,
        duration:duration,
        ease:'none',
      }
      tween = gsap.to(dom,{
        ...initTweenOption,
        delay:delay,
      })
      dom.onmouseenter = e =>{
        tween.pause()  // 动画暂停
        dom.onscroll = e =>dom.scrollTop == offset && (dom.scrollTop = 0) // 开始监听用户滚动事件
      }
      dom.onmouseleave = e => {
        let current_offset =  offset - dom.scrollTop
        let radio = current_offset / offset * duration
        tween = gsap.to(dom,{ // 重新开启动画
          scrollTop:offset,
          duration:radio,
          ease:'none',
          onComplete:()=>{
            dom.scrollTop = 0
            tween = gsap.to(dom,initTweenOption)
            tween.play()
            tween.repeat(-1)
          }
        })
        tween.play()
      }
      tween.repeat(-1)
    }
  }else{
    tween && tween.kill()
    tween = null
    dom.onmouseenter = undefined
    dom.onmouseleave = undefined
    dom.onscroll = undefined
  }
})

defineExpose({
  init,ready
})
</script>

<template>
  <div class="kanban-wrapper">
    <content-header title="风险项目" :btn-list="btnList" />
    <query-box
        ref="DangerProjQueryRef"
        class="query-box"
        :btn-id="btnList[0].id" dom-id="danger-proj-dom-id"
        :options="store.deptList"
        :height="(1.13+0.5)*Math.ceil(store.deptList.length/2) + 0.5*2"
        @change="(()=>getChangeFun(0))()"
        v-model:value="queryParams.department" />
    <window-loading :loading="loading && store.loading"/>
    <empty :show-div="!loading && data.length == 0" />
    <div class="kanban-content" id="danger-kanban">
      <div class="kanban-item" :class="{'ready':!loading && !store.loading}" v-for="(item, index) in data"
           :style="{
              '--color':colorList[item.index]||'#B3B5BB',
              '--bg-color':colorList[item.index]?colorList[index]+'33':'#D9D9D933',
              '--inner-color':colorList[item.index]||'#D9D9D9',
              '--index':item.index,
           }">
        <div class="index num">{{item.index+1}}</div>
        <div class="progress-box">
          <div class="progress-label">
            <p class="name">{{item.name}}</p>
            <p class="predict">预计{{item.predict}}%</p>
          </div>
          <el-progress
              :percentage="item.progress"
              :show-text=false
              stroke-linecap="butt"
              :stroke-width="getpx(0.5)"
          />
        </div>
        <div class="progress-num">
          <span class="num">{{item.progress}}</span>
          <span class="sign">%</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@import '@/assets/styles/global.scss';
.kanban-wrapper{
  padding:1.5rem 1.5rem 2.94rem 1.5rem;
  position:relative;
}

.query-box{
  top:calc($content-header-h + 1.5rem + 0.6rem);
  width:13rem;
  max-height: calc(22rem - $content-header-h - 1.5rem - 2.94rem - 0.6rem);
}
.kanban-content{
  cursor: pointer;
  margin-top:1.75rem;
  $item-h:2.13rem;
  $item-mb:1.13rem;
  $size:5;
  height:calc( $item-h * $size + $item-mb * ($size - 1) );
  overflow-x: hidden;
  overflow-y: scroll;
  position:relative;
  &::-webkit-scrollbar{width:0px;}
  .kanban-item{
    height:2.13rem;
    display: flex;
    color:#001133;
    margin-bottom:1.13rem;
    position:relative;
    &:before{
      content:'123';
      position:absolute;
      right:0;
      top:0;
      width:100%;
      height:100%;
      transition-property: width;
      transition-delay: calc(var(--index) * 0.1s);
      transition-duration: 1s;
      color:transparent;
      z-index:1;
      background: #ffffff;
    }
    &.ready:before{
        width:0%;
    }
    &:last-child{margin-bottom: 0;}
    .num{font-family: D-DINExp}
    .index{
      width:2.13rem;
      height:100%;
      background: rgba(235, 239, 250, 0.8);
      border-radius: 0.38rem 0.38rem 0.38rem 0.38rem;
      line-height: 2.13rem;
      text-align: center;
      font-size: 1.5rem;
      color:var(--color);
      margin-right:0.44rem;
      opacity: 0.8;
    }
    .progress-box{
      width:20.88rem;
      display: flex;
      flex-direction:column;
      justify-content: space-between;
      .progress-label{
        display: flex;
        justify-content: space-between;
        $font-size:0.88rem;
        $max-len:17;
        .name{
          font-family: SourceHanSansCN-Medium;
          font-size: $font-size;
          max-width: calc($font-size * $max-len);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          opacity: 0.8;
        }
        .predict{
          font-family: SourceHanSansCN-Normal;
          font-size: 0.75rem;
          color: rgba(29,29,29,0.7);
        }
      }
    }
    &:nth-child(1),&:nth-child(2),&:nth-child(3){
      .progress-num{ color:var(--color)}
    }
    .progress-num{
      flex:1;
      text-align: right;
      .num{
        font-size: 2rem;
      }
      .sign{
        font-family: D-DINExp;
        font-size: 0.88rem;
      }
    }
  }
}

// 进度条
::v-deep(.el-progress-bar__outer){
  background-color: var(--bg-color);
  border-radius:0rem;
  .el-progress-bar__inner{
    background-color: var(--inner-color);
    border-radius:0rem;
  }
}
</style>
