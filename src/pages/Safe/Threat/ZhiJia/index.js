import { Component } from 'react'
import { connect } from 'dva'
import { Table, Pagination } from 'antd'
import Tooltip from '@/components/common/CustomTooltip'
import './style.less'
import { transliteration, emptyFilter, getCaches, cacheSearchParameter, timeStampToTime } from '@/utils/common'
import { NavLink, withRouter } from 'dva/router'
import { safetyPermission } from '@a/permission'
import hasAuth from '@/utils/auth'
import TempletForm from '@/components/Safe/TerminalModal/templateForm'
import Search from '../common/Search'
import moment from 'moment'

const viusSearchIndex = 0  //此处数字代表着在查询条件在该路由下的数组下标
const aptSearchIndex = 1  //此处数字代表着在查询条件在该路由下的数组下标
class ThreatZhiJia extends Component {
  constructor (props) {
    super(props)
    this.state = {
      assetList: this.props.assetList || [],
      virusList: this.props.virusList || [],
      show: false,
      page: { // 病毒分页
        pageIndex: 1,
        pageSize: 10
      },
      pageAPT: { // 高级威胁分页
        pageIndex: 1,
        pageSize: 10
      },
      rowKeys: ['no', 'order'],
      seekTerm: {
        safetyId: '',
        multipleQuery: '',
        beginTime: '',
        endTime: ''
      }, //病毒请求参数
      seekTermAPT: {
        safetyId: '',
        multipleQuery: '',
        beginTime: '',
        endTime: ''
      }, // 高级威胁请求参数
      virusColums: [
        {
          title: '中毒文件',
          key: 'fileName',
          dataIndex: 'fileName',
          render: (text) => {
            return <Tooltip title={text} placement="topLeft">{text}</Tooltip>
          }
        },
        {
          title: '病毒名称',
          key: 'virusName',
          dataIndex: 'virusName',
          render: (text) => {
            return <Tooltip title={text}>{text}</Tooltip>
          }
        },
        {
          title: '终端名称',
          key: 'sourceAssetName',
          dataIndex: 'sourceAssetName',
          render: (text) => {
            return <Tooltip title={text}>{text}</Tooltip>
          }
        },
        {
          title: '终端IP',
          key: 'sourceIp',
          width: 135,
          dataIndex: 'sourceIp'
        },
        {
          title: '所属安全设备',
          key: 'assetName',
          dataIndex: 'assetName',
          render: (text) => {
            return <Tooltip title={text}>{text}</Tooltip>
          }
        },
        {
          title: '中毒时间',
          key: 'threatEventTime',
          dataIndex: 'threatEventTime',
          width: 170,
          render: (text) => {
            const v = emptyFilter(timeStampToTime(text))
            return <span className="tabTimeCss">{v}</span>
          }
        },
        {
          title: '操作',
          key: 'operate',
          width: 180,
          render: (record) => {
            return (
              <div className="operate-wrap">
                {
                  hasAuth(safetyPermission.SAFETY_WXSJ_ZJ_CK) ? <NavLink to={`/safe/threat/ZhiJiaDetail?id=${transliteration(record.assetId)}&primaryKey=${transliteration(record.safetyThreatId)}&status=1`} >查看</NavLink> : null
                }
                {
                  hasAuth(safetyPermission.SAFETY_WXSJ_ZJ_CKBG) && record.reportUrl ? <a href={`${record.reportUrl}`} target="_blank" rel="noopener noreferrer" >查看报告</a> : null
                }
              </div>
            )
          }
        }
      ],
      templateId: '',
      superColumns: [
        {
          title: '追溯时间',
          key: 'threatEventTime',
          dataIndex: 'threatEventTime',
          width: 210,
          render: (text) => {
            const v = emptyFilter(timeStampToTime(text))
            return <span className="tabTimeCss">{v}</span>
          }
        },
        {
          title: 'APT名称',
          key: 'aptName',
          dataIndex: 'aptName',
          render: (text) => {
            return <Tooltip title={text}>{text}</Tooltip>
          }
        },
        {
          title: 'APT版本',
          key: 'aptVersion',
          dataIndex: 'aptVersion'
        },
        {
          title: '终端数量',
          key: 'assetCount',
          dataIndex: 'assetCount',
          render: (text, record) => {
            if (!record.assetCount) {
              return text
            }
            return (<a onClick={() => this.showNumDetail(record)}>{text}</a>)
          }
        },
        {
          title: '所属安全设备',
          key: 'assetName',
          dataIndex: 'assetName',
          render: (text) => {
            return <Tooltip title={text}>{text}</Tooltip>
          }
        },
        {
          title: '操作',
          key: 'operate',
          width: 150,
          render: (record) => {
            return (
              <div className="operate-wrap">
                {
                  hasAuth(safetyPermission.SAFETY_WXSJ_ZJ_CKBG) && record.reportUrl ? <a {...record.reportUrl ? { href: record.reportUrl } : {}} target="_blank">查看报告</a> : null
                }
              </div>
            )
          }
        }
      ]
    }
  }
  componentDidMount () {
    const caches = getCaches(this, false)
    if (caches && caches.length) {
      console.log(caches)
      const virus = caches[viusSearchIndex] // 此处数字代表着在查询条件在该路由下的数组下标
      const apt = caches[aptSearchIndex]  // 此处数字代表着在查询条件在该路由下的数组下标
      // 病毒威胁缓存
      if (virus && Object.keys(virus.parameter).length) {
        const { multipleQuery, beginTime, endTime, safetyId = null } = virus.parameter
        const { pageSize, currentPage: pageIndex } = virus.page
        const parameter = { retrieve: multipleQuery, time: [beginTime ? moment(Number(beginTime)) : null, endTime ? moment(Number(endTime)) : null], safetyId }
        // 回显缓存的查询条件
        this.virusSearchForm.setFieldsValue({ ...parameter })
        this.setState({
          page: { pageSize, pageIndex },
          seekTerm: virus.parameter
        }, () => this.getsafetythreatvirusList(false))
      } else {
        this.getsafetythreatvirusList(false)
      }
      // 高级威胁缓存
      if (apt && Object.keys(apt.parameter).length) {
        const { multipleQuery, beginTime, endTime, safetyId = null } = apt.parameter
        const { pageSize, currentPage: pageIndex } = apt.page
        const parameter = { retrieve: multipleQuery, time: [beginTime ? moment(Number(beginTime)) : null, endTime ? moment(Number(endTime)) : null], safetyId }
        // 回显缓存的查询条件
        this.aptSearchForm.setFieldsValue({ ...parameter })
        this.setState({
          pageAPT: { pageSize, pageIndex },
          seekTermAPT: apt.parameter
        }, () => this.getsafetythreataptList(false))
      } else {
        this.getsafetythreataptList(false)
      }
    } else {
      this.getsafetythreataptList(false)
      this.getsafetythreatvirusList(false)
    }
  }

