import { PureComponent, Fragment } from 'react'
import { connect } from 'dva'
import PropTypes from 'prop-types'
import { Table, Button, Form, Input, Select, DatePicker, TreeSelect, Tooltip, message } from 'antd'
import './style.less'
import { debounce, throttle } from 'lodash'
import moment from 'moment'
import { analysisUrl, subNodeQuery, emptyFilter, TooltipFn } from '@/utils/common'
import { withRouter } from 'dva/router'
import { HARD_ASSET_TL_TYPE } from '@a/js/enume'
import DetailFiedls from '@c/common/DetailFiedls'
import AssetModal from '@/components/Asset/AssetModal'
import ToViewModel from './ToViewModel/index.jsx'

const { Option } = Select
const { TreeNode, SHOW_PARENT } = TreeSelect
const FormItem = Form.Item
const { TextArea } = Input

@Form.create()
class relationDetailsAddModel extends PureComponent {
  state = {
    PrefixCls: 'relationDetailsAddModel',
    pageSize: 10, //每页数据条数
    currentPage: 1, //当前页码
    visible: false, //移除弹框
    multipleQuery: null, //综合查询
    categoryModels: null, //资产类型
    assetGroup: null, //资产组
    areaIds: [],
    timeType: '', //事件类型
    searchNetworkDevice: false, //是否只查询网络设备
    beginTime: '',
    endTime: null,
    selectedRowKeys: [],
    selectedRows: [],
    primaryKey: analysisUrl(this.props.location.search).assetId,
    record: {} //传到子组件的数据
  }

  static defaultProps ={
    assetRelationDetailsListAddAssetGroup: [],
    assetRelationDetailsListAddList: {}
  }

  static propTypes={
    assetRelationDetailsListAddAssetGroup: PropTypes.array,
    assetRelationDetailsListAddList: PropTypes.object,
    detailsRecoed: PropTypes.object,
    userAreaTree: PropTypes.object,  //区域树
    isNext: PropTypes.bool
  }

  //获取是否下一步
  getIsNext=()=>{
    if(!this.state.selectedRows.length) {
      message.info('请选择设备')
      return 1
    }
    return this.props.isNext
  }

  //分页
  changePage = (current, pageSize) => {
    this.setState({ currentPage: current, pageSize: pageSize }, this.assetRelationDetailsListAddList)
  }

  showModal=(record)=>{
    this.setState({ record: record }, ()=>{
      this.handleCancel(true)
    })
  }
  //传递子组件this
  onRef=(ref)=>{
    this.ToViewModel = ref
  }

  //提交
  handleOk=throttle(async (ref)=>{
    await this.ToViewModel.handleSubmit()
    await this.assetRelationDetailsListAddList()
  }, 1000, { trailing: false })

  //退出
  handleCancel=(boo = false)=>{
    this.setState({ visible: boo })
  }

  //加载资产类型和区域树结构的下拉列表
  getTreeNode = data=>type => {
    let val = ''
    if(type === 'categoryModels'){
      val = 'name'
    }else if(type === 'areaIds'){
      val = 'fullName'
    }
    if(data)
      return (
        <TreeNode value={data.stringId} title={data[val]} key= {`${data.stringId}`} formStatus={data.formStatus}>
          {data.childrenNode && data.childrenNode.length ? (
            data.childrenNode.map(item =>this.getTreeNode(item)(type))
          ) : null
          }
        </TreeNode>
      )
  }

  //查询时间控制
  submitControl=(val, type)=>{
    return moment(moment(val).format('YYYY-MM-DD') + type).unix() * 1000
  }

  //填充数据
  pushData=(fieldsValue = {})=>{
    const { primaryKey } = this.state
    const beginTime = fieldsValue.beginTime ? this.submitControl(fieldsValue.beginTime, ' 00:00:00') : null
    const endTime = fieldsValue.endTime ? this.submitControl(fieldsValue.endTime, ' 23:59:59') : null
    // console.log(record.stringId)
    this.setState({
      primaryKey,
      currentPage: 1,
      multipleQuery: fieldsValue.multipleQuery,
      categoryModels: fieldsValue.categoryModels,
      assetGroup: fieldsValue.assetGroup,
      timeType: '2',
      beginTime: beginTime,
      endTime: endTime,
      areaIds: fieldsValue.areaIds
    }, this.assetRelationDetailsListAddList)
  }

