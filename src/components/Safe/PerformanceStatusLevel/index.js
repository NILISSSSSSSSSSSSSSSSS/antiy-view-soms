import Tooltip from '@/components/common/CustomTooltip'
const level = {
  '0': { color: '#fff', backgroundColor: 'green', title: '正常' }, // 正常
  '1': { color: '#fff', backgroundColor: 'rgb(255, 0, 0)', title: '紧急' }, // 紧急
  '2': { color: '#fff', backgroundColor: 'rgba(255, 0, 0, 0.85)', title: '重要' }, // 重要
  '3': { color: '#000', backgroundColor: 'rgba(255, 255, 0, 0.6)', title: '次要' }, // 次要
  '4': { color: '#000', backgroundColor: '#c0c0c0', title: '提示' } // 提示
}
/**
 * 渲染性能的告警级别颜色显示块
 * @param alarmNewLevel
 * @param text
 * @param style
 * @return {*}
 */
export default ({ alarmNewLevel, text,  style }) => {
  const _style = level[alarmNewLevel + '']
  const title = level[alarmNewLevel + ''].title
  return (
    <div style={{ textAlign: 'center' }}>
      <span style={{ padding: 6, display: 'inline-block', width: 44, borderRadius: 3, ..._style, ...style }}>
        <Tooltip title={<span style={{ padding: 6, borderRadius: 3, ..._style, ...style }}>{title}</span>}>{text}%</Tooltip>
      </span>
    </div>
  )
}
