/* 自适应脚本 */

// 根据屏幕分辨率定制rem单位大小
// 最大适配：3840
// 最小适配：1024
export function resize(){
    let rootWidth = document.documentElement.clientWidth || document.body.clientWidth
    let rootDom = document.querySelector('html')
    let k = 16/1920
    let b = 16 - 1920*k
    rootDom.style.fontSize = (k*rootWidth+b) + 'px'
}

/**
 * 将rem转化为px值
 * @param rem
 * @returns {number}
 */
export function getpx(rem){
    let rootDom = document.querySelector('html')
    let fontSize = parseFloat( rootDom.style.fontSize)
    return rem*fontSize
}

/**
 *
 * @param h
 * @param s
 * @param l
 * @param a
 * @param option
 * @returns {string}
 */
export function getHSL([h,s,l],alpha=100,option={
    h_add:0,
    s_add:0,
    l_add:0,
}){
    const h_add = option.h_add || 0
    const s_add = option.s_add || 0
    const l_add = option.l_add || 0
    return `hsl(${h+h_add}deg ${s+s_add}% ${l+l_add}% / ${alpha}%)`
}

