import { Component } from 'react'
import {
  Form, DatePicker, Button, Table, Pagination, Select,
  Message, Badge, message
} from 'antd'
import api from '@/services/api'
import moment from 'moment'
import './style.less'
import { connect } from 'dva'
import hasAuth from '@/utils/auth'
import { cacheSearchParameter, evalSearchParam, removeCriteria, TooltipFn, getAfterDeletePage } from '@/utils/common'
import color from '@/them/them'
import ModalConfirm from '@/components/common/ModalConfirm'
import { systemPermission } from '@a/permission'

const { Item } = Form
const { Option } = Select
const { urgencyColor, nomalColor } = color
const levelConfig = {
  '1': { color: nomalColor.color, title: '已读' }, // 正常
  '2': { color: urgencyColor.color, title: '未读' } // 紧急
}
class MessageManage extends Component {
  constructor (props) {
    super(props)
    this.state = {
      pagingParameter: {
        pageSize: 10,
        currentPage: 1
      },
      values: {},
      selectedRowKeys: [],
      sorts: {
        sortName: undefined,
        sortOrder: undefined
      },
      startTime: undefined,
      endTime: undefined,
      sortKey: '',
      body: {},
      messageDeleteModal: false,
      messageReadModal: false
    }
  }
  componentDidMount () {
    let { list } = evalSearchParam(this) || {}
    if (list) {
      let rank = () => {
        if (list[0].parameter.sortOrder === 'asc')
          return 'ascend'
        if (list[0].parameter.sortOrder === 'desc')
          return 'descend'
        return void (0)
      }
      this.setState({
        pagingParameter: list[0].page,
        values: list[0].parameter,
        sortKey: rank()
      }, () => this.getMessagePageList(false))
    } else {
      this.getMessagePageList(false)
    }
  }

  //获取消息列表
  getMessagePageList = (is = true) => {
    let { values, pagingParameter, sorts } = this.state
    if (is)
      cacheSearchParameter([{
        page: pagingParameter,
        parameter: { ...values, ...sorts }
      }], this.props.history)
    let { createTime = [] } = values
    if (values.createTime && values.createTime.length) {
      values.beginTime = String(moment(createTime[0]).startOf('day').valueOf())
      values.endTime = String(moment(createTime[1]).endOf('day').valueOf())
    }
    delete values.createTime
    const params = { ...values, ...pagingParameter, ...sorts }
    api.getMessagePageList(params).then(response => {
      if (response && response.head && response.head.code === '200') {
        this.setState({
          body: response.body,
          list: response.body.items
        })
      }
    })
  }
  //排序分页
  handleTableChange = (pagination, filters, sorter) => {
    this.setState({
      sorts: {
        sortName: sorter.columnKey,
        sortOrder: sorter.order === 'ascend' ? 'asc' : 'desc'
      },
      sortKey: sorter.order
    }, () => this.getMessagePageList())
  }
  //设置已读
  handleRead = (iData) => {
    let { selectList } = this.state
    if (!iData.length) {
      Message.warn('请选择消息')
      return
    }
    if(selectList.map( item => { return item.messageStatus}).includes(2)){
      this.setState({
        messageReadModal: true,
        iData
      })
    }else{
      Message.warn('消息已读')
    }

  }
  //设置已读
  readOk = (record, paramText) => {
    const { iData } = this.state
    api.getMessagePageUpdate({ ids: iData || [record] }).then(response => {
      if (response && response.head && response.head.code === '200') {
        if(!record){
          Message.success('设置成功')
        }
        this.setState({
          selectedRowKeys: [],
          endTime: undefined,
          startTime: undefined,
          messageReadModal: false
        }, () => this.getMessagePageList())
      }
      this.props.dispatch({ type: 'system/getMsgcount',  payload: { id: sessionStorage.id  } })
    }, this.props.history.push(paramText))
  }
  //表单查询
  Submit = (e) => {
    e.preventDefault()
    this.props.form.validateFields((err, values) => {
      if (!err) {
        let { messageStatus, origin, beginTime, endTime } = values
        //保留搜索条件
        if (messageStatus === 'all') values.messageStatus = undefined
        if (origin === 'all') values.origin = undefined
        values.beginTime = beginTime ? moment(beginTime).startOf('day').valueOf() : undefined
        values.endTime = endTime ? moment(endTime).endOf('day').valueOf() : undefined
        if (beginTime && endTime && values.endTime <= values.beginTime) {
          Message.info('结束时间不能小于开始时间！')
          return
        }
        this.setState({
          pagingParameter: { currentPage: 1, pageSize: 10 },
          values
        }, this.getMessagePageList)
      }
    })
  }
  //重置
  Reset = () => {
    this.props.form.resetFields()
    removeCriteria()
    this.setState({
      pagingParameter: {
        pageSize: 10,
        currentPage: 1
      },
      sortKey: '',
      values: {}
    }, () => this.getMessagePageList(false))
  }
  /**
   * 改变分页的单页数量
   * @param currentPage
   * @param pageSize {Number} 选择的每页显示数量
   * */
  changePage = (currentPage, pageSize) => {
    this.setState({
      pagingParameter: {
        currentPage,
        pageSize
      }
    }, () => this.getMessagePageList())
  }

