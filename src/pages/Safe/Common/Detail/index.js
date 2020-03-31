import { Component } from 'react'
import { connect } from 'dva'
import { Table, Pagination } from 'antd'
import { Link, withRouter } from 'dva/router'
import api from '@/services/api'
import moment from 'moment'
import _ from 'lodash'
import DownloadFile from '@/components/common/DownloadFile'
import Tooltip from '@/components/common/CustomTooltip'
import { analysisUrl, flowSwitch, strUnescape, transliteration, cacheSearchParameter, getCaches, timeStampToTime } from '@/utils/common'
import DetailFiedls from '@/components/common/DetailFiedls'
// import config from '@/components/Safe/config'
import './index.less'

// const { installStatusWidth, timeWidth, macWidth, ipWidth } = config

const statusList = [
  { key: 'SUCCESS', label: '安装成功' },
  { key: 'NOT_UPDATE', label: '待安装' },
  { key: 'UPDATING', label: '安装中' },
  { key: 'FAIL', label: '安装失败' }
]
const searchIndex = 0 //在该路由下所在的第几个查询
class CommonDetail extends Component {
  constructor (props) {
    super(props)
    const from = analysisUrl(this.props.location.search).from
    this.state = {
      assetId: analysisUrl(this.props.location.search).id,
      body: {},
      basicData: {},
      pagingParameter: {
        pageSize: 5,
        currentPage: 1
      },
      equipmentData: '',
      total: 0,
      columns: [
        {
          title: '名称',
          dataIndex: 'name',
          key: 'name',
          width: '20%',
          render: (name) => {
            // m没有获取到资产ID，就不跳转，防止代码报错
            return <Tooltip title={ name }>{ name }</Tooltip>
          }
        }, {
          title: '编号',
          dataIndex: 'number',
          key: 'number',
          width: '10%',
          render: (text) => {
            return <Tooltip title={ text }>{ text }</Tooltip>
          }
        },
        {
          title: '当前版本',
          width: '10%',
          dataIndex: from === 'feature' ? 'feature' : 'version',
          key: from === 'feature' ? 'feature' : 'version'
        }, {
          title: 'IP',
          dataIndex: 'ip',
          key: 'ip',
          width: '12%'
          // width: ipWidth
        }, {
          title: 'MAC',
          dataIndex: 'mac',
          key: 'mac',
          width: '12%'
          // width: macWidth
        },
        {
          title: '安装进度',
          dataIndex: from === 'feature' ? 'upstatus' : 'upgradeStatus',
          key: from === 'feature' ? 'upstatus' : 'upgradeStatus',
          // width: installStatusWidth,
          width: '10%',
          render: (status) => {
            const { label } = statusList.find((e) => e.key === status) || { label: status }
            return label
          }
        }, {
          title: '安装时间',
          dataIndex: from === 'feature' ? 'uptime' : 'upgradeDate',
          key: from === 'feature' ? 'uptime' : 'upgradeDate',
          // width: timeWidth,
          width: '16%',
          render: (uptime) => {
            return timeStampToTime(uptime)
          }
        }, {
          title: '操作',
          key: 'operate',
          width: '10%',
          render: (v, record) => {
            const { assetId, categoryModel } = record || {}
            // /safe/equipment/detail?id=120&&categoryModel=3
            //`/safe/equipment/detail?id=${ transliteration(assetId) }&&categoryModel=${ transliteration(categoryModel) }`
            return (
              <div className="operate-wrap">
                <Link
                  to={{
                    pathname: '/safe/equipment/detail',
                    search: `?id=${transliteration(assetId) }&categoryModel=${ transliteration(categoryModel) }`,
                    state: { rCaches: 1 }
                  }}>
                 查看
                </Link>
              </div>
            )
          }
        }
      ]
    }
    this.installInfo = [
      { key: 'upgradeableNumber', label: '待安装设备' },
      { key: 'upgradedNumber', label: '安装成功设备' },
      { key: 'upgradingNumber', label: '安装中设备' },
      { key: 'upgradeFailedNumber', label: '安装失败设备' }
    ]
    this.baseInfoList1 = [
      { key: from === 'feature' ? 'featureLibraryName' : 'name', name: '名称' },
      { key: from === 'feature' ? 'featureLibraryVersion' : 'version', name: from === 'feature' ? '特征库版本' : '升级包版本', showTips: false },
      {
        key: from === 'feature' ? 'publishTime' : 'publishDate', showTips: false, name: '发布时间', render: (v) => {
          return v ? moment(v).format('YYYY-MM-DD') : null
        }
      }
    ]
    this.baseInfoList2 = [
      { key: 'relatedAssetManufacturer', label: '厂商', name: '厂商' },
      { key: 'relatedAssetName', label: '名称', name: '名称' },
      { key: 'relatedAssetVersion', label: '版本', name: '版本' }
    ]
    this.baseInfoList3 = [
      {
        key: 'fileSize', label: '大小', name: '大小', showTips: false, render: (fileSize, row) => {
          return row.filepath === 'string' ? '' : row.filepath && JSON.parse(row.filepath).map(item => (flowSwitch(item.fileSize, 'GB'))).join(', ')
        }
      },
      { key: from === 'feature' ? 'featureLibraryNumber' : 'number', label: '序列号', name: '序列号' },
      {
        key: 'gmtCreate', label: '登记时间', name: '登记时间', showTips: false, render: (gmtCreate) => {
          return gmtCreate ? moment(gmtCreate).format('YYYY-MM-DD HH:mm:SS') : null
        }
      },
      { key: from === 'feature' ? 'createUserName' : 'uploadUser', label: '上传者', name: '上传者' },

      { key: from === 'feature' ? 'installTypeMsg' : 'installTypeName', label: '安装方式', name: '安装方式', showTips: false },
      {
        key: 'checkCode', label: '校验方式', name: '校验方式', render: (v, row) => {
          return `${ row.checkType } ${ row.checkCode }`
        }
      }
      // { key: from === 'feature' ? 'summary' : 'describ', label: '摘要' }
    ]

  }

