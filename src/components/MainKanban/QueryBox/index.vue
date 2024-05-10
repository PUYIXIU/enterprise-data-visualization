<script setup>
import DropDownBox from '@/components/DropDownBox'
import {ref,reactive} from 'vue'
import {useLocalDataStore} from "@/storage/index.js";
const visible = ref(false)
const props = defineProps(['btnId'])
const emit = defineEmits(['change'])
const store = useLocalDataStore()
function expand(){
  visible.value = !visible.value
  // 通知父元素修改按钮的状态
  emit('change', visible.value)
}

defineExpose({
  expand,
  reset
})

const initQueryParams = {
  showType:'图表展示',
  priority:'全部',
  // filterDay:1,
  status:'全部',
  product:'全部',
}

const queryParams = ref(initQueryParams)

// 重置筛选项
function reset(){
  queryParams.value = {
    ...initQueryParams,
    showType:queryParams.value.showType
  }
}

const queryOptions = [
  {
    title:'展示方式', // 标题
    propName:(value)=>store.showType=value,
    options:[
        {value:0,label:'图表展示'},
        {value:1,label:'列表展示'},
    ]
  },
  {
    title:'优先等级',
    propName:'priority',
    options:[
      {value:'全部',label:'全部'},
      {value:'高',label:'高'},
      {value:'中',label:'中'},
      {value:'低',label:'低'},
    ]
  },
  // {
  //   title:'数据时间',
  //   propName:'filterDay',
  //   options:[
  //     {value:1,label:'近七天'},
  //     {value:2,label:'近15天'},
  //     {value:3,label:'近1个月'},
  //     {value:4,label:'近2个月'},
  //     {value:5,label:'近3个月'},
  //     {value:6,label:'近半年'},
  //     {value:7,label:'近一年'},
  //   ]
  // },
  {
    title:'项目状态',
    propName:'status',
    options:[
      {value:'全部',label:'全部'},
      {value:'进行中',label:'进行中'},
      {value:'已完成',label:'已完成'},
      {value:'迭代中',label:'迭代中'},
      {value:'运维中',label:'运维中'},
      {value:'已逾期',label:'已逾期'},
    ]
  },
  {
    title:'产品业务线',
    propName:'product',
    options:[
      {value:'全部',label:'全部'},
      {value:'消防业务',label:'消防业务'},
      {value:'实操业务',label:'实操业务'},
      {value:'单品系列',label:'单品系列'},
      {value:'展馆业务',label:'展馆业务'},
      {value:'业务系列',label:'业务系列'},
      {value:'化工业务',label:'化工业务'},
      {value:'链工宝',label:'链工宝'},
      {value:'课程内容',label:'课程内容'},
    ]
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
