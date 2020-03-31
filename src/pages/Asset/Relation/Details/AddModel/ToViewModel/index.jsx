import { PureComponent } from 'react'
import { connect } from 'dva'
import PropTypes from 'prop-types'
import { throttle } from 'lodash'
import { Form,  Select, message } from 'antd'
import './style.less'

const { Option } = Select

@Form.create()
class relationDetailsAddModelToViewModel extends PureComponent {
  state = {
    PrefixCls: 'relationDetailsAddModelToViewModel',
    pageSize: 10, //每页数据条数
    currentPage: 1, //当前页码
    relationDetailsAddModelToViewModelList: []
  }

  static defaultProps ={
    record: {}
  }

  static propTypes={
    assetRelationDetailsObj: PropTypes.object,
    relationUseableIpNet: PropTypes.array,
    record: PropTypes.object,
    detailsRecoed: PropTypes.object
  }

  //新增回调
  assetRelationDetailsListAddDetailsAddCallback=()=>{
    if(this.props.assetRelationDetailsListAddDetailsAdd){
      message.success('添加成功')
    }
  }

  //新增通联
  handleSubmit=throttle(e=>{
    const {
      assetRelationDetailsObj: { asset },
      addRecord: { stringId },
      detailsRecoed: { assetIp, assetPort }
    } = this.props
    const { form: { validateFields } } = this.props
    let poyload = null
    validateFields(async (err, fieldsValue)=>{
      if(err) return void(0)
      poyload = {
        assetId: asset.stringId,
        assetIp: assetIp,
        parentAssetId: stringId,
        assetPort: assetPort,
        parentAssetIp: fieldsValue.parentAssetIp,
        parentAssetPort: fieldsValue.parentAssetPort
      }
      // this.assetRelationDetailsListAddDetailsAdd(poyload)
    })
    if(!(poyload && poyload.parentAssetIp && poyload.parentAssetPort)) return void(0)
    return poyload
  }, 1000, { trailing: false })

  onPortChange=(value, prevValue )=>{
    const { relationUseableIpNet, form: { setFieldsValue } } = this.props
    relationUseableIpNet.forEach(item=>{
      if(item.net === value){
        setFieldsValue({ parentAssetIp: item.ip })
        return void(0)
      }
    })
  }

  //**接口开始 */
  init=async ()=>{
    const { dispatch, addRecord: { stringId } } = this.props
    await dispatch({ type: 'asset/relationUseableIpNet', payload: {  //ip和网口
      assetId: stringId
    } })
  }

  //新增通联
  assetRelationDetailsListAddDetailsAdd=async (poyload)=>{
    const { dispatch } = this.props
    await dispatch({ type: 'asset/assetRelationDetailsListAddDetailsAdd', payload: poyload })
    await this.props.addHandleCancel()
    await this.props.detailHandleCancel()
    await this.assetRelationDetailsListAddDetailsAddCallback()
  }

  render () {
    const { PrefixCls } = this.state
    const {
      form: { getFieldDecorator },
      assetRelationDetailsObj: { asset },
      relationUseableIpNet,
      detailsRecoed,
      addRecord
    } = this.props

    const {
      name,   //资产名称
      categoryModelName, //资产类型
      number //资产编号
    } = asset

    const {
      assetIp, //ip
      assetPort, //网口
      categoryModel //祖父级是否网络设备
    } = detailsRecoed

    const isAddNet = (categoryModel === 2) //祖父级是否网络设备

    const isNet = addRecord.categoryModel === 2  //关联设备是否网络设备

    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 18 }
    }

    const formItemLayoutInput = {
      style: {
        width: 300
      }
    }

    return (
      <div className={PrefixCls}>
        <section className={`${PrefixCls}-add`}>
          <Form onSubmit={this.handleSubmit}>
            <Form.Item label='设备名称' {...formItemLayout}>
              {<span>{name}</span>}
            </Form.Item>
            <Form.Item label='设备类型' {...formItemLayout}>
              {<span>{number}</span>}
            </Form.Item>
            <Form.Item label='所在区域' {...formItemLayout}>
              {<span>{categoryModelName}</span>}
            </Form.Item>

            {isAddNet && (
              <Form.Item label='所选设备网口' {...formItemLayout}>
                {<span>{assetPort}</span>}
              </Form.Item>
            )}

            <Form.Item label='所选资产网口IP' {...formItemLayout}>
              {<span>{assetIp}</span>}
            </Form.Item>

            {isNet && (
              <Form.Item label='关联设备绑定网口' {...formItemLayout}>
                {getFieldDecorator('parentAssetPort', {
                  validateTrigger: 'onBlur',
                  rules: [{ required: true, message: '请选择网口' }]
                })(
                  <Select placeholder='请选择' {...formItemLayoutInput}
                    showSearch  allowClear onChange={this.onPortChange}
                    getPopupContainer={triggerNode => triggerNode.parentNode}
                  >
                    {relationUseableIpNet.map((item, index)=>(
                      <Option value={item.net} key={index} >{item.net}</Option>
                    ))}
                  </Select>
                )}
              </Form.Item>
            )}

            <Form.Item label='关联设备绑定的IP' {...formItemLayout}>
              {getFieldDecorator('parentAssetIp', {
                rules: [{ required: true, message: '请选择IP' }]
              }
              )(<Select placeholder='请选择' {...formItemLayoutInput}
                showSearch  allowClear
                disabled={isNet}
                getPopupContainer={triggerNode => triggerNode.parentNode}
              >
                {relationUseableIpNet.map((item, index)=>(
                  <Option value={item.ip} key={index}>{item.ip}</Option>
                ))}
              </Select>)}
            </Form.Item>

          </Form>
        </section>
      </div>
    )
  }

  componentDidMount () {
    this.props.onRef(this)
    this.init()
  }
}

export default connect(({ asset }) => ({
  assetRelationDetailsObj: asset.assetRelationDetailsObj,
  relationUseableIpNet: asset.relationUseableIpNet,
  assetRelationDetailsListAddDetailsAdd: asset.assetRelationDetailsListAddDetailsAdd
}))(relationDetailsAddModelToViewModel)
