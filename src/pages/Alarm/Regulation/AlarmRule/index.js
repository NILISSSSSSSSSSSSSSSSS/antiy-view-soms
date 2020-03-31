
import { Component } from 'react'
import { connect } from 'dva'
import { Button, Form, Table, Pagination, Input, message, Tooltip } from 'antd'
import api from '@/services/api'
import ChangeLevel from '@/components/Alarm/Alert/changeLevel'
import hasAuth from '@/utils/auth'
import Status from '@/components/common/Status'
import ModalConfirm from '@/components/common/ModalConfirm'
import { logAlarmPermission } from '@a/permission'
import { cache } from '@/utils/common'

const Item = Form.Item
const RegulationTypeArr = ['', '漏洞告警', '补丁告警', '配置告警', '', '安全设备性能告警', '安全运维服务性能告警', '异常资产告警', '资产状态监控告警']
class alarmRegulation extends Component{
  constructor (props){
    super(props)
    this.state = {
      data: this.props.data,
      pagingParameter: {
        currentPage: 1,
        pageSize: 10
      },
      columns: [{
        title: '规则名称',
        dataIndex: 'alarmName',
        key: 'alarmName',
        render: (text)=>{
          return(
            <Tooltip title={text} placement="topLeft" getPopupContainer={triggerNode => triggerNode.parentNode}>
              <span>{text}</span>
            </Tooltip>
          )
        }
      }, {
        title: '规则类型',
        dataIndex: 'alarmType',
        key: 'alarmType',
        render: (text)=>{
          return(
            <Tooltip title={RegulationTypeArr[text]} placement="topLeft" getPopupContainer={triggerNode => triggerNode.parentNode}>
              <span>{RegulationTypeArr[text]}</span>
            </Tooltip>
          )
        }
      }, {
        title: '原级别',
        dataIndex: 'alarmOldLevel',
        key: 'alarmOldLevel',
        render: (v) => {
          switch (v){
            case 1 : return <Status level={'1'}/>
            case 2 : return <Status level={'2'}/>
            case 3 : return <Status level={'3'}/>
            case 4 : return <Status level={'4'}/>
            default: break
          }
        }
      }, {
        title: '新级别',
        dataIndex: 'alarmNewLevel',
        key: 'alarmNewLevel',
        render: (v) => {
          switch (v){
            case 1 : return <Status level={'1'}/>
            case 2 : return <Status level={'2'}/>
            case 3 : return <Status level={'3'}/>
            case 4 : return <Status level={'4'}/>
            default: break
          }
        }
      },  {
        title: '操作',
        width: 200,
        render: (scope)=>{
          return (
            <div className="operate-wrap">
              { hasAuth(logAlarmPermission.alarmManageRuleUpdateLevel) && <a onClick={()=>this.showAlert(scope)}>变更级别</a> }
            </div>
          )
        }
      }],
      search: {},
      alertReset: false
    }
  }

  componentDidMount (){
    //解析保留的数据
    this.props.children(this)
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

  UNSAFE_componentWillReceiveProps (nextProps) {
    if(JSON.stringify(this.props.data) !== JSON.stringify(nextProps.data))
      this.setState({ data: nextProps.data })
  }

  render (){
    let { data, pagingParameter, columns, alertModal } = this.state
    let { getFieldDecorator } = this.props.form
    // comfirm一样的modal参数
    const alertReset = {
      title: '初始设置',
      visible: alertModal,
      children: (<p className='model-text'>确认要恢复所有设置?</p>),
      onOk: this.reset,
      onCancel: () => this.setState({ alertModal: false })
    }
    return(
      <article className="main-table-content">
        <div className="search-bar">
          <Form className="filter-form new-flex-layout" layout="inline" onSubmit={this.onSubmit}>
            <Item label="规则名称">
              {getFieldDecorator('alarmName')(
                <Input autoComplete="off" className="filter-form-item" placeholder="请输入规则名称" maxLength={30}/>
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
              { hasAuth(logAlarmPermission.alarmManageRuleRecover) && <Button type="primary" style={{ width: 'auto' }} onClick={() => this.setState({ alertModal: true })}>恢复初始设置</Button> }
            </div>
          </div>
          <Table rowKey="stringId"  columns={columns} dataSource={data.items} pagination={false}></Table>
          <Pagination
            current={pagingParameter.currentPage}
            className="table-pagination"
            defaultPageSize={10}
            pageSize={pagingParameter.pageSize}
            onChange={this.pageChange}
            showSizeChanger ={true}
            onShowSizeChange={ this.pageChange}
            total={data.totalRecords ? data.totalRecords : 0}
            showTotal={(total) => `共 ${total} 条数据`}
            showQuickJumper={true} />
        </div>
        <ChangeLevel  childrens={(now)=>this.ChangeLevel = now } success={this.uploadData} />
        <ModalConfirm props={alertReset}/>
      </article>
    )
  }
  getData = ( param ) =>{
    this.props.dispatch({ type: 'Alarms/getAlarmRuleList', payload: param })
  }
  //显示弹窗
  showAlert =(data)=>{
    this.ChangeLevel.show(data)
  }
  //更新列表数据
  uploadData=()=>{
    let { pagingParameter } = this.state
    this.getData({ ...pagingParameter })
  }
  //提交表单
  onSubmit = (e) => {
    e.preventDefault()
    let { pagingParameter } = this.state
    this.props.form.validateFields((err, values) => {
      !values.alarmName && delete values.alarmName
      if (!err) {
        cache.cacheSearchParameter([{
          page: pagingParameter,
          parameter: {
            ...values
          }
        }], this.props.history, 0, '0')
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
  //恢复默认值
  reset=()=>{
    let { pageSize } = this.state
    api.postAlarmRuleListReset().then( ()=>{
      message.success('恢复成功!')
      this.getData({ currentPage: 1, pageSize })
      this.setState({ alertModal: false })
    })
  }
  //翻页
  pageChange = (currentPage, pageSize)=>{
    let { search } = this.state
    cache.cacheSearchParameter([{
      page: {
        currentPage,
        pageSize
      },
      parameter: {
        ...search
      }
    }], this.props.history, 0, '0')
    this.setState({
      pagingParameter: {
        currentPage,
        pageSize
      }
    })
    this.getData({ currentPage, pageSize, ...search })
  }
}
const mapStateToProps = ({ Alarms }) => {
  return {
    data: Alarms.getAlarmRuleList
  }
}

const alarmRegulations = Form.create()(alarmRegulation)

export default connect(mapStateToProps)(alarmRegulations)
