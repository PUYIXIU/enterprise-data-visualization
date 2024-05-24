<script setup>
import DropDownBox from '@/components/DropDownBox'
import {ref,reactive} from 'vue'
import {useLocalDataStore} from "@/storage/index.js";
import {copy} from "@/components/MainKanban/LiquidChart/liquidChartData.js";
import {priorityDict, productLineDict, showTypeDict, statusDict} from "@/components/MainKanban/Dict.js";
const visible = ref(false)
const props = defineProps(['btnId'])
const emit = defineEmits(['change','filterData'])
const store = useLocalDataStore()
const initQueryParams = {
  priority:'全部', // 优先级
  status:'全部', // 状态
  productLine:'全部', // 产品线
}
let lastParams = copy(initQueryParams)

function expand(){
  visible.value = !visible.value
  // 通知父元素修改按钮的状态
  emit('change', visible.value)
}

defineExpose({
  expand,
  reset,
  filterData
})

// 过滤数据
function filterData(){
  emit('filterData',queryParams.value)
}

const queryParams = ref(initQueryParams)

// 重置筛选项
function reset(){
  if(copy(queryParams) != copy(initQueryParams)){
    queryParams.value = {
      ...initQueryParams,
    }
    filterData()
  }
}

const queryOptions = [
  {
    title:'展示方式', // 标题
    propName:(value)=>store.showType=value,
    options:showTypeDict
  },
  {
    title:'优先等级',
    propName:'priority',
    options:priorityDict
  },
  {
    title:'项目状态',
    propName:'status',
    options:statusDict
  },
  {
    title:'产品业务线',
    propName:'productLine',
    options:productLineDict
  },
]

/**
 * 表单修改
 * @param option 修改选项
 * @param propName 被修改变量
 */
function queryChange(option,propName){
  if(typeof propName === 'string'){ // 修改的是筛选数据
    queryParams.value[propName] = option.value
    filterData()
  }else if(typeof propName === 'function'){ // 修改的是函数
    propName(option.value)
  }
}

</script>

<template>
  <drop-down-box :visible-box="visible" :height="10.81" dom-id="main-query-box" @blur="expand" :btn-id="btnId">
    <div class="query-inner full">
      <div class="query-form-item" v-for="item in queryOptions">
        <span class="query-title">{{item.title}}</span>
        <p class="options-list">
          <span
              v-for="option in item.options"
              :class="{
                'active':typeof item.propName === 'function'?option.value ===  store.showType : option.value===queryParams[item.propName]}"
              @click="queryChange(option, item.propName)"
          >{{option.label}}</span>
        </p>
      </div>
    </div>
  </drop-down-box>
</template>

<style scoped lang="scss">
.query-inner{
  padding:1.63rem 1.5rem;
}
.query-form-item{
  display: flex;
  font-family: SourceHanSansCN-Medium;
  font-size: 0.88rem;
  height: 1.56rem;
  margin-bottom:0.5rem;
  &:last-child{margin-bottom: 0;}
  .query-title{
    width:5.5rem;
    color: rgba(29,29,29,0.7);
    line-height: 1.7rem;
  }
  .options-list{
    span{
      display: inline-block;
      height: 1.56rem;
      line-height: 1.7rem;
      background: #EFF4FF;
      border-radius: 0.78rem 0.78rem 0.78rem 0.78rem;
      width: 4.25rem;
      margin-right:0.75rem;
      text-align: center;
      color: rgba(126, 126, 126, 0.51);
      cursor:pointer;
      transition-property: color , background-color;
      transition-duration: 0.05s;
      transition-timing-function: ease-in-out;
      &:hover{
        color:#ffffffcc;
        background: #5a66f7;
      }
      &.active{
        color:#ffffffcc;
        background: #4078FE;
      }
    }
  }
}
</style>
