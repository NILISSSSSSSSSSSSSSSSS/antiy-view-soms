import { PureComponent } from 'react'
import { connect } from 'dva'
import {
  Table,
  Select,
  DatePicker,
  Form,
  Input,
  Button,
  message
} from 'antd'
import { Link } from 'dva/router'
import './style.less'
import moment from 'moment'
import { transliteration, TooltipFn } from '@/utils/common'
import PropTypes from 'prop-types'
import { debounce } from 'lodash'
import { HARD_ASSET_TYPE, ASSET_STATUS, ASSET_STATUS_USEABLE } from '@a/js/enume'

const FormItem = Form.Item
const Option = Select.Option

@Form.create()
class AssetGroupRegisterAlert extends PureComponent {
  state = {
    //开始
    currentPage: 1, //当前页码
    pageSize: 10,
    multipleQuery: '',
    categoryModels: [],
    assetStatusList: [],
    assetGroup: '',
    firstEnterStartTime: '',
    firstEnterEndTime: '',
    //结束
    gmtCreate: '',
    timeType: 1,
    rowsSelectedList: [],
    selectedRowKeys: [],
    stringIds: this.props.stringIds,
    sorts: {
      sortName: undefined,
      sortOrder: undefined
    }
  }

  static defaultProps ={
    PrefixCls: 'AssetGroupRegister',
    assetBody: { items: [], totalRecords: 0 },
    groupInfoBody: []
  }

  static propTypes={
    PrefixCls: PropTypes.string,
    groupInfoBody: PropTypes.array, //资产组
    assetBody: PropTypes.object // 硬件资产列表
  }

  //提交到上个表单
  save = (event)=>{
    let { rowsSelectedList } = this.state
    if(!rowsSelectedList.length){
      message.warn('没有选择要关联的资产')
      return
    }
    this.props.saveAlert(this.state.rowsSelectedList)
    this.cancel()
  }
  cancel =() =>{
    const { form: { resetFields }, cancelAlert } = this.props
    this.setState({ selectedRowKeys: [], rowsSelectedList: [] })
    resetFields()
    cancelAlert()
  }

  //翻页
  pageChange = (page, pageSize)=>{
    this.setState({
      currentPage: page,
      pageSize: pageSize
    }, this.getAssetList)
  }

  //查询时间控制
  submitControl=(val, type)=>{
    return moment(moment(val).format('YYYY-MM-DD') + type).unix() * 1000
  }

  // 提交表单，执行查询
  onSubmit = (e) => {
    e.preventDefault()
    const { form: { validateFields } } = this.props
    validateFields((err, values) => {
      if(err) return void(0)
      this.setState({
        currentPage: 1,
        multipleQuery: values.multipleQuery,
        categoryModels: values.categoryModels,
        assetStatusList: values.assetStatusList,
        assetGroup: values.assetGroup,
        firstEnterStartTime: values.firstEnterStartTime ? this.submitControl(values.firstEnterStartTime, ' 00:00:00') : '',
        firstEnterEndTime: values.firstEnterEndTime ? this.submitControl(values.firstEnterEndTime, ' 23:59:59') : ''
      }, this.getAssetList)
    })
  }
//排序分页
handleTableChange = (pagination, filters, sorter) => {
  this.setState({
    sorts: {
      sortName: 'gmt_create',
      sortOrder: sorter.order === 'ascend' ? 'asc' : 'desc'
    }
  }, this.getAssetList)
}
  //查询条件重置
handleReset = () => {
  this.props.form.resetFields()
  //重置查询条件后，重新查询页面数据
  this.setState({
    currentPage: 1,
    multipleQuery: '',
    categoryModels: [],
    assetStatusList: [],
    assetGroup: '',
    firstEnterStartTime: '',
    firstEnterEndTime: '',
    sorts: {
      sortName: undefined,
      sortOrder: undefined
    }
  }, this.getAssetList)
}

  //**接口开始 */
  //列表
  getAssetList=debounce(()=>{
    const {
      currentPage,
      pageSize,
      multipleQuery,
      categoryModels,
      assetStatusList,
      assetGroup,
      firstEnterStartTime,
      firstEnterEndTime,
      stringIds, //其他页面跳进来
      sorts //排序字段
    } = this.state
    const payload = {
      currentPage,
      pageSize,
      multipleQuery,
      categoryModels,
      assetStatusList,
      assetGroup,
      firstEnterStartTime,
      firstEnterEndTime,
      assetGroupQuery: true, //其他页面跳进来,后台要求参数
      ...sorts
    }
    if(stringIds){
      payload.associateGroup = true //其他页面跳进来,后台要求参数
      payload.groupId = stringIds
    }
    if(firstEnterStartTime){
      payload.timeType = 1
    }
    this.props.dispatch({ type: 'asset/getAssetList', payload: payload })
  }, 300)

  //获取资产资产组
  getGroupInfo=()=>{
    this.props.dispatch({ type: 'asset/getGroupInfo' })
  }

