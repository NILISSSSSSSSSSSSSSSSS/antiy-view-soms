import { Component } from 'react'
import fetch from 'dva/fetch'
import moment from 'moment'
import Tooltip from '@/components/common/CustomTooltip'
import { Table, Modal, TreeSelect, message } from 'antd'
import Columnar from '@/components/ReportForm/Asset/Chart/columnar'
import Broken from '@/components/ReportForm/Asset/Chart/broken'
import TimeFiler from '@/components/common/TimeFiler'
import api from '@/services/api'
import hasAuth from '@/utils/auth'
import { reportPermission } from '@a/permission'
import { findSubNodeStringIds, findNodeByStringID, cacheSearchParameter, evalSearchParam, createHeaders } from '@/utils/common'
import '../List/style.less'

moment.locale('zh-cn')
const rowKey = 'classifyName'
const TreeNode = TreeSelect.TreeNode
class ReportFormAssetArea extends Component {
  constructor (props) {
    super(props)
    this.state = {
      dateType: '',
      columns: [],
      iData: [],
      chartData: {
        align: 'left',
        title: '',
        date: [],
        list: []
      },
      value: [],
      showTime: new Date().toLocaleDateString(),
      Parameter: {},
      QuarterEnd: '',
      QuarterStart: '',
      mode: ['month', 'month'],
      userAreaTree: [],
      areaValue: '',
      exportVisible: false,
      timeRange: [],
      checkedValue: ''
    }
    this.titleText = '本周 资产区域 TOP5总数'
    this.tableText = '本周 资产区域 总数'
  }

  componentDidMount () {
    api.getUserAreaTree().then((data) => {
      if (data.head && data.head.code === '200')
        this.setState({ userAreaTree: data.body }, () => {
          const areaData = {
            topAreaId: this.state.userAreaTree.stringId,
            topAreaName: this.state.userAreaTree.fullName
          }
          const params = {
            ...areaData,
            timeType: '1',
            startTime: moment().week(moment().week()).startOf('week').valueOf(),
            endTime: moment().valueOf()
          }

          const { list } = evalSearchParam(this, null, false) || {}
          if (sessionStorage.searchParameter && list) {
            const { parameter } = list[0]
            this.setState({
              checkedValue: Number(parameter.timeType),
              showTime: moment(params.endTime).format('YYYY-MM-DD HH:mm'),
              timeRange: parameter.timeType === '5' ? [moment(parameter.startTime).startOf('month'), moment(parameter.endTime).endOf('month')] : []
            })
            this.queryData({ ...Object.assign(parameter, areaData) })
          } else {
            this.queryData(params)
          }
        })
    })
  }

  /**
   * 获取对象下的所有节点
   * @param obj {Object} 区域对象
   * @return {{childrenAradIds: T[], parentAreaId: *, parentAreaName: (fullName|{value}|string)}[]}
   */
  getAllAreaIds = (obj) => {
    const result = obj.childrenNode.map((el) => {
      const a = {
        childrenAradIds: (findSubNodeStringIds(el, el.stringId) || []).filter(e => e !== el.stringId),
        parentAreaId: el.stringId,
        parentAreaName: el.fullName
      }
      return a
    })
    return result
  }
  queryData = (param = {}) => {
    const { userAreaTree = {}, Parameter } = this.state
    let assetAreaIds = Parameter.assetAreaIds
    const len = (userAreaTree.childrenNode || []).length
    // 只有一个节点时，没有子集节点时
    if (!len) {
      assetAreaIds = [{ parentAreaId: userAreaTree.stringId, parentAreaName: userAreaTree.fullName, childrenAradIds: [userAreaTree.stringId] }]
    } else {
      // 要遍历tree的
      assetAreaIds = this.getAllAreaIds(userAreaTree)
    }
    let params = {
      ...Parameter,
      ...param,
      assetAreaIds
    }
    this.setState({ Parameter: params, showTime: moment(params.endTime).format('YYYY-MM-DD HH:mm') })
    this.getTableData(params)
    this.getChartData(params)
  }
  /**
   * 时间变更时间
   * @param filter {Object} filter对象
   */
  timeFilterChange = (filter) => {
    const timeTypes = [
      { key: 'week', value: '1', label: '本周' },
      { key: 'month', value: '2', label: '本月' },
      { key: 'quarter', value: '3', label: '本季度' },
      { key: 'year', value: '4', label: '本年' },
      { key: 'other', value: '5', label: '' }]
    const timeType = (timeTypes.find(e => e.key === filter.dateType) || {})
    const param = {
      timeType: timeType.value,
      startTime: filter.startTime,
      endTime: filter.endTime
    }
    let rangeTime = moment(filter.startTime).format('YYYY-MM') + '~' + moment(filter.endTime).format('YYYY-MM')
    const title = `${timeType.label || rangeTime} 资产区域 TOP5总数`
    const columns = JSON.parse(JSON.stringify(this.state.columns))
    columns[0].title = this.tableText = `${timeType.label || rangeTime} 资产区域总数`
    this.titleText = title
    const { Parameter } = this.state
    let params = {
      ...Parameter,
      ...param
    }
    this.setState({
      columns,
      Parameter: params,
      checkedValue: '',
      timeRange: [],
      showTime: moment(params.endTime).format('YYYY-MM-DD HH:mm')
    })
    cacheSearchParameter([{
      parameter: param
    }], this.props.history)
    this.getTableData(params)
    this.getChartData(params)
  }

