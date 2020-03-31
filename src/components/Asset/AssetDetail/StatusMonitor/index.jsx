import { PureComponent } from 'react'
import { connect } from 'dva'
import { Link } from 'dva/router'
import { Table, Form, Row, Col } from 'antd'
import { debounce } from 'lodash'
import PropTypes from 'prop-types'
import './style.less'
import { transliteration, TooltipFn, cacheSearchParameter, evalSearchParam } from '@/utils/common'

@Form.create()
class StatusMonitor extends PureComponent{
  state = {
    PrefixCls: 'StatusMonitor',
    assetGroup: this.props.assetId,
    currentPage: 1,
    pageSize: 10,
    assetStatus: 1
  }

  static propTypes={
    assetId: PropTypes.string
  }

   //翻页
   pageChange = (currentPage, pageSize)=>{
     this.setState({
       currentPage,
       pageSize
     }, this.getAssetList)
   }

  onSubmit=()=>{

  }

  handleReset=()=>{

  }

  changeVul = assetStatus => {
    this.setState({ assetStatus })
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
    const { currentPage, pageSize, PrefixCls, assetStatus } = this.state
    const { assetBody, getGroupQueryId } = this.props

    const columns1 = [{
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      isShow: true,
      render: text=>TooltipFn(text)
    }, {
      title: '描述',
      dataIndex: 'number',
      key: 'number',
      isShow: true,
      render: text=>TooltipFn(text)
    },
    {
      title: '位置',
      dataIndex: 'ip',
      key: 'ip',
      isShow: true,
      render: text=>TooltipFn(text)
    }]
    const columns2 = [{
      title: '名称',
      dataIndex: 'mac',
      key: 'mac',
      isShow: true,
      render: text=>TooltipFn(text)
    },
    {
      title: '描述',
      dataIndex: 'categoryModelName',
      key: 'categoryModelName',
      isShow: true,
      render: text=>TooltipFn(text)
    }, {
      title: '状态',
      dataIndex: 'assetGroup',
      key: 'assetGroup',
      isShow: true,
      width: '30%',
      render: text=>TooltipFn(text)
    }]
    const columns3 = [{
      title: '名称',
      dataIndex: 'assetStatus',
      key: 'assetStatus',
      isShow: true,
      render: text=>TooltipFn(text)
    }, {
      title: '厂商',
      isShow: true,
      key: 'operate',
      render: text=>TooltipFn(text)
    }, {
      title: '版本',
      dataIndex: 'assetStatus',
      key: 'assetStatus',
      isShow: true,
      render: text=>TooltipFn(text)
    }, {
      title: '安装时间',
      isShow: true,
      key: 'operate',
      render: text=>TooltipFn(text)
    }]

    const columns = [columns1, columns2, columns3]

    const assetsState = [
      { name: '进程监控', value: '33' },
      { name: '服务监控', value: '33' },
      { name: '软件监控', value: '33' }
    ]

    const span = { xxl: 6, xl: 8 }

    return(
      <div className={`asset-detail-baseInfo ${PrefixCls}`}>
        <div className="asset-detail-baseInfo-basics">
          <div className="detail-title">
            硬件状态
          </div>
          <div className="detail-content asset-group-detail-content">
            {/* <Row>
              <Col {...span}><span className="detail-content-label">业务名称：</span>{null}</Col>
              <Col {...span}><span className="detail-content-label">业务重要性：</span>{null}</Col>
            </Row> */}
            <Row>
              <Col xxl={24} xl={24}><span className="detail-content-label">在线状态：</span>{null}</Col>
              <Col xxl={24} xl={24}><span className="detail-content-label">CPU使用率：</span>{null}</Col>
              <Col xxl={24} xl={24}><span className="detail-content-label">内存占用率：</span>{null}</Col>
              <Col xxl={24} xl={24}><span className="detail-content-label">硬盘占用率：</span>{null}</Col>
              <Col xxl={24} xl={24}><span className="detail-content-label">监控规则：</span>{null}</Col>
              <Col xxl={24} xl={24}><span className="detail-content-label">更新时间：</span>{null}</Col>
            </Row>
          </div>
        </div>

        <div className="table-wrap">
          <div className="detail-title">
            软件进程与服务
          </div>
          <div className="table-btns clearfix">
            <ul className="change-bar">
              {assetsState.map((item, i) => (
                <li
                  className={`${i + 1 === assetStatus ? 'colorTop' : null} fl`}
                  key={i}
                  onClick={() => this.changeVul(i + 1)}
                >
                  {item.name}：{item.value}
                </li>
              ))}
            </ul>
          </div>
          <Table
            rowKey={(text, record) => record}
            columns={columns[assetStatus - 1]}
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
      </div>
    )
  }

  async componentDidMount (){
    // await this.props.dispatch({ type: 'asset/getGroupQueryId', payload: {
    //   primaryKey: this.state.assetId
    // } })
    // this.getAssetList()

    // const data = evalSearchParam(this, null, false)
    // //判断是否存有数据
    // if(sessionStorage.searchParameter && data){
    //   const list = data && data.list
    //   const { page = null } = list && list[0]
    //   this.setState({
    //     ...page
    //   }, this.getAssetList)
    // }else{
    //   this.getAssetList()
    // }
  }
}

export default connect(({ asset }) => ({
  assetBody: asset.assetBody,
  getGroupQueryId: asset.getGroupQueryId
}))(StatusMonitor)
