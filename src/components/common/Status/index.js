import { Badge } from 'antd'
import color from '@/them/them.js'
import './index.less'

const { urgencyColor, importantColor, secondaryColor, promptColor, nomalColor, abnormalColor } = color
const levelConfig = {
  '0': { color: nomalColor.color, title: '正常' }, // 正常
  '1': { color: urgencyColor.color, title: '紧急' }, // 紧急
  '2': { color: importantColor.color, title: '重要' }, // 重要
  '3': { color: secondaryColor.color, title: '次要' }, // 次要
  '4': { color: promptColor.color, title: '提示' }, // 提示
  '5': { color: abnormalColor.color, title: '异常' } // 异常
}
export default ({ level = '0', text }) => {
  const className = ''
  return (
    <div className="status-color">
      <Badge status="success" className={className} color={ levelConfig[ level ].color } text={ text || levelConfig[ level ].title }/>
    </div>)
}