  render () {
    let { columns, chartData, showTime, iData, userAreaTree, exportVisible, checkedValue, timeRange } = this.state
    return (
      <div className="All">
        <header className="charts-header">
          <div className="container">
            <TimeFiler onChange={this.timeFilterChange} type={checkedValue || undefined} defaultValue={timeRange} />
            <div className="area-header-select"><span className='area-header-select-lable'>区域:</span>
              <TreeSelect
                onSelect={this.onSelect}
                onChange={this.onChange}
                style={{ width: '200px', marginLeft: '8px' }}
                dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                placeholder="请选择"
                // value = {areaValue}
                allowClear
                treeDefaultExpandAll
              >
                {
                  this.getUserAreaTreeNode(userAreaTree)
                }
              </TreeSelect>
            </div>
          </div>
        </header>
        <div className="Patchtext">统计时间：截止为{showTime}</div>
        <div id="chart-content" className="chart-content-one">
          <section className={chartData.date.length > 6 ? 'whole' : 'topo'}>
            <Columnar iData={chartData} />
          </section>
          <section className={chartData.date.length > 6 ? 'whole' : 'topo'}>
            <Broken iData={chartData} />
          </section>
        </div>
        <div className="table-wrap" id="asset-table-content">
          <div className="table-btn">
            <div className='export-btn'>
              {hasAuth(reportPermission.REPORT_ASSET_DC) && <a onClick={() => this.setState({ exportVisible: true })}><img src={require('@/assets/export.svg')} alt="" />导出</a>}
            </div>
          </div>
          <Table rowKey={rowKey} className='asset-table-style' columns={columns} dataSource={iData} pagination={false} bordered size='small' />
        </div>
        <a id="report-forms-area-download" href='' download='' style={{ visibility: 'hidden' }}>
        </a>
        <Modal
          title="导出Excel"
          width={650}
          visible={exportVisible}
          onCancel={() => this.setState({ exportVisible: false })}
          onOk={this.downloadData}>
          <p>请确认是否导出当前数据？</p>
        </Modal>
      </div>
    )
  }
  //下拉框选择区域
  onSelect = (value) => {
    let { userAreaTree, Parameter } = this.state
    const param = { ...Parameter }
    const currentNode = findNodeByStringID(userAreaTree, value)
    // 只有一个节点时，没有子集节点时
    const len = (currentNode.childrenNode || []).length
    // 找出当前节点下的所有节点
    const assetAreaIds = len ? this.getAllAreaIds(currentNode) : [{ parentAreaId: currentNode.stringId, parentAreaName: currentNode.fullName, childrenAradIds: [currentNode.stringId] }]
    param.topAreaId = value
    param.topAreaName = currentNode.fullName
    param.assetAreaIds = assetAreaIds
    this.setState({ areaValue: value, Parameter: param }, () => {
      this.getTableData(param)
      this.getChartData(param)
    })
  }
  //选择区域清除
  onChange = (value, options, extra) => {
    // 删除当前区域时，请求当前用户下的所有区域数据
    if (!value) {
      const { userAreaTree = {}, Parameter } = this.state
      this.queryData({ ...Parameter, topAreaId: userAreaTree.stringId, topAreaName: userAreaTree.fullName })
    }
  }
  //导出数据
  downloadData = () => {
    let { Parameter } = this.state
    // 该导出接口由于入参过于复杂，且参数大小可能会超过get的最大限制，所以用post的方式导出。
    // 导出接口的返回值是文件流，无法通过公共request函数调用，所以在此处单独调用。
    // 维护接口调用时，注意此处需一起维护。
    fetch('/api/v1/asset/report/query/exportAreaTable', {
      headers: {
        'Content-Type': 'application/json; charset=UTF-8',
        ...createHeaders(Parameter)
      },
      method: 'post',
      body: JSON.stringify(Parameter)
    }).then(data => {
      return data.blob()
    }).then(data => {
      let { columns } = this.state
      let title = columns[0].title.replace(/\s+/g, '')
      if (window.navigator.userAgent.indexOf('Trident/7.0') > -1) {
        window.navigator.msSaveOrOpenBlob(data, columns.length ? title + '.xlsx' : '')
        this.setState({ exportVisible: false })
      } else {
        let init = document.querySelector('#report-forms-area-download')
        init.href = URL.createObjectURL(data)
        init.download = title + '.xlsx'
        init.click()
        this.setState({ exportVisible: false })
      }
    }).catch((err) => message.error('导出数据错误'))
  }
  //加载区域树结构的下拉列表
  getUserAreaTreeNode = (data) => {
    return data ? (<TreeNode value={data.stringId} title={data.fullName} key={`${data.stringId}`}>{
      data.childrenNode && data.childrenNode.length ? (
        data.childrenNode.map(item => {
          return this.getUserAreaTreeNode(item)
        })
      ) : null
    }
    </TreeNode>
    ) : null
  }

