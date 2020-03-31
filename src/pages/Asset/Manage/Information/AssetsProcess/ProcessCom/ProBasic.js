import React from 'react'
import '../style.less'

export default ({ basicObj }) => {
  const { remarkName, note, fileInfo } = basicObj
  // 检查附件.doc
  const fileInfos = JSON.parse(fileInfo)
  const styles = {
    style: {
      display: 'block',
      overflow: 'hidden',
      'text-overflow': 'ellipsis',
      'white-space': 'nowrap'
    }
  }
  return (
    <section className="basic-info">
      <p>
        <span className="label">{remarkName}：</span>
        <span>{note}</span>
      </p>
      <p>
        <span className="label">附件：</span>
        {Array.isArray(fileInfos) && fileInfos.map((item, i)=> <a {...styles} onClick={() => window.open(`/api/v1/file/download?access_token=${sessionStorage.getItem('token')}&url=${item.url}&fileName=${encodeURIComponent(item.fileName)}`)}>{item.fileName}</a> )}
      </p>
    </section>
  )
}

