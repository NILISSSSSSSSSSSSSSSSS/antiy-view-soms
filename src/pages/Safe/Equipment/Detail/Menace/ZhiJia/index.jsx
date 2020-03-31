import { PureComponent } from 'react'
import { connect } from 'dva'
import { Form, Table } from 'antd'
import { analysisUrl, transliteration, emptyFilter, evalSearchParam, cacheSearchParameter, timeStampToTime } from '@/utils/common'
import { withRouter, NavLink } from 'dva/router'
import moment from 'moment'
import hasAuth from '@/utils/auth'
import PropTypes from 'prop-types'
import { debounce } from 'lodash'
import Tooltip from '@/components/common/CustomTooltip'
import TempletForm from '@/components/Safe/TerminalModal/templateForm'
import Search from '../common/Search'

const viusSearchIndex = 3  //此处数字代表着在查询条件在该路由下的数组下标
const aptSearchIndex = 4  //此处数字代表着在查询条件在该路由下的数组下标
@Form.create()
class MenaceDetailZhiJia extends PureComponent {
  state = {
    assetId: analysisUrl(this.props.location.search).id,
    //威胁表单查询
    currentPageVirus: 1,
    pageSizeVirus: 10,
    multipleQueryVirus: '',
    beginTimeVirus: '',
    endTimeVirus: '',
    //威胁表单结束
    //高级表单查询
    currentPageAdvance: 1,
    pageSizeAdvance: 10,
    multipleQueryAdvance: '',
    beginTimeAdvance: '',
    endTimeAdvance: ''
  }
  static propTypes = {
    safetythreataptList: PropTypes.object,
    safetythreatvirusList: PropTypes.object
  }
  componentDidMount () {
    const cache = this.getCache()
    // 是否有缓存查询条件
    if (cache && cache.length) {
      const virus = cache[viusSearchIndex] // 此处数字代表着在查询条件在该路由下的数组下标
      const apt = cache[aptSearchIndex]  // 此处数字代表着在查询条件在该路由下的数组下标
      // 病毒威胁缓存
      if (virus && Object.keys(virus).length) {
        const { multipleQueryVirus, beginTimeVirus, endTimeVirus } = virus.parameter
        const parameter = { retrieve: multipleQueryVirus, time: [beginTimeVirus ? moment(Number(beginTimeVirus)) : null, beginTimeVirus ? moment(Number(endTimeVirus)) : null] }
        // 回显缓存的查询条件
        this.virusSearchForm.setFieldsValue({ ...parameter })
        this.setState({
          ...virus.page,
          ...virus.parameter
        }, () => this.getsafetythreatvirusList(false))
      } else {
        this.getsafetythreatvirusList(false)
      }
      //高级威胁缓存
      if (apt && Object.keys(apt).length) {
        const { multipleQueryAdvance, beginTimeAdvance, endTimeAdvance } = apt.parameter
        const parameter = { retrieve: multipleQueryAdvance, time: [beginTimeAdvance ? moment(Number(beginTimeAdvance)) : null, endTimeAdvance ? moment(Number(endTimeAdvance)) : null] }
        // 回显缓存的查询条件
        this.aptSearchForm.setFieldsValue({ ...parameter })
        this.setState({
          ...apt.page,
          ...apt.parameter
        }, () => {
          this.getsafetythreataptList(false)
        })
      } else {
        this.getsafetythreataptList(false)
      }
    } else {
      this.getsafetythreatvirusList(false)
      this.getsafetythreataptList(false)
    }
  }
  virusChangePage = (currentPage, pageSize) => {
    this.setState({
      currentPageVirus: currentPage,
      pageSizeVirus: pageSize
    }, this.getsafetythreatvirusList)
  }

  advanceChangePage = (currentPage, pageSize) => {
    this.setState({
      currentPageAdvance: currentPage,
      pageSizeAdvance: pageSize
    }, this.getsafetythreataptList)
  }

  //病毒查询
  virusSubmit = (values = {}) => {
    this.setState({
      currentPageVirus: 1,
      beginTimeVirus: values.beginTime || '',
      endTimeVirus: values.endTime || '',
      multipleQueryVirus: values.multipleQuery
    }, this.getsafetythreatvirusList)
  }

  //高级查询
  advancedSubmit = (values = {}) => {
    this.setState({
      currentPageAdvance: 1,
      beginTimeAdvance: values.beginTime || '',
      endTimeAdvance: values.endTime || '',
      multipleQueryAdvance: values.retrieve
    }, this.getsafetythreataptList)
  }

