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

    // type=value时坐标系的单位长度
    let x_unit = content_w/max_x // x轴单位长度（px）
    let y_unit = content_h/max_y // y轴单位长度（px）

    let max_mapR = 50, min_mapR = 10 // 最终半径映射范围（%）
    let axis_range = {
        x:[0,0],
        y:[0,0]
    } // 坐标轴范围
    let gap_x = 2 , gap_y = 2 // 坐标轴留白
    let x_category = [], y_category = []

    data.forEach(node=>{
        // 水面高度由 百分制 转换为 小数制
        node.waveValue = (node.wave / 100) || 0
        // 直径大小映射到
        let mapResult = valueMap(node.radius, [min_r, max_r],[min_mapR, max_mapR])
        node.mapEffect = mapResult.mapEffect
        node.mapRadius = mapResult.mapValue
        // 计算x轴，y轴范围
        let r2px =node.mapRadius/2/100*content_h  // 半径
        let x = node.x * x_unit
        let y = node.y * y_unit
        let left =  Math.floor((node.x * x_unit - r2px)/x_unit)
        let right = Math.ceil((node.x * x_unit + r2px)/x_unit) + gap_x
        let top = Math.ceil((node.y * y_unit - r2px)/y_unit)
        let bottom = Math.ceil((node.y * y_unit + r2px)/y_unit) + gap_y
        axis_range.x[0]>left && (axis_range.x[0] = left)
        axis_range.x[1]<right && (axis_range.x[1] = right)
        axis_range.y[0]>top && (axis_range.y[0] = top)
        axis_range.y[1]<bottom && (axis_range.y[1] = bottom)

        // let x = Math.ceil((node.x * x_unit + r2px)/x_unit) + gap_x
        // axis_range[0]<x && (axis_range[0] = x)
        // let y = Math.ceil((node.y * y_unit + r2px)/y_unit) + gap_y
        // axis_range[1]<y && (axis_range[1] = y)

        // 推入均匀模式下的x、y值
        x_category.push(node.x)
        y_category.push(node.y)
    })

    data.sort((a,b)=>b.mapRadius - a.mapRadius) // 按照半径排序


    /* 以下计算均匀模式数据 */
    x_category.sort((a,b)=>a-b)
    y_category.sort((a,b)=>a-b)
    x_category = Array.from(new Set(x_category))
    y_category = Array.from(new Set(y_category))
    // 将半径和索引值联系在一起进行坐标系边界计算
    //  此时数据按照从大到小的顺序排序

    if(data.length>0){ // 数据长度大于1继续均匀模式下的坐标计算
        // type=category时坐标系的单位长度
        let x_unit_category = content_w/x_category.length // x单位长度
        let y_unit_category = content_h/y_category.length // y单位长度
        let half_x = x_unit_category/2
        let half_y = y_unit_category/2
        let g_left = 0 , g_right = 0, g_top = 0, g_bottom = 0;
        data.forEach((node,index)=>{
            let r2px = node.mapRadius/2/100*content_h // 半径px大小
            let x_index = x_category.findIndex(i=>i == node.x) // x轴索引位置
            let y_index = y_category.findIndex(i=>i == node.y) // y轴索引位置

            let x = x_index * x_unit_category + half_x // 数据x中心点
            let y = y_index * y_unit_category + half_y // 数据y中心点

            let left = x - r2px
            let right = x + r2px
            let top = y - r2px
            let bottom = y + r2px
            g_left>left && (g_left = left)
            g_right<right && (g_right = right)
            g_top>top && (g_top = top)
            g_bottom<bottom && (g_bottom = bottom)
        })
        g_right -= content_w
        g_bottom -= content_h
        // 计算新增的数量
        if(g_left<0 || g_right>0){
            let over = 0 ; // 超界数量
            let left_rate = 0, right_rate = 0 // 左右比重
            let left_add = 0, right_add = 0; // 左右添加数量
            if(g_left<0) {
                left_rate = Math.abs(g_left)
                over+=left_rate
            }
            if(g_right>0) {
                right_rate = Math.abs(g_right)
                over += Math.abs(right_rate)
            }
            left_rate  = left_rate / over
            right_rate  = right_rate / over
            let add = Math.ceil(x_category.length*over/(content_w-over))
            left_add = Math.ceil(left_rate * add)
            right_add = Math.ceil(right_rate * add)
            // 向左兼容
            let minX = x_category[0]
            let maxX = x_category.slice(-1)[0]
            for(let i =0; i< left_add; i++){
                let addValue = minX - 1 - i
                if(addValue<0) addValue = ''
                x_category.unshift(addValue)
            }
            for(let i =0; i< right_add; i++)x_category.push(maxX + 1 + i)
        }
        if(g_top<0 || g_bottom>0){
            let over = 0 ; // 超界数量
            let top_rate = 0, bottom_rate = 0 // 左右比重
            let top_add = 0, bottom_add = 0; // 左右添加数量
            if(g_left<0) {
                top_rate = Math.abs(g_top)
                over+=top_rate
            }
            if(g_right>0) {
                bottom_rate = Math.abs(g_bottom)
                over += bottom_rate
            }
            top_rate  = top_rate / over
            bottom_rate  = bottom_rate / over
            let add = Math.ceil(y_category.length*over/(content_h-over))
            top_add = Math.ceil(top_rate * add)
            bottom_add = Math.ceil(bottom_rate * add)
            // 向下兼容
            let minY = y_category[0]
            let maxY = y_category.slice(-1)[0]
            for(let i =0; i< top_add; i++) y_category.push(maxY + 1 + i)
            for(let i =0; i< bottom_add; i++){
                let addValue = minY - 1 - i
                if(addValue<0) addValue = ''
                y_category.unshift(addValue)
            }
        }
        if(g_top<0){ // 上侧超界
            let addUnitNumber = Math.ceil(Math.abs(g_top)/y_unit_category) // 增加的单位数量
            for(let i =0; i< addUnitNumber; i++)y_category.push('')
        }
        if(g_bottom<0){ // 下侧超界
            let addUnitNumber = Math.ceil(g_bottom/y_unit_category) // 增加的单位数量
            for(let i =0; i< addUnitNumber; i++)y_category.unshift('')
        }
    }
    return {
        data,
        axis_range,
        x_category,
        y_category,
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

export function handlePieData(data){ // 对饼图进行处理
    let minValue = 0, maxValue = 0; // 最大值和最小值
    data.forEach(o=>{
        if(minValue>o) minValue = o;
        if(maxValue<o) maxValue = o;
    })
    let valueDiff = maxValue - minValue
    data.forEach(node=>{
        if(maxValue == minValue){
            node.valueEffect = node.value > 0?1:0;
        }else{
            node.valueEffect = (node.value - minValue) / valueDiff // 计算出半径系数
        }
    })
    data.sort((a,b)=>a.value - b.value) // 排序
    return data
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
