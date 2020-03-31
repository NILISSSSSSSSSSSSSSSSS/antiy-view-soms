import { Component } from 'react'
import { Button, Form, Table, Pagination, message } from 'antd'
import api from '@/services/api'
import Charts from '@/pages/Safe/Performance/Charts'
import { analysisUrl, cacheSearchParameter, getCaches } from '@/utils/common'
import moment from 'moment'
import DetailFiedls from '@/components/common/DetailFiedls'
import DateRange from '@/components/common/DateRange'
const { Item } = Form

const charSearchIndex = 0  // 服务器监控图形搜索在该路由下的位置
const tableSearchIndex = 1  // 历史性能表格在该路由下的位置
class Performance extends Component {
  constructor (props) {
    super(props)
    this.defaultTime = [moment(moment(moment().valueOf()).subtract(6, 'day').format('YYYY-MM-DD') + ' 00:00:00'), moment()]
    this.state = {
      assetId: analysisUrl(this.props.location.search).id,
      body: {},
      equipmentData: '',
      pagingParameter: {
        pageSize: 10,
        currentPage: 1
      },
      updateTime: this.defaultTime
    }
    this.columns = [
      {
        title: 'CPU占用率',
        dataIndex: 'cpuOccupyRate',
        key: 'cpuOccupyRate',
        render: (text) => { return (text ? `${text}%` : null) }
      }, {
        title: '内存占用率',
        dataIndex: 'memoryOccupyRate',
        render: (text) => { return (text ? `${text}%` : null) }
      }, {
        title: '磁盘占用率',
        dataIndex: 'diskOccupyRate',
        render: (text) => { return (text ? `${text}%` : null) }
      }, {
        title: '更新时间',
        dataIndex: 'gmtCreate',
        render: (text) => {
          return text ? (moment(text).format('YYYY-MM-DD HH:mm') + ':00') : null
        }
      }
    ]
  }
  componentDidMount () {
    const { pagingParameter } = this.state
    this.getData()
    //获取缓存
    const cache = getCaches(this, true, tableSearchIndex)
    // 有缓存时
    if (cache) {
      const { page: pagingParameter, parameter } = cache
      // 把缓存数据更新值state
      this.setState({ pagingParameter, updateTime: parameter.time }, () => {
        const { pagingParameter, updateTime } = this.state
        this.getList({ ...pagingParameter, beginTime: updateTime[0].valueOf(), endTime: updateTime[1].valueOf() }, false)
      })
    } else {
      this.getList({ ...pagingParameter, beginTime: this.defaultTime[0].valueOf(), endTime: this.defaultTime[1].valueOf() }, false)
    }
  }
  //根据页面获取当前设备信息数据
  getData = () => {
    const values = {
      primaryKey: analysisUrl(this.props.location.search).id
    }
    api.equipmentQueryById(values).then(response => {
      if (response && response.head && response.head.code === '200') {
        this.setState({
          equipmentData: response.body ? response.body : ''
        })
      }
    })
  }

