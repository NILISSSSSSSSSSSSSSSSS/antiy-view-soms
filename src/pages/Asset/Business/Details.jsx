import { PureComponent } from 'react'
import { Link } from 'dva/router'
import { Table, Form, Row, Col } from 'antd'
import { debounce } from 'lodash'
import Search from '@/components/common/Search'
import { analysisUrl, transliteration, TooltipFn, cacheSearchParameter, evalSearchParam } from '@/utils/common'
import { SOURCE_LEVEL } from '@a/js/enume'
import api from '@/services/api'

@Form.create()
class AssetBusinesspDtails extends PureComponent{
  state = {
    PrefixCls: 'AssetBusinesspDtails',
    uniqueId: decodeURIComponent(analysisUrl(this.props.location.search).uniqueId),
    businessInfo: {},
    assetBody: []
  }

   onSubmit=values=>{
     this.setState({
       multipleQuery: values.multipleQuery
     }, this.businessAndAsset)
   }

   handleReset=()=>{
     this.setState({
       multipleQuery: null
     }, this.businessAndAsset)
   }

  //**接口开始 */
  businessAndAsset=debounce(async ()=>{
    const state = this.state
    const { history, dispatch } = this.props
    const payload = {
      uniqueId: state.uniqueId,
      multipleQuery: state.multipleQuery
    }
    // cacheSearchParameter([{
    //   page: pagingParameter
    // }], history, 0)
    // await dispatch({ type: 'asset/businessAndAsset', payload: payload })
    api.businessAndAsset(payload).then(res => {
      if (res && res.head && res.head.code === '200') {
        this.setState({ assetBody: res.body })
      }
    })
  }, 300)

  render (){
    const { PrefixCls, businessInfo, assetBody } = this.state

    const columns = [{
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      isShow: true,
      render: text=>TooltipFn(text)
    }, {
      title: '编号',
      dataIndex: 'number',
      key: 'number',
      isShow: true,
      render: text=>TooltipFn(text)
    },
    {
      title: 'IP',
      dataIndex: 'ips',
      key: 'ips',
      isShow: true,
      render: text=>TooltipFn(text)
    }, {
      title: 'MAC',
      dataIndex: 'macs',
      key: 'macs',
      isShow: true,
      render: text=>TooltipFn(text)
    },
    {
      title: '厂商',
      dataIndex: 'manufacturer',
      key: 'manufacturer',
      isShow: true,
      render: text=>TooltipFn(text)
    }, {
      title: '资产组',
      dataIndex: 'assetGroup',
      key: 'assetGroup',
      isShow: true,
      width: '30%',
      render: text=>TooltipFn(text)
    }, {
      title: '业务影响',
      dataIndex: 'businessInfluence',
      key: 'businessInfluence',
      isShow: true,
      render: text=>TooltipFn(text)
    }, {
      title: '操作',
      isShow: true,
      key: 'operate',
      render: (text, scope)=>{
        return (
          <div className="operate-wrap">
            <Link to={`/asset/manage/detail?id=${transliteration(scope.stringId)}`}>
              查看
            </Link>
          </div>
        )
      }
    }]

    const span = { xxl: 6, xl: 8 }
    const defaultFields = [
      { label: '综合查询', key: 'multipleQuery', type: 'input', placeholder: '请输入资产名称/编号/IP/MAC' }
    ]

    return(
      <div className={PrefixCls}>
        <div className="detail-content asset-group-detail-content">
          <Row>
            <Col {...span}><span className="detail-content-label">业务名称：</span>{businessInfo.name}</Col>
            <Col {...span}><span className="detail-content-label">业务重要性：</span>{businessInfo.importanceDesc}</Col>
          </Row>
          <Row>
            <Col xxl={24} xl={24}><span className="detail-content-label">描述：</span>{businessInfo.description}</Col>
          </Row>
        </div>
        <div className="search-bar">
          <Search defaultFields={ defaultFields } onSubmit={ this.onSubmit } onReset={ this.handleReset }/>
        </div>
        <div className="table-wrap">
          <Table
            rowKey={(text, record) => record}
            columns={columns}
            dataSource={assetBody}
            pagination={{
              pageSizeOptions: ['10', '20', '30', '40'],
              showTotal: () => `共 ${assetBody.length} 条数据`
            }}
          />
        </div>
      </div>
    )
  }

  async componentDidMount (){
    api.getBusinessInfo({ uniqueId: this.state.uniqueId }).then(res => {
      if (res && res.head && res.head.code === '200') {
        this.setState({ businessInfo: res.body })
      }
    })

    this.businessAndAsset()

    // const data = evalSearchParam(this, null, false)
    // //判断是否存有数据
    // if(sessionStorage.searchParameter && data){
    //   const list = data && data.list
    //   const { page = null } = list && list[0]
    //   this.setState({
    //     ...page
    //   }, this.businessAndAsset)
    // }else{
    //   this.businessAndAsset()
    // }
  }
}

export default AssetBusinesspDtails
