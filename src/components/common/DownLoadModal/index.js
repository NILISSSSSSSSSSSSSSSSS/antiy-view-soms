
import React, { Component } from 'react'
import { connect } from 'dva'
import { Form, Modal, Tooltip } from 'antd'
import { download } from '@/utils/common'

class Search extends Component {
  constructor (props){
    super(props)
    this.state = {
      changeValue: 0,
      saveModal: false
    }
  }

  render () {
    const { params } = this.props
    return (
      <Modal
        className='over-scroll-modal-noBtn'
        visible={params.fileModal}
        title='文件列表'
        onCancel= {this.props.onCancel}
        footer={null}
        width = {500}
      >
        <div className='modal-attachment'>
          {
            params.attachmentList && params.attachmentList.length ? (params.attachmentList.map((item, index)=>(
              <div className='modal-attachment-item'>
                <Tooltip title={item.fileName} placement="topLeft" getPopupContainer={triggerNode => triggerNode.parentNode}>
                  <span className='modal-attachment-text'>{item.fileName || item.reportName}</span>
                </Tooltip>
                <img style={{ cursor: 'pointer' }} key={index} src={require('@/assets/download.svg')} className="download-icon" title="点击下载" alt=""
                  onClick={()=>{ download(params.url, { fileName: item.fileName || item.reportName, fileUrl: item.fileUrl || item.reportUrl }) }}/>
              </div>
            ))) : ''
          }
        </div>
      </Modal>
    )
  }
}
const Searchs = Form.create()(Search)

export default connect()(Searchs)