  componentDidMount () {
    const cache = getCaches(this, false, searchIndex)
    if(cache){
      const { page: pagingParameter } = cache
      this.setState({ pagingParameter }, () => this.getData(false))
    }else {
      this.getData(false)
    }
  }

  //根据页面获取列表数据
  getData = (isCache = true) => {
    const values = {
      primaryKey: analysisUrl(this.props.location.search).id,
      ...this.state.pagingParameter
    }
    const { pageSize, currentPage } = values
    const parameter = {}
    // 缓存数据
    isCache && cacheSearchParameter([{ page: { pageSize, currentPage }, parameter }], this.props.history)
    if(analysisUrl(this.props.location.search).from === 'version') {
      api.queryPackageDetail(values).then(response => {
        if(response && response.head && response.head.code === '200') {
          this.setState({
            equipmentData: response.body,
            basicData: {
              ...response.body.safetyUpgradePackageResponse,
              filepath: strUnescape(response.body.safetyUpgradePackageResponse.filepath),
              manualDoc: strUnescape(response.body.safetyUpgradePackageResponse.manualDoc)
            },
            list: response.body.safetyEquipmentUpgradeResponsePageResult.items,
            total: response.body.safetyEquipmentUpgradeResponsePageResult.totalRecords
          })
        }
      })
    } else {
      api.featureQueryId(values).then(response => {
        if(response && response.head && response.head.code === '200') {
          this.setState({
            equipmentData: response.body,
            basicData: {
              ...response.body.featureLibraryResponse,
              filepath: strUnescape(response.body.featureLibraryResponse.filepath),
              useDirection: strUnescape(response.body.featureLibraryResponse.useDirection)
            },
            list: response.body.safetyFeatureLibraryRelationDetailResponses.items,
            total: response.body.safetyFeatureLibraryRelationDetailResponses.totalRecords
          })
        }
      })
    }

  }
  goBack = () => {
    this.props.history.goBack()
  }
  //分页
  pageModify = (pageSize, currentPage) => {
    this.setState({
      pagingParameter: {
        pageSize,
        currentPage
      }
    }, this.getData)
  }
  changePage = (currentPage) => {
    const pageSize = this.state.pagingParameter.pageSize
    this.pageModify(pageSize, currentPage)
  }
  /**
   * 改变单页显示数量事件
   * @param currentPage
   * @param pageSize
   */
  changePageSize = (currentPage, pageSize) => {
    const { params } = this.state
    this.pageModify(pageSize, currentPage, params)
  }
  /**
   * 检测文件的合法性
   * @param filepath 文件路径
   */
  checkFileUrl = (filepath = '[]') => {
    try {
      const _filepath = JSON.parse(filepath)
      if(!Array.isArray(_filepath) || filepath === '[null]') {
        return false
      }
      return true
    } catch(e) {
      return false
    }
  }
  /**
   * 渲染table信息
   * @param list
   * @param data
   * @param coloum
   * @return {Uint8Array | BigInt64Array | *[] | Float64Array | Int8Array | Float32Array | Int32Array | Uint32Array | Uint8ClampedArray | BigUint64Array | Int16Array | Uint16Array}
   */
  renderTableInfo = (list = [], data = {}, coloum = 4) => {
    return _.chunk(list, coloum).map((el, i) => {
      return (
        <div key={ i }>
          <div className="detail-info-filed">
            {
              el.map((it, idx) => {
                return (<div key={ idx } className="detail-info-filed-row">
                  <div className="detail-info-filed-label detail-content-label">{ it.label }:</div>
                  <div className="detail-info-filed-value">{ data[ it.key ] }</div>
                </div>)
              })
            }
          </div>
        </div>
      )
    })
  }