  //查询
  handleSubmit=(e)=>{
    e.preventDefault()
    const { form: { validateFields }, userAreaTree } = this.props
    validateFields( (err, fieldsValue)=>{
      if(err) return void(0)
      // fieldsValue.areaIds = subNodeQuery(userAreaTree)(fieldsValue.areaIds)
      this.pushData(fieldsValue)
    })
  }

  //重置
  handleReset=()=>{
    const { form: { validateFields, resetFields  } } = this.props
    validateFields((err, fieldsValue) => {
      resetFields() //重置控件
      this.pushData()
    })
  }

  //**接口开始 */
  init=async ()=>{
    const { dispatch } = this.props
    const { primaryKey } = this.state
    const { detailsRecoed: { categoryModel } } = this.props
    await Promise.all([
      dispatch({ type: 'asset/getUserAreaTree' }), // 区域树
      dispatch({ type: 'asset/assetRelationDetailsListAddAssetGroup', payload: { isNet: categoryModel, primaryKey } }) //资产组
    ])
  }

  //列表
  assetRelationDetailsListAddList=debounce(()=>{
    const { dispatch, detailsRecoed } = this.props
    const state = this.state
    dispatch({ type: 'asset/assetRelationDetailsListAddList', payload: {
      primaryKey: state.primaryKey,
      currentPage: state.currentPage,
      pageSize: state.pageSize,
      multipleQuery: state.multipleQuery,
      //有传过来的categoryModel是计算设备1就只显示网络设备2
      categoryModels: detailsRecoed.categoryModel === 1 ? [2] : state.categoryModels,
      assetGroup: state.assetGroup,
      timeType: state.timeType,
      beginTime: state.beginTime,
      endTime: state.endTime,
      areaIds: state.areaIds
    } })
  }, 300)

