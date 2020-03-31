import React, { Component, Fragment } from 'react'
import { connect } from 'dva'
import { withRouter } from 'dva/router'
import { Form, Table, Pagination, Button, message } from 'antd'
import moment from 'moment'
import { TooltipFn, timeStampToTime, emptyFilter, cacheSearchParameter, evalSearchParam, removeCriteria } from '@/utils/common'
import api from '@/services/api'
import hasAuth from '@/utils/auth'
import { defendPermission } from '@a/permission'
import Search from '@/components/common/Search'
import IntoManageModal from '@/components/Defend/IntoManageModal'
import ModifyPwdModal from '@/components/Defend/ModifyPwdModal'
import ModifyAgreementModal from '@/components/Defend/ModifyAgreementModal'
import RidManageModal from '@/components/Defend/RidManageModal'
import './style.less'

const maxLength = 30
export class DefendManageForm extends Component {
  constructor (props) {
    super(props)
    this.state = {
      list: {},
      pagingParameter: {
        pageSize: 10,
        currentPage: 1
      },
      seekTerm: {},                        // 筛选条件
      sortedInfo: null,                    // 列表排序
      intoManageModalVisible: false,       // 纳入管理modal
      modifyPwdModalVisible: false,        // 修改密码modal
      modifyAgreementModalVisible: false,  // 协议协议modal
      ridManageModalVisible: false,        // 踢出管理
      thisId: '',                          // 当前操作的设备id
      thisRecord: {},                      // 当前操作的设备信息
      tips: '',                            // 错误提示（纳入管理，修改协议，修改密码）
      modalLoading: false                  // 加载状态
    }
  }
  componentDidMount () {
    const { dispatch } = this.props
    //获取厂商、名称、版本
    dispatch({ type: 'defend/getDefendSupplier', payload: { isAll: 1 } })
    // 获取列表
    let { pageSize, currentPage } = this.state
    //解析保留的数据
    let { list } = evalSearchParam(this) || {}
    if(list && list[0]){
      const init = list[0].parameter
      if (init.beginTime || init.endTime)
        init.time = [init.beginTime ? moment(init.beginTime) : '', init.endTime ? moment(init.endTime) : '']
      this.setState({
        searchExpand: true,
        pageSize: list[0].page.pageSize,
        currentPage: list[0].page.currentPage,
        seekTerm: init }, ()=>{
        let { pageSize, currentPage } = list[0].page
        // 设置查询表单
        this.searchForm.setFieldsValue({ ...init })
        this.getList(currentPage, pageSize)
      })
    }else{
      this.getList(currentPage, pageSize)
    }
  }
  getList = (page, size, is = false) => {
    const { seekTerm, pagingParameter } = this.state
    if(is){
      cacheSearchParameter([{
        page: { pageSize: size, currentPage: page },
        parameter: seekTerm
      }], this.props.history, 0, '1')
    }
    const postParms = {
      ...seekTerm,
      ...pagingParameter
    }
    api.equipmentList(postParms).then(response => {
      if (response && response.head && response.head.code === '200') {
        this.setState({
          list: response.body
        })
      }
    })
  }
  // 提交表单，执行查询
  handleSubmit = values => {
    if (values.time) values.beginTime = moment(values.time[0]).startOf('day').valueOf()
    if (values.time) values.endTime = moment(values.time[1]).endOf('day').valueOf()
    delete values.time
    values.manufacturers = values.manufacturer
    values.names = values.name
    values.versions = values.version
    delete values.manufacturer
    delete values.name
    delete values.version
    this.setState({
      pagingParameter: {
        pageSize: this.state.pagingParameter.pageSize,
        currentPage: 1
      },
      seekTerm: values
    }, () => this.getList(1, 10, true))
  }
  //查询条件重置
  handleReset = () => {
    this.props.form.resetFields()
    removeCriteria('1', this.props.history)
    //重置查询条件后，重新查询页面数据
    this.setState({
      pagingParameter: {
        pageSize: 10,
        currentPage: 1
      },
      seekTerm: {}
    }, () => this.getList(1, 10))
  }
  //翻页
  pageChange = (page, pageSize) => {
    this.setState({
      pagingParameter: {
        currentPage: page,
        pageSize: pageSize
      }
    }, ()=>this.getList(page, pageSize))
  }
  // 点击纳入管理
  handleIntoManage = record => {
    this.setState({
      intoManageModalVisible: true,
      thisId: record.id,
      tips: ''
    })
  }
  // 纳入管理确定
  intoManageSubmit = values => {
    const { thisId } = this.state
    values.id = thisId
    this.setState({
      tips: '',
      modalLoading: true
    }, () => {
      api.intoManagement(values).then(response => {
        if (response && response.head && response.head.code === '200') {
          this.setState({
            tips: '加载成功'
          }, () => {
            message.success('纳入成功！')
            setTimeout(()=>{
              this.setState({
                intoManageModalVisible: false,
                modalLoading: false
              }, this.getList)
            }, 800)
          })
        }
      }).catch(err => {
        this.setState({
          tips: err,
          modalLoading: false
        })
      })
    })
  }
  // 点击修改密码
  handleModifyPwd = record => {
    this.setState({
      modifyPwdModalVisible: true,
      thisRecord: record,
      tips: ''
    })
  }
  // 修改密码确定
  modifyPwdSubmit = values => {
    const { thisRecord } = this.state
    const { id, port, protocol, userName } = thisRecord
    values.id = id
    values.port = port
    values.protocol = protocol
    values.userName = userName
    this.setState({
      tips: '',
      modalLoading: true
    }, () => {
      api.modifyPwd(values).then(response => {
        if (response && response.head && response.head.code === '200') {
          this.setState({
            tips: '加载成功'
          }, () => {
            setTimeout(()=>{
              message.success('修改成功！')
              this.setState({
                modifyPwdModalVisible: false,
                modalLoading: false
              }, this.getList)
            }, 500)
          })
        }
      }).catch(err => {
        this.setState({
          tips: err,
          modalLoading: false
        })
      })
    })
  }
  // 点击修改协议
  handleModifyAgreement = record => {
    this.setState({
      modifyAgreementModalVisible: true,
      thisRecord: record,
      thisId: record.id,
      pwdChanged: false,
      tips: ''
    })
  }
  // 修改协议确定
  modifyAgreementSubmit = values => {
    const { thisId, pagingParameter } = this.state
    const { currentPage, pageSize }  = pagingParameter
    values.id = thisId
    this.setState({
      tips: '',
      modalLoading: true
    })
    api.updateProtocol(values).then(response => {
      if (response && response.head && response.head.code === '200') {
        message.success('修改成功！')
        this.setState({
          modifyAgreementModalVisible: false,
          modalLoading: false
        }, ()=>this.getList(currentPage, pageSize))
      }
    }).catch(err => {
      this.setState({
        tips: err,
        pwdChanged: true,
        modalLoading: false
      })
    })
  }
  // 点击踢出管理
  handleRidManage = record => {
    this.setState({
      ridManageModalVisible: true,
      thisId: record.id
    })
  }
  // 踢出管理确定
  ridManageSumit = () => {
    const { thisId, pagingParameter } = this.state
    const { pageSize }  = pagingParameter
    api.outManagement({
      assets: [thisId]
    }).then(response => {
      if (response && response.head && response.head.code === '200') {
        this.setState({
          ridManageModalVisible: false
        }, ()=>this.getList(1, pageSize))
      }
    })
  }
  resetForm = () => {
    this.setState({ tips: '' })
  }
  /**
   * 查询条件变更时
   * @param values
   */
  searchChange = (values) => {
    this.exportDownParam = values
  }
  handleChange = (pagination, filters, sorter) => {
    const { seekTerm } = this.state
    if(sorter.columnKey === 'status') { // 按状态排序
      const { order } = sorter
      delete seekTerm.sortOrder
      if(order === 'ascend'){
        seekTerm.is_managed = 'asc'
      }else if (order === 'descend'){
        seekTerm.is_managed = 'desc'
      }
    }else if(sorter.columnKey === 'firstEnterNett') { // 按时间排序
      const { order } = sorter
      delete seekTerm.is_managed
      if(order === 'ascend'){
        seekTerm.sortOrder = 'asc'
      }else if (order === 'descend'){
        seekTerm.sortOrder = 'desc'
      }
    } else {
      delete seekTerm.is_managed
      delete seekTerm.sortOrder
    }
    this.setState({
      // filteredInfo: filters,
      sortedInfo: sorter,
      seekTerm
    }, () => this.getList(1, 10))
  }
  /**
   * 联动选择厂商/名称/版本
   * @param fields
   */
  resetSearch = (val, index, keys1, keys2) => {
    const { dispatch } = this.props
    this.searchForm.setFieldsValue({
      [keys1]: undefined,
      [keys2]: undefined
    }, () => {
      let supplier = this.searchForm.getFieldValue('manufacturer')
      if (index === 1) {
        dispatch({ type: 'defend/clearDefendName' })
        if (val && val.length) dispatch({ type: 'defend/getDefendName', payload: { manufacturerList: val, isAll: 1 } })
      } else {
        dispatch({ type: 'defend/cleaDefendVersion' })
        if (supplier && supplier.length && val && val.length) dispatch({ type: 'defend/getDefendVersion', payload: { manufacturerList: supplier, nameList: val, isAll: 1 } })
      }
    })
  }
  // 运维操作
  toLuna = async () => {
    const res = await api.queryUserId()
    window.open(`/luna/?id=${res.body}`, '_blank')
  }
  getWorkOrderBtn = (record) => {
    // 修改密码按钮，rdp和vnc类型常显，其他类型isPasswdChanged为true显示
    return (
      <Fragment>
        {
          (record.status === '未管理') ?
            <span onClick={() => this.handleIntoManage(record)}>纳入管理</span>
            :
            <span>
              <span onClick={() => this.handleModifyAgreement(record)}>修改协议</span>
              {(record.isPasswdChanged || record.protocol === 'rdp' || record.protocol === 'vnc') ? <span onClick={() => this.handleModifyPwd(record)}>修改密码</span> : null}
              <span onClick={() => this.handleRidManage(record)}>踢出管理</span>
            </span>
        }
      </Fragment>
    )
  }
  render () {
    const {
      list,
      pagingParameter,
      intoManageModalVisible,
      modifyPwdModalVisible,
      modifyAgreementModalVisible,
      ridManageModalVisible,
      thisRecord,
      tips,
      searchExpand,
      pwdChanged,
      modalLoading
    } = this.state
    let { sortedInfo } = this.state
    const { defendSupplierList, defendVersionList, defendNameList } = this.props
    sortedInfo = sortedInfo || {}
    const columns = [{
      title: '编号',
      dataIndex: 'number',
      key: 'number',
      isShow: true,
      render: text => TooltipFn(text)
    }, {
      title: '厂商',
      dataIndex: 'manufacturer',
      key: 'manufacturer',
      isShow: true,
      render: text => emptyFilter(text)
    }, {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      isShow: true,
      render: text => emptyFilter(text)
    }, {
      title: '版本',
      dataIndex: 'version',
      key: 'version',
      isShow: true,
      render: text => emptyFilter(text)
    }, {
      title: 'IP',
      dataIndex: 'ip',
      key: 'ip',
      isShow: true,
      render: text => TooltipFn(text)
    }, {
      title: '账号',
      dataIndex: 'userName',
      key: 'userName',
      isShow: true,
      render: text => emptyFilter(text)
    }, {
    }, {
      title: '协议',
      dataIndex: 'protocol',
      key: 'protocol',
      isShow: true,
      render: text => emptyFilter(text)
    }, {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      isShow: true,
      sorter: true,
      sortOrder: sortedInfo && sortedInfo.columnKey === 'status' ? sortedInfo.order : false,
      ellipsis: true,
      render: text => { return text }
    },
    // {
    //   title: '网络连接',
    //   dataIndex: 'connectStatus',
    //   key: 'connectStatus',
    //   isShow: true,
    //   filters: [
    //     { text: '在线', value: '1' },
    //     { text: '离线', value: '2' }
    //   ],
    //   filteredValue: filteredInfo.connectStatus || null,
    //   onFilter: (value, record) => record.connectStatus.includes(value),
    //   ellipsis: true,
    //   render: val => {
    //     return val
    //   }
    // },
    {
      title: '首次入网时间',
      dataIndex: 'firstEnterNett',
      key: 'firstEnterNett',
      width: 190,
      isShow: true,
      sorter: true,
      sortOrder: sortedInfo && sortedInfo.columnKey === 'firstEnterNett' ? sortedInfo.order : false,
      ellipsis: true,
      render: (text) => {
        return (<span className="tabTimeCss">{timeStampToTime(Number(text))}</span>)
      }
    }, {
      title: '操作',
      width: '18%',
      render: (text, record) => {
        return (
          <div className="operate-wrap">
            {
              this.getWorkOrderBtn(record)
            }
          </div>
        )
      }
    }]
    this.defaultFields = [
      { label: '综合查询', maxLength: 30, key: 'blurQueryField', span: 12, type: 'input', placeholder: 'IP/编号' },
      { label: '首次入网时间', key: 'time', type: 'dateRange', placeholder: ['开始日期', '结束日期'], data: [] }
    ]
    this.filterFields = [
      { type: 'select', multiple: true, label: '厂商', maxLength, placeholder: '全部', showSearch: true, key: 'manufacturer', data: defendSupplierList, onChange: (val) => this.resetSearch(val, 1, 'name', 'version') },
      { type: 'select', multiple: true, label: '名称', maxLength, placeholder: '全部', showSearch: true, key: 'name', data: defendNameList, onChange: (val) => this.resetSearch(val, 2, 'version') },
      { type: 'select', multiple: true, label: '版本', maxLength, placeholder: '全部', showSearch: true, key: 'version', data: defendVersionList }
    ]
    const fields = this.filterFields
    return (
      <article className="main-table-content equipment-manage-list">
        <div className="search-bar">
          <Search fieldList={fields} setDefaultExpandedStatus={searchExpand} ref={(search) => { search && (this.searchForm = search) }} onChange={this.searchChange} onSubmit={this.handleSubmit} onReset={this.handleReset} defaultFields={this.defaultFields} />
        </div>
        <section className="table-wrap table-style">
          <div className="table-btn">
            <div className="left-btn">
              {hasAuth(defendPermission.PORTAL_OPERATE) ? <Button onClick={this.toLuna}>运维操作</Button> : null}
            </div>
          </div>
          <Table rowKey="id" onChange={this.handleChange} columns={columns} dataSource={list ? list.items : []} pagination={false} />
          {
            list.totalRecords > 0 &&
            <Pagination current={pagingParameter.currentPage} pageSize={pagingParameter.pageSize} className="table-pagination" onChange={this.pageChange}
              onShowSizeChange={this.pageChange} defaultPageSize={10}
              total={list ? list.totalRecords : 0} showTotal={(total) => `共 ${total} 条数据`}
              showSizeChanger={true} showQuickJumper={true} />
          }
        </section>
        {/* 纳入管理 */}
        <IntoManageModal visible={intoManageModalVisible}
          submit={this.intoManageSubmit}
          tips={tips}
          modalLoading={modalLoading}
          resetForm={this.resetForm}
          onClose={() => {this.setState({ intoManageModalVisible: false })}} />
        {/* 修改密码 */}
        <ModifyPwdModal visible={modifyPwdModalVisible}
          submit={this.modifyPwdSubmit}
          tips={tips}
          modalLoading={modalLoading}
          resetForm={this.resetForm}
          onClose={() => {this.setState({ modifyPwdModalVisible: false })}} />
        {/* 修改协议 */}
        <ModifyAgreementModal visible={modifyAgreementModalVisible}
          record={thisRecord}
          tips={tips}
          pwdChanged={pwdChanged}
          modalLoading={modalLoading}
          submit={this.modifyAgreementSubmit}
          resetForm={this.resetForm}
          onClose={() => {this.setState({ modifyAgreementModalVisible: false })}} />
        {/* 踢出管理 */}
        <RidManageModal visible={ridManageModalVisible}
          submit={this.ridManageSumit}
          onClose={() => {this.setState({ ridManageModalVisible: false })}} />
      </article>
    )
  }
}
const mapStateToProps = ({ defend }) => {
  return {
    defendSupplierList: defend.defendSupplierList,
    defendVersionList: defend.defendVersionList,
    defendNameList: defend.defendNameList
  }
}
const DefendManage = Form.create()(DefendManageForm)
export default withRouter(connect(mapStateToProps)(DefendManage))
