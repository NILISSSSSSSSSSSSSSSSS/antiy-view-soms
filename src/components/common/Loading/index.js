import React from 'react'
import { Spin } from 'antd'
import './style.less'

const Loading = ({ loading = false }) => {
  return (
    <div className='loading-animation'>
      <Spin tip='' spinning={loading}></Spin>
    </div>
  )
}

export default Loading
