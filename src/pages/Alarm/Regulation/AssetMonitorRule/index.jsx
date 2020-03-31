
import React, { Component } from 'react'
import { connect } from 'dva'
import { Form, Button, Table, Pagination, message, Input, TreeSelect, Select } from 'antd'
import { TooltipFn, cache  } from '@/utils/common'
import ModalConfirm from '@/components/common/ModalConfirm'
import Status from '@/components/common/Status'
import api from '@/services/api'
import { Link } from 'dva/router'
const { Item } = Form
const { Option } = Select
const { TreeNode } = TreeSelect
const alarmGradeArray = [
  { value: '', name: '全部' },
  {  value: '1', name: '紧急' },
  { value: '2', name: '重要' },
  { value: '3', name: '次要' },
  { value: '4', name: '提示' }
]
class AssetMonitorRule extends Component{
  constructor (props){
    super(props)
    this.state = {
      columns: [
        {
          title: '规则名称',
          dataIndex: 'name',
          key: 'name',
          render: (text)=>TooltipFn(text)
        }, {
          title: '区域',
          dataIndex: 'areaName',
          key: 'areaName',
          render: (text)=>TooltipFn(text)
        }, {
          title: '告警级别',
          dataIndex: 'alarmLevel',
          key: 'alarmLevel',
          render: (v) => {
            switch (v){
              case '1' : return <Status level={'1'}/>
              case '2' : return <Status level={'2'}/>
              case '3' : return <Status level={'3'}/>
              case '4' : return <Status level={'4'}/>
              default: break
            }
          }
        }, {
          title: '关联资产数',
          dataIndex: 'relatedAssetAmount',
          key: 'relatedAssetAmount'
        }, {
          title: '状态',
          dataIndex: 'ruleStatusName',
          key: 'ruleStatusName'
        },  {
          title: '操作',
          dataIndex: 'operate',
          key: 'operate',
          render: (text, record)=> {
            return (
              <div className="operate-wrap">
                { <Link to={`/logalarm/alarm/regulation/edit?uniqueId=${record.uniqueId}`}>变更</Link> }
                { <a onClick={ ()=> this.setState({ templateDeleteModal: true, record })}>删除</a>}
                { record.ruleStatus === '0' && <a onClick={ ()=> this.setState({ statusModal: true, record })}>启用</a>}
                { record.ruleStatus === '1' &&  <a onClick={ ()=> this.setState({ statusModal: true, record })}>禁用</a>}
                <Link to={`/logalarm/alarm/regulation/detail?uniqueId=${record.uniqueId}`}>查看</Link>
              </div>
            )
          }
        }
      ],
      templateDeleteModal: false,
      statusModal: false,
      checkModal: false,
      OperatingSystemArr: [],
      rowsSelectedList: [],
      selectedRowKeys: [],
      statusArr: [],
      search: {},
      body: {},
      pagingParameter: {
        currentPage: 1,
        pageSize: 10
      }

    }
  }

  componentDidMount (){
    this.props.children(this)
    this.getTree()
    //解析保留的数据
    const { list } = cache.evalSearchParam(this, {}, false) || {}
    //判断是否存有数据
    if(list && list[0]){
      const { page, parameter } = list[0]
      this.setState({
        pagingParameter: page,
        search: parameter
      }, () => {
        this.getData({ ...page, ...parameter } )
      })
    }else{
      this.getData({ currentPage: 1, pageSize: 10 })
    }
  }

  // 获取列表
  getData = ( param ) =>{
    const { pagingParameter } = this.state
    api.getAssetMonitorRuleList({ ...param, ...pagingParameter }).then((res) => {
      this.setState({ body: res.body })
    })
  }
  getTree = () => {
    api.getUserAreaTree().then( res =>
      this.setState({ getUserAreaTree: res.body })
    )
  }
  //加载区域树结构的下拉列表
  getTreeNode = data => {
    if(data) return (
      <TreeNode value={data.stringId} title={data['fullName']} key= {`${data.stringId}`}>
        {data.childrenNode && data.childrenNode.length ? (
          data.childrenNode.map(item =>
            this.getTreeNode(item)
          )
        ) : null
        }
      </TreeNode>
    )
  }

  //翻页
  pageChange = (currentPage, pageSize) => {
    let { search } = this.state
    this.setState({
      pagingParameter: {
        currentPage,
        pageSize
      }
    }, () => this.getData({ ...search }))
  }

