import { Tooltip } from 'antd'
import React from 'react'
import { emptyFilter } from '@/utils/common'

export default ({ title, children, ...other }) => {
  let component = ''
  if(typeof children === 'string' || !children){
    component = <span className="table-tooltop">{emptyFilter(title)}</span>
  }else {
    component = children
  }
  return (
    <Tooltip title={title === '--' ? '' : title} { ...other} getPopupContainer={triggerNode => triggerNode.parentNode}>
      { component }
    </Tooltip>
  )
}
