import { Component } from 'react'
import { connect } from 'dva'
import { Button, Form, Table, TreeSelect, Pagination, Input, Modal } from 'antd'
import hasAuth from '@/utils/auth'
import PigeonholeTab from '@/components/common/PigeonholeTab'
import api from '@/services/api'
import { evalSearchParam, cacheSearchParameter, TooltipFn } from '@/utils/common'
import { logAlarmPermission } from '@a/permission'
import LogImport from '@c/Log/Alert/logImport'
import './style.less'

const Item = Form.Item
const { TreeNode } = TreeSelect
class LogSystem extends Component{
  constructor (props){
    super(props)
    this.state = {
      columns: [
        {
          title: '时间',
          dataIndex: 'timestamp',
          key: 'timestamp',
          width: 200
        }, {
          title: '资产编号',
          dataIndex: 'assetNumber',
          key: 'assetNumber',
          render: (text)=>TooltipFn(text)
        }, {
          title: '资产名称',
          dataIndex: 'assetName',
          key: 'assetName',
          render: (text)=>TooltipFn(text)
        }, {
          title: '日志类型',
          dataIndex: 'logType',
          key: 'logType',
          render: (text)=> {
            switch(text){
              case 1 : return TooltipFn('系统登陆日志')
              case 2 : return TooltipFn('系统启动日志')
              case 3 : return TooltipFn('登陆失败日志')
              default : break
            }
          }
        }, {
          title: '内容',
          dataIndex: 'logContent',
          key: 'logContent',
          render: (text)=>TooltipFn(text)
        }, {
          title: '操作',
          width: 200,
          render: ( scope)=>{
            return (
              <div className="operate-wrap">
                {hasAuth(logAlarmPermission.logManageSystemView) && <a onClick={()=>this.showAlert(scope)}>查看</a> }
              </div>
            )
          }
        }],
      body: {},
      pagingParameter: {
        currentPage: 1,
        pageSize: 10
      },
      alertShow: false,
      visible: false,
      search: {},
      openKeys: ['sub1'],
      detailsList: {},
      flag: '1',
      treeData: []
    }
  }
  componentDidMount (){
    //解析保留的数据
    const { list } = evalSearchParam(this) || {}
    //判断是否存有数据
    if(sessionStorage.searchParameter && list){
      const { page, parameter } = list[1]
      this.setState({
        pagingParameter: page,
        search: parameter
      })
      this.getList({ currentPage: page.currentPage, pageSize: page.pageSize, ...parameter })
    }else{
      this.getList({ currentPage: 1, pageSize: 10 })
    }
    this.getTreeData()
  }