  render (){
    let {
      selectedRowKeys,
      currentPage,
      pageSize,
      rowsSelectedList
    } = this.state
    const {
      PrefixCls,
      form: { getFieldDecorator },
      groupInfoBody,
      assetBody
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
    }, {
      title: '资产类型',
      dataIndex: 'categoryModelName',
      key: 'categoryModelName',
      isShow: true,
      width: '8%',
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
    }, {
      title: '资产组',
      dataIndex: 'assetGroup',
      key: 'assetGroup',
      isShow: true,
      width: '8%',
      render: text=>TooltipFn(text)
    }, {
      title: '状态',
      dataIndex: 'assetStatus',
      key: 'assetStatus',
      width: '8%',
      render: (text) => ASSET_STATUS.find((v, i)=>i + 1 === text).name,
      isShow: true
    }, {
      title: '首次发现时间',
      width: 160,
      dataIndex: 'gmtCreate',
      key: 'gmtCreate',
      sorter: true,
      render: (text) => moment(text).format('YYYY-MM-DD HH:mm:ss'),
      isShow: true
    }, {
      title: '操作',
      // width: 100,
      width: '12%',
      render: (text, scope) =>
        <Link to={`/asset/manage/detail?id=${transliteration(scope.stringId)}`} target="_blank">
          <span className='alertColor'>查看</span>
        </Link>
      ,
      isShow: true
    }]

    const rowSelection = {
      selectedRowKeys,
      onChange: (selectedRowKeys, selectedRows) => {
        this.setState({
          selectedRowKeys
        }, ()=>{
          let init = []
          if(selectedRows.length){
            rowsSelectedList.concat(selectedRows).forEach((now)=>{
              if(!(init.some(item=>item.stringId === now.stringId)))
                init.push(now)
            })
            this.setState({ rowsSelectedList: init })
          }
        })
      },
      onSelect: (record, selected, row, list)=>{ //手动单选
        let { rowsSelectedList } = this.state
        if(!selected){
          rowsSelectedList.splice(rowsSelectedList.findIndex(el=>el.stringId === record.stringId), 1)
          this.setState({ rowsSelectedList })
        }
      },
      onSelectAll: (selected, selectedRows, changeRows)=>{ //手动执行全选操作
        let { rowsSelectedList } = this.state
        if(!selected){
          changeRows.forEach(now=>{
            rowsSelectedList.splice(rowsSelectedList.findIndex(el=>el.stringId === now.stringId), 1)
          })
          this.setState({ rowsSelectedList })
        }
      },
      getCheckboxProps: record => ({
        disabled: record.name === 'Disabled User', // Column configuration not to be checked
        name: record.name
      })
    }

    return(
      <div className={`${PrefixCls} form-content`}>
        <Form layout="inline" className="new-flex-layout" onSubmit={this.onSubmit}>
          <FormItem  label='综合查询'>
            {getFieldDecorator('multipleQuery', {
              rules: [{ required: false, message: '请输入' }]
            })(
              <Input autoComplete="off"
                placeholder="名称/编号/IP/MAC"
                maxLength={30}
                style={{ width: 638 }}
              />
            )}
          </FormItem>
          <FormItem label='资产类型' className='item-separation'>
            {getFieldDecorator('categoryModels')(
              <Select placeholder="全部"
                allowClear
                optionFilterProp="children"
                getPopupContainer={triggerNode => triggerNode.parentNode}
                mode='multiple'>
                {HARD_ASSET_TYPE.map(item=>(
                  <Option value={item.value} key={item.value}>{item.name}</Option>)
                )}
              </Select>
            )}
          </FormItem>
          <FormItem label="状态">
            {getFieldDecorator('assetStatusList')(
              <Select  mode="multiple"
                placeholder="全部"
                allowClear
                optionFilterProp="children"
                getPopupContainer={triggerNode => triggerNode.parentNode}>
                { ASSET_STATUS_USEABLE.map((item, index)=>{
                  return(<Option value={ item.value} key={index}>{item.name}</Option>)
                })  }
              </Select>
            )}
          </FormItem>

          <FormItem label='首次发现时间' className='item-date-container item-date-two'>
            {getFieldDecorator('firstEnterStartTime', {
            })(
              <DatePicker placeholder="开始日期" allowClear
                getCalendarContainer={triggerNode => triggerNode.parentNode}/>
            )}
            <span className="split">-</span>
          </FormItem>
          <FormItem className='item-date-container item-date-two'>
            {getFieldDecorator('firstEnterEndTime', {
            })(
              <DatePicker placeholder="结束日期" allowClear
                getCalendarContainer={triggerNode => triggerNode.parentNode}/>
            )}
          </FormItem>
          <FormItem label='资产组' className='item-separation'>
            {getFieldDecorator('assetGroup', {
              initialValue: ''
            })(
              <Select showSearch
                placeholder="全部"
                getPopupContainer={triggerNode => triggerNode.parentNode}
                optionFilterProp="children"
              >
                <Option value={''} key={''}>全部</Option>
                {groupInfoBody.map((item, index)=>
                  <Option value={item.id} key={index + 'assetGroup'}>{item.value}</Option>
                )}
              </Select>
            ) }
          </FormItem>

          <FormItem className="search-item">
            <Button type="primary" htmlType="submit" >查询</Button>
            <Button  onClick={this.handleReset}  >重置</Button>
          </FormItem>

        </Form>
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
            onChange={this.handleTableChange}
          />
        </div>
        <footer className="Button-center">
          <div>
            <Button type="primary" onClick={(e)=>this.save(e)}>确认</Button>
            <Button type="primary" className="back-btn" ghost onClick={this.cancel}>取消</Button>
          </div>
        </footer>
      </div>
    )
  }

  async componentDidMount () {
    await this.getAssetList()
    await this.getGroupInfo()

    this.props.children(this)
  }

  UNSAFE_componentWillReceiveProps (nextProps) {
    this.setState({ selectedRowKeys: nextProps.initKeys })
  }

}

export default connect(({ asset }) => ({
  assetBody: asset.assetBody,
  groupInfoBody: asset.groupInfoBody
}))(AssetGroupRegisterAlert)
