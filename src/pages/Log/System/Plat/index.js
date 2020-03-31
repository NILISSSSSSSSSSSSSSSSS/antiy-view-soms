import { Component } from 'react'
import { connect } from 'dva'
import { Button, Form, Table, Select, Pagination, Input, Modal, Tooltip } from 'antd'
import hasAuth from '@/utils/auth'
import DateRange from '@/components/common/DateRange'
import { emptyFilter, evalSearchParam, cacheSearchParameter } from '@/utils/common'
import PigeonholeTab from '@/components/common/PigeonholeTab'
import { logAlarmPermission } from '@a/permission'
import api from '@/services/api'
import moment from 'moment'
import './style.less'

const Item = Form.Item
const { Option } = Select

//15天前
const startDate = moment().startOf('day').valueOf() - 1209600000
//这个时间只显示在前端（当天中的最晚时间）不传到后端去的
const endDate = moment().endOf('day').valueOf()
class LogSystem extends Component{
  constructor (props){
    super(props)
    this.state = {
      columns: [
        {
          title: '日志记录时间',
          dataIndex: 'timestamp',
          key: 'timestamp',
          width: 200,
          render: (text)=>{
            //后端传过来的时间格式
            return(<span className="tabTimeCss">{text.split('.')[0]}</span>)
          }
        }, {
          title: '级别',
          dataIndex: 'level',
          key: 'level',
          width: 100,
          render: (text)=>{
            switch(text){
              case 'TRACE': return 'Trace'
              case 'DEBUG': return 'Debug'
              case 'INFO': return 'Info'
              case 'WARN': return 'Warn'
              case 'ERROR': return 'Error'
              default: break
            }
          }
        }, {
          title: '类名',
          dataIndex: 'logger',
          key: 'logger',
          render: (text)=>{
            return(
              <Tooltip title={text} placement="topLeft" getPopupContainer={triggerNode => triggerNode.parentNode}>
                <span>{emptyFilter(text)}</span>
              </Tooltip>
            )
          }
        }, {
          title: '方法名',
          dataIndex: 'method',
          key: 'method',
          render: (text)=>{
            return(
              <Tooltip title={text} placement="topLeft" getPopupContainer={triggerNode => triggerNode.parentNode}>
                <span>{emptyFilter(text)}</span>
              </Tooltip>
            )
          }
        }, {
          title: '调用者',
          dataIndex: 'userName',
          key: 'userName',
          render: (text)=>{
            return (
              <Tooltip title={text} placement="topLeft" getPopupContainer={triggerNode => triggerNode.parentNode}>
                <span>{emptyFilter(text)}</span>
              </Tooltip>
            )
          }
        }, {
          title: '请求流水号',
          dataIndex: 'requestId',
          key: 'requestId',
          render: (text)=>{
            return(
              <Tooltip title={text} placement="topLeft" getPopupContainer={triggerNode => triggerNode.parentNode}>
                <span>{emptyFilter(text)}</span>
              </Tooltip>
            )
          }
        }, {
          title: '操作',
          width: 200,
          render: ( scope)=>{
            return (
              <div className="operate-wrap">
                { this.state.flag === '1' && <a>删除</a>}
                {hasAuth(logAlarmPermission.logManageSystemView) && <a onClick={()=>this.showAlert(scope)}>查看</a> }
              </div>
            )
          }
        }],
      rankArray: [
        { value: '', name: '全部' },
        { value: 'trace', name: 'Trace' },
        { value: 'debug', name: 'Debug' },
        { value: 'info', name: 'Info' },
        { value: 'warn', name: 'Warn' },
        { value: 'error', name: 'Error' }
      ],
      list: this.props.list,
      pagingParameter: {
        currentPage: 1,
        pageSize: 10
      },
      alertShow: false,
      search: {},
      detailsList: {},
      isArchived: 1,
      flag: '1'
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
      this.getList({ currentPage: 1, pageSize: 10, beginTime: startDate })
    }
  }

  UNSAFE_componentWillReceiveProps (nextProps) {
    if(JSON.stringify(this.props.list) !== JSON.stringify(nextProps.list)){
      nextProps.list.items = nextProps.list.items.map((item, index)=>{
        item.order = index + 1
        return item
      })
      this.setState({ list: nextProps.list })
    }
  }

