import { PureComponent, Fragment } from 'react'
import { connect } from 'dva'
import { Form, Table } from 'antd'
import { NavLink, withRouter } from 'dva/router'
import hasAuth from '@/utils/auth'
import PropTypes from 'prop-types'
import { debounce } from 'lodash'
import { analysisUrl, transliteration, getCaches, cacheSearchParameter, timeStampToTime } from '@/utils/common'
import Search from '../common/Search'
import moment from 'moment'

const searchIndex = 5  //此处数字代表着在查询条件在该路由下的数组下标
@withRouter
@Form.create()
class MenaceDetailTanHai extends PureComponent {
  state = {
    PrefixCls: 'safeEquipmentDetailMenaceDetailTanHai',
    assetId: analysisUrl(this.props.location.search).id,
    //表单查询
    currentPage: 1,
    pageSize: 10,
    beginTime: '',
    endTime: '',
    multipleQuery: ''
    //表单结束
  }
  static propTypes={
    safetythreattanhaiList: PropTypes.object
  }
  changePage = (current, pageSize) => {
    this.setState({ currentPage: current, pageSize: pageSize }, this.getsafetythreattanhaiEquip)
  }
  handleReset=()=>{
    this.setState({
      currentPage: 1,
      multipleQuery: '',
      beginTime: '',
      endTime: ''
    }, this.getsafetythreattanhaiEquip)
  }

  // 提交表单，执行查询
  handleSubmit = (values = {}) => {
    this.setState({
      currentPage: 1,
      beginTime: values.beginTime || '',
      endTime: values.endTime || '',
      multipleQuery: values.retrieve
    }, this.getsafetythreattanhaiEquip)
  }
  //**接口开始 */
  //list
  getsafetythreattanhaiEquip=debounce((isCache = true)=>{
    const { currentPage, pageSize, beginTime, endTime, assetId, multipleQuery } = this.state
    const payload = { currentPage, pageSize, beginTime, endTime, assetId, multipleQuery }
    isCache && this.setCache(payload, searchIndex)
    this.props.dispatch({ type: 'safe/getsafetythreattanhaiList', payload: payload })
  })
  columns = [
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
            { text }
            <div>
              {msg.map((v, i)=><span key={i} {...spanStyle}>{v}</span>)}
            </div>
          </Fragment>
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
            { hasAuth('safedev:wxsj:thwx:ckxq') && <NavLink to={`/safe/threat/TanHaiDetail?id=${transliteration(record.assetId)}&primaryKey=${transliteration(record.stringId)}&status=1`} >查看</NavLink> }
            { hasAuth('safedev:wxsj:thwx:ckbg') && record.reportUrl && <a href={ `${record.reportUrl}` } target="_blank" rel="noopener noreferrer" >查看报告</a> }
          </div>
        )
      }
    }
  ]
  /**
   * 设置缓存
   * @param  parames{Object}要缓存的参数
   * @param searchIndex{Number} 要缓存的参数所在该页面是第几个位置
   */
  setCache = (parames = {}, searchIndex) => {
    const { currentPage, pageSize, safetyId, multipleQuery, beginTime, endTime } = parames
    const parameter = { safetyId, multipleQuery, beginTime, endTime }
    cacheSearchParameter([{ page: { currentPage, pageSize }, parameter }], this.props.history, searchIndex)
  }
  render () {
    const { PrefixCls } = this.state
    const { safetythreattanhaiList: { items, totalRecords } } = this.props
    return (
      <div className={PrefixCls}>
        <Search from="tanhai" ref={(search)=>{search && (this.searchForm = search.searchForm)}} search={this.handleSubmit} placeholder={{ safetyId: '全部', beginTime: '开始日期', endTime: '结束日期', retrieve: 'IP/端口' }}/>
        <div className="table-wrap">
          <Table
            rowKey={(text, record) => record}
            columns={this.columns}
            dataSource={items || []}
            pagination={{
              showQuickJumper: true,
              showSizeChanger: true,
              pageSizeOptions: ['10', '20', '30', '40'],
              onShowSizeChange: this.changePage,
              showTotal: () => `共 ${totalRecords} 条数据`,
              defaultCurrent: 1,
              defaultPageSize: 10,
              total: totalRecords,
              onChange: this.changePage
            }}
          />
        </div>
      </div>
    )
  }

  componentDidMount () {
    // this.getsafetythreataptEquip()
    const cache = getCaches(this, false, searchIndex)
    if(cache){
      const { multipleQuery, beginTime, endTime } = cache.parameter
      const { pageSize, currentPage } = cache.page
      const parameter = { retrieve: multipleQuery, time: [ beginTime ? moment(beginTime) : null,  endTime ? moment(endTime) : null] }
      // 回显缓存的查询条件
      this.searchForm.setFieldsValue({ ...parameter })
      this.setState({ currentPage, pageSize, ...cache.parameter }, ()=>{
        this.getsafetythreattanhaiEquip(false)
      })
    }else {
      this.getsafetythreattanhaiEquip(false)
    }
  }
}

export default connect(({ safe }) => ({
  safetythreattanhaiList: safe.safetythreattanhaiList
}))(withRouter(MenaceDetailTanHai))
