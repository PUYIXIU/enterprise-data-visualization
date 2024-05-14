// 过滤出主图数据
export function filterChartData(src){
    return pick(src,[
        {propName:'projectId', rename:'id'}, // id
        {propName:'projectName', rename:'name'}, // 项目名
        {propName:'status', rename:'type'}, // 项目状态-类型
        {propName:'taskCount', type:Number,rename:'x'}, // 任务数-x轴
        {propName:'participantCount', type:Number,rename:'y'}, // 参与人数-y轴
        {propName:'projectRate', type:Number,rename:'wave'}, // 进度-水面
        {propName:'laborHours', type:Number,rename:'radius'}, // 工时-半径
        'commander', // 产品负责人
    ])
}

// 过滤出表格数据
export function filterTableData(src){
    return pick(src,[
        'projectId', // 项目id
        'projectName', // 产品名称
        ['erpProjectCode','无'], // 代号
        'priority', // 优先级
        'commander', // 产品负责人
        'productLine', // 产品业务线
        'responsiblePersonName', // 分管负责人
        'status', // 状态
        'erpProjectStartDate', // 开始时间
        'erpProjectEndDate', // 结束时间
        'daysOpen', // 已开启天数
        'daysRemaining', // 剩余天数
        {propName:'projectRate', type:Number}, // 项目进度
        'grade', //项目热度
        ['hotChange',Math.random()>0.5?-1:1], // 项目热度变化
        'laborHours', //工时
    ])
}

// 过滤出项目热度数据
export function filterHotData(src){
    return pick(src,[
        'projectName', // 产品名称
        'commander', // 产品负责人
        'grade', //项目热度
    ])
}

// 获取主图、主表、热度图数据
export function filterMainData(src){
    let chartData = [] // 图表数据
    let tableData = [] // 表格数据
    let hotData = [] // 热度数据
    src.forEach(row=>{
        chartData.push(filterChartData(row))
        tableData.push(filterTableData(row))
        hotData.push(filterHotData(row))
    })
    return{
        chartData,
        tableData,
        hotData
    }
}

// 获取项目占比数据
export function filterProgressData(src){
    let result = []
    src.forEach(({map})=>{
        result.push(pick(map,[
            {propName:'projectName', rename:'name'}, // 模块名称
            {propName:'taskNum', type:Number}, // 项目数量
            {propName:'percent', type:Number}, // 占比
        ]))
    })
    result.sort((a,b)=>b.taskNum - a.taskNum) // 项目占比从大到小排序
    return result
}

// 获取风险项目数据
export function filterDangerProjData(src){
    let result = []
    src.forEach(({map})=>{
        result.push(pick(map,[
            {propName:'projectName', rename:'name'}, // 模块名称
            'predict', // 预计
            {propName:'progress', type:Number}, // 进度
        ]))
    })
    return result
}

// 摘取对象指定元素
export function pick(obj, option){
    let copy = {}
    option.forEach(prop=>{
        if(typeof prop == 'string'){
            copy[prop] = obj[prop]
        }else if(Array.isArray(prop)){
            let [o,v] = prop
            copy[o] = obj[o] == undefined ? v : obj[o]
        }else if(typeof  prop == 'object'){
            let {propName, type, rename} = prop
            let name = rename!=undefined?rename:propName // 重命名
            switch (type){
                case Number: // 强制转换数字类型
                    if(!isNaN(Number(obj[propName]))){
                        copy[name] = obj[propName]*1;
                    }else{
                        copy[name] = 0;
                    }
                    break;
                case undefined:
                default:copy[name] = obj[propName];break;
            }
        }
    })
    return copy
}