  clearData = () => {
    let { selectedRowKeys, record, pagingParameter, body } = this.state
    let { pageSize, currentPage } = pagingParameter
    let messageIds = record ? [record.stringId] : selectedRowKeys
    api.messagePageDelete({ messageIds }).then(res=>{
      currentPage = getAfterDeletePage(body.totalRecords - messageIds.length, currentPage, pageSize)
      message.success('删除成功！')
      this.setState({
        messageDeleteModal: false,
        record: undefined,
        selectedRowKeys: [],
        pagingParameter: {
          pageSize,
          currentPage
        }
      }, this.getMessagePageList)
    })
  }

  isAlertDel = () => {
    let { selectedRowKeys } = this.state
    selectedRowKeys.length ?
      this.setState({
        messageDeleteModal: true
      }) :
      message.warn('请勾选数据！')
  }
  linkContent = (text, record) => {
    let paramText
    // 资产列表
    let textArr = ['模板实施', '结果验证', '入网实施', '安全检查', '安全整改', '退役发起', '退役实施', '资产登记' ]
    textArr.map( item => { if(text.includes(item)){ paramText = `/asset/manage?id=${JSON.parse(record.other).id}` } } )
    //工单列表页
    if(text.includes('工单')){
      let workOrderSheetTab = record.other && JSON.parse(record.other).workOrderSheetTab
      if(workOrderSheetTab === 'TAB_AGENCY' ){paramText = `/routine/workorder/todo?id=${JSON.parse(record.other).id}` }
      if(workOrderSheetTab === 'TAB_ALREADY_DONE' ){paramText = `/routine/workorder/todo?id=${JSON.parse(record.other).id}&status=3` }
      if(workOrderSheetTab === 'TAB_MY_LIST' ){paramText = `/routine/workorder/todo?id=${JSON.parse(record.other).id}&status=2` }
    } else if(text.includes('装机模板审核')){
      // 装机模板列表页
      paramText = `/asset/installtemplate?id=${JSON.parse(record.other).id}`
    } else if(text.includes('配置基准')){
      // 基准配置列表页
      paramText = `/basesetting/manage?businessId=${JSON.parse(record.other).id}`
    } else if(text.includes('配置加固')){
      // 基准加固列表页
      paramText = `/basesetting/list/validation?businessId=${JSON.parse(record.other).id}`
    } else if(text.includes('配置核查')){
      //配置核查列表页
      paramText = `/basesetting/list/enforcement?businessId=${JSON.parse(record.other).id}`
    } else if(text.includes('漏洞修复')){
      // 漏洞修复列表页
      paramText = `/bugpatch/bugmanage/dispose?id=${JSON.parse(record.other).id.split('&')[0]}&caches=1`
    } else if(text.includes('补丁安装')){
      // 补丁安装列表页
      paramText = `/bugpatch/patchmanage/install/asset?idr=${JSON.parse(record.other).id.split('&')[0]}`
    } else if(text.includes('补丁退回')){
      // 补丁信息管理列表页
      paramText = `/bugpatch/patchmanage/information?stringid=${JSON.parse(record.other).id.split('&')[1]}`
    } else if(text.includes('漏洞退回')){
      // 漏洞信息管理列表页
      paramText = `/bugpatch/bugmanage/information?id=${JSON.parse(record.other).id.split('&')[1]}`
    }else if(text.includes('漏洞处置')){
      // 漏洞处置管理（跳资产维度：资产id）
      paramText = `/bugpatch/bugmanage/dispose?id=${JSON.parse(record.other).id.split('&')[0]}`
    }else if(text.includes('补丁处置')){
      // 补丁安装（跳资产维度：资产id）
      paramText = `/bugpatch/patchmanage/install?stringid=${JSON.parse(record.other).id.split('&')[0]}`
    }else if(text.includes('资产探测')){
      // 资产探测
      paramText = '/asset/manage?status=2'
    }else if(text.includes('准入变更')){
      paramText = `/asset/admittance?assetId=${JSON.parse(record.other).id}`
    }
    this.readOk(record.stringId, paramText)
  }
  render () {
    let { pagingParameter, body, selectedRowKeys, sortKey, messageDeleteModal, messageReadModal } = this.state
    let list = []
    let total = 0
    if (body) {
      list = body.items
      total = body.totalRecords
    }
    const { getFieldDecorator } = this.props.form
    const rowSelection = {
      selectedRowKeys,
      onChange: (selectedRowKeys, selectedRows) => {
        this.setState({
          selectedRowKeys,
          selectList: selectedRows
        })
      },
      getCheckboxProps: record => ({
        // disabled: String(record.messageStatus) === '1',
        messageStatus: record.messageStatus
      })
    }
    const columns = [{
      title: '消息来源',
      dataIndex: 'origin',
      key: 'origin',
      width: '20%',
      render: (origin) => {
        switch (origin) {
          case 1:
            return ('资产管理')
          case 2:
            return ('配置管理')
          case 3:
          case 4:
            return ('漏洞补丁管理')
          case 5:
            return ('日志管理')
          case 6:
            return ('告警管理')
          case 7:
            return ('日常安全管理')
          case 8:
            return ('安全设备管理')
          case 9:
            return ('系统管理')
          // case 10 :
          //   return ('公共')
          // case 11 :
          //   return ('其他')
          default:
            break
        }
      }
    }, {
      title: '消息内容',
      dataIndex: 'content',
      key: 'content',
      width: '50%',
      render: (text, record) => {
        return(TooltipFn(<a onClick={ () => this.linkContent(text, record)}>{text}</a>))
      }
    }, {
      title: '发起时间',
      dataIndex: 'gmtCreate',
      key: 'gmtCreate',
      sortOrder: sortKey,
      sortDirections: ['descend', 'ascend'],
      width: '18%',
      render: gmtCreate => gmtCreate <= 0 ? '' : (<span className="tabTimeCss">{moment(gmtCreate).format('YYYY-MM-DD HH:mm:ss')}</span>)
    }, {
      title: '消息状态',
      dataIndex: 'messageStatus',
      key: 'messageStatus',
      width: '12%',
      render: (text) => {
        return <Badge status="success" className="ant-badge-text-color" color={levelConfig[text].color} text={levelConfig[text].title} />
      }
    }, {
      title: '操作',
      key: 'operate',
      width: '16%',
      render: (record) => {
        return (
          <div className="operate-wrap">
            {
              hasAuth(systemPermission.sysMsgDelete) &&
              <a onClick={() => this.setState({  record, messageDeleteModal: true })}>删除</a>
            }
          </div>
        )
      }
    }]
    const messageDelete = {
      visible: messageDeleteModal,
      children: (<p className='model-text'>是否删除消息?</p>),
      onOk: this.clearData,
      onCancel: () => this.setState({ messageDeleteModal: false })
    }
    const messageRead = {
      visible: messageReadModal,
      children: (<p className='model-text'>是否把信息设置为已读?</p>),
      onOk: this.readOk,
      onCancel: () => this.setState({ messageReadModal: false })
    }

    return (
      <div className="main-table-content system-message-manage">
        <div className="search-bar">
          <Form className="filter-form new-flex-layout" layout="inline" onSubmit={this.Submit} onReset={this.Reset}>
            <Item label='消息来源'>
              {
                getFieldDecorator('origin', {
                  initialValue: 'all'
                })(
                  <Select className="filter-form-item" placeholder='请选择消息来源'
                    getPopupContainer={triggerNode => triggerNode.parentNode} >
                    <Option key='all'>全部</Option>
                    <Option key='1'>资产管理</Option>
                    <Option key='2'>配置管理</Option>
                    <Option key='3'>漏洞管理</Option>
                    <Option key='4'>补丁管理</Option>
                    <Option key='5'>日志管理</Option>
                    <Option key='6'>告警管理</Option>
                    <Option key='7'>日常安全管理</Option>
                    {/* <Option key='8'>安全设备管理</Option> */}
                    <Option key='9'>系统管理</Option>
                    {/* <Option key='10'>公共</Option>
                    <Option key='11'>其他</Option> */}
                  </Select>
                )
              }
            </Item>
            <Item label='消息状态' className="item-separation">
              {
                getFieldDecorator('messageStatus', {
                  initialValue: 'all'
                })(
                  <Select className="filter-form-item" placeholder='请选择消息状态'
                    getPopupContainer={triggerNode => triggerNode.parentNode} >
                    <Option key='all'>全部</Option>
                    <Option key='1'>已读</Option>
                    <Option key='2'>未读</Option>
                  </Select>
                )
              }
            </Item>
            <Item label='发起时间' className="item-date-container item-date-two">
              {
                getFieldDecorator('beginTime')(
                  <DatePicker
                    getCalendarContainer={triggerNode => triggerNode.parentNode}
                    placeholder="开始时间"
                    disabledDate={(date) => date && date >= moment(new Date())}
                    onChange={(v) => this.setState({ startTime: v })}
                  />
                )
              }
              <span>-</span>
            </Item>
            <Item className="item-date-container item-date-two">
              {
                getFieldDecorator('endTime')(
                  <DatePicker
                    placeholder="结束时间"
                    getCalendarContainer={triggerNode => triggerNode.parentNode}
                    disabledDate={(date) => date && date >= moment(new Date())}
                    onChange={(v) => this.setState({ endTime: v })}
                  />
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
            <div></div>{/*占位 */}
            <div className="right-btn">
              {hasAuth(systemPermission.sysMsgFlag) && <Button type="primary" onClick={() => this.handleRead(selectedRowKeys)}>标为已读</Button>}
              {hasAuth(systemPermission.sysMsgBatchdelete) && <Button type="primary" onClick={this.isAlertDel}>批量删除</Button>}
            </div>
          </div>
          <Table
            // onRow={(record) => ({
            //   onClick: () => {
            //     if (record.messageStatus === 2)
            //       this.readOk([record.stringId])
            //   }
            // })}
            rowKey="stringId"
            columns={columns}
            dataSource={list}
            rowSelection={rowSelection}
            pagination={false}
            showQuickJumper={true}
            showSizeChanger={true}
            onChange={this.handleTableChange}
          />
          {
            total > 0 &&
            <Pagination
              current={pagingParameter.currentPage}
              pageSize={pagingParameter.pageSize}
              className="table-pagination"
              total={total || 0}
              showTotal={(total) => `共 ${total || 0} 条数据`}
              showQuickJumper={true}
              showSizeChanger={total > 10}
              onChange={this.changePage}
              onShowSizeChange={this.changePage} />
          }

          <ModalConfirm props={messageDelete}/>
          <ModalConfirm props={messageRead}/>
        </div>
      </div>
    )
  }
}
const mapStateToProps = ({ system }) => {
  return {
    getMsgcount: system.getMsgcount
  }
}
const MessageManages = Form.create()(MessageManage)
export default connect(mapStateToProps)(MessageManages)
