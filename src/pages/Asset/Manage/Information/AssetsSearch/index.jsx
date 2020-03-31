import React, { Component } from 'react'
import { connect } from 'dva'
import DateRange from '@/components/common/DateRange'
import {
  Button, Input, Form, Icon,
  Select, TreeSelect, Row
} from 'antd'
import { analysisUrl, subNodeQuery } from '@/utils/common'
import PropTypes from 'prop-types'
import { uniqBy } from 'lodash'
import moment from 'moment'
import { withRouter } from 'dva/router'
import { ASSET_STATUS, ASSETS_IMPORTANT, MAINTENANCE_TYPE,
  ACCESS_STATE, ASSET_SOURCE, IS_BORROW, NET_CONNECTIONS
} from '@a/js/enume'

const FormItem = Form.Item
const { Option } = Select
const { TreeNode, SHOW_PARENT } = TreeSelect
const ASSETS_TYPES = ['计算设备', '网络设备', '安全设备', '存储设备', '其它设备']

@withRouter
@Form.create()
@connect(({ information }) => ({
  getAssetsOS: information.getAssetsOS,
  getManufacturerInfo: information.getManufacturerInfo,
  getGroupInfo: information.getGroupInfo,
  getUserInAsset: information.getUserInAsset,
  getUserAreaTree: information.getUserAreaTree,
  baselineTemplate: information.baselineTemplate
}))
class AssetsSearch extends Component {
  state = {
    isExpand: false  //是否展开
  }

  static propTypes = {
    getAssetsOS: PropTypes.array,  //操作系统
    getManufacturerInfo: PropTypes.array,
    getGroupInfo: PropTypes.array,
    getUserInAsset: PropTypes.array,
    getUserAreaTree: PropTypes.object,
    baselineTemplate: PropTypes.array
  }

  //展开搜索条件
  showCondition = () => {
    this.setState({ isExpand: !this.state.isExpand })
  }

  //加载区域树结构的下拉列表
  getTreeNode = data => {
    if(data) return (
      <TreeNode value={data.stringId} title={data['fullName']} key= {`${data.stringId}`}>
        {data.childrenNode && data.childrenNode.length ? (
          data.childrenNode.map(item =>
            this.getTreeNode(item)
          )
        ) : null
        }
      </TreeNode>
    )
  }

  //执行查询
  handleSubmit = async () => {
    const values = this.getData()
    await this.props.handleSubmit(values)
  }

  //查询时间控制
  submitControl = (val, type) => {
    return moment(moment(val).format('YYYY-MM-DD') + type).unix() * 1000
  }

  // 执行查询
  getData = (e) => {
    let valuesData = {}
    const { getUserAreaTree, form: { validateFields } } = this.props
    // 首次发现时间起始时间 firstEnterStartTime
    // 首次发现时间结束时间 firstEnterEndTime
    // 到期时间起始时间 serviceLifeStartTime
    // 到期时间结束时间 serviceLifeEndTime

    validateFields((err, values = {}) => {
      if (err) return void (0)
      const [FirstBegin, FirstEnd] = values.gmtCreate || [null, null]
      const [ServiceBegin, ServiceEnd] = values.serviceLife || [null, null]
      values.firstEnterStartTime = FirstBegin ? this.submitControl(FirstBegin, ' 00:00:00') : ''
      values.firstEnterEndTime = FirstEnd ? this.submitControl(FirstEnd, ' 23:59:59') : ''
      values.serviceLifeStartTime = ServiceBegin ? this.submitControl(ServiceBegin, ' 00:00:00') : ''
      values.serviceLifeEndTime = ServiceEnd ? this.submitControl(ServiceEnd, ' 23:59:59') : ''
      // values.areaIds = subNodeQuery(getUserAreaTree)(values.areaIds)
      values.isExpand = this.state.isExpand
      valuesData = values
    })
    return valuesData
  }

  //查询条件重置
  handleReset = () => {
    this.resetKeyBegin = 'beigin' + Math.random()
    this.resetKeyEnd = 'end' + Math.random()
    this.props.form.resetFields()
    const values = this.getData()
    this.props.handleSubmit(values, true)
  }

  //**副作用 */
  getManufacturerInfo=(supplier = null)=>{
    this.props.dispatch({ type: 'information/getManufacturerInfo', payload: { supplier } }) // 厂商
  }