  // 获取表格数据
  getTableData = (Paramet) => {
    let init = {}
    init.title = this.tableText
    // let tableEl = document.getElementById('asset-table-content')
    api.getAssetAreaTables({ ...Paramet }).then((data) => {
      if (data.head && data.head.code === '200') {
        // if(data.body.children.length < 6)
        //   tableEl.classList.add('asset-table-style')
        // else
        //   tableEl.classList.remove('asset-table-style')
        init.children = data.body.children.map((item) => {
          return {
            title: item.name,
            className: 'next-title',
            dataIndex: item.key,
            key: item.key,
            render: (text) => {
              if (item.key === rowKey) {
                return <Tooltip title={text}>{text}</Tooltip>
              } else {
                return text
              }
            }
          }
        })
        this.setState({
          columns: [init], iData: data.body.rows.map((item, i) => {
            return { order: i, ...item }
          })
        })
      }
    })
  }

  //图表数据
  getChartData = (paramet, title = '') => {
    let { chartData } = this.state
    api.getAssetAreaCharts(paramet).then((data) => {
      if (data.head && data.head.code === '200') {
        chartData.date = data.body.date
        chartData.title = [`{span|${this.titleText}}`].join('\n')
        chartData.list = data.body.list.map((item) => {
          return {
            classify: item.classify,
            data: item.data,
            add: item.add
          }
        })
        this.setState({ chartData })
      }
    })
  }
  //遍历得到KEY
  getParentKey = (iData) => {
    let init = []
    let childrens = []
    let keyMap = (now) => {
      return now.map(v => v.stringId)
    }
    let childrenTop = (now) => {
      if (Array.isArray(now))
        now.forEach((item) => {
          if (item.childrenNode && item.childrenNode.length) {
            childrens = childrens.concat(keyMap(item.childrenNode))
            childrenTop(item.childrenNode)
          } else {
            childrens.push(item.stringId)
          }
        })
      return childrens
    }
    let topo = (now) => {
      if (Array.isArray(now)) {
        now.forEach((item) => {
          init.push({
            childrenAradIds: childrenTop(item.childrenNode),
            parentAreaId: item.stringId,
            parentAreaName: item.fullName
          })
          childrens = []
        })
      }

    }
    topo(iData)
    return init
  }
}

export default ReportFormAssetArea
