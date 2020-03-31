import React, { Fragment } from 'react'
import { Row, Col } from 'antd'
import DownloadFile from '@/components/common/DownloadFile'

const blockSpan = { xxl: 24, xl: 24 }

export default ({ detailList = [], body = {} }) => {
  return (
    <Fragment>
      <div className="detail-content detail-content-layout">
        <Row>
          {detailList.map((item, index) => {
            let value = ''
            return <Fragment key={index}><Col  {...blockSpan}><span className="detail-content-label">{item.name}：</span>
              {item.key !== 'source' ? (value || '--') : (body.fileRequests && body.fileRequests.length ? <DownloadFile filelist={body.fileRequests.map(item =>({ ...item, fileName: item.fileName }))}/> : '--' )}
            </Col></Fragment>
          })}
        </Row>
      </div>
    </Fragment>)
}