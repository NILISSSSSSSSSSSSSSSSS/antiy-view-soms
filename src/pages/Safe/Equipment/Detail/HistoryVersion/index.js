import { Component } from 'react'
import { connect } from 'dva'
import { Table, Pagination } from 'antd'
import { withRouter } from 'react-router-dom'
import api from '@/services/api'
import { analysisUrl, emptyFilter, cacheSearchParameter, getCaches, timeStampToTime } from '@/utils/common'
import Tooltip from '@/components/common/CustomTooltip'
import './styles.less'
import config from '@/components/Safe/config'
import DetailFiedls from '@/components/common/DetailFiedls'
const { installStatusWidth, timeWidth } = config

const upgradeStatusList = [
  { key: 'SUCCESS', label: '成功' },
  { key: 'NOT_UPDATE', label: '未升级' },
  { key: 'UPDATING', label: '升级中' },
  { key: 'FAIL', label: '失败' }
]
// 是存储的第几个tabs
const SEARCH_INDEX = 1
class HistoryVersionDetail extends Component {
  constructor (props) {
    super(props)
    this.urlParams = analysisUrl(this.props.location.search) || {}
    this.state = {
      basicBody: {},
      featureBody: {},
      versionPagingParameter: {
        pageSize: 10,
        currentPage: 1
      },
      FeaturePagingParameter: {
        pageSize: 10,
        currentPage: 1
      }
    }
    this.versionColumns = [
      {
        title: '升级包名称',
        dataIndex: 'name',
        render: (text) => {
          return <Tooltip title={text} placement="topLeft">{text}</Tooltip>
        }
      },
      {
        title: '升级包序列号',
        dataIndex: 'number',
        render: (text) => {
          return <Tooltip title={text}>{text}</Tooltip>
        }
      },
      {
        title: '版本',
        dataIndex: 'version'
      },
      {
        title: '安装状态',
        dataIndex: 'upgradeStatus',
        width: installStatusWidth,
        render: (v) => {
          return (upgradeStatusList.find((e) => e.key === v) || {}).label
        }
      },
      {
        title: '安装时间',
        dataIndex: 'upgradeDate',
        width: timeWidth,
        render: timestamp => {
          return (<span className="tabTimeCss">{timestamp ? timeStampToTime(timestamp) : ''}</span>)
        }
      },
      {
        title: '摘要',
        dataIndex: 'describ',
        render: (text) => {
          return <Tooltip title={text}>
            {emptyFilter(text)}
          </Tooltip>
        }
      },
      {
        title: '备注',
        dataIndex: 'memo',
        render: (text) => {
          return (
            <Tooltip title={text}>{emptyFilter(text)}</Tooltip>
          )
        }
      }
    ]
    this.FeatureColumns = [
      {
        title: '特征库版本名称',
        dataIndex: 'featureLibraryName',
        render: (text) => {
          return <Tooltip title={text} placement="topLeft">
            {emptyFilter(text)}
          </Tooltip>
        }
      },
      {
        title: '特征库版本序列号',
        dataIndex: 'featureLibraryNumber',
        render: (text) => {
          return <Tooltip title={text}>
            {emptyFilter(text)}
          </Tooltip>
        }
      },
      {
        title: '版本',
        dataIndex: 'featureLibraryVersion'
      },
      {
        title: '安装状态',
        dataIndex: 'upgradeStatus',
        width: installStatusWidth,
        render: (v) => {
          return (upgradeStatusList.find((e) => e.key === v) || {}).label
        }
      },
      {
        title: '安装时间',
        dataIndex: 'upgradeTime',
        width: timeWidth,
        render: timestamp => {
          return (<span className="tabTimeCss">{timestamp ? timeStampToTime(timestamp) : ''}</span>)
        }
      },
      {
        title: '摘要',
        dataIndex: 'summary',
        render: (text) => {
          return <Tooltip title={text}>
            {emptyFilter(text)}
          </Tooltip>
        }
      },
      {
        title: '备注',
        dataIndex: 'memo',
        render: (text) => {
          return (
            <Tooltip title={text}>{emptyFilter(text)}</Tooltip>
          )
        }
      }
    ]
  }
  componentDidMount () {
    const { versionPagingParameter, FeaturePagingParameter } = this.state
    let versionPage = { ...versionPagingParameter }
    let FeaturePage = { ...FeaturePagingParameter }
    const cache = this.getCache()
    // 有缓存的参数时
    if (cache && cache.length) {
      versionPage = cache[0].page || versionPagingParameter
      FeaturePage = cache[1].page || FeaturePagingParameter
    }
    this.getFeatureList(FeaturePage, false)
    this.getVersionList(versionPage, false)
    this.getBasic()
  }

