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
import { debounce, cloneDeep, uniqBy } from 'lodash'
import Search from '@/components/common/Search'
import { ASSETS_TYPE } from '@a/js/enume'

class AssetBusinessRegisterAlert extends PureComponent {
  state = {
    //开始
    currentPage: 1, //当前页码
    pageSize: 10,
    multipleQuery: null,
    categoryModels: null,
    responsibleUserId: null,
    assetGroup: null,
    operationSystem: null,
    //结束
    gmtCreate: '',
    timeType: 1,
    selectedRows: [],
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
    groupInfoBody: PropTypes.array //资产组
  }

  //提交到上个表单
  save = ()=>{
    const { selectedRows } = this.state
    if(!selectedRows.length){
      message.warn('请选择资产')
      return
    }
    this.props.saveAlert(selectedRows)
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
      categoryModels: values.categoryModels,
      responsibleUserId: values.responsibleUserId,
      assetGroup: values.assetGroup,
      operationSystem: values.operationSystem
    }, this.getbusinessIsAsset)
  }

  //查询条件重置
  handleReset = () => {
    this.setState({
      currentPage: 1,
      multipleQuery: null,
      categoryModels: null,
      responsibleUserId: null,
      assetGroup: null,
      operationSystem: null
    }, this.getbusinessIsAsset)
  }

  //**接口开始 */
  //列表
  getbusinessIsAsset=debounce(()=>{
    // areaIds
    const state = this.state
    const payload = {
      currentPage: state.currentPage,
      pageSize: state.pageSize,
      multipleQuery: state.multipleQuery,
      categoryModels: state.categoryModels,
      responsibleUserId: state.responsibleUserId,
      assetGroup: state.assetGroup,
      operationSystem: state.operationSystem
    }
    if(state.stringIds){
      payload.areaIds = state.stringIds
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
  }

  render (){
    const {
      selectedRowKeys,
      currentPage,
      pageSize,
      assetBody
    } = this.state
    const {
      PrefixCls,
      groupInfoBody,
      getUserInAsset,
      getAssetsOS
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
      title: '类型',
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
      title: '资产组',
      dataIndex: 'assetGroup',
      key: 'assetGroup',
      isShow: true,
      width: '8%',
      render: text=>TooltipFn(text)
    }, {
      title: '操作系统',
      dataIndex: 'manufacturer',
      key: 'manufacturer',
      isShow: true,
      width: '8%',
      render: text=>TooltipFn(text)
    }, {
      title: '使用者',
      dataIndex: 'importanceDegree',
      key: 'importanceDegree',
      width: '8%',
      render: text=>TooltipFn(text)
    }]

    const rowSelection = {
      type: 'radio',
      selectedRowKeys,
      onChange: (selectedRowKeys, selectedRows) => {
        this.setState({
          selectedRowKeys, selectedRows
        })
      }
    }

    const defaultFields = [
      { label: '综合查询', key: 'multipleQuery', type: 'input', placeholder: '请输入资产名称/编号/IP/MAC' },
      { label: '资产类型', key: 'categoryModels', multiple: true, type: 'select', data: ASSETS_TYPE },
      { label: '使用者', key: 'responsibleUserId', multiple: true, type: 'select', data: getUserInAsset.map(item=>{
        return { value: item.id, name: item.value }
      }) },
      { label: '资产组', key: 'assetGroup', multiple: true, type: 'select', data: groupInfoBody.map(item=>{
        return { value: item.id, name: item.value }
      }) },
      { label: '操作系统', key: 'operationSystem', multiple: true, type: 'select', data: uniqBy(getAssetsOS, 'value').map(item=>{
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
    this.props.dispatch({ type: 'information/getUserInAsset' }) // 使用者
    this.props.dispatch({ type: 'information/getAssetsOS' }) // 操作系统

    this.props.children(this)
  }

}

export default connect(({ asset, information }) => ({
  groupInfoBody: asset.groupInfoBody,
  getUserInAsset: information.getUserInAsset,
  getAssetsOS: information.getAssetsOS
}))(AssetBusinessRegisterAlert)
