import {getpx} from "@/utils/style.js";

/**
 *  color: [h, s, l]
 *  h_add: 色相偏移
 *  s_add: 饱和度偏移
 *  l_add: 明暗度偏移
 */
export const liquidColorList = [
    { // 深蓝 0
        color:[235, 93, 67, 50],
        h_add:0,
        s_add:0,
        l_add:-30,
    },
    { // 紫色 1
        color:[267, 71, 66, 40],
        h_add:25,
        s_add:20,
        l_add:-30
    },
    { //浅蓝 2
        color:[218, 97, 70, 50],
        h_add:0,
        s_add:0,
        l_add:-20
    },
    { // 靛青 3
        color:[179, 49, 54],
        h_add:0,
        s_add:20,
        l_add:-15,
    },
    { // 红色 4
        color:[22, 78, 49],
        h_add:0,
        s_add:10,
        l_add:-5,
    },
]

export const liquidPieColor = [
    { // 深蓝
        pie:[
            { // 深紫色紫色
                color:[241, 95, 75, 50],
                h_add:0,
                s_add:0,
                l_add:-30,
                alpha:100,
            },
            { // 浅紫色
                color:[241, 95, 75, 50],
                h_add:0,
                s_add:0,
                l_add:-30,
                alpha:100,
            },
        ]
    },
    { // 紫色
        pie:[
            { // 深紫色紫色
                color: [269, 95, 71],
                h_add:0,
                s_add:0,
                l_add:0,
                alpha:50,
            },
            { // 浅紫色
                color: [269, 95, 71],
                h_add:0,
                s_add:0,
                l_add:0,
                alpha:50,
            },
        ]
    },
    { // 浅蓝
        pie:[
            { // 深紫色紫色
                color:[222, 100, 71],
                h_add:0,
                s_add:0,
                l_add:0,
                alpha:50,
            },
            { // 浅紫色
                color:[222, 100, 71],
                h_add:0,
                s_add:0,
                l_add:0,
                alpha:50,
            },
        ]
    },
    { // 靛青
        pie:[
            { // 深紫色紫色
                color:[179, 49, 54],
                h_add:0,
                s_add:0,
                l_add:-20,
                alpha:50,
            },
            { // 浅紫色
                color:[179, 49, 54],
                h_add:0,
                s_add:0,
                l_add:-20,
                alpha:50,
            },
        ]
    },
    { // 红色
        pie:[
            { // 深紫色紫色
                color:[22, 78, 49],
                h_add:0,
                s_add:10,
                l_add:-5,
                alpha:75,
            },
            { // 浅紫色
                color:[22, 78, 49],
                h_add:0,
                s_add:10,
                l_add:-5,
                alpha:75,
            },
        ]
    },
]

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
