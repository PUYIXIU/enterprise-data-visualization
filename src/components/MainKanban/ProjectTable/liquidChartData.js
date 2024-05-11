import {getpx} from "@/utils/style.js";
import {liquidColorMap} from "@/components/MainKanban/LiquidChart/colorConfig.js";

/**
 * 获取水球图处理的结果
 * x：x轴坐标
 * y：y轴坐标
 * wave：水面进度
 * radius：半径
 *
 * 其他：
 *  - id 唯一标识
 *  - commander 产品负责人
 * @param data 原始数据
 * @param dom 图表容器
 * @param grid 栅格边框
 */
export function getLiquidData(
    data,
    dom,
    grid={top:0,bottom:0,left:0,right:0},
){
    let {
        max_x, // 最大x值
        max_y, // 最大y值
        max_r, // 最大半径值
        min_r, // 最小半径值
    } = getAxisRange(data)
    let content_w = dom.clientWidth - grid.left - grid.right // 容器宽度
    let content_h = dom.clientHeight - grid.top - grid.bottom // 容器高度
    let x_unit = content_w/max_x // x轴单位长度（px）
    let y_unit = content_h/max_y // y轴单位长度（px）
    let max_mapR = 50, min_mapR = 10 // 最终半径映射范围（%）
    let axis_range = [0, 0] // 坐标轴范围
    let gap_x = 2 , gap_y = 2 // 坐标轴留白

    data.forEach(node=>{
        // 水面高度由 百分制 转换为 小数制
        node.waveValue = (node.wave / 100) || 0
        // 直径大小映射到
        let mapResult = valueMap(node.radius, [min_r, max_r],[min_mapR, max_mapR])
        node.mapEffect = mapResult.mapEffect
        node.mapRadius = mapResult.mapValue
        // 计算x轴，y轴范围
        let r2px =node.mapRadius/2/100*content_h
        let x = Math.ceil((node.x * x_unit + r2px)/x_unit) + gap_x
        axis_range[0]<x && (axis_range[0] = x)
        let y = Math.ceil((node.y * y_unit + r2px)/y_unit) + gap_y
        axis_range[1]<y && (axis_range[1] = y)
    })
    data.sort((a,b)=>b.mapRadius - a.mapRadius) // 按照半径排序
    return {
        data,
        axis_range
    }
}

export function getLiquidOptions(data, optionTemp){
    let options = []
    data.forEach((node,index)=>{
        let {config:color} = liquidColorMap[node.type]

        let topOption = copy(optionTemp)
        topOption.label.formatter = `{title|${node.radius}h}\n{subtitle|${node.name}}\n{subtitle|${node.wave}}{percent|%}`
        topOption.center = node.center // 中心坐标
        topOption.radius = `${node.mapRadius}%`  // 半径

        let rich = topOption.label.rich
        rich.title.fontSize = useEffectMap(node.mapEffect, getpx(0.75),getpx(1.875))
        rich.subtitle.fontSize = useEffectMap(node.mapEffect, getpx(0.5),getpx(1.375))
        rich.percent.fontSize = useEffectMap(node.mapEffect, getpx(0.5),getpx(0.75))
        rich.title.lineHeight = useEffectMap(node.mapEffect, getpx(1.125),getpx(2.5))
        rich.subtitle.lineHeight = useEffectMap(node.mapEffect, getpx(1.125),getpx(2.5))
        topOption.data = [node.wave/100]

        topOption.itemStyle.color = color.top.itemStyleColor
        topOption.backgroundStyle.shadowColor = color.top.shadowColor
        topOption.backgroundStyle.color = color.top.backgroundColor

        let baseOption = copy(topOption)
        baseOption.name = 'base'
        baseOption.label = {show:false}
        baseOption.backgroundStyle.shadowOffsetX = 0
        baseOption.backgroundStyle.shadowOffsetY = 0
        baseOption.backgroundStyle.shadowBlur = getpx(1)
        baseOption.backgroundStyle.color = color.base.backgroundColor
        baseOption.backgroundStyle.shadowColor = color.base.shadowColor

        topOption.z = index
        baseOption.z = index

        options.push(baseOption)
        options.push(topOption)
    })
    return options
}

export function copy(obj){
    return JSON.parse(JSON.stringify(obj))
}

function useEffectMap(effect,min,max){
    return (max - min) * effect + min
}

// 数据映射到指定范围内
function valueMap(value, [ min, max ],[map_min, map_max]){
    if(max == min) return value.value>0?{mapEffect: 1,mapValue: map_max}:{mapEffect: 0,mapValue: map_min} // 最大值=最小值
    let mapEffect = (value - min) / (max - min)
    return {
        mapEffect, // 映射系数
        mapValue:(map_max - map_min)*mapEffect + map_min
    }
}

// 获取xy轴范围
function getAxisRange(data){
    let max_x = 0
    let max_y = 0
    let max_r = 0
    let min_r = 0
    data.forEach(({x,y,radius})=>{
        if(max_x<x) max_x = x
        if(max_y<y) max_y = y
        if(max_r<radius) max_r = radius
        if(min_r>radius) min_r = radius
    })
    return {max_x,max_y,max_r,min_r}
}