  render (){
    let { list, pagingParameter, rankArray, columns, alertShow, detailsList } = this.state
    let { getFieldDecorator } = this.props.form
    return(
      <article className="main-table-content">
        <PigeonholeTab onChange={ (value) =>this.pigeonholeChange(value)}/>
        <div className="search-bar">
          <Form className="filter-form new-flex-layout" layout="inline" onSubmit={this.onSubmit}>
            <Item label="日志记录时间" className='item-date-container'>
              {getFieldDecorator('time' )(
                <DateRange format="YYYY-MM-DD" initialValue={ [ moment(startDate), moment(endDate)]} placeholder={['开始日期', '结束日期']} resetKey={this.resetKey} allowClear/>
              )}
            </Item>
            <Item label="级别"  className='item-separation'>
              {
                getFieldDecorator('level', { initialValue: '' })(
                  <Select
                    getPopupContainer={triggerNode => triggerNode.parentNode}
                    className="filter-form-item" placeholder="全部" >
                    {
                      rankArray.map((item, index)=>{
                        return(<Option value={item.value} key={ index + item.name }>{item.name}</Option>)
                      })
                    }
                  </Select>
                )
              }
            </Item>
            <Item label="流水号">
              {
                getFieldDecorator('requestId')(
                  <Input autoComplete="off"  className="filter-form-item" placeholder='请输入' maxLength={150} />
                )
              }
            </Item>
            <Item label="类名">
              {
                getFieldDecorator('logger')(
                  <Input autoComplete="off" className="filter-form-item" placeholder='请输入' maxLength={150}/>
                )
              }
            </Item>
            <Item label="方法名" className='item-separation'>
              {
                getFieldDecorator('method')(
                  <Input autoComplete="off" className="filter-form-item" placeholder='请输入' maxLength={150}/>
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
          <Table rowKey="order"  columns={columns} dataSource={list.items} pagination={false}></Table>
          {
            list.totalRecords > 0 &&
            <Pagination
              current={pagingParameter.currentPage}
              pageSize={pagingParameter.pageSize}
              className="table-pagination"
              onChange={this.pageChange}
              total={list.totalRecords ? list.totalRecords : 0}
              showTotal={(total) => `共 ${total} 条数据`}
            />
          }

        </div>
        <Modal className='over-scroll-modal' title='日志详情' visible={alertShow}  onCancel={this.handleCancel} cancelText='返回' width={800} footer={null} >
          <div style={{ paddingLeft: '8%', lineHeight: 2 }} className="details-alert detail-content-layout form-content">
            <div><span className='detail-content-label'> 级别： </span>{detailsList.level} </div>
            <div><span className='detail-content-label'> 日志记录时间： </span>{ detailsList.timestamp ? detailsList.timestamp.split('.')[0] : ''} </div>
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
  //获取数据
  getList = (param) =>{
    const { flag } = this.state
    flag === '1' ?
      this.props.dispatch({ type: 'Logs/getSystemLogList', payload: param })
      :
      api.getSystemLogList().then( res => {
        this.setState({ list: res.body })
      })
  }
  //显示弹窗
  showAlert =(now)=>{
    this.setState({ alertShow: true, detailsList: now })
  }
  //弹窗取消
  handleCancel=()=>{
    this.setState({ alertShow: false })
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
        }], this.props.history, '0')
        !values.level && delete values.level
        !values.logger && delete values.logger
        !values.method && delete values.method
        !values.requestId && delete values.requestId
        values.beginTime = values.time && values.time[0] && moment(values.time[0].format('YYYY-MM-DD') + ' 00:00:00').valueOf() || startDate//没选时间默认为15天
        values.endTime = values.time && values.time[1] && moment(values.time[1].format('YYYY-MM-DD') + ' 23:59:59').valueOf()
        this.setState({
          search: values,
          pagingParameter: {
            currentPage: 1,
            pageSize: pagingParameter.pageSize
          } })
        this.getList({ ...values, currentPage: 1, pageSize: pagingParameter.pageSize  })
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
      } })
    this.props.form.resetFields()
    this.getList({ currentPage: 1, pageSize: 10, beginTime: startDate })
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
    }, () => {
      // 系统日志table特殊需求，由于接口原因，禁止翻页的页码和当前页码相差过大，所以需隐藏直接跳转到第一页、直接跳转到最后一页、jump-prev、jump-next
      // 隐藏直接跳转到第一页无法通过css控制，所以是在js中实现的。
      const ele = document.getElementsByClassName('ant-pagination-item-1')[0]
      if (currentPage > 3) {
        ele.style.display = 'none'
      } else {
        ele.style.display = 'inline-block'
      }
    })
    //无查询时
    if(!search){
      this.getList({ currentPage, pageSize, beginTime: startDate })
    }else{
      //有查询时
      this.getList({ ...search, currentPage, pageSize })
    }
  }
  pigeonholeChange = (value) => {
    this.setState({
      flag: value
    })
  }
}
const mapStateToProps = ({ Logs }) => {
  return {
    list: Logs.systemLogList
  }
}

const LogSystems = Form.create()(LogSystem)

export default connect(mapStateToProps)(LogSystems)