  /**
   * 获取新能指标的表格数据
   * @param isCache 是否缓存
   * @param value{Object} { pageSize: Number, currentPage: Number, beginTime: ?Number, endTime: ?Number }
   */
  getList = (value = {}, isCache = true) => {
    const { assetId } = this.state
    const { currentPage, pageSize, beginTime, endTime } = value
    // 缓存数据
    isCache && cacheSearchParameter([{ page: { pageSize, currentPage }, parameter: { time: [beginTime, endTime] } }], this.props.history, tableSearchIndex)
    api.getHistoryPerformance({ primaryKey: assetId, ...value }).then(response => {
      if (response && response.head && response.head.code === '200') {
        this.setState({
          list: (response.body.items || []).map((e, i) => ({ ...e, stringId: e.stringId || i })),
          totalRecords: response.body.totalRecords
        })
      }
    })
  }
  // 提交表单，执行查询
  Submit = (e) => {
    e.preventDefault()
    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.search(values)
      }
    })
  }
  // 查询性能表格数据
  search = (values = {}) => {
    let value = {}
    const { pagingParameter: { pageSize } } = this.state
    if (values.time && values.time.length) {
      if (!values.time[0]) {
        message.info('请选择开始日期')
        return
      }
      if (!values.time[1]) {
        message.info('请选择结束日期')
        return
      }
      const beginTime = values.time[0].valueOf()
      const endTime = values.time[1].valueOf()
      const limit = 7
      // 最大间隔的天数，毫秒型
      const limtDay = 1000 * 60 * 60 * 24 * limit
      if ((beginTime + limtDay) < endTime) {
        message.info('最大间隔天数不能超过' + limit + '天')
        return
      }
      // const beginTime = moment(values.time[0].format('YYYY-MM-DD') + ' 00:00:00').valueOf()
      // const endTime = moment(values.time[1].format('YYYY-MM-DD') + ' 23:59:59').valueOf()
      value.beginTime = beginTime
      value.endTime = endTime
    }
    value = { ...value, currentPage: 1, pageSize }
    this.getList(value)
    this.setState({ updateTime: values.time || [] })
  }
  //分页
  pageModify = (pageSize, currentPage) => {
    const { updateTime } = this.state
    let value = {}
    // 拼装更新时间
    if (updateTime.length) {
      value.beginTime = updateTime[0].valueOf()
      value.endTime = updateTime[1].valueOf()
    }
    this.setState({
      pagingParameter: {
        pageSize,
        currentPage
      }
    }, () => { this.getList({ pageSize, currentPage, ...value }) })
  }
  /**
   * 切换单页显示数量事件
   * @param currentPage
   * @param pageSize
   */
  changeShowSize = (currentPage, pageSize) => {
    this.pageModify(pageSize, currentPage)
  }
  /**
   * 翻页事件
   * @param currentPage
   */
  changePage = (currentPage) => {
    const pageSize = this.state.pagingParameter.pageSize
    this.pageModify(pageSize, currentPage)
  }
  goBack = () => {
    this.props.history.goBack()
  }
  // 重置事件
  handleReset = () => {
    this.resetKey = Math.random()
    const values = { time: [...this.defaultTime] }
    this.search(values)
  }
  render () {
    const { list, type, equipmentData, pagingParameter, totalRecords } = this.state
    const { getFieldDecorator } = this.props.form
    const _basiInfo = [{ name: '设备名称', key: 'name' }, { name: '硬件版本', key: 'version' }, { name: '软件版本', key: 'newVersion', showTips: false }, { name: 'IP', key: 'ip', showTips: false }, { name: '设备编号', key: 'number' }, { name: '厂商', key: 'manufacturer' }]
    return (
      <div className="main-detail-content">
        <p className="detail-title">当前设备信息</p>
        <div className="detail-content">
          <DetailFiedls fields={_basiInfo} data={equipmentData} />
        </div>
        <p className="detail-title">性能指标信息</p>
        <div className="table-wrap">
          <Charts type={type} id={analysisUrl(this.props.location.search).id} searchIndex={charSearchIndex} />
          <div className="table-btn">
            <div>
              {/* <Button type="primary" style={{ marginRight: 20 }} onClick={this.DeleteModal}>导出</Button> */}
              {/* <Button type="primary" >更新</Button> */}
            </div>
            <div className="search-bar">
              <Form layout="inline" className="filter-form" style={{ boxShadow: 'none' }} onSubmit={this.Submit}>
                <Item label='更新时间'>
                  {
                    getFieldDecorator('time', {
                      initialValue: this.defaultTime
                    })(
                      <DateRange initialValue={this.defaultTime} allowClear={false} recentlyDay={7} style={{ width: 300 }} resetKey={this.resetKey} />
                    )
                  }
                </Item>
                <Item className="search-item" style={{ marginRight: 0 }}>
                  <Button type="primary" htmlType='submit' style={{ height: 32, marginRight: 0 }}>查询</Button>
                  {/*<Button onClick={this.handleReset} style={{ height: 32 }}>重置</Button>*/}
                </Item>
              </Form>
            </div>
          </div>
          <div className="table-wrap">
            <Table rowKey='stringId' columns={this.columns} dataSource={list} bordered pagination={false} />
            { totalRecords && <Pagination
              className="table-pagination"
              total={totalRecords} showTotal={(total) => `共 ${total || 0} 条数据`}
              showSizeChanger={false}
              showQuickJumper={true}
              onChange={this.changePage}
              onShowSizeChange={this.changeShowSize}
              pageSize={pagingParameter.pageSize}
              current={pagingParameter.currentPage} />}
          </div>
        </div>
      </div>
    )
  }
}

const PerformanceForm = Form.create()(Performance)
export default PerformanceForm
