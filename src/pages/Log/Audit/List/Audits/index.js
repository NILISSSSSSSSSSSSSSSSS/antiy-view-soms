
import { Component } from 'react'
import { connect } from 'dva'
import { Button, Form, Table, Pagination, Input, message, Tooltip, Modal, Select } from 'antd'
import { Link } from 'dva/router'
import api from '@/services/api'
import { download } from '@/utils/common'
import ExportModal from '@/components/common/ExportModal'
import ModalConfirm from '@/components/common/ModalConfirm'
import hasAuth from '@/utils/auth'
import { transliteration, emptyFilter, cacheSearchParameter, evalSearchParam } from '@/utils/common'
import DateRange from '@/components/common/DateRange'
import moment from 'moment'
import { logAlarmPermission } from '@a/permission'
import { analysisUrl } from '@u/common'

const { Item } = Form
const { Option } = Select
class LogAudit extends Component{
  constructor (props){
    super(props)
    this.state = {
      columns: [
        {
          title: '日志审计时间',
          dataIndex: 'gmtCreate',
          key: 'gmtCreate',
          width: 200,
          render: (text)=>{
            return(<span className="tabTimeCss">{ text ? moment(text).format('YYYY-MM-DD HH:mm:ss') : emptyFilter(text)}</span>)
          }
        }, {
          title: '审计报告名称',
          dataIndex: 'auditReportName',
          key: 'auditReportName',
          render: (text)=>{
            return(
              <Tooltip title={text} placement="topLeft" getPopupContainer={triggerNode => triggerNode.parentNode}>
                <span>{text}</span>
              </Tooltip>
            )
          }
        }, {
          title: '审计人员',
          dataIndex: 'auditorName',
          key: 'auditorName',
          render: (text)=>{
            return(
              <Tooltip title={text} placement="topLeft" getPopupContainer={triggerNode => triggerNode.parentNode}>
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
              <Tooltip title={text} placement="topLeft" getPopupContainer={triggerNode => triggerNode.parentNode}>
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
        }, {
          title: '操作',
          render: (text, scope)=>{
            return (
              <div className="operate-wrap">
                {
                  hasAuth(logAlarmPermission.logManageReportView) ? <Link to={`/logalarm/log/audit/details?id=${transliteration(scope.stringId)}`}>查看</Link> : null
                }
                {  analysisUrl(this.props.history.location.search).status === '1' && <a onClick={ () =>this.setState({ delModal: true })}>删除</a>}
              </div>
            )
          }
        }],
      list: this.props.list,
      pagingParameter: {
        currentPage: 1,
        pageSize: 10
      },
      userList: [],
      search: {},
      delModal: false,
      //导出框显示
      exportVisible: false,
      //导出查询条件
      searchValues: {},
      //导出数据总数
      exportTotal: 0,
      fileModal: false,
      fileVal: {}

    }
  }

  componentDidMount (){
    //解析保留的数据
    const { list } = evalSearchParam(this) || {}
    //判断是否存有数据
    if(sessionStorage.searchParameter && list){
      const { page, parameter } = list[0]
      this.setState({
        pagingParameter: page,
        search: parameter
      }, () => {
        this.getAuditLogList({ ...page, ...parameter } )
      })
    }else{
      this.getAuditLogList({ currentPage: 1, pageSize: 10 } )
    }
    //审计人员接口
    api.getAllStatusUserInAreaOfCurrentUser().then((data)=>{
      data.body.unshift({ name: '全部', stringId: '0' })
      this.setState({
        userList: data.body
      })
    })
  }

  UNSAFE_componentWillReceiveProps (nextProps) {
    if(JSON.stringify(this.props.list) !== JSON.stringify(nextProps.list))
      this.setState({ list: nextProps.list })
  }

  render (){
    let { list, pagingParameter, columns, exportVisible, searchValues, exportTotal, fileModal, fileVal, userList, delModal } = this.state
    let { getFieldDecorator } = this.props.form
    const alertClear = {
      visible: delModal,
      children: (<p className='model-text'>是否清除此报告?</p>),
      onOk: this.delData,
      onCancel: () => this.setState({ delModal: false })
    }
    return(
      <article className="main-table-content">
        <div className="search-bar">
          <Form className="filter-form new-flex-layout" layout="inline" onSubmit={this.onSubmit} onReset={this.onReset}>
            <Item label="日志审计时间" className='item-date-container'>
              {getFieldDecorator('time')(
                <DateRange format="YYYY-MM-DD" placeholder={['开始日期', '结束日期']} resetKey={this.resetKey} allowClear/>
              )}
            </Item>
            <Item label="审计人员" className='item-separation'>
              {
                getFieldDecorator('auditorName', { initialValue: '全部' })(
                  <Select
                    getPopupContainer={triggerNode => triggerNode.parentNode}
                    showSearch
                    filterOption={(input, option) =>
                      option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                    }
                    optionFilterProp="children"
                    className="filter-form-item" allowClear={true} placeholder="全部" >
                    {
                      userList.map((item, index)=>{
                        return(<Option value={item.stringId} key={index + 'auditorName'}>{item.name}</Option>)
                      })
                    }
                  </Select>
                )
              }
            </Item>
            <Item label="审计报告名称">
              {
                getFieldDecorator('auditReportName')(
                  <Input autoComplete="off" className="filter-form-item" placeholder='请输入' maxLength={60}/>
                )
              }
            </Item>
            <Item className="search-item">
              <Button type="primary" htmlType="submit">查询</Button>
              <Button type="primary" ghost htmlType='reset'>重置</Button>
            </Item>
          </Form>
        </div>
        <div className="table-wrap">
          <div className="table-btn">
            <div className="left-btn">
              { hasAuth(logAlarmPermission.logManageRReport) && <Button type="primary" onClick={this.Download}>导出</Button> }
            </div>
          </div>
          <Table rowKey="stringId"  columns={columns} dataSource={list.items} pagination={false}></Table>
          {
            list.totalRecords > 0 &&
            <Pagination
              current={pagingParameter.currentPage}
              pageSize={pagingParameter.pageSize}
              className="table-pagination"
              defaultPageSize={10}
              onChange={this.pageChange}
              showSizeChanger ={list.totalRecords > 10}
              onShowSizeChange={this.pageChange}
              total={list.totalRecords ? list.totalRecords : 0}  showTotal={(total) => `共 ${total} 条数据`} showQuickJumper={true}/>
          }

        </div>
        {/* 导出 */}
        {
          exportVisible &&
          <ExportModal
            exportModal={{
            //弹框显示
              exportVisible,
              //搜索条件
              searchValues,
              //数据总数
              total: exportTotal,
              //阈值
              threshold: 5000,
              //下载地址
              url: '/api/v1/log/exoprt/audit/records'
            }}
            handleCancelExport={() => this.setState({ exportVisible: false })} />
        }
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
                <div className='modal-attachment-item'>
                  <Tooltip title={item.fileName} placement="topLeft" getPopupContainer={triggerNode => triggerNode.parentNode}>
                    <span className='modal-attachment-text'>{item.fileName}</span>
                  </Tooltip>
                  <img  key={index} src={require('@/assets/download.svg')} className="download-icon" title="点击下载" alt=""
                    onClick={()=>{ download('/api/v1/log/download/file', { fileName: item.fileName, fileUrl: item.fileUrl }) }}/>
                </div>
              ))) : ''
            }
          </div>
        </Modal>
        {/* 删除弹窗 */}
        <ModalConfirm props={alertClear}/>
      </article>
    )
  }
    //获取数据
    getAuditLogList = (params) =>{
      this.props.dispatch({ type: 'Logs/getAuditLogList', payload: params })
    }
  //显示文件下载弹窗
  showFileModal = (fileVal) =>{
    this.setState({
      fileModal: true,
      fileVal
    })
  }
  //导出
  Download = ()=>{
    let { search, pageIndex, pageSize } = this.state
    search.currentPage = pageIndex
    search.pageSize = pageSize
    this.props.form.validateFields((err, values) => {
      values.auditorName === '全部' && delete values.auditorName
      !values.auditReportName && delete values.auditReportName

      if(!err){
        search.auditorId = values.auditorName
        search.auditReportName = values.auditReportName
        if(values.time && values.time[0] ){
          search.beginTime = moment(values.time[0].format('YYYY-MM-DD') + ' 00:00:00').valueOf() + ''
        }
        if( values.time && values.time[1] ){
          search.endTime = moment(values.time[1].format('YYYY-MM-DD') + ' 23:59:59').valueOf() + ''
        }
        api.getAuditLogList(search).then(data=>{
          const exportTotal = data.body.totalRecords
          if(exportTotal === 0){
            message.info('暂无数据导出')
            return false
          }else{
            this.setState({
              exportTotal,
              exportVisible: true,
              searchValues: search
            })
          }
        })
      }
    })
  }
  //提交表单
  onSubmit = (e) => {
    e.preventDefault()
    let { pagingParameter } = this.state
    this.props.form.validateFields((err, values) => {
      if (!err) {
        let init = {}
        values.auditorName === '全部' && delete values.auditorName
        !values.auditReportName && delete values.auditReportName
        init = {
          auditReportName: values.auditReportName,
          // auditorName: values.auditorName,
          auditorId: values.auditorName,
          beginTime: values.time && values.time[0] ? moment(values.time[0].format('YYYY-MM-DD') + ' 00:00:00').valueOf() + '' : null,
          endTime: values.time && values.time[1] ? moment(values.time[1].format('YYYY-MM-DD') + ' 23:59:59').valueOf() + '' : null
        }
        cacheSearchParameter([{
          page: pagingParameter,
          parameter: {
            ...values
          }
        }], this.props.history, '0')
        this.setState({
          search: init,
          pagingParameter: {
            currentPage: 1,
            pageSize: pagingParameter.pageSize
          } })
        this.getAuditLogList({ ...init,  pageSize: pagingParameter.pageSize, currentPage: 1 } )
      }
    })
  }
  //重置表单信息
  onReset = ()=>{
    this.setState({ search: {} })
    this.props.form.resetFields()
    this.setState({
      pagingParameter: {
        currentPage: 1,
        pageSize: 10
      }
    })
    this.getAuditLogList({ currentPage: 1, pageSize: 10 })
    this.resetKey = Math.random()
  }
  //翻页
  pageChange = (currentPage, pageSize)=>{
    let { search } = this.state
    cacheSearchParameter([{
      page: {
        currentPage,
        pageSize
      },
      parameter: {
        ...search
      }
    }], this.props.history, '0')
    this.setState({
      pagingParameter: {
        currentPage,
        pageSize
      }
    })
    this.getAuditLogList({ currentPage, pageSize, ...search })
  }
  // 删除
  delData = () => {
    let { currentPage, pageSize, search } = this.state
    console.log('删除')
    this.setState({ delModal: false })
    this.getAuditLogList({ currentPage, pageSize, ...search })
  }
}
const mapStateToProps = ({ Logs }) => {
  return {
    list: Logs.logAuitList
  }
}

const LogAudits = Form.create()(LogAudit)

export default connect(mapStateToProps)(LogAudits)