  render () {
    const { list, columns, total, pagingParameter, basicData: data, equipmentData } = this.state
    // console.log(basicData.filepath)
    const basicData = { ...data }
    basicData.filepath = basicData.filepath || '[]'
    basicData.manualDoc = basicData.manualDoc || '[]'
    basicData.useDirection = basicData.useDirection || '[]'
    const from = analysisUrl(this.props.location.search).from
    const oneRowFields = [
      { key: from === 'feature' ? 'summary' : 'describ', name: '摘要', overFlow: 'visible', showTips: false },
      {
        key: '',
        name: '包文件',
        showTips: false,
        breakLine: true,
        render: () => this.checkFileUrl(basicData.filepath) ? <DownloadFile
          filelist={ JSON.parse(basicData.filepath).map(item => ({
            ...item,
            fileName: item.name || item.originFileName
          })) }/> : ''
      },
      {
        key: '',
        name: '安装说明书',
        showTips: false,
        breakLine: true,
        render: () => this.checkFileUrl(from === 'feature' ? basicData.useDirection : basicData.manualDoc) ?
          <DownloadFile
            filelist={ JSON.parse(from === 'feature' ? basicData.useDirection : basicData.manualDoc).map(item => ({
              ...item,
              fileName: item.name || item.originFileName
            })) }/> : ''
      } ]
    return (
      <div className="main-detail-content">
        <p className="detail-title">基本信息</p>
        <div className="detail-content">
          <DetailFiedls fields={ this.baseInfoList1 } data={ basicData }/>
          <div className="detail-content-equ">
            <div className="detail-content-equ-label">关联设备</div>
            <DetailFiedls fields={ this.baseInfoList2 } data={ basicData }/>
          </div>
          <DetailFiedls fields={ this.baseInfoList3 } data={ basicData }/>
          <DetailFiedls fields={ oneRowFields } column={ 1 } data={ basicData }/>
        </div>
        <p className="detail-title">关联设备信息</p>
        <div className="detail-content">
          { this.renderTableInfo(this.installInfo, equipmentData) }
        </div>
        <div className="table-wrap">
          <Table rowKey='id' columns={ columns } dataSource={ list } pagination={ false }/>
          {total ? <Pagination
            current={ pagingParameter.currentPage }
            pageSize={ pagingParameter.pageSize }
            className="table-pagination"
            total={ total }
            showTotal={ (total) => `共 ${ total || 0 } 条数据` }
            showSizeChanger={ false }
            showQuickJumper={ true }
            onChange={ this.changePage }
            onShowSizeChange={ this.changePageSize }/> : null}
        </div>
        {/* <div className='Button-center back-btn'>
          <Button type="primary" ghost onClick={ this.goBack }>返回</Button>
        </div> */}
      </div>
    )
  }
}
export default connect()(withRouter(CommonDetail))
