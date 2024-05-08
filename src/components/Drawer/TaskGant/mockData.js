import dayjs from "dayjs";
// 任务甘特图测试数据
export const mockData = {
    predictStartTime:'2023.01.01', // 预计开始时间
    predictEndTime:'2023.10.01', // 预计结束时间
    predictProgress:30, // 预计当前进度

    delayProgress:11, // 实际开始时间 相对 预计开始时间 的 推迟比率

    realStartTime:'2023.02.01', // 实际开始时间
    realEndTime:'2023.10.18', // 实际结束时间
    realProgress:38, //实际当前进度

    currentTime:'2024.4.22', // 当前时间

    totalHour:560, // 总工时
    hourList:[
        // [某一时间段内的总工时,当天工时]
        // ['2024-01-01 2024-01-04',8],
        ...getHourList('2024-02-01','2024-10-18', 560, 6)
    ], // 工时详情
}

export function getHourList(startTime, endTime, totalHours, timeStep){
    let result = []
    let start = dayjs(startTime)
    let end = dayjs(endTime)
    // 总天数
    let dayDiff = end.diff(start, 'day')+1

    const avg = totalHours / dayDiff // 平均值
    const maxDiff = avg

    while(!start.isAfter(end)){
        result.push([
            start.format('YYYY-MM-DD'),
            Math.floor(avg*(Math.random()+0.5))
        ])
        start = start.add(timeStep,'day')
    }

    return result
}
