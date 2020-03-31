import { Component } from 'react'
import { connect } from 'dva'
// import { NavLink } from 'dva/router'
import { Form, LocaleProvider, Button, Table, Pagination, Input, Tooltip } from 'antd'
import zhCN from 'antd/lib/locale-provider/zh_CN'
import moment from 'moment'
import api from '@/services/api'
import './style.less'
import hasAuth from '@/utils/auth'
import { systemPermission } from '@a/permission'
import { emptyFilter, cacheSearchParameter, evalSearchParam, removeCriteria } from '@/utils/common'
import RoleRegister from '../RoleRegister'

const { Item } = Form
class SystemRoleList extends Component {
  constructor (props) {
    super(props)
    this.state = {
      columns: [
        {
          title: '角色名称',
          key: 'name',
          dataIndex: 'name',
          render: (text) => {
            return (
              <Tooltip title={text} placement="topLeft" getPopupContainer={triggerNode => triggerNode.parentNode}>
                <span>{emptyFilter(text)}</span>
              </Tooltip>
            )
          }
        },
        {
          title: '创建时间',
          key: 'gmtCreate',
          dataIndex: 'gmtCreate',
          render: timestamp => timestamp <= 0 ? '' : (<span className="tabTimeCss">{moment(timestamp).format('YYYY-MM-DD HH:mm:ss')}</span>)
        },
        {
          title: '角色描述',
          key: 'description',
          dataIndex: 'description',
          render: (text) => {
            return (
              <Tooltip title={text} placement="topLeft" getPopupContainer={triggerNode => triggerNode.parentNode}>
                <span>{emptyFilter(text)}</span>
              </Tooltip>
            )
          }
        },
        {
          title: '操作',
          key: 'operate',
          render: (record) => {
            return (
              <div className="operate-wrap">
                {
                  hasAuth(systemPermission.sysRoleUpdate) ? <a onClick={()=>this.alert.showAlert({ type: 'change', text: '变更', id: record.stringId })}>变更</a> : null
                }
                {
                  hasAuth(systemPermission.sysRoleView) ? <a onClick={()=>this.alert.showAlert({ type: 'detail', text: '查看', id: record.stringId })}>查看</a> : null
                }
              </div>
            )
          }
        }
      ],
      body: null,
      pagingParameter: {
        pageSize: 10,
        currentPage: 1
      },
      values: {}
    }
  }
  componentDidMount () {
    //判断是否存有数据
    let { list } = evalSearchParam(this) || {}
    if(list){
      this.setState({ pagingParameter: list[0].page,  values: list[0].parameter })
      this.getList({ ...list[0].page, ...list[0].parameter })
    }else{
      this.getList({
        ...this.state.pagingParameter
      })
    }
  }

  render () {
    let { columns, pagingParameter, body } = this.state
    let list  = []
    let total =  0
    if (body){
      list = body.items
      total =  body.totalRecords
    }
    const { getFieldDecorator } = this.props.form
    return (
      <div className="main-table-content system-role-list">
        <div className="search-bar">
          <Form style={{ 'paddingBottom': '20px' }} className="filter-form new-flex-layout" layout="inline" onSubmit={this.handleSubmit}>
            <Item label="角色名称：">
              {getFieldDecorator('name', {
                rules: [{ min: 1, max: 30, message: '字符长度最小为1，最大为30！' }]
              })(
                <Input autoComplete="off" className="filter-form-item" placeholder="请输入角色名称" />
              )}
            </Item>
            <Item className="search-item item-separation">
              <Button type="primary" htmlType="submit">查询</Button>
              <Button type="primary" ghost onClick={this.handleReset}>重置</Button>
            </Item>
          </Form>
        </div>
        <div className="table-wrap">
          <div className="table-btn">
            <div className="left-btn">
              {
                hasAuth(systemPermission.sysRoleCheckin) ? <Button type="primary" onClick={() =>this.alert.showAlert({ type: 'register', text: '登记' })}>登记</Button> : null
              }
            </div>
          </div>
          <Table rowKey="stringId" columns={columns} dataSource={list} pagination={false} />
          <LocaleProvider locale={zhCN}>
            <Pagination
              className="table-pagination"
              total={total} showTotal={(total) => `共 ${total || 0} 条数据`}
              showQuickJumper={true}
              onChange={this.changePage}
              showSizeChanger={true}
              onShowSizeChange={this.changePage}
              pageSize={pagingParameter.pageSize}
              current={pagingParameter.currentPage} />
          </LocaleProvider>
        </div>
        <RoleRegister children={(now)=>this.alert = now} parent={this}></RoleRegister>
      </div>
    )
  }
  //重置
  handleReset = () => {
    this.props.form.resetFields()
    removeCriteria()
    this.setState({
      values: {}
    }, () => {
      this.getList({
        pageSize: 10,
        currentPage: 1
      })
    })
  }

  //表单查询
  handleSubmit = (e) => {
    e.preventDefault()
    this.props.form.validateFields((err, values) => {
      if (err) {
        return
      }
      this.setState({
        pagingParameter: {
          pageSize: this.state.pagingParameter.pageSize,
          currentPage: 1
        },
        values
      }, () => {
        let { values, sorts, pagingParameter } = this.state
        cacheSearchParameter([{
          page: pagingParameter,
          parameter: { ...values, sorts }
        }], this.props.history )
        this.getList({
          ...pagingParameter,
          ...values
        })
      })
    })
  }

  //获取列表
  getList = (param) => {
    this.setState({
      pagingParameter: {
        pageSize: param.pageSize,
        currentPage: param.currentPage
      }
    })
    api.getRolePagelist(param).then(response => {
      if(response && response.head && response.head.code === '200' ){
        this.setState({
          body: response.body
        })
      }
    }).catch(err => {})
  }
  //更新列表
  updatedIdata = ()=>{
    let { currentPage, pageSize  } = this.state.pagingParameter
    this.changePage(currentPage, pageSize )
  }

  //当前页码改变
  changePage = (currentPage, pageSize) => {
    this.setState({
      pagingParameter: {
        pageSize: pageSize,
        currentPage: currentPage
      }
    }, ()=>{
      let { values, sorts, pagingParameter } = this.state
      cacheSearchParameter([{
        page: pagingParameter,
        parameter: { ...values, sorts }
      }], this.props.history )
      this.getList({ ...pagingParameter, ...values, ...sorts })
    })
  }
}

const SystemRoleListForm = Form.create()(SystemRoleList)
export default connect()(SystemRoleListForm)