  render () {
    const { isExpand } = this.state
    const {
      getAssetsOS,
      getManufacturerInfo,
      getGroupInfo,
      getUserInAsset,
      getUserAreaTree,
      baselineTemplate,
      form: { getFieldDecorator }
    } = this.props

    return (
      <div className="search-bar">
        <Form className="filter-form new-flex-layout" layout="inline">
          <FormItem label="综合查询">
            {getFieldDecorator('multipleQuery')(
              <Input autoComplete='off' className="filter-form-item" maxLength={30} placeholder="名称/编号机器名/国资码/序列号/IP/MAC" />
            )}
          </FormItem>
          <FormItem label='资产类型'>
            {getFieldDecorator('categoryModels')(
              <Select placeholder="全部"
                allowClear
                getPopupContainer={triggerNode => triggerNode.parentNode}
                mode='multiple'>
                {ASSETS_TYPES && ASSETS_TYPES.map((item, i) => (
                  <Option value={i + 1} key={i}>{item}</Option>)
                )}
              </Select>
            )}
          </FormItem>
          <FormItem label='资产状态' className='item-separation'>
            {getFieldDecorator('assetStatusList')(
              <Select placeholder="全部"
                allowClear
                getPopupContainer={triggerNode => triggerNode.parentNode}
                mode='multiple'
              >
                {ASSET_STATUS.map(item => (
                  <Option value={item.value} key={item.value}>{item.name}</Option>)
                )}
              </Select>
            )}
          </FormItem>
          <FormItem className="search-item search-more-item item-separation">
            <Button type="primary" htmlType="submit" className="margin-right" onClick={this.handleSubmit}>查询</Button>
            <Button type="primary" ghost onClick={this.handleReset}>重置</Button>
          </FormItem>
          <FormItem>
            <span className="show-ondition" onClick={this.showCondition}>
              <Icon type={isExpand ? 'up' : 'down'} />
              {isExpand ? '收起' : '高级查询'}
            </span>
          </FormItem>

          <section className="hide-form" style={{ display: isExpand ? 'block' : 'none' }}>
            <Row className='new-flex-layout no-padding'>
              <FormItem label='物理位置'>
                {getFieldDecorator('physicalPosition')(
                  <Input autoComplete='off' placeholder="请输入" maxLength={30} />
                ) }
              </FormItem>
              <FormItem label='机房位置' className='item-separation'>
                {getFieldDecorator('computerRoomLocation')(
                  <Input autoComplete='off' placeholder="请输入"  maxLength={30} />
                ) }
              </FormItem>
              <FormItem label='描述'>
                {getFieldDecorator('describe')(
                  <Input autoComplete='off' placeholder="请输入"  maxLength={30} />
                ) }
              </FormItem>
              <FormItem label='key'>
                {getFieldDecorator('key')(
                  <Input autoComplete='off' placeholder="请输入"  maxLength={30} />
                ) }
              </FormItem>
              <FormItem label='名称' className='item-separation'>
                {getFieldDecorator('name')(
                  <Select showSearch
                    placeholder="全部"
                    getPopupContainer={triggerNode => triggerNode.parentNode}
                    mode='multiple'
                  >
                    <Option value={''} key={''}>全部</Option>
                    {/* {getGroupInfo && getGroupInfo.map((item) => (
                      <Option value={item.id} key={item.id}>{item.value}</Option>)
                    )} */}
                  </Select>
                )}
              </FormItem>
              <FormItem label='厂商'>
                {getFieldDecorator('manufacturer')(
                  <Select onSearch={val=>{this.getManufacturerInfo(val)}}showSearch getPopupContainer={triggerNode => triggerNode.parentNode}>
                    <Option value={''} key={''}>全部</Option>
                    {getManufacturerInfo && getManufacturerInfo.map((item, index) => (
                      <Option value={item} key={index}>{item}</Option>
                    ))}
                  </Select>
                )}
              </FormItem>
              <FormItem label='版本'>
                {getFieldDecorator('Edition', {
                  initialValue: ''
                })(
                  <Select
                    allowClear
                    placeholder="全部"
                    getPopupContainer={triggerNode => triggerNode.parentNode}
                  >
                    <Option value={''} key={''}>全部</Option>
                    {/* {getGroupInfo && getGroupInfo.map((item) => (
                      <Option value={item.id} key={item.id}>{item.value}</Option>)
                    )} */}
                  </Select>
                )}
              </FormItem>
              <FormItem label='操作系统' className='item-separation'>
                {getFieldDecorator('operationSystem', {
                  initialValue: ''
                })(
                  <Select showSearch optionFilterProp="children" getPopupContainer={triggerNode => triggerNode.parentNode}>
                    <Option value={''} key={''}>全部</Option>
                    {getAssetsOS && uniqBy(getAssetsOS, 'value').map((item) => (
                      <Option value={item.id} key={item.id}>{item.value}</Option>
                    ))}
                  </Select>
                )}
              </FormItem>
              <FormItem label='资产来源'>
                {getFieldDecorator('assetSource')(
                  <Select placeholder="全部"
                    getPopupContainer={triggerNode => triggerNode.parentNode}
                    showSearch={false}>
                    <Option value={''} key={''}>全部</Option>
                    {ASSET_SOURCE.map((item, i) => (
                      <Option value={i + 1} key={i}>{item}</Option>)
                    )}
                  </Select>
                )}
              </FormItem>
              <FormItem label='从属业务'>
                {getFieldDecorator('assetSource666')(
                  <Select placeholder="全部"
                    getPopupContainer={triggerNode => triggerNode.parentNode}
                    showSearch={false}>
                    <Option value={''} key={''}>全部</Option>
                  </Select>
                )}
              </FormItem>
              <FormItem label='资产组' className='item-separation'>
                {getFieldDecorator('assetGroup', {
                  initialValue: ''
                })(
                  <Select showSearch
                    getPopupContainer={triggerNode => triggerNode.parentNode}
                    optionFilterProp="children">
                    <Option value={''} key={''}>全部</Option>
                    {getGroupInfo && getGroupInfo.map((item) => (
                      <Option value={item.id} key={item.id}>{item.value}</Option>)
                    )}
                  </Select>
                )}
              </FormItem>
              <FormItem label='网络类型'>
                {getFieldDecorator('Networktype', {
                  initialValue: ''
                })(
                  <Select
                    allowClear
                    placeholder="全部"
                    getPopupContainer={triggerNode => triggerNode.parentNode}
                  >
                    <Option value={''} key={''}>全部</Option>
                    {/* {getGroupInfo && getGroupInfo.map((item) => (
                      <Option value={item.id} key={item.id}>{item.value}</Option>)
                    )} */}
                  </Select>
                )}
              </FormItem>
              <FormItem label='归属区域'>
                {getFieldDecorator('areaIds')(
                  <TreeSelect
                    showSearch
                    dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                    placeholder="全部"
                    allowClear
                    multiple
                    getPopupContainer={triggerNode => triggerNode.parentNode}
                    treeDefaultExpandAll
                    // showCheckedStrategy={SHOW_ALL}
                    // treeCheckable={true}
                    treeNodeFilterProp='title'
                  >
                    {this.getTreeNode(getUserAreaTree)}
                  </TreeSelect>
                )}
              </FormItem>
              <FormItem label='使用者' className='item-separation'>
                {getFieldDecorator('responsibleUserId', {
                  initialValue: ''
                })(
                  <Select showSearch optionFilterProp="children" getPopupContainer={triggerNode => triggerNode.parentNode}>
                    <Option value={''} key={''}>全部</Option>
                    {getUserInAsset && getUserInAsset.map((item) => (
                      <Option value={item.id} key={item.id}>{item.value}</Option>
                    ))}
                  </Select>
                )}
              </FormItem>
              <FormItem label='准入状态'>
                {getFieldDecorator('AccessState', {
                  initialValue: ''
                })(
                  <Select
                    allowClear
                    placeholder="全部"
                    getPopupContainer={triggerNode => triggerNode.parentNode}
                  >
                    <Option value={''} key={''}>全部</Option>
                    {ACCESS_STATE.map((item) => (
                      <Option value={item.value} key={item.value}>{item.value}</Option>)
                    )}
                  </Select>
                )}
              </FormItem>
              <FormItem label='是否可借用'>
                {getFieldDecorator('WhetherBorrowed', {
                  initialValue: ''
                })(
                  <Select
                    allowClear
                    placeholder="全部"
                    getPopupContainer={triggerNode => triggerNode.parentNode}
                  >
                    <Option value={''} key={''}>全部</Option>
                    {IS_BORROW.map((item) => (
                      <Option value={item.value} key={item.value}>{item.value}</Option>)
                    )}
                  </Select>
                )}
              </FormItem>
              <FormItem label='基准模板' className='item-separation'>
                {getFieldDecorator('baselineTemplateId', {
                  initialValue: ''
                })(
                  <Select showSearch optionFilterProp="children" getPopupContainer={triggerNode => triggerNode.parentNode}>
                    <Option value={''} key={''}>全部</Option>
                    {baselineTemplate && baselineTemplate.map((item) => (
                      <Option value={item.id} key={item.id}>{item.value}</Option>
                    ))}
                  </Select>
                )}
              </FormItem>
              <FormItem label='网络连接'>
                {getFieldDecorator('netConnonet', {
                  initialValue: ''
                })(
                  <Select allowClear
                    placeholder="全部"
                    getPopupContainer={triggerNode => triggerNode.parentNode}>
                    <Option value={''} key={''}>全部</Option>
                    {NET_CONNECTIONS.map((item) => (
                      <Option value={item.value} key={item.value}>{item.value}</Option>)
                    )}
                  </Select>
                )}
              </FormItem>
              <FormItem label='是否涉密'>
                {getFieldDecorator('IsConfidential', {
                  initialValue: ''
                })(
                  <Select
                    allowClear
                    placeholder="全部"
                    getPopupContainer={triggerNode => triggerNode.parentNode}
                  >
                    <Option value={''} key={''}>全部</Option>
                    {IS_BORROW.map((item) => (
                      <Option value={item.value} key={item.value}>{item.value}</Option>)
                    )}
                  </Select>
                )}
              </FormItem>
              <FormItem label='是否孤岛设备' className='item-separation'>
                {getFieldDecorator('IslandEquipment', {
                  initialValue: ''
                })(
                  <Select
                    allowClear
                    placeholder="全部"
                    getPopupContainer={triggerNode => triggerNode.parentNode}
                  >
                    <Option value={''} key={''}>全部</Option>
                    {IS_BORROW.map((item) => (
                      <Option value={item.value} key={item.value}>{item.value}</Option>)
                    )}
                  </Select>
                )}
              </FormItem>
              <FormItem label='重要程度'>
                {getFieldDecorator('importanceDegree')(
                  <Select placeholder="全部"
                    getPopupContainer={triggerNode => triggerNode.parentNode}
                    showSearch={false}>
                    <Option value={''} key={''}>全部</Option>
                    {ASSETS_IMPORTANT.map((item, i) => (
                      <Option value={item.vaule} key={i}>{item.name}</Option>)
                    )}
                  </Select>
                )}
              </FormItem>
              <FormItem label='维护方式'>
                {getFieldDecorator('Maintenance')(
                  <Select placeholder="全部"
                    getPopupContainer={triggerNode => triggerNode.parentNode}
                    showSearch={false}>
                    <Option value={''} key={''}>全部</Option>
                    {MAINTENANCE_TYPE.map((item, i) => (
                      <Option value={item.vaule} key={i}>{item.name}</Option>)
                    )}
                  </Select>
                )}
              </FormItem>

              <FormItem label="到期时间" className='item-date-container item-separation'>
                {getFieldDecorator('serviceLife', {
                })(
                  <DateRange future placeholder={['开始时间', '结束时间']} format="YYYY-MM-DD" resetKey={this.resetKeyBegin} />
                )}
              </FormItem>
              <FormItem label="首次发现时间" className='item-date-container'>
                {getFieldDecorator('gmtCreate', {
                })(
                  <DateRange future={false} placeholder={['开始时间', '结束时间']} format="YYYY-MM-DD" resetKey={this.resetKeyBegin} />
                )}
              </FormItem>

              <FormItem label="启用时间" className='item-date-container'>
                {getFieldDecorator('serviceLife1', {
                })(
                  <DateRange future placeholder={['开始时间', '结束时间']} format="YYYY-MM-DD" resetKey={this.resetKeyBegin} />
                )}
              </FormItem>

              <FormItem label="装机时间" className='item-date-container item-separation'>
                {getFieldDecorator('serviceLife2', {
                })(
                  <DateRange future placeholder={['开始时间', '结束时间']} format="YYYY-MM-DD" resetKey={this.resetKeyBegin} />
                )}
              </FormItem>
            </Row>
          </section>
        </Form>
      </div>

    )
  }

  componentDidMount () {
    const { dispatch, form: { setFieldsValue } } = this.props
    const init = analysisUrl(this.props.location.search)
    if(init.conditionShow) this.setState({ isExpand: init.conditionShow })
    if(init.assetStatusList) setFieldsValue({ assetStatusList: [Number(init.assetStatusList)] })
    dispatch({ type: 'information/getAssetsOS' }) // 操作系统
    dispatch({ type: 'information/getGroupInfo' }) // 资产组
    this.getManufacturerInfo() // 厂商
    dispatch({ type: 'information/getUserInAsset' }) // 使用者
    dispatch({ type: 'information/getUserAreaTree' }) // 区域树
    dispatch({ type: 'information/baselineTemplate' }) //  基准模板
    // this.handleSubmit()
    // this.props.handleSubmit(values)
  }

  UNSAFE_componentWillReceiveProps (nextProps) {
    // 更新列表数据
    if (JSON.stringify(this.props.isExpand) !== JSON.stringify(nextProps.isExpand)) {
      this.setState({
        isExpand: nextProps.isExpand
      })
    }
  }

}

export {
  AssetsSearch,
  ASSETS_TYPES
}
