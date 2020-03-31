import { Component } from 'react'
import { connect } from 'dva'
import { Form, Input, Button, Table, Pagination, Select, message, Tooltip } from 'antd'
import './style.less'
import { Link } from 'dva/router'
import Add from '@/components/Knowledge/Alert/Add.js'
import api from '@/services/api'
import moment from 'moment'
import hasAuth from '@/utils/auth'
import { routinePermission } from '@a/permission'
import { transliteration, emptyFilter, cacheSearchParameter, evalSearchParam, removeCriteria } from '@/utils/common'
import DateRange from '@/components/common/DateRange'
import ModalConfirm from '@/components/common/ModalConfirm'

const { Item } = Form
const { Option } = Select
class Knowledge extends Component {
  constructor (props) {
    super(props)
    this.state = {
      pagingParameter: {
        pageSize: 10,
        currentPage: 1
      },
      sorts: {
        sortName: undefined,
        sortOrder: undefined
      },
      total: 0,
      rowsSelectedList: [],
      selectedRowKeys: [],
      body: {},
      values: {},
      deleteVisible: false // 剔除
    }
  }
  componentDidMount () {
    //判断是否存有数据
    if (sessionStorage.searchParameter) {
      //解析保留的数据
      let { list } = evalSearchParam(this)
      if (list) {
        let param = JSON.parse(JSON.stringify(list[0])).parameter
        let v = ['beginTime', 'endTime']
        let init = list[0].parameter
        v.forEach(item => {
          delete param[item]
        })
        if (init.beginTime || init.endTime)
          param.beginTime = [init.beginTime ? moment(init.beginTime) : '', init.endTime ? moment(init.endTime) : '']
        this.props.form.setFieldsValue(param)
        this.setState({
          pagingParameter: list[0].page,
          values: list[0].parameter,
          sorts: list[0].sorts
        }, () => {
          this.getKnowledgeList()
        })
      } else {
        this.getKnowledgeList()
      }
    } else {
      this.getKnowledgeList()
    }
  }
  //获取知识库列表
  getKnowledgeList = () => {
    const postParams = {
      ...this.state.pagingParameter,
      ...this.state.values
    }
    api.getKnowledgeList(postParams).then(response => {
      if (response && response.head && response.head.code === '200') {
        this.setState({
          body: response.body
        })
      }
    })
  }
  DeleteOkShow = () => {
    const { selectedRowKeys } = this.state
    if (!selectedRowKeys.length) {
      message.info('未勾选数据！')
      return
    }
    this.setState({
      deleteVisible: true
    })
  }
  //确认剔除
  DeleteOk = () => {
    const { selectedRowKeys } = this.state
    // 注：此处接口后端需要json数组，不传键值对
    api.deleteKnowledge(selectedRowKeys).then(response => {
      if (response && response.head && response.head.code === '200') {
        message.success('剔除成功')
        this.setState({ selectedRowKeys: [], deleteVisible: false })
        this.getKnowledgeList()
      } else {
        message.warn('请选择移除项')
      }
    })
  }
  //表单查询
  Submit = (e) => {
    e.preventDefault()
    this.props.form.validateFields((err, values) => {
      if (!err) {
        // 创建时间
        if (values.knowledgeType === '0') delete values.knowledgeType
        const beginTimeArr = values.beginTime ? [...values.beginTime] : undefined
        if (beginTimeArr) {
          values.beginTime = beginTimeArr[0] ? beginTimeArr[0].valueOf() : ''
          values.endTime = beginTimeArr[1] ? beginTimeArr[1].valueOf() : ''
        }
        if (values.endTime && values.beginTime >= values.endTime) {
          message.error('结束时间不能小于开始时间!')
          return
        }
        this.setState({
          values,
          pagingParameter: {
            pageSize: this.state.pagingParameter.pageSize,
            currentPage: 1
          }
        }, () => {
          const { pagingParameter, sorts, values } = this.state
          cacheSearchParameter([{
            page: pagingParameter,
            parameter: { ...values },
            sorts
          }], this.props.history)
          this.getKnowledgeList()
        })
      }
    })
  }
  //重置
  Reset = () => {
    this.props.form.resetFields()
    removeCriteria()
    this.resetKeyBegin = 'beigin' + Math.random()
    this.setState({
      selectedRowKeys: [],
      values: {},
      pagingParameter: {
        pageSize: 10,
        currentPage: 1
      },
      sorts: {
        sortName: undefined,
        sortOrder: undefined
      }
    }, () => {
      this.getKnowledgeList()
    })
  }
  //触发子组件弹窗事件并传值
  ShowModal = (id) => {
    this.AddModal.ShowModal(id)
  }
  //分页
  pageModify = (pageSize, currentPage) => {
    this.setState({
      pagingParameter: {
        pageSize,
        currentPage
      }
    }, () => {
      const { values, sorts, pagingParameter } = this.state
      cacheSearchParameter([{
        page: pagingParameter,
        parameter: { ...values },
        sorts
      }], this.props.history, 0)
      this.getKnowledgeList()
    })
  }
  changePage = (currentPage, pageSize) => {
    this.pageModify(pageSize, currentPage)
  }
  handleTableChange = (pagination, filters, sorter) => {
    const source = sorter.columnKey ? sorter.columnKey : ''
    let sort = ''
    if (source) sort = sorter.order === 'ascend' ? 'ASC' : 'DESC'
    const values = { ...this.state.values }
    if (source && sort) {
      values.source = source
      values.sort = sort
    }
    this.setState({
      values,
      sorts: {
        sortName: sorter.columnKey,
        sortOrder: sorter.order
      }
    }, () => {
      const { pagingParameter, sorts, values } = this.state
      cacheSearchParameter([{
        page: pagingParameter,
        parameter: { ...values },
        sorts
      }], this.props.history)
      this.getKnowledgeList()
    })
  }
  render () {
    const { body, pagingParameter, selectedRowKeys, deleteVisible, sorts } = this.state
    const { getFieldDecorator } = this.props.form

    const columns = [{
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      render: (text) => {
        return (
          <Tooltip title={text} placement="topLeft" getPopupContainer={triggerNode => triggerNode.parentNode}>
            <span>{emptyFilter(text)}</span>
          </Tooltip>
        )
      }
    }, {
      title: '关键字',
      dataIndex: 'keyWords',
      key: 'keyWords',
      render: (text) => {
        return (
          <Tooltip title={text} placement="topLeft" getPopupContainer={triggerNode => triggerNode.parentNode}>
            <span>{emptyFilter(text)}</span>
          </Tooltip>
        )
      }
    }, {
      title: '类型',
      dataIndex: 'knowledgeType',
      key: 'knowledgeType',
      render: (text) => {
        switch (text) {
          case 'CASE':
            return '案例库'
          case 'PLAN':
            return '方案库'
          case 'EVENT':
            return '事件库'
          case 'BENCHMARK_STRATEGY':
            return '基准策略库'
          default:
            break
        }
      }
    }, {
      title: '创建时间',
      dataIndex: 'gmtCreate',
      key: 'gmtCreate',
      sorter: true,
      sortOrder: sorts && sorts.sortName === 'gmtCreate' ? sorts.sortOrder : false,
      width: 190,
      render: timestamp => (<span className="tabTimeCss">{timestamp <= 0 ? '--' : moment(timestamp).format('YYYY-MM-DD HH:mm:ss')}</span>)
    }, {
      title: '操作',
      dataIndex: 'operate',
      key: 'operate',
      render: (text, record) => {
        return (
          <div className="operate-wrap">
            {
              hasAuth(routinePermission.routineKnowledgeUpdate) ? <a onClick={() => this.ShowModal(record.id)}>变更</a> : null
            }
            {
              hasAuth(routinePermission.routineKnowledgeView) ? <Link to={`/routine/knowledge/detail?id=${transliteration(record.id)}`}>查看</Link> : null
            }
          </div>
        )
      }
    }]
    //复选框
    const rowSelection = {
      selectedRowKeys,
      onChange: (selectedRowKeys, selectedRows) => {
        this.setState({
          selectedRowKeys,
          rowsSelectedList: selectedRows
        })
      }
    }

    const deleteProps = {
      visible: deleteVisible,
      onOk: this.DeleteOk,
      onCancel: () => { this.setState({ deleteVisible: false }) },
      children: <p className="model-text">是否剔除选中数据？</p>
    }

    return (
      <div className='main-table-content Knowledge-list'>
        <div className="search-bar">
          <Form className="filter-form new-flex-layout" layout="inline" onSubmit={this.Submit} onReset={this.Reset}>
            <Item label='名称'>
              {
                getFieldDecorator('name', {
                  rules: [{ min: 1, max: 30, message: '输入字符长度 1 -30 ' }]
                })(
                  <Input autoComplete="off" className="filter-form-item" placeholder="请输入名称" />
                )
              }
            </Item>
            <Item label='关键字' className="item-separation">
              {
                getFieldDecorator('keyWords', {
                  rules: [{ min: 1, max: 30, message: '输入字符长度 1 -30 ' }]
                })(
                  <Input autoComplete="off" className="filter-form-item" placeholder="请输入关键字" />
                )
              }
            </Item>
            <Item label='知识库类型'>
              {
                getFieldDecorator('knowledgeType', {
                  initialValue: '0'
                }, {
                })(
                  <Select className="filter-form-item" placeholder="请选择知识库类型" getPopupContainer={triggerNode => triggerNode.parentNode}>
                    <Option key="0" value="0">全部</Option>
                    <Option key='EVENT'>事件库</Option>
                    <Option key='PLAN'>方案库</Option>
                    <Option key='CASE'>案例库</Option>
                    <Option key='BENCHMARK_STRATEGY'>基准策略库</Option>
                  </Select>
                )
              }
            </Item>
            <Item label='创建时间' className="item-date-container">
              {getFieldDecorator('beginTime')(
                <DateRange future placeholder={['开始日期', '结束日期']} format="YYYY-MM-DD" resetKey={this.resetKeyBegin} />
              )}
            </Item>
            <Item className="search-item" style={{ 'marginLeft': 65 }}>
              <Button type="primary" htmlType="submit">查询</Button>
              <Button type="primary" ghost htmlType='reset'>重置</Button>
            </Item>
          </Form>
        </div>
        <div className="table-wrap">
          <div className="table-btn">
            <div className="left-btn">
              {
                hasAuth(routinePermission.routineKnowledgeChckin) ? <Button type="primary" onClick={() => this.ShowModal(null)}>登记</Button> : null
              }
            </div>
            <div className="right-btn">
              {
                hasAuth(routinePermission.routineKnowledgeDelete) ? <Button type="primary" onClick={this.DeleteOkShow}>剔除</Button> : null
              }
            </div>
          </div>
          <Table rowKey="id" columns={columns} dataSource={body.items} rowSelection={rowSelection} pagination={false} onChange={this.handleTableChange} />
          <Pagination
            current={pagingParameter.currentPage}
            pageSize={pagingParameter.pageSize}
            className="table-pagination"
            total={body.totalRecords ? body.totalRecords : 0}
            showTotal={(total) => `共 ${total} 条数据`}
            showSizeChanger={ body.totalRecords > 10 ? true : false }
            showQuickJumper={true}
            onChange={this.changePage}
            onShowSizeChange={this.changePage} />
        </div>
        {/* 弹窗 */}
        <Add AddModal={(ref) => { this.AddModal = ref }} getKnowledgeList={this.getKnowledgeList} />
        {/* 剔除 */}
        <ModalConfirm props={deleteProps} />
      </div>
    )
  }
}
const KnowledgeForm = Form.create()(Knowledge)
export default connect()(KnowledgeForm)
