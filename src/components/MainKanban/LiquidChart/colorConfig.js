import {getHSL, getpx} from "@/utils/style.js";

/**
 *  color: [h, s, l]
 *  h_add: 色相偏移
 *  s_add: 饱和度偏移
 *  l_add: 明暗度偏移
 */
// 深蓝色
const darkBlue = {
    liquid:{color:[235, 93, 67, 50], h_add:0, s_add:0, l_add:-30,},
    pie:[
        {color:[241, 95, 75, 50], h_add:0, s_add:0, l_add:-30, alpha:100,},
        {color:[241, 95, 75, 50], h_add:0, s_add:0, l_add:-30, alpha:100,},
    ]
}

// 紫色
const violet = {
    liquid:{color:[267, 71, 66, 40], h_add:25, s_add:20, l_add:-30},
    pie:[
        {color:[241, 95, 75, 50], h_add:0, s_add:0, l_add:-30, alpha:100,},
        {color:[241, 95, 75, 50], h_add:0, s_add:0, l_add:-30, alpha:100,},
    ]
}

// 浅蓝色
const lightBlue = {
    liquid:{color:[218, 97, 70, 50], h_add:0, s_add:0, l_add:-20},
    pie:[
        {color:[222, 100, 71], h_add:0, s_add:0, l_add:0, alpha:50,},
        {color:[222, 100, 71], h_add:0, s_add:0, l_add:0, alpha:50,},
    ]
}

// 靛青色
const cyan = {
    liquid:{color:[179, 49, 54], h_add:0, s_add:20, l_add:-15,},
    pie:[
        {color:[179, 49, 54], h_add:0, s_add:0, l_add:-20, alpha:50,},
        {color:[179, 49, 54], h_add:0, s_add:0, l_add:-20, alpha:50,},
    ]
}

// 橘红色
const orange = {
    liquid:{color:[22, 78, 49], h_add:0, s_add:10, l_add:-5,},
    pie:[
        {color:[22, 78, 49], h_add:0, s_add:10, l_add:-5, alpha:75,},
        {color:[22, 78, 49], h_add:0, s_add:10, l_add:-5, alpha:75,},
    ]
}

export const colorList = [
    darkBlue,
    violet,
    lightBlue,
    cyan,
    orange
]

// 计算图例颜色-阴影颜色-背景颜色-波浪颜色等等
function getColorOption(){
    colorList.forEach(colorNode=>{
        let config = {
            top:{},
            base:{}
        }

        config.toolTipColor =  getHSL(colorNode.liquid.color) // 图例颜色
        {
            // 水球颜色
            const {color, h_add, s_add, l_add} = colorNode.liquid
            config.top.itemStyleColor = getHSL(color, 100,{h_add,s_add,l_add}) // 主水波颜色
            config.top.shadowColor = getHSL(color, 100) // 主阴影颜色
            config.top.backgroundColor = getHSL(color, 20) // 主背景颜色
            config.base.backgroundColor = getHSL(color, 20,{h_add,s_add,l_add}) // 叠底背景颜色
            config.base.shadowColor = getHSL(color, 100,{h_add,s_add,l_add}) // 叠底阴影颜色
        }

        colorNode.config = config
    })
}
getColorOption()

export const liquidColorMap = {
    '进行中':colorList[0],
    '已完成':colorList[1],
    '迭代中':colorList[2],
    '运维中':colorList[3],
    '已逾期':colorList[4],
}

// 获取图例及其配色
export function getToolTips(){
    return Object.entries(liquidColorMap).map(([key,value])=>{
        return {
            label:key,
            value:key,
            color:value.config.toolTipColor
        }
    })
}

// 饼图模版
export const pieOptionTemp = {
    type:'pie',
    center:['50%','50%'],
    radius:['50%','65%'],
    startAngle:80,
    data:[{
        name:'张杰',
        radiusValue:120,
        value:50,
    }],
    endAngle:0,
    itemStyle:{
        color:{
            type: 'linear',
            x: 0, y: 0,
            x2: 1, y2: 1,
            colorStops: [{
                offset: 0, color: '#7703bf' // 外圈颜色
            }, {
                offset: 1, color: '#7703bf33' // 内圈颜色
            }],
        }
    },
    label:{
        position:'inner',
        rotate:'radial',
        color:'#fff',
        formatter:(param)=>`{num|120}{unit|h}\t{name|${param.name}}`,
        rich:{
            num:{
                textShadowColor:'rgba(0,0,0,0.75)',
                textShadowBlur:3,
                textShadowOffsetY:1,
                fontSize:getpx(1.5),
                fontFamily:'SourceHanSansCN-Regular',
            },
            unit:{
                textShadowColor:'rgba(0,0,0,0.75)',
                textShadowBlur:3,
                textShadowOffsetY:1,
                fontSize:getpx(0.8),
                fontFamily:'SourceHanSansCN-Regular',
            },
            name:{
                textShadowColor:'rgba(0,0,0,0.75)',
                textShadowBlur:3,
                textShadowOffsetY:1,
                fontSize:getpx(1.5),
                fontFamily:'SourceHanSansCN-Regular',
            }
        }
    },
    labelLine:{
        show:false
    },
    animation:false
}
