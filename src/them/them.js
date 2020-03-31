// 分类配色，所有图形颜色
const categoryColor = [ '#4083FF', '#46ECFF', '#A569FF', '#22B37A', '#FFDA38', '#FFDA38' ]

// 图形组件的legend的样式
const canvasLegendStyle = { color: '#98ACD9' }

const urgencyColor = { color: '#C22A4E', title: '紧急' } // 紧急
const importantColor = { color: '#FF8E64', title: '重要' } // 重要
const secondaryColor = { color: '#FFDA38', title: '次要' } // 次要
const promptColor = { color: '#5C85FF', title: '提示' } // 提示
const nomalColor = { color: '#3B6CFF', title: '正常' } // 正常
const abnormalColor = { color: '#FF426F', title: '异常' } // 异常
// 所有等级配色
const levelColor = [urgencyColor.color, importantColor.color, secondaryColor.color, promptColor.color]

export default {
  canvasLegendStyle,
  categoryColor,
  levelColor,
  urgencyColor,
  importantColor,
  secondaryColor,
  promptColor,
  nomalColor,
  abnormalColor
}
