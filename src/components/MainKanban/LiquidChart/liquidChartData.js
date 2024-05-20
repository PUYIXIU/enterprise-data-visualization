import {getHSL, getpx} from "@/utils/style.js";
import {liquidColorMap} from "@/components/MainKanban/LiquidChart/colorConfig.js";


function countUnit(total, splitNumber){
    if(splitNumber == 0) return total;
    return total / splitNumber
}
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
    let content_w = dom.clientWidth - grid.left - grid.right  // 容器宽度
    let content_h = dom.clientHeight - grid.top - grid.bottom // 容器高度
    // let content_w = dom.clientWidth  // 容器宽度
    // let content_h = dom.clientHeight // 容器高度
    // type=value时坐标系的单位长度
    let x_unit = content_w/max_x // x轴单位长度（px）
    let y_unit = content_h/max_y // y轴单位长度（px）

    let max_mapR = 50, min_mapR = 10 // 最终半径映射范围（%）
    let axis_range = {
        x:[0,max_x],
        y:[0,max_y]
    } // 坐标轴范围
    let gap_left = 0 ,gap_right = 0, gap_top = 0, gap_bottom = 0 // 坐标轴留白
    let x_category = [], y_category = []

    data.forEach(node=>{
        // 水面高度由 百分制 转换为 小数制
        node.waveValue = (node.wave / 100) || 0
        // 直径大小映射到
        let mapResult = valueMap(node.radius, [min_r, max_r],[min_mapR, max_mapR])
        node.mapEffect = mapResult.mapEffect
        node.mapRadius = mapResult.mapValue
        // 计算x轴，y轴范围
        let r2px = node.mapRadius/2/100*content_h  // 半径
        let x = (node.x - axis_range.x[0]) * x_unit
        let y = (axis_range.y[1] - node.y) * y_unit
        let left =  x - r2px - gap_left
        let right = x + r2px + gap_right
        let top = y - r2px - gap_top
        let bottom = y + r2px + gap_bottom


        if(left<0){ // 左侧超过
            let n = axis_range.x[1] - axis_range.x[0]
            let left_add = Math.ceil(((node.x - axis_range.x[0]) * content_w -r2px*n)/(r2px - content_w))
            axis_range.x[0] -= left_add
            x_unit = countUnit(content_w, axis_range.x[1] - axis_range.x[0] )
        }
        if(right>content_w){ // 右侧超过
            let n = axis_range.x[1] - axis_range.x[0]
            let right_add = Math.ceil((content_w * n - (node.x - axis_range.x[0]) * content_w - r2px*n) / (r2px - content_w))
            axis_range.x[1] += right_add
            x_unit = countUnit(content_w, axis_range.x[1] - axis_range.x[0] )
        }
        if(top<0){ // 上侧超过
            let n = axis_range.y[1]-axis_range.y[0]
            let top_add = Math.ceil(
                (r2px*n - content_h*axis_range.y[1] + content_h * node.y) / (content_h - r2px)
            )
            axis_range.y[1] += top_add
            y_unit = countUnit(content_h, axis_range.y[1] - axis_range.y[0] )
        }
        if(bottom>content_h){ // 下侧超过
            let n = axis_range.y[1]-axis_range.y[0]
            let bottom_add = Math.ceil(
                // ((content_h-r2px)*n - content_h*axis_range.y[1] + content_h*node.y)/(content_h-r2px)
                (content_h*axis_range.y[1] - content_h*node.y)/(content_h-r2px) - n
            )
            axis_range.y[0] -= bottom_add
            y_unit = countUnit(content_h, axis_range.y[1] - axis_range.y[0] )
        }
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
        let x_num = 0
        let y_num = 0
        let x_unit = 0
        let y_unit = 0

        // 刷新单位
        function refreshUnit(){
            x_num = x_category.length * 2
            y_num = y_category.length * 2
            x_unit = content_w / x_num // x单位
            y_unit = content_h / y_num // y单位
        }
        refreshUnit()
        data.forEach((node,index)=>{
            let r2px = node.mapRadius/2/100*content_h // 半径px大小

            let x_index = x_category.findIndex(i=>i == node.x)*2+1 // x轴索引位置
            let y_index = y_category.findIndex(i=>i == node.y)*2+1 // y轴索引位置

            let x = x_index * x_unit // 数据x中心点
            let y = (y_num - y_index)*y_unit // 数据y中心点
            let left = x - r2px
            let right = x + r2px
            let top = y - r2px
            let bottom = y + r2px
            if(left<0){ // 左侧超过
                let n = x_num
                let left_add = Math.ceil(((x_index - 0) * content_w -r2px*n)/(r2px - content_w)/2)
                for(let i =0, pre= x_category[0];i<left_add;i++) {
                    let temp = ''
                    if(typeof pre == 'number' && (--pre)>=0)temp = pre
                    x_category.unshift(temp)
                }
                refreshUnit()
            }
            if(right>content_w){ // 右侧超过
                let n = x_num
                let right_add = Math.ceil((content_w * n - (x_index - 0) * content_w - r2px*n) / (r2px - content_w)/2)
                for(let i =0, pre = x_category.slice(-1);i<right_add;i++) x_category.push(++pre)
                refreshUnit()
            }
            if(top<0){ // 上侧超过
                let n = y_num
                let top_add = Math.ceil(
                    (r2px*n - content_h*y_num + content_h * y_index) / (content_h - r2px)/2
                )
                for(let i =0, pre = y_category.slice(-1);i<top_add;i++) y_category.push(++pre)
                refreshUnit()
            }
            if(bottom>content_h){ // 下侧超过
                let n = y_num
                let bottom_add = Math.ceil(
                    ((content_h*y_num - content_h*y_index)/(content_h-r2px) - n)/2
                )
                let last= x_category[0]
                for(let i =0, pre= y_category[0];i<bottom_add;i++) {
                    let temp = ''
                    if(typeof pre == 'number' && (--pre)>=0)temp = pre
                    y_category.unshift(temp)
                }
                refreshUnit()
            }
        })
    }
    return {
        data,
        axis_range,
        x_category,
        y_category,
    }
}