  //删除
  clearData = () =>{
    let { record, pagingParameter } = this.state
    api.deleteMonitorRuleById({ uniqueIds: [record.uniqueId] }).then( res => {
      this.getData()
      message.info('删除成功')
    })
    let { currentPage, pageSize } = pagingParameter
    this.setState({
      record: undefined,
      rowsSelectedList: [],
      templateDeleteModal: false,
      pagingParameter: {
        currentPage,
        pageSize
      }
    })
  }
  //启用禁用调接口
  onIsUpDown = () =>{
    const { record } = this.state
    api.monitorRuleStatus({ uniqueId: record.uniqueId, useFlag: record.ruleStatus === '0' ? '1' : '0' }).then( (res) => {
      message.success(record.ruleStatus === '0' ? '启用成功' : '禁用成功')
      this.setState({ statusModal: false })
      this.getData()
    })
  }
  //查询
  //提交表单
  onSubmit = (e) => {
    e.preventDefault()
    let { pagingParameter } = this.state
    this.props.form.validateFields((err, values) => {
      !values.alarmName && delete values.alarmName
      values.alarmLevel === '' && delete values.alarmLevel
      if (!err) {
        cache.cacheSearchParameter([{
          page: pagingParameter,
          parameter: {
            ...values
          }
        }], this.props.history, 1, '1')
        this.setState({
          search: values,
          pagingParameter: {
            currentPage: 1,
            pageSize: pagingParameter.pageSize
          }
        }, ()=>{ this.getData({ currentPage: 1, pageSize: pagingParameter.pageSize, ...values })})
      }
    })
  }
  //重置表单信息
  handleReset = ()=>{
    this.props.form.resetFields()
    this.setState({ search: {}, currentPage: 1, pageSize: 10 }, () => this.getData({ currentPage: 1, pageChange: 10 }) )
  }
  render (){
    let { columns, body, templateDeleteModal, statusModal, pagingParameter, record, getUserAreaTree } = this.state
    let { getFieldDecorator } = this.props.form
    let list = []
    let totalRecords = 0
    if(body && body.items){
      list = body.items
      totalRecords = body.totalRecords
    }
    const templateDelete = {
      visible: templateDeleteModal,
      children: (<p className='model-text'>是否删除规则?</p>),
      onOk: this.clearData,
      onCancel: () => this.setState({ templateDeleteModal: false })
    }
    const templateUpDown = {
      visible: statusModal,
      children: (<p className='model-text'>是否{ record && record.ruleStatus === '1' ? '禁用' : '启用'}规则?</p>),
      onOk: this.onIsUpDown,
      onCancel: () => this.setState({ statusModal: false })
    }

    return(
      <div className='main-table-content'>
        <div className="search-bar">
          <Form className="filter-form new-flex-layout" layout="inline" onSubmit={this.onSubmit}>
            <Item label="规则名称">
              {getFieldDecorator('name')(
                <Input autoComplete="off" className="filter-form-item" placeholder="请输入规则名称" maxLength={30}/>
              )}
            </Item>
            <Item label='归属区域'>
              {getFieldDecorator('areaList')(
                <TreeSelect
                  showSearch
                  dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                  placeholder="全部"
                  allowClear
                  multiple
                  getPopupContainer={triggerNode => triggerNode.parentNode}
                  treeDefaultExpandAll
                  treeNodeFilterProp='title'
                >
                  {this.getTreeNode(getUserAreaTree)}
                </TreeSelect>
              )}
            </Item>
            <Item label="告警级别" className='item-separation'>
              {
                getFieldDecorator('alarmLevel',  { initialValue: '' }
                )(
                  <Select
                    className="filter-form-item"
                    getPopupContainer={triggerNode => triggerNode.parentNode}
                    placeholder="全部" >
                    {
                      alarmGradeArray.map((item, index)=>{
                        return (<Option value={item.value} key={index}>{item.name}</Option>)
                      })
                    }
                  </Select>
                )
              }
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
              { <Button type="primary" style={{ width: 'auto' }} onClick={ () =>this.props.history.push('/logalarm/alarm/regulation/create')}>创建</Button> }
            </div>
          </div>
          <Table rowKey="uniqueId" columns={columns} dataSource={list}  pagination={false}></Table>
          {
            totalRecords > 0 &&
               <Pagination
                 current={pagingParameter.currentPage}
                 className="table-pagination"
                 defaultPageSize={10}
                 pageSize={pagingParameter.pageSize}
                 onChange={this.pageChange}
                 showSizeChanger = {totalRecords > 10}
                 onShowSizeChange={ this.pageChange}
                 total={totalRecords}
                 showTotal={(total) => `共 ${total} 条数据`}
                 showQuickJumper={true} />
          }

        </div>
        <ModalConfirm props={templateDelete}/>
        <ModalConfirm props={templateUpDown}/>
      </div>
    )
  }
}
const mapStateToProps = ({  information }) => {
  return {
  }
}
const AssetMonitorRules = Form.create()(AssetMonitorRule)
export default connect(mapStateToProps)(AssetMonitorRules)
