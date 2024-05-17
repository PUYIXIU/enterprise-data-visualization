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
        'index', // 索引
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
    src.forEach((row,index)=>{
        row.index = index + 1
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
    src.forEach(({map}, index)=>{
        map.index = index
        result.push(pick(map,[
            'index', // 索引
            {propName:'projectName', rename:'name'}, // 模块名称
            'predict', // 预计
            {propName:'progress', type:Number}, // 进度
        ]))
    })
    return result
}

// 获取参与人工时详情数据
export function filterPieData(src){
    let result = []
    src.forEach(({map})=>{
        result.push(pick(map,[
            {propName:'employeeName', rename:'name'}, // 参与人名
            {propName:'totalHour', type:Number, rename:'value'}, // 工时
        ]))
    })
    return result
}

// 对任务工时柱状图进行处理
export function filterBarData(src){
    let result = []
    src.forEach(({map})=>{
        result.push(pick(map,[
            {propName:'erpTaskName', rename:'name'}, // 参与人名
            {propName:'erpTaskHours', type:Number, rename:'value'}, // 工时
        ]))
    })
    return result
}

// 对项目甘特图进行处理
export function filterGantData(src){
    let result = pick(src[0].map,[
        'predictStartTime', // 预计开始时间
        'predictEndTime', // 预计结束时间
        {propName:'predictProgress', type:Number,}, // 预计进度

        {propName:'delayProgress', type:Number,}, // 推迟比率

        'realStartTime', // 实际开始时间
        'realEndTime', // 实际结束时间时间
        {propName:'realProgress', type:Number,}, // 实际进度

        'currentTime', // 当前时间
        {propName:'totalHour', type:Number,}, // 总工时
    ])
    result.hourList = src[0].map.hourList.split(', ').map(str=>{
        let value = str.split('=')
        value[1] *= 1 // 转换为Number类型
        return value
    })
    return result
}

// 对任务进度数据进行处理
export function filterTimelineData(src){
    let result = []
    src.forEach(row=>{
        result.push(pick(row,[
            'id', // 任务唯一表示
            'taskName', // 任务名称
            'startTime', // 开始时间
            'endTime', // 结束时间
            {propName:'progress', type:Number,}, // 进度
            'participantCount', // 参与人数
            'predictProgress', // 预计进度
        ]))
    })
    result = result.sort((a,b)=>{
        return new Date(b.endTime) - new Date(a.startTime)
    })
    return result
}

// 对任务进度人员工时详情进行处理
export function filterHourListData(src){
    let result = []
    src.forEach(row=>{
        let maxHour = 0
        row.hourList = row.hourList.split(', ').map(cell=> {
            let entries = cell.split('=')
            entries[1] *= 1
            if(entries[1]>maxHour) maxHour = entries[1]
            return entries
        })
        row.maxHour = maxHour
        result.push(pick(row,[
            'id', // 参与人id
            'name', // 参与人姓名
            'maxHour', // 最大工时
            {propName:'totalHour', type:Number,}, // 工时
            {propName:'percent', type:Number,}, // 进度
            'hourList'
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