  render () {
    const {
      PrefixCls,
      visible,
      record,
      currentPage,
      pageSize,
      selectedRowKeys,
      selectedRows
    } = this.state
    const {
      form: { getFieldDecorator },
      assetRelationDetailsListAddAssetGroup,
      userAreaTree,
      assetRelationDetailsListAddList: { totalRecords, items },
      detailsRecoed,
      isNext
    } = this.props

    const columns = [
      {
        title: '名称',
        dataIndex: 'name',
        key: 'name',
        render: (text, record)=>(
          <Tooltip getPopupContainer={triggerNode => triggerNode.parentNode}placement="topLeft" title={text}>
            <a className={`${PrefixCls}-a`} onClick={() => this.showModal( record)}>
              {text}
            </a>
          </Tooltip>
        )
      },
      {
        title: '编号',
        dataIndex: 'number',
        key: 'number',
        render: text=>TooltipFn(text)
      },
      {
        title: '资产类型',
        key: 'categoryModelName',
        dataIndex: 'categoryModelName',
        render: text=>TooltipFn(text)
      },
      {
        title: '区域',
        key: 'areaName',
        dataIndex: 'areaName',
        render: text=>TooltipFn(text)
      },
      {
        title: 'IP',
        dataIndex: 'ips',
        key: 'ips',
        render: text=>TooltipFn(text)
      },
      {
        title: 'MAC',
        dataIndex: 'macs',
        key: 'macs',
        render: text=>TooltipFn(text)
      },
      {
        title: '资产组',
        dataIndex: 'assetGroup',
        key: 'assetGroup',
        render: text=>TooltipFn(text)
      },
      {
        title: '首次入网时间',
        dataIndex: 'firstEnterNett',
        key: 'firstEnterNett',
        width: 180,
        render: text=>text ? TooltipFn(moment(text).format('YYYY-MM-DD HH:mm:ss')) : null
      }
    ]

    // const addModal = {
    //   title: '详情',
    //   visible: visible,
    //   width: 650,
    //   onOk: this.handleOk,
    //   onCancel: ()=>this.handleCancel(),
    //   children: <ToViewModel onRef={this.onRef} addRecord={record} detailsRecoed={detailsRecoed}
    //     addHandleCancel={this.handleCancel} detailHandleCancel={this.props.detailHandleCancel}
    //   />
    // }

    const rowSelection = {
      type: 'radio',
      selectedRowKeys,
      onChange: (selectedRowKeys, selectedRows) => {
        this.setState({
          selectedRowKeys, selectedRows
        })
      }
    }
    const renderNext = (
      <Fragment>
        <section className={`${PrefixCls}-search`}>
          <Form className="new-flex-layout" layout="inline" onSubmit={this.handleSubmit}>
            <Form.Item label='综合查询'>
              {getFieldDecorator('multipleQuery')(
                <Input autoComplete='off' placeholder='名称/编号/IP/MAC' maxLength={30}/>
              )}
            </Form.Item>
            {(detailsRecoed.categoryModel === 2) &&
            <Form.Item label='资产类型' className='item-separation'>
              {getFieldDecorator('categoryModels')(
                <Select placeholder="全部"
                  allowClear
                  getPopupContainer={triggerNode => triggerNode.parentNode}
                  showSearch={false}
                  mode='multiple'>
                  {HARD_ASSET_TL_TYPE.map(item=>(
                    <Option value={item.value} key={item.value}>{item.name}</Option>)
                  )}
                </Select>
              )}
            </Form.Item>
            }
            <Form.Item label='区域' className={(detailsRecoed.categoryModel === 2) ? null : 'item-separation'}>
              {getFieldDecorator('areaIds')(
                <TreeSelect
                  showSearch
                  dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                  placeholder="全部"
                  allowClear
                  multiple
                  getPopupContainer={triggerNode => triggerNode.parentNode}
                  treeDefaultExpandAll
                  // showCheckedStrategy={SHOW_PARENT}
                  // treeCheckable={true}
                  treeNodeFilterProp='title'
                >
                  {this.getTreeNode(userAreaTree)('areaIds')}
                </TreeSelect>
              )}
            </Form.Item>
            <Form.Item label='首次入网时间' className='item-date-container item-date-two'>
              {getFieldDecorator('beginTime', {
              })(
                <DatePicker placeholder="开始日期" allowClear getCalendarContainer={triggerNode => triggerNode.parentNode} />
              )}
              <span className="split">-</span>
            </Form.Item>
            <Form.Item className='item-date-container item-date-two'>
              {getFieldDecorator('endTime', {
              })(
                <DatePicker placeholder="结束日期" allowClear  getCalendarContainer={triggerNode => triggerNode.parentNode} />
              )}
            </Form.Item>
            <Form.Item label='资产组' className={(detailsRecoed.categoryModel === 2) ? 'item-separation' : null}>
              {getFieldDecorator('assetGroup', {
                initialValue: ''
              })(
                <Select
                  showSearch
                  getPopupContainer={triggerNode => triggerNode.parentNode}
                  optionFilterProp="children"
                >
                  <Option value={''} key={''}>全部</Option>
                  {assetRelationDetailsListAddAssetGroup.map((item, index)=>(
                    <Option value={item.id} key={index}>{item.value}</Option>
                  ))}
                </Select>
              )}
            </Form.Item>
            <Form.Item className={(detailsRecoed.categoryModel === 2) ? 'search-item' : 'search-item item-separation'}>
              <Button type="primary" htmlType="submit" style={{ marginRight: 12 }}>查询</Button>
              <Button onClick={this.handleReset}>重置</Button>
            </Form.Item>
          </Form>
        </section>
        <section className={`${PrefixCls}-table`}>
          <Table
            rowKey={(text, record) => record}
            columns={columns}
            dataSource={items}
            rowSelection={rowSelection}
            pagination={{
              current: currentPage,
              pageSize: pageSize,
              className: 'table-pagination',
              showQuickJumper: true,
              // showSizeChanger: true,
              pageSizeOptions: ['10', '20', '30', '40'],
              onShowSizeChange: this.changePage,
              showTotal: () => `共 ${totalRecords} 条数据`,
              defaultCurrent: 1,
              defaultPageSize: 10,
              total: totalRecords,
              onChange: this.changePage
            }}
          />
        </section>

      </Fragment>
    )

    const renderForm = ()=>{
      const assetFields = [
        { key: 'name', name: '设备名称' },
        { key: 'key', name: '设备类型' },
        { key: 'operationSystemName', name: '使用者' },
        { key: 'number', name: '所在区域' },
        { key: 'name1', name: 'IP' },
        { key: 'key1', name: '所属组织' },
        { key: 'operationSystemName1', name: 'MAC' }
      ]
      const assetData = []

      return (<Fragment>
        <p className="detail-title">资产信息：</p>
        <div className="detail-content asset-group-detail-content">
          <DetailFiedls fields={assetFields} data={assetData} />
        </div>
        <p className="detail-title">关联设备信息：</p>
        <div className="detail-content asset-group-detail-content">
          <ToViewModel onRef={this.onRef} addRecord={selectedRows[0]} detailsRecoed={detailsRecoed}
            addHandleCancel={this.handleCancel} detailHandleCancel={this.props.detailHandleCancel}
          />
        </div>
        <p className="detail-title">其他通联维护信息：</p>
        <div className="detail-content asset-group-detail-content">
          <Form className="filter-form new-flex-layout" layout="inline">
            <FormItem label="配件间房间号">
              {getFieldDecorator('multipleQuery')(
                <Input autoComplete='off' className="filter-form-item" maxLength={30} placeholder="名称/编号/IP/MAC" />
              )}
            </FormItem>
            <FormItem label="办公室网口">
              {getFieldDecorator('multipleQuery1')(
                <Input autoComplete='off' className="filter-form-item" maxLength={30} placeholder="名称/编号/IP/MAC" />
              )}
            </FormItem>
            <FormItem label="办公室网口状态">
              {getFieldDecorator('multipleQuery2')(
                <Select placeholder="全部"
                  allowClear
                  getPopupContainer={triggerNode => triggerNode.parentNode}
                  mode='multiple'
                  showSearch={false}>
                  <Option value={1} key={1}>正常</Option>
                  <Option value={2} key={2}>损坏</Option>
                </Select>
              )}
            </FormItem>
            <FormItem label="交换机状态">
              {getFieldDecorator('multipleQuery3')(
                <Select placeholder="全部"
                  allowClear
                  getPopupContainer={triggerNode => triggerNode.parentNode}
                  mode='multiple'
                  showSearch={false}>
                  {/* {ASSET_STATUS.map(item => (
                    <Option value={item.value} key={item.value}>{item.name}</Option>)
                  )} */}
                </Select>
              )}
            </FormItem>
            <FormItem label="Vlan号">
              {getFieldDecorator('multipleQuery4')(
                <Input autoComplete='off' className="filter-form-item" maxLength={30} placeholder="名称/编号/IP/MAC" />
              )}
            </FormItem>
            <FormItem  label={'备注'}>
              {getFieldDecorator('note', {
                rules: [
                  { message: '最多300个字符！', max: 300 }
                ]
              })(
                <TextArea rows={6} placeholder="请输入" style={{ resize: 'none' }} />
              )}
            </FormItem>
            <FormItem label="自定义">
              {getFieldDecorator('multipleQuery5')(
                <Input autoComplete='off' className="filter-form-item" maxLength={30} placeholder="名称/编号/IP/MAC" />
              )}
            </FormItem>
          </Form>
        </div>
      </Fragment>)
    }

    return (
      <div className={PrefixCls}>
        {isNext ? renderNext : renderForm()}
        {/* <AssetModal data={addModal} /> */}
      </div>
    )
  }

  componentDidMount () {
    this.props.child(this)
    this.init()
    this.assetRelationDetailsListAddList()
  }
}

export default withRouter(connect(({ asset }) => ({
  userAreaTree: asset.userAreaTree,
  assetRelationDetailsListAddAssetGroup: asset.assetRelationDetailsListAddAssetGroup,
  assetRelationDetailsListAddList: asset.assetRelationDetailsListAddList
}))(relationDetailsAddModel))
