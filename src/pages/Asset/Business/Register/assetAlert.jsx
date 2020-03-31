import { PureComponent } from 'react'
import { connect } from 'dva'
import {
  Table,
  Button,
  message
} from 'antd'
import './style.less'
import Api from '@/services/api'
import { TooltipFn } from '@/utils/common'
import PropTypes from 'prop-types'
import { debounce, cloneDeep } from 'lodash'
import Search from '@/components/common/Search'
import { ASSETS_IMPORTANT } from '@a/js/enume'

class AssetBusinessRegisterAlert extends PureComponent {
  state = {
    //开始
    currentPage: 1, //当前页码
    pageSize: 10,
    multipleQuery: null,
    manufacturer: null,
    assetGroup: null,
    //结束
    gmtCreate: '',
    timeType: 1,
    rowsSelectedList: [],
    selectedRowKeys: [],
    assetBody: {},
    stringIds: this.props.stringIds
  }

  static defaultProps ={
    PrefixCls: 'AssetBusinessRegister',
    groupInfoBody: []
  }

  static propTypes={
    PrefixCls: PropTypes.string,
    getManufacturerInfo: PropTypes.array, //厂商
    groupInfoBody: PropTypes.array //资产组
  }

  //提交到上个表单
  save = ()=>{
    const { rowsSelectedList } = this.state
    if(!rowsSelectedList.length){
      message.warn('没有选择要关联的资产')
      return
    }
    this.props.saveAlert(rowsSelectedList)
    this.cancel()
  }
  cancel =() =>{
    this.props.cancelAlert()
  }

  //翻页
  pageChange = (page, pageSize)=>{
    this.setState({
      currentPage: page,
      pageSize: pageSize
    }, this.getbusinessIsAsset)
  }

  // 提交表单，执行查询
  onSubmit = values => {
    this.setState({
      currentPage: 1,
      multipleQuery: values.multipleQuery,
      manufacturer: values.manufacturer,
      assetGroup: values.assetGroup
    }, this.getbusinessIsAsset)
  }

  //查询条件重置
  handleReset = () => {
    this.setState({
      currentPage: 1,
      multipleQuery: null,
      manufacturer: null,
      assetGroup: null
    }, this.getbusinessIsAsset)
  }

  //**接口开始 */
  //列表
  getbusinessIsAsset=debounce(()=>{
    // areaIds
    const {
      currentPage,
      pageSize,
      multipleQuery,
      manufacturer,
      assetGroup,
      stringIds //其他页面跳进来
    } = this.state
    const payload = {
      currentPage,
      pageSize,
      multipleQuery,
      manufacturer,
      assetGroup
    }
    if(stringIds){
      payload.areaIds = stringIds
    }

    Api.getbusinessIsAsset(payload).then(res=>{
      if(res.head && res.head.code === '200'){
        this.setState({ assetBody: res.body })
      }
    })
  }, 300)

  //获取资产资产组
  getDropInfo=()=>{
    this.props.dispatch({ type: 'asset/getGroupInfo' })
    this.getManufacturerInfo()
  }

  getManufacturerInfo=(supplier = null)=>{
    this.props.dispatch({ type: 'information/getManufacturerInfo', payload: { supplier } }) // 厂商
  }

  render (){
    const {
      rowsSelectedList,
      selectedRowKeys,
      currentPage,
      pageSize,
      assetBody
    } = this.state
    const {
      PrefixCls,
      groupInfoBody,
      getManufacturerInfo
    } = this.props

    const columns = [{
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      width: '12%',
      render: text=>TooltipFn(text)
    }, {
      title: '编号',
      dataIndex: 'number',
      key: 'number',
      isShow: true,
      width: '10%',
      render: text=>TooltipFn(text)
    },
    {
      title: 'IP',
      dataIndex: 'ips',
      key: 'ips',
      isShow: true,
      width: '10%',
      render: text=>TooltipFn(text)
    }, {
      title: 'MAC',
      dataIndex: 'macs',
      key: 'macs',
      isShow: true,
      width: '12%',
      render: text=>TooltipFn(text)
    },
    {
      title: '厂商',
      dataIndex: 'manufacturer',
      key: 'manufacturer',
      isShow: true,
      width: '8%',
      render: text=>TooltipFn(text)
    }, {
      title: '资产组',
      dataIndex: 'assetGroup',
      key: 'assetGroup',
      isShow: true,
      width: '8%',
      render: text=>TooltipFn(text)
    }, {
      title: '重要程度',
      dataIndex: 'importanceDegree',
      key: 'importanceDegree',
      width: '8%',
      render: text=>TooltipFn((ASSETS_IMPORTANT.filter(v=>v.value === text)[0] || {}).name)
    }]

    const rowSelection = {
      selectedRowKeys,
      onChange: (selectedRowKeys, selectedRows) => {
        const rowsSelectedListNew = cloneDeep(rowsSelectedList).concat(selectedRows).filter(v=>selectedRowKeys.includes(v.stringId))
        this.setState({
          selectedRowKeys, rowsSelectedList: rowsSelectedListNew
        })
      }
    }

    const defaultFields = [
      { label: '综合查询', key: 'multipleQuery', type: 'input', placeholder: '请输入资产名称/编号/IP/MAC' },
      { label: '厂商', key: 'manufacturer', multiple: true, type: 'select', onSearch: val=>{this.getManufacturerInfo(val)}, data: getManufacturerInfo.map(item=>{
        return { value: item, name: item }
      }) },
      { label: '资产组', key: 'assetGroup', multiple: true, type: 'select', data: groupInfoBody.map(item=>{
        return { value: item.id, name: item.value }
      }) }
    ]

    return(
      <div className={`${PrefixCls} form-content`}>
        <Search defaultFields={ defaultFields } onSubmit={ this.onSubmit } onReset={ this.handleReset }/>

        <div className="ant-col-18 ant-form-item-control-wrapper"></div>
        <div className="table-wrap table-style">
          <Table
            rowKey='stringId'
            columns={columns}
            dataSource={assetBody.items}
            rowSelection={rowSelection}
            pagination={{
              className: 'table-pagination',
              showQuickJumper: true,
              // showSizeChanger: true,
              pageSizeOptions: ['10', '20', '30', '40'],
              // onShowSizeChange: this.pageChange,
              showTotal: () => `共 ${assetBody.totalRecords} 条数据`,
              current: currentPage,
              pageSize: pageSize,
              total: assetBody.totalRecords,
              onChange: this.pageChange
            }}
          />
        </div>
        <footer className="Button-center">
          <div>
            <Button type="primary" onClick={()=>this.save()}>确认</Button>
            <Button type="primary" className="back-btn" ghost onClick={this.cancel}>取消</Button>
          </div>
        </footer>
      </div>
    )
  }

  async componentDidMount () {
    await this.getbusinessIsAsset()
    await this.getDropInfo()

    this.props.children(this)
  }

  UNSAFE_componentWillReceiveProps (nextProps) {
    this.setState({ selectedRowKeys: nextProps.initKeys })
  }

}

export default connect(({ asset, information }) => ({
  getManufacturerInfo: information.getManufacturerInfo,
  groupInfoBody: asset.groupInfoBody
}))(AssetBusinessRegisterAlert)