/**
 * 获取水球散点图需要的options
 * @param data 元数据
 * @param optionTemp 水球图series的模板
 * @returns {*[]}
 */
export function getLiquidOptions(data,optionTemp,targetDom,grid){
    let options = []
    let content_h = targetDom.clientHeight
    grid.top = grid.top/content_h
    grid.bottom = grid.bottom/content_h

    data.forEach((node,index)=>{
        let {config:color} = liquidColorMap[node.type]

        let topOption = copy(optionTemp)
        topOption.label.formatter = `{title|${node.radius}h}\n{subtitle|${node.name}}\n{subtitle|${node.wave}}{percent|%}`
        topOption.center = node.center // 中心坐标
        topOption.radius = `${node.mapRadius * (1 - grid.top - grid.bottom)*0.95}%`  // 半径

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

/**
 * 获取饼状图需要的数据
 * @param data 原数据
 * @returns {*}
 */
export function handlePieData(data){ // 对饼图进行处理
    let minValue = 0, maxValue = 0; // 最大值和最小值
    data.forEach(o=>{
        if(minValue>o.value) minValue = o.value;
        if(maxValue<o.value) maxValue = o.value;
    })
    let valueDiff = maxValue - minValue
    data.forEach(node=>{
        if(maxValue == minValue){
            node.valueEffect = node.value > 0?1:0;
        }else{
            node.valueEffect = (node.value - minValue) / valueDiff // 计算出半径系数
        }
    })
    data.sort((a,b)=>b.value - a.value) // 排序
    return data
}

export function getPieOptions(data, pieColor, pieOptionTemp, liquidOptionTemp,canvasSize){
    let options = []
    let pieNum = data.length // 弧形的个数
    let innerOuterGap = 3 // 水球和环的间隔百分比
    let innerRadius = parseFloat(liquidOptionTemp.radius)+innerOuterGap // 内部水球图的半径
    let pxRadius = innerRadius * canvasSize[1] / 100 // px半径
    let circleLength = 2 * Math.PI * pxRadius // 计算圆周 注意这里的innerRadius是百分比，因此无法计算出精确值
    pieOptionTemp.radius[0] = `${innerRadius+3}%`
    let fontEffect = circleLength / pieNum * 0.7 // 一个字体对应的最小值
    pieOptionTemp.label.rich.num.fontSize = Math.min( getpx(1.2), fontEffect)
    pieOptionTemp.label.rich.unit.fontSize = Math.min( getpx(0.8), fontEffect*0.8/1.2)
    pieOptionTemp.label.rich.name.fontSize = Math.min( getpx(1.2), fontEffect)

    let gap = 3 // 饼图间隔
    let angle = 360 / pieNum - gap // 单个弧形所占的弧度
    let minRadius = innerRadius + 30 // 最小外半径（40 - 80）
    let maxRadius = 95 // 最大外半径
    let angleDiff = 45 // 角度偏移
    data.forEach((node,index)=>{
        let temp = [0,1].includes(index)?(index+1):index
        const i = (temp+1)%pieColor.length
        const color = pieColor[i]
        let pieOption = copy(pieOptionTemp)
        pieOption.label.formatter = `{num|${node.value}}{unit|h} {name|${node.name}}`

        /** 计算外半径 */
        const outerRadius = useEffectMap(node.valueEffect, minRadius, maxRadius)
        pieOption.radius[1] = `${outerRadius}%`

        /** 计算起始角度 */
        pieOption.startAngle = - index * (angle + gap) + angleDiff
        let realAngle = angle>20? 20:angle // 真正的跨越角度
        pieOption.endAngle = pieOption.startAngle - realAngle


        let middle = (pieOption.endAngle + pieOption.startAngle)/2

        /** 计算渐变 */
        let x = Math.cos(-middle/180*Math.PI)
        let y = Math.sin(-middle/180*Math.PI)
        pieOption.itemStyle.color.x = x/2+0.5
        pieOption.itemStyle.color.y = y/2+0.5
        pieOption.itemStyle.color.x2 = -x/2+0.5
        pieOption.itemStyle.color.y2 = -y/2+0.5

        // 外圈颜色
        pieOption.itemStyle.color.colorStops[0].color = getHSL(color.color, color.alpha)
        // 内圈颜色
        pieOption.itemStyle.color.colorStops[1].color = getHSL(color.color, 30)

        options.push(pieOption)
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