  UNSAFE_componentWillReceiveProps (nextProps) {
    // if (JSON.stringify(this.props.assetList) !== JSON.stringify(nextProps.assetList)) {
    //   this.setState({
    //     assetList: nextProps.assetList
    //   })
    // }
    this.setState({
      assetList: nextProps.assetList,
      virusList: nextProps.virusList
    })
    // if (JSON.stringify(this.props.virusList) !== JSON.stringify(nextProps.virusList)) {
    //   this.setState({
    //     virusList: nextProps.virusList
    //   })
    // }
  }
  /**
   * 设置缓存
   * @param  parames{Object}要缓存的参数
   * @param searchIndex{Number} 要缓存的参数所在该页面是第几个位置
   */
  setCache = (parames = {}, searchIndex) => {
    console.log('searchIndex', searchIndex)
    const { currentPage, pageSize, safetyId, retrieve: multipleQuery, beginTime, endTime } = parames
    const parameter = { safetyId, multipleQuery, beginTime, endTime }
    cacheSearchParameter([{ page: { currentPage, pageSize }, parameter }], this.props.history, searchIndex)
  }
  // 病毒翻页
  pageChange = (page, pageSize) => {
    this.setState({ page: { pageIndex: page, pageSize: pageSize } })
    const { seekTerm } = this.state
    const values = { ...seekTerm }
    values.currentPage = page
    values.pageSize = pageSize
    this.setCache(values, viusSearchIndex)
    this.props.dispatch({ type: 'safe/getsafetythreatvirusList', payload: values })
  }
  // 高级威胁翻页
  pageChangeAPT = (page, pageSize) => {
    this.setState({ pageAPT: { pageIndex: page, pageSize: pageSize } })
    const { seekTermAPT } = this.state
    const values = { ...seekTermAPT }
    values.currentPage = page
    values.pageSize = pageSize
    this.setCache(values, aptSearchIndex)
    this.props.dispatch({ type: 'safe/getsafetythreataptList', payload: values })
  }
  // 获取高级威胁列表数据
  getsafetythreataptList = (isCache = true) => {
    const { seekTermAPT, pageAPT: { pageIndex: currentPage, pageSize } } = this.state
    const postParms = {
      ...seekTermAPT,
      currentPage,
      pageSize
    }
    // 缓存查询参数
    isCache && this.setCache(postParms, aptSearchIndex)
    this.props.dispatch({ type: 'safe/getsafetythreataptList', payload: postParms })
  }
  // 获取病毒威胁列表数据
  getsafetythreatvirusList = (isCache = true) => {
    const { seekTerm, page: { pageIndex: currentPage, pageSize } } = this.state
    const postParms = {
      ...seekTerm,
      currentPage,
      pageSize
    }
    // 缓存查询参数
    isCache && this.setCache(postParms, viusSearchIndex)
    this.props.dispatch({ type: 'safe/getsafetythreatvirusList', payload: postParms })
  }
  // 病毒查询
  virusSearch = (values = {}) => {
    const { page: { pageSize } } = this.state
    this.setState({
      seekTerm: values,
      page: { pageIndex: 1, pageSize }
    }, () => {
      this.getsafetythreatvirusList()
    })
  }

