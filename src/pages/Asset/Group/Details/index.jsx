import { PureComponent } from 'react'
import { connect } from 'dva'
import { Link } from 'dva/router'
import { Table, Form, Row, Col, Button } from 'antd'
import moment from 'moment'
import { debounce } from 'lodash'
import { analysisUrl, transliteration, TooltipFn, cacheSearchParameter, evalSearchParam } from '@/utils/common'
import { ASSET_STATUS } from '@a/js/enume'

@Form.create()
class AssetGroupDtails extends PureComponent{
  state = {
    PrefixCls: 'AssetGroupDtails',
    assetGroup: decodeURIComponent(analysisUrl(this.props.location.search).stringId),
    currentPage: 1,
    pageSize: 10
  }

   //翻页
   pageChange = (currentPage, pageSize)=>{
     this.setState({
       currentPage,
       pageSize
     }, this.getAssetList)
   }

  //**接口开始 */
  getAssetList=debounce(async ()=>{
    const state = this.state
    const { history, dispatch } = this.props
    const pagingParameter = {
      currentPage: state.currentPage,
      pageSize: state.pageSize
    }
    const payload = {
      ...pagingParameter,
      assetGroup: state.assetGroup
    }
    cacheSearchParameter([{
      page: pagingParameter
    }], history, 0)
    await dispatch({ type: 'asset/getAssetList', payload: payload })
  })

  render (){
    const { currentPage, pageSize, PrefixCls } = this.state
    const { assetBody, getGroupQueryId } = this.props

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
    }, {
      title: '资产类型',
      dataIndex: 'categoryModelName',
      key: 'categoryModelName',
      isShow: true,
      render: text=>TooltipFn(text)
    },
    {
      title: 'IP',
      dataIndex: 'ip',
      key: 'ip',
      isShow: true,
      render: text=>TooltipFn(text)
    }, {
      title: 'MAC',
      dataIndex: 'mac',
      key: 'mac',
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
      title: '状态',
      dataIndex: 'assetStatus',
      key: 'assetStatus',
      isShow: true,
      render: (status) => TooltipFn(ASSET_STATUS.filter(item=>item.value === status)[0].name)
    }, {
      title: '首次发现时间',
      dataIndex: 'gmtCreate',
      key: 'gmtCreate',
      isShow: true,
      width: 168,
      render: (text)=>(<span>{moment(text).format('YYYY-MM-DD HH:mm:ss')}</span>)
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

    return(
      <div className={PrefixCls}>
        {/* <h2 className="page-title">资产组详情</h2> */}
        <div className="detail-content asset-group-detail-content">
          <Row>
            <Col {...span}><span className="detail-content-label">资产组名称：</span>{getGroupQueryId.name}</Col>
            <Col {...span}><span className="detail-content-label">备注信息：</span>{getGroupQueryId.memo}</Col>
          </Row>
          <Row>
            <Col xxl={24} xl={24}><span className="detail-content-label">资产明细：</span></Col>
          </Row>
        </div>
        <div className="table-wrap">
          <Table
            rowKey={(text, record) => record}
            columns={columns}
            dataSource={assetBody.items}
            pagination={{
              current: currentPage,
              pageSize: pageSize,
              showQuickJumper: true,
              showSizeChanger: assetBody.totalRecords > 10,
              pageSizeOptions: ['10', '20', '30', '40'],
              onShowSizeChange: this.pageChange,
              showTotal: () => `共 ${assetBody.totalRecords} 条数据`,
              defaultCurrent: 1,
              defaultPageSize: 10,
              total: assetBody.totalRecords,
              onChange: this.pageChange
            }}
          />
        </div>
        {/* <footer className="Button-center back-btn" style={{ textAlign: 'center' }}>
          <Button type="primary" ghost onClick={()=>this.props.history.goBack() }>返回</Button>
        </footer> */}
      </div>
    )
  }

  async componentDidMount (){
    await this.props.dispatch({ type: 'asset/getGroupQueryId', payload: {
      primaryKey: this.state.assetGroup
    } })
    // this.getAssetList()

    const data = evalSearchParam(this, null, false)
    //判断是否存有数据
    if(sessionStorage.searchParameter && data){
      const list = data && data.list
      const { page = null } = list && list[0]
      this.setState({
        ...page
      }, this.getAssetList)
    }else{
      this.getAssetList()
    }
  }
}

export default connect(({ asset }) => ({
  assetBody: asset.assetBody,
  getGroupQueryId: asset.getGroupQueryId
}))(AssetGroupDtails)