  //**接口开始 */
  //威胁列表
  getsafetythreatvirusList = debounce((isCache = true) => {
    const {
      currentPageVirus,
      pageSizeVirus,
      assetId,
      multipleQueryVirus,
      beginTimeVirus,
      endTimeVirus
    } = this.state
    const payload = {
      currentPage: currentPageVirus,
      pageSize: pageSizeVirus,
      assetId,
      multipleQuery: multipleQueryVirus,
      beginTime: beginTimeVirus,
      endTime: endTimeVirus
    }
    isCache && this.setCache([{ page: { currentPageVirus, pageSizeVirus }, parameter: { multipleQueryVirus, beginTimeVirus, endTimeVirus } }], viusSearchIndex)
    this.props.dispatch({ type: 'safe/getsafetythreatvirusList', payload: payload })
  })
  //高级列表
  getsafetythreataptList = debounce((isCache = true) => {
    const {
      currentPageAdvance,
      pageSizeAdvance,
      assetId,
      multipleQueryAdvance,
      beginTimeAdvance,
      endTimeAdvance
    } = this.state
    const payload = {
      currentPage: currentPageAdvance,
      pageSize: pageSizeAdvance,
      assetId,
      multipleQuery: multipleQueryAdvance,
      beginTime: beginTimeAdvance,
      endTime: endTimeAdvance
    }
    isCache && this.setCache([{ page: { currentPageAdvance, pageSizeAdvance }, parameter: { multipleQueryAdvance, beginTimeAdvance, endTimeAdvance } }], aptSearchIndex)
    this.props.dispatch({ type: 'safe/getsafetythreataptList', payload: payload })
  })
  // 病毒威胁 表格字段
  virusColumns = [
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
        return <Tooltip title={text} >{text}</Tooltip>
      }
    },
    {
      title: '终端IP',
      key: 'sourceIp',
      dataIndex: 'sourceIp'
    },
    {
      title: '中毒时间',
      key: 'threatEventTime',
      dataIndex: 'threatEventTime',
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
              hasAuth('safedev:wxsj:zjwx:ckxq') ? <NavLink to={`/safe/threat/ZhiJiaDetail?id=${transliteration(record.assetId)}&primaryKey=${transliteration(record.safetyThreatId)}`} >查看</NavLink> : null
            }
            {
              hasAuth('safedev:wxsj:zjwx:ckbg') && record.reportUrl ? <a href={`${record.reportUrl}`} target="_blank" rel="noopener noreferrer">查看报告</a> : null
            }
          </div>
        )
      }
    }
  ]
  //高级威胁 表格column
  advancedcolumns = [
    {
      title: '追溯时间',
      key: 'threatEventTime',
      dataIndex: 'threatEventTime',
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
      title: '操作',
      key: 'operate',
      width: 150,
      render: (record) => {
        return (
          <div className="operate-wrap">
            {
              hasAuth('safedev:wxsj:zjwx:ckbg') && record.reportUrl ? <a {...record.reportUrl ? { href: record.reportUrl } : {}} target="_blank">查看报告</a> : null
            }
          </div>
        )
      }
    }
  ]
  /**
   * 显示高级威胁的终端列表modal
   * @param values
   */
  showNumDetail = (values) => {
    this.setState({ show: true, templateId: values.stringId })
  }
  /**
   * 获取缓存数据
   */
  getCache = () => {
    if (sessionStorage.searchParameter) {
      const cache = evalSearchParam(this, {}, false)
      return cache.list
    }
    return void 0
  }
  /**
   * 设置缓存
   */
  setCache = (cache = [], searchIndex) => {
    cacheSearchParameter(cache, this.props.history, searchIndex)
  }
  render () {
    const { safetythreatvirusList, safetythreataptList } = this.props
    const { currentPageAdvance, pageSizeAdvance, currentPageVirus, pageSizeVirus } = this.state
    return (
      <div className="main-detail-content">
        <p className="detail-title">病毒威胁</p>
        <Search from="virus" ref={(search) => {
          /*此处必须使用 ref获取，该Search组件没有使用过高阶组件，所以必须使用ref获取，否则获取不到*/
          search && (this.virusSearchForm = search.searchForm)
        }} search={this.virusSubmit} placeholder={{ safetyId: '全部', beginTime: '开始日期', endTime: '结束日期', retrieve: '病毒名称/终端名称/IP' }} />
        <div className="table-wrap">
          <Table
            rowKey={(text, record) => record}
            columns={this.virusColumns}
            dataSource={safetythreatvirusList.items}
            pagination={{
              showQuickJumper: true,
              showSizeChanger: false,
              // pageSizeOptions: ['10', '20', '30', '40'],
              onShowSizeChange: this.virusChangePage,
              showTotal: () => `共 ${safetythreatvirusList.totalRecords} 条数据`,
              current: currentPageVirus,
              pageSize: pageSizeVirus,
              total: safetythreatvirusList.totalRecords,
              onChange: this.virusChangePage
            }}
          />
        </div>
        <p className="detail-title">高级威胁</p>
        <Search from="apt" ref={(search) => { search && (this.aptSearchForm = search.searchForm) }} search={this.advancedSubmit} placeholder={{ safetyId: '全部', beginTime: '开始日期', endTime: '结束日期', retrieve: 'APT名称' }} />
        <div className="table-wrap">
          <Table
            rowKey={(text, record) => record}
            columns={this.advancedcolumns}
            dataSource={safetythreataptList.items}
            pagination={{
              showQuickJumper: true,
              showSizeChanger: false,
              // pageSizeOptions: ['10', '20', '30', '40'],
              onShowSizeChange: this.advanceChangePage,
              showTotal: () => `共 ${safetythreataptList.totalRecords} 条数据`,
              current: currentPageAdvance,
              pageSize: pageSizeAdvance,
              total: safetythreataptList.totalRecords,
              onChange: this.advanceChangePage
            }}
          />
        </div>
        <TempletForm visible={this.state.show} id={this.state.templateId} onCancel={() => { this.setState({ show: false }) }} />
      </div>
    )
  }
}

export default withRouter(connect(({ safe }) => ({
  safetythreatvirusList: safe.safetythreatvirusList,
  safetythreataptList: safe.safetythreataptList
}))(MenaceDetailZhiJia))