  // 高级威胁查询
  aptSearch = (values = {}) => {
    const { pageAPT: { pageSize } } = this.state
    this.setState({
      seekTermAPT: values,
      pageAPT: { pageIndex: 1, pageSize }
    }, () => {
      this.getsafetythreataptList()
    })
  }
  showNumDetail = (values) => {
    this.setState({ show: true, templateId: values.stringId })
  }
  //查询条件重置
  handleReset = (index) => {
    if (index === 1) {
      //重置查询条件后，重新查询页面数据
      const pageAPT = { pageIndex: 1, pageSize: 10 }
      this.setState({ pageAPT: { ...pageAPT }, seekTermAPT: {} })
      const { pageIndex: currentPage, pageSize } = pageAPT
      this.setCache({ currentPage, pageSize }, aptSearchIndex)
      this.props.dispatch({ type: 'safe/getsafetythreataptList', payload: { currentPage, pageSize } })
    } else {
      //重置查询条件后，重新查询页面数据
      const page = { pageIndex: 1, pageSize: 10 }
      this.setState({ page: { ...page }, seekTerm: {} })
      const { pageIndex: currentPage, pageSize } = page
      this.setCache({ currentPage, pageSize }, viusSearchIndex)
      this.props.dispatch({ type: 'safe/getsafetythreatvirusList', payload: { currentPage, pageSize } })
    }
  }
  render () {
    let { assetList, virusColums, page, pageAPT, superColumns, virusList } = this.state
    return (
      <div className="main-detail-content">
        <p className="detail-title">病毒威胁</p>
        <div className="threat-item">
          <Search from='virus' ref={(search) => {
            /*此处必须使用 ref获取，该Search组件没有使用过高阶组件，所以必须使用ref获取，否则获取不到*/
            search && (this.virusSearchForm = search.searchForm)
          }} search={this.virusSearch} reset={() => { this.handleReset(0) }} placeholder={{ safetyId: '全部', beginTime: '开始日期', endTime: '结束日期', retrieve: '病毒名称/终端名称/IP' }} />
          <div className="table-wrap">
            <Table rowKey="stringId" columns={virusColums} dataSource={virusList.items} pagination={false}/>
            {
              virusList.totalRecords
                ? <Pagination current={page.pageIndex} pageSize={page.pageSize} className="table-pagination" onChange={this.pageChange} onShowSizeChange={this.pageChange} total={virusList.totalRecords ? virusList.totalRecords : 0} showTotal={(total) => `共 ${virusList.totalRecords || 0} 条数据`} showSizeChanger={false} showQuickJumper={true} />
                : null
            }
          </div>
        </div>
        <p className="detail-title">高级威胁</p>
        <div className="threat-item ">
          {/*<h3><span className="blue-title" />高级威胁</h3>*/}
          <Search from='apt' ref={(search) => { search && (this.aptSearchForm = search.searchForm) }} search={this.aptSearch} reset={() => { this.handleReset(1) }} placeholder={{ safetyId: '全部', beginTime: '开始日期', endTime: '结束日期', retrieve: 'APT名称' }} />
          <div className="table-wrap">
            <Table rowKey="stringId" columns={superColumns} dataSource={assetList.items} pagination={false}/>
            {
              assetList.totalRecords
                ? <Pagination current={pageAPT.pageIndex} pageSize={pageAPT.pageSize} className="table-pagination" onChange={this.pageChangeAPT} onShowSizeChange={this.pageChangeAPT} total={assetList.totalRecords ? assetList.totalRecords : 0} showTotal={(total) => `共 ${assetList.totalRecords || 0} 条数据`} showSizeChanger={false} showQuickJumper={true} />
                : null
            }
          </div>
        </div>
        <TempletForm visible={this.state.show} id={this.state.templateId} onCancel={() => { this.setState({ show: false }) }} />
      </div>
    )
  }
}

const mapStateToProps = ({ safe }) => {
  return {
    assetList: safe.safetythreataptList,
    virusList: safe.safetythreatvirusList
  }
}
export default connect(mapStateToProps)(withRouter(ThreatZhiJia))
