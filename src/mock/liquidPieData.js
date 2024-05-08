import {mock_liquidData} from "@/mock/liquidScatterData.js";

// 测试参与人名单
export const mockPeopleList = [
    {
        name:'张三',
        totalHour:75,
    },
    {
        name:'李四',
        totalHour:25,
    },
    {
        name:'王源超',
        totalHour:50,
    },
    {
        name:'林俊杰',
        totalHour:100,
    },
    {
        name:'张玉峰',
        totalHour:70,
    },
]
export const mock_liquidPieData = mock_liquidData.map(item=>{
    item.peopleList = mockPeopleList
    return item;
})
