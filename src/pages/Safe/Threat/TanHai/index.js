import { Component, Fragment } from 'react'
import { connect } from 'dva'
// import _ from 'lodash'
import { Table, Pagination } from 'antd'
import Tooltip from '@/components/common/CustomTooltip'
// import zhCN from 'antd/lib/locale-provider/zh_CN'
// import api from '@/services/api'
import './style.less'
import { transliteration, getCaches, cacheSearchParameter, timeStampToTime } from '@/utils/common'
import { NavLink, withRouter } from 'dva/router'
import { safetyPermission } from '@a/permission'
import hasAuth from '@/utils/auth'
import Search from '../common/Search'
import moment from 'moment'
const searchIndex = 2  //此处数字代表着在查询条件在该路由下的数组下标

class ThreatZhiJia extends Component {
  constructor (props) {
    super(props)
    this.state = {
      pageIndex: 1,
      pageSize: 10,
      seekTerm: {
        beginTime: '',
        endTime: '',
        safetyId: '',
        multipleQuery: ''
      },
      columns: [
        {
          title: '最后活跃时间',
          key: 'lastActiveTime',
          dataIndex: 'lastActiveTime',
          width: '20%',
          render: (text) => {
            return (<span className="tabTimeCss">{text ? timeStampToTime(text) : ''}</span>)
          }
        },
        {
          title: '描述',
          key: 'distinationLocaltion',
          width: '40%',
          render: (record) => {
            const {
              sourceIp,
              protocolTypeMsg,
              distinationIp,
              distinationPort,
              behaviorTypeMsg
            } = record
            const msg = !behaviorTypeMsg ? [] : (behaviorTypeMsg.indexOf(',') !== -1) ? behaviorTypeMsg.split(',') : [behaviorTypeMsg]
            const spanStyle = {
              style: {
                margin: '5px',
                padding: '2px',
                border: '1px solid rgb(211,211,211)',
                borderRadius: '3px'
              }
            }
            const text = `局域网 ${sourceIp} 通过 ${protocolTypeMsg} 访问 局域网${distinationIp} 端口：${distinationPort}`
            return (
              <Fragment>
                <Tooltip title={text}>
                  {text}
                </Tooltip>

                <div style={{ marginTop: '5px', display: 'flex', flexWrap: 'wrap' }}>
                  {msg.map((v, i) => <span key={i} {...spanStyle}>{v}</span>)}
                </div>
              </Fragment>
            )
          }
        },
        {
          title: '所属安全设备',
          key: 'assetName',
          dataIndex: 'assetName',
          width: '26%',
          render: (text) => {
            return (
              <Tooltip title={text}>
                {text}
              </Tooltip>
            )
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
                  hasAuth(safetyPermission.SAFETY_WXSJ_TH_CK) ? <NavLink to={`/safe/threat/TanHaiDetail?id=${transliteration(record.assetId)}&primaryKey=${transliteration(record.stringId)}&status=1`} >查看</NavLink> : null
                }
                {
                  hasAuth(safetyPermission.SAFETY_WXSJ_TH_CKBG) && record.reportUrl ? <a href={`${record.reportUrl}`} target="_blank" rel="noopener noreferrer" >查看报告</a> : null
                }
              </div>
            )
          }
        }
      ]
    }
  }
  componentDidMount () {
    const cache = getCaches(this, false, searchIndex)
    if (cache) {
      const { multipleQuery, beginTime, endTime, safetyId = null } = cache.parameter
      const { pageSize, currentPage: pageIndex } = cache.page
      const parameter = { retrieve: multipleQuery, time: [beginTime ? moment(Number(beginTime)) : null, endTime ? moment(Number(endTime)) : null], safetyId }
      // 回显缓存的查询条件
      this.searchForm.setFieldsValue({ ...parameter })
      this.setState({ pageIndex, pageSize, seekTerm: cache.parameter }, () => {
        this.getsafetythreattanhaiList(false)
      })
    } else {
      this.getsafetythreattanhaiList(false)
    }
  }
  /**
   * 设置缓存
   * @param  parames{Object}要缓存的参数
   * @param searchIndex{Number} 要缓存的参数所在该页面是第几个位置
   */
  setCache = (parames = {}, searchIndex) => {
    const { currentPage, pageSize, safetyId, retrieve: multipleQuery, beginTime, endTime } = parames
    const parameter = { safetyId, multipleQuery, beginTime, endTime }
    cacheSearchParameter([{ page: { currentPage, pageSize }, parameter }], this.props.history, searchIndex)
  }
  getsafetythreattanhaiList = (isCache = true) => {
    const { seekTerm, pageIndex, pageSize } = this.state
    const postParms = {
      ...seekTerm,
      currentPage: pageIndex,
      pageSize
    }
    isCache && this.setCache(postParms, searchIndex)
    this.props.dispatch({ type: 'safe/getsafetythreattanhaiList', payload: postParms })
  }
  pageChange = (page, pageSize) => {
    this.setState({ pageIndex: page, pageSize: pageSize })
    const { seekTerm } = this.state
    const values = { ...seekTerm, currentPage: page, pageSize }
    this.setCache(values, searchIndex)
    this.props.dispatch({ type: 'safe/getsafetythreattanhaiList', payload: values })
  }
  search = (values) => {
    this.setState({
      seekTerm: values,
      pageIndex: 1,
      pageSize: 10
    }, () => {
      this.getsafetythreattanhaiList()
    })
  }
  //查询条件重置
  handleReset = () => {
    const param = { currentPage: 1, pageSize: 10 }
    //重置查询条件后，重新查询页面数据
    this.setState({ pageIndex: 1, pageSize: 10 })
    this.setCache(param, searchIndex)
    this.props.dispatch({ type: 'safe/getsafetythreattanhaiList', payload: param })
  }
  render () {
    const { columns, pageIndex, pageSize } = this.state
    const { tanhaiInfos = {} } = this.props
    const { items = [], totalRecords = 0 } = tanhaiInfos
    return (
      <div>
        <Search from='tanhai' ref={(search) => { search && (this.searchForm = search.searchForm) }} search={this.search} reset={() => { this.handleReset() }} placeholder={{ safetyId: '全部', beginTime: '开始日期', endTime: '结束日期', retrieve: 'IP/端口' }} />
        <div className="table-wrap">
          {/* 列表 */}
          <Table rowKey="stringId" columns={columns} dataSource={items} pagination={false} />
          {
            totalRecords
              ? <Pagination current={pageIndex} pageSize={pageSize} className="table-pagination" defaultPageSize={10} onChange={this.pageChange} onShowSizeChange={this.pageChange} total={totalRecords} showTotal={() => `共 ${totalRecords} 条数据`} showSizeChanger={totalRecords > 10 ? true : false} showQuickJumper={true} />
              : null
          }
          {/* 分页 */}

        </div>
      </div>
    )
  }
}

const mapStateToProps = ({ safe }) => {
  return {
    tanhaiInfos: safe.safetythreattanhaiList
  }
}
export default connect(mapStateToProps)(withRouter(ThreatZhiJia))