  /**
   * 获取缓存数据
   */
  getCache = () => {
    return getCaches(this, false, SEARCH_INDEX) || void 0
  }
  //获取特征库历史版本
  getFeatureList = (param, isCache = true) => {
    const { id: assetId } = this.urlParams
    const { versionPagingParameter } = this.state
    isCache && this.setCache([versionPagingParameter, param])
    api.featureQueryHistory({ primaryKey: assetId, ...param }).then(response => {
      if (response && response.head && response.head.code === '200') {
        this.setState({
          FeaturePagingParameter: param,
          featureBody: response.body
        })
      }
    })
  }
  //获取基本信息
  getBasic = () => {
    const { id: assetId } = this.urlParams
    api.equipmentQueryById({ primaryKey: assetId }).then(response => {
      if (response && response.head && response.head.code === '200') {
        this.setState({
          basicBody: response.body
        })
      }
    })
  }

  //获取升级版本
  getVersionList = (param, isCache = true) => {
    const { id: assetId } = this.urlParams
    const { FeaturePagingParameter } = this.state
    isCache && this.setCache([param, FeaturePagingParameter])
    api.upgradeQueryHistory({ assetId, ...param }).then(response => {
      if (response && response.head && response.head.code === '200') {
        this.setState({
          versionPagingParameter: param,
          VersionBody: response.body
        })
      }
    })
  }
  //页面修改(特征库)
  featurePageModify = (pageSize, currentPage) => {
    this.getFeatureList({ pageSize, currentPage })
  }
  //改变当前页显示数量
  featureChangeShowSize = (currentPage, pageSize) => {
    this.featurePageModify(pageSize, 1)
  }

  //当前页码改变
  featureChangePage = (currentPage, pageSize) => {
    this.featurePageModify(pageSize, currentPage)
  }
  //页面修改(升级版本)
  versionPageModify = (pageSize, currentPage) => {
    this.getVersionList({ pageSize, currentPage })
  }
  //改变当前页显示数量
  versionChangeShowSize = (currentPage, pageSize) => {
    this.versionPageModify(pageSize, 1)
  }

  //当前页码改变
  versionChangePage = (currentPage, pageSize) => {
    this.versionPageModify(pageSize, currentPage)
  }
  /**
   * 设置缓存
   */
  setCache = (list = []) => {
    const cache = list.map((e) => ({ page: e }))
    cache.forEach((item, i) => {
      cacheSearchParameter([item], this.props.history, i, SEARCH_INDEX)
    })
  }
  render () {
    const { featureBody, VersionBody, versionPagingParameter, FeaturePagingParameter, basicBody } = this.state
    let FeatureList = []
    let featureTotal = 0
    if (featureBody) {
      FeatureList = featureBody.items
      featureTotal = featureBody.totalRecords
    }
    let versionList = []
    let versionTotal = 0
    if (VersionBody) {
      versionList = VersionBody.items
      versionTotal = VersionBody.totalRecords
    }
    const fields = [{ name: '当前软件版本', key: 'newVersion', showTips: false }, { name: '当前特征库版本', key: 'maxFeatureLibrary', showTips: false }]
    return (
      <div className="main-detail-content history-version">
        <p className="detail-title">当前版本信息</p>
        <div className="detail-content">
          <DetailFiedls fields={fields} data={basicBody} />
        </div>
        <p className="detail-title">历史版本升级信息</p>
        <div className="table-wrap">
          <Table rowKey="stringId" columns={this.versionColumns} dataSource={versionList} pagination={false} />
          {
            versionTotal > 10 && <Pagination
              className="table-pagination"
              total={versionTotal} showTotal={(total) => `共 ${total || 0} 条数据`}
              showSizeChanger={false}
              showQuickJumper={true}
              onChange={this.versionChangePage}
              onShowSizeChange={this.versionChangeShowSize}
              pageSize={versionPagingParameter.pageSize}
              current={versionPagingParameter.currentPage} />
          }
        </div>

        <p className="detail-title">历史特征库版本信息</p>
        <div className="table-wrap">
          <Table rowKey="stringId" columns={this.FeatureColumns} dataSource={FeatureList} pagination={false} />
          {
            featureTotal > 10 && <Pagination
              className="table-pagination"
              total={featureTotal} showTotal={(total) => `共 ${total || 0} 条数据`}
              showSizeChanger={false}
              showQuickJumper={true}
              onChange={this.featureChangePage}
              onShowSizeChange={this.featureChangeShowSize}
              pageSize={FeaturePagingParameter.pageSize}
              current={FeaturePagingParameter.currentPage} />
          }
        </div>
      </div>
    )
  }
}
export default withRouter(connect()(HistoryVersionDetail))
