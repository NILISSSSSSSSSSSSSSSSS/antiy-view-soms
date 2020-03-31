
import { Component } from 'react'
import { connect } from 'dva'
import { Row, Col, Form, Table, Pagination, Modal, Tooltip } from 'antd'
import moment from 'moment'
import './style.less'
import { download, analysisUrl, emptyFilter } from '@/utils/common'
import api from '@/services/api'

class LogManagerDetails extends Component{
  constructor (props){
    super(props)
    this.state = {
      body: {},
      moduleIds: {
        '1010': '资产管理',
        '1020': '配置管理',
        '1030': '漏洞管理',
        '1031': '突发漏洞管理',
        '1032': '日常漏洞管理',
        '1040': '补丁管理',
        '1041': '日常补丁管理',
        '1042': '应急补丁管理',
        '1050': '日志管理',
        '1060': '告警管理',
        '1070': '安全设备管理',
        '1080': '日常安全管理',
        '1090': '系统管理',
        '1110': '预警管理'
      },
      list: [],
      noChooseTime: '',
      usersByRoleCodeAndAreaIdList: [],
      columns: [{
        title: '审计时间',
        dataIndex: 'gmtCreate',
        key: 'gmtCreate',
        width: 200,
        render: (text)=>{
          return(<span className="tabTimeCss">{ text ? moment(text).format('YYYY-MM-DD HH:mm:ss') : ''}</span>)
        }
      }, {
        title: '审计人',
        dataIndex: 'auditorName',
        key: 'auditorName',
        render: (text)=>{
          return(
            <Tooltip title={text} placement="topLeft">
              <span>{text}</span>
            </Tooltip>
          )
        }
      }, {
        title: '审计报告名称',
        dataIndex: 'auditReportName',
        key: 'auditReportName',
        render: (text)=>{
          return(
            <Tooltip title={text} placement="topLeft">
              <span>{text}</span>
            </Tooltip>
          )
        }
      }, {
        title: '审计结论',
        dataIndex: 'auditContent',
        key: 'auditContent',
        render: (text)=>{
          return(
            <Tooltip title={text} placement="topLeft">
              <span>{text}</span>
            </Tooltip>
          )
        }
      }, {
        title: '附件',
        width: 120,
        render: (text, scope)=>{
          return(
            <div style={{ overflow: 'visible', textOverflow: 'initial', whiteSpace: 'pre-wrap' }}>
              {emptyFilter(
                scope.attachmentList && scope.attachmentList.length ?
                  <div className="operate-wrap">
                    <a onClick={ () => this.showFileModal(scope) }>文件下载 </a>
                  </div>
                  : ''
              )}
            </div>
          )
        }
      }],
      pageIndex: 1,
      pageSize: 10,
      fileVal: {},
      fileModal: false,
      licenseVersion: JSON.parse(sessionStorage.getItem('licenseVersion'))
    }
  }
  componentDidMount () {
    api.getLogHandleListId({ oprId: analysisUrl(this.props.location.search).stringId }).then((data)=>{
      if(data.head && data.head.code === '200'){
        this.setState({ body: data.body })
        if(data.body.auditorId)
          this.pageChange(1, 10)
      }
    })
    this.getAuditList()
  }
  getAuditList = (currentPage, pageSize) =>{
    api.getLogHandleListAuditId({ oprId: analysisUrl(this.props.location.search).stringId, currentPage, pageSize }).then((data)=>{
      if(data.head && data.head.code === '200'){
        this.setState({
          list: data.body
        })
      }
    })
  }
  render () {
    let { body, columns, list, pageIndex, fileModal, fileVal, moduleIds, licenseVersion } = this.state
    const span = { xxl: 6, xl: 8 }
    return(
      <div className="main-detail-content">
        <p className='detail-title'>基础信息</p>
        <div className='detail-content detail-content-layout'>
          <Row>
            <Col {...span}><span className="detail-content-label">日志记录时间：</span>{
              body.createTime ? moment(body.createTime).format('YYYY-MM-DD HH:mm:ss') : ''}</Col>
            <Col {...span}><span className="detail-content-label">操作用户：</span>{body.oprName}</Col>
            <Col {...span}><span className="detail-content-label">操作人IP：</span>{body.oprIp}</Col>
            <Col {...span}><span className="detail-content-label">安全事件：</span>{body.incident}</Col>
            {
              (licenseVersion === 2 || licenseVersion === 3) && <Col {...span}><span className="detail-content-label">业务流程：</span>{ body.moduleId && moduleIds[body.moduleId.slice(0, 4)]}</Col>
            }
          </Row>
        </div>
        <p className='detail-title'>日志审计信息</p>
        <div className="table-wrap">
          <Table rowKey="stringId" columns={columns} dataSource={list.items} pagination={false}></Table>
          {
            list.totalRecords > 0 &&
            <Pagination
              current={pageIndex}
              className="table-pagination"
              defaultPageSize={10}
              onChange={this.pageChange}
              showSizeChanger ={list.totalRecords > 10}
              onShowSizeChange={ this.pageChange}
              total={list.totalRecords ? list.totalRecords : 0}  showTotal={(total) => `共 ${total} 条数据`} showQuickJumper={true} />
          }

        </div>
        {/* <footer className="Button-center back-btn">
          <Button type="primary" ghost onClick={this.callback }>返回</Button>
        </footer> */}
        {/* 文件下载弹出框 */}
        <Modal
          className='over-scroll-modal-noBtn'
          visible={fileModal}
          title='文件列表'
          onCancel= {() => this.setState({ fileModal: false })}
          footer={null}
          width = {500}
        >
          <div className='modal-attachment'>
            {
              fileVal.attachmentList && fileVal.attachmentList.length ? (fileVal.attachmentList.map((item, index)=>(
                <div key={index} className='modal-attachment-item'>
                  <Tooltip title={item.fileName} placement="topLeft" getPopupContainer={triggerNode => triggerNode.parentNode}>
                    <span className='modal-attachment-text'>{item.fileName}</span>
                  </Tooltip>
                  <img src={require('@/assets/download.svg')} className="download-icon" title="点击下载" alt=""
                    onClick={()=>{ download('/api/v1/log/download/file', { fileName: item.fileName, fileUrl: item.fileUrl }) }} />
                </div>
              ))) : ''
            }
          </div>
        </Modal>
      </div>
    )
  }
  //显示弹窗
  showFileModal = (fileVal) =>{
    this.setState({
      fileModal: true,
      fileVal
    })
  }
  //取消
  handleCancel = ()=>{
    this.props.form.resetFields()
  }

  timeStampToDate = (text) =>{
    if (text){
      const dateFormat = 'YYYY-MM-DD HH:mm:ss'
      return moment(text).format(dateFormat)
    }
  }
  //返回上一级
  callback=()=>{
    this.props.history.goBack()
  }
  //翻页
  pageChange = (page, pageSize)=>{
    this.setState({
      pageIndex: page,
      pageSize: pageSize
    })
    this.getAuditList(page, pageSize, false)
  }
}

const mapStateToProps = () => {
  return {
  }
}
const LogManagerDetailss = Form.create()(LogManagerDetails)
export default connect(mapStateToProps)(LogManagerDetailss)