  //获取数据
  getList = (params) =>{
    const { flag, pagingParameter, search } = this.state
    let { pageSize, currentPage } = pagingParameter
    // 操作系统的id不同传的参数不同
    if(search.sysemId && search.sysemId.indexOf('-') !== -1 ){
      search.logType = String(search.sysemId).split('-')[1]
      search.operatingSystem = search.sysemId.split('-')[0]
    }else{
      search.operatingSystem = search.sysemId
    }
    delete search.sysemId
    flag === '1' ?
      api.getDeviceLogList({ pageSize, currentPage, ...params, ...search }).then( res => {
        this.setState({ body: res.body })
      })
      :
      api.getSystemLogList().then( res => {
        this.setState({ body: res.body })
      })
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
    }], this.props.history, '1')
    this.setState({
      pagingParameter: {
        currentPage,
        pageSize
      }
    }, this.getList)
  }
  //显示弹窗
  showAlert =(now)=>{
    this.setState({ alertShow: true, detailsList: now })
  }
  //弹窗取消
  handleCancel=()=>{
    this.setState({ alertShow: false })
  }
  getTreeData = () => {
    api.allSystemTree().then( res => {
      this.setState({ treeData: res.body })
    })
  }
  //加载区域树结构的下拉列表
  getTreeNode = data => {
    if( data && data.length) return (
      data.map( item => {
        return (
          <TreeNode value={item.code} title={item.name} key= {`${item.code}`}>
            {
              item.children && item.children.length ? (
                this.getTreeNode( item.children )
              ) : null
            }
          </TreeNode>
        )
      })
    )
  }
  //提交表单
  onSubmit = (e) => {
    e.preventDefault()
    let { pagingParameter } = this.state
    this.props.form.validateFields((err, values) => {
      if (!err) {
        cacheSearchParameter([{
          page: pagingParameter,
          parameter: {
            ...values
          }
        }], this.props.history, '1')
        this.setState({
          search: values,
          pagingParameter: {
            currentPage: 1,
            pageSize: pagingParameter.pageSize
          } }, this.getList)
      }
    })
  }
  //重置表单信息
  handleReset = ()=>{
    this.setState({
      search: {},
      pagingParameter: {
        currentPage: 1,
        pageSize: 10
      } }, () =>this.getList({ currentPage: 1, pageSize: 10 }))
    this.props.form.resetFields()
    this.resetKey = Math.random()
  }
  pigeonholeChange = (value) => {
    this.setState({
      flag: value
    })
  }
  onExport = () => {
    this.setState({ visible: true })
  }
  render (){
    let { body, pagingParameter, columns, alertShow, detailsList, flag, treeData, visible } = this.state
    let { getFieldDecorator } = this.props.form
    return(
      <article className="main-table-content">
        <PigeonholeTab onChange={ (value) =>this.pigeonholeChange(value)}/>
        <div className="search-bar">
          <Form className="filter-form new-flex-layout" layout="inline" onSubmit={this.onSubmit} onReset={ this.onReset}>
            <Item label='操作系统'>
              {getFieldDecorator('sysemId')(
                <TreeSelect
                  dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                  placeholder="请选择"
                  allowClear
                  getPopupContainer={triggerNode => triggerNode.parentNode}
                  treeDefaultExpandAll
                  treeNodeFilterProp='title'
                >
                  {this.getTreeNode(treeData)}
                </TreeSelect>
              )}
            </Item>
            <Item label="综合查询" className='item-separation'>
              {
                getFieldDecorator('queryString')(
                  <Input autoComplete="off"  className="filter-form-item" placeholder='请输入' maxLength={150} />
                )
              }
            </Item>
            <Item className="search-item">
              <Button type="primary" htmlType="submit">查询</Button>
              <Button type="primary" ghost onClick={this.handleReset}>重置</Button>
            </Item>
          </Form>
        </div>
        <div className="table-wrap system-log">
          <div className="table-btn">
            <div className="left-btn">
              { flag === '1' && <Button type="primary" onClick={ this.onExport}>导入</Button> }
            </div>
          </div>
          <div className='menu-add-table'>
            <div>
              <Table rowKey="order" columns={columns} dataSource={body.items} pagination={false}></Table>
              {
                body.totalRecords > 0 &&
            <Pagination
              current={pagingParameter.currentPage}
              pageSize={pagingParameter.pageSize}
              className="table-pagination"
              onChange={this.pageChange}
              total={body.totalRecords ? body.totalRecords : 0}
              showTotal={(total) => `共 ${total} 条数据`}
            />
              }
            </div>
          </div>

        </div>
        <LogImport
          visible= {visible}
          onCancel = { () =>this.setState({ visible: false })}
        />
        <Modal className='over-scroll-modal' title='日志详情' visible={alertShow}  onCancel={this.handleCancel} cancelText='返回' width={800} footer={null} >
          <div style={{ paddingLeft: '8%', lineHeight: 2 }} className="details-alert detail-content-layout form-content">
            <div><span className='detail-content-label'> 级别： </span>{detailsList.level} </div>
            <div><span className='detail-content-label'> 日志记录时间： </span>{ detailsList.timestamp ? detailsList.timestamp : ''} </div>
            <div><span className='detail-content-label'> 调用者名称： </span>{detailsList.userName}</div>
            <div><span className='detail-content-label'> 请求流水号： </span>{detailsList.requestId}</div>
            <div><span className='detail-content-label'> 线程名： </span>{detailsList.thread}</div>
            <div><span className='detail-content-label'> 全类名： </span>{detailsList.logger}</div>
            <div><span className='detail-content-label'> 消息体： </span>{detailsList.msg}</div>
          </div>
          <div className="Button-center">
            <div>
              <Button type="primary" ghost onClick={this.handleCancel}> 关闭 </Button>
            </div>
          </div>
        </Modal>
      </article>
    )
  }
}
const mapStateToProps = ({ Logs }) => {
  return { }
}

const LogSystems = Form.create()(LogSystem)

export default connect(mapStateToProps)(LogSystems)
