import { Component } from 'react'
import CommonForm from '@c/common/Form'
import { AUTO, MANUAL, MAINTENANCE_TYPE, STORAGE_DEVICE, NETWORK_DEVICE, OTHER_DEVICE, SAFETY_DEVICE } from '@a/js/enume'
import api from '@/services/api'
import * as regExp from '@/utils/regExp'
import moment from 'moment'
import './index.less'
import { connect } from 'dva'

const formLayout = {
  labelCol: {
    span: 8
  },
  wrapperCol: {
    span: 16
  }
}
const formLayout2 = {
  labelCol: {
    span: 2
  },
  wrapperCol: {
    span: 22
  }
}
// 安装方式必须为人工的资产类型
const INSTALLTYPE_MUST_IS_MANUAL_TYPE = [STORAGE_DEVICE, NETWORK_DEVICE, OTHER_DEVICE, SAFETY_DEVICE].map(e=>e.value)
// 限定字符数量的表单规则
const maxChartsRules = [{ max: 30, message: '最大30字符' }]
const serviceLife = moment('2049-12-31')
const floatNumberMsg = '格式错误, 请输入0-9999999的2位小数'
const fields2 = [
  { name: '描述', key: 'describle', type: 'textArea', rules: [{ max: 300, message: '最大300字符' }] }
]
/**
 * 维护信息
 * @param isSelectedTenplate: { Boolean } 是否已经选择了模板，关系到安装方式的默认值和是否被禁用
 */
class Maintenance extends Component {
  constructor (props){
    super(props)
    this.state = {
      groupList: []
    }
    this.isInitValue = true
  }
  componentDidMount () {
    this.getGroupList()
    const { action, data } = this.props
    action === 'CHANGE' && this.setFieldsValue(data)
  }
  UNSAFE_componentWillReceiveProps (nextProps, nextContext) {
    const { action, data } = nextProps
    if(JSON.stringify(this.props.data) !== JSON.stringify(nextProps.data) && action === 'CHANGE'){
      this.isInitValue = true
      this.setFieldsValue(data)
    }
  }

  /**
   * 给字段赋值
   */
  setFieldsValue = (data = {}) => {
    if(!this.isInitValue){
      return
    }
    const { form } = this.props
    const fields = this.generateFields()
    const values = {}
    fields.forEach((field, i)=>{
      const { key, type } = field
      if(key === 'assetGroups'){
        values[key] = (data[key] || []).map(e=>e.stringId)
      }else  if(key === 'isWireless'){
        values[key] = data[key] === 1 ? '1' : '0'
      }else if(key === 'serviceLife'){
        // 到期时间默认选择
        values[key] = data[key] ? moment(data[key]) : serviceLife
      } else if(type === 'date' && key !== 'serviceLife'){
        values[key] = data[key] ? moment(data[key]) : null
      }else {
        values[key] = data[key] === null ? undefined : data[key]
      }
    })
    const describle = fields2[0]
    this.isInitValue = false
    form.setFieldsValue({ ...values, describle: data[describle.key] })
  }
  // 获取资产组
  getGroupList = () => {
    api.getGroupInfo().then((res)=>{
      this.setState({ groupList: res.body })
      this.props.getAssetGroup(res.body)
    })
  }
  /**
   * 自定义验证数字的最大值和最小值
   * @param rule 验证规则
   * @param value 值
   * @param callback 验证完成回调，此回调必须要用
   * @param min 最小值
   * @param max 最大值
   */
  validatorMinAndMax = (rule, value, callback, min = 0, max = 9999999) => {
    if (!value) {
      callback()
    }
    const _value = Number(value)
    if (isNaN(_value) || !(rule.pattern && rule.pattern.test(value)) || _value < min || _value > max){
      callback('')
    }
    callback()
  }
  // 禁用购买时间
  disabledBuyDate = (momentDate) => {
    // 未来时间
    const isFuture = momentDate.isAfter(moment(), 'day')
    if(isFuture){
      return true
    }
    const { form } = this.props
    const serviceLife = form.getFieldValue('serviceLife')
    if(!serviceLife){
      return false
    }
    return momentDate >= serviceLife
  }
  // 禁用到期服务日期
  disabledServiceLifeDate = (momentDate) => {
    const { form } = this.props
    const buyDate = form.getFieldValue('buyDate')
    if(!buyDate){
      return false
    }
    return momentDate < buyDate
  }
  /**
   * 自定义验证数字的0-9999999.00(包含2位小数)
   * @param rule 验证规则
   * @param value 值
   * @param callback 验证完成回调，此回调必须要用
   * @param min 最小值
   * @param max 最大值
   */
  validatorFloatMinAndMax = (rule, value, callback, min = 0, max = 9999999) => {
    if(!value){
      callback()
      return
    }
    const _value = parseFloat(value)
    if(rule.pattern && !rule.pattern.test(value) || _value > max || _value < min){
      callback('')
      return
    }
    callback()
  }
  // 作用于dram大小、ncrm大小、cpu大小、flash大小
  // 特殊的0-9999999.00的包含2位小数的验证
  floatNumberValidator = [
    { pattern: regExp.sevenNumberTwoFloatPattern, validator: (rule, value, callback) => { this.validatorFloatMinAndMax(rule, value, callback) }, message: floatNumberMsg }]
  generateFields = () => {
    const { groupList } = this.state
    const { categoryModel, isSelectedTenplate, isLandEquipment } = this.props
    let disabled = false
    let defaultValue = AUTO.value
    // 如果选择模板，并且资产类型是非计算设备时
    if(INSTALLTYPE_MUST_IS_MANUAL_TYPE.includes(categoryModel) && isSelectedTenplate){
      disabled = true
      defaultValue = MANUAL.value
    }
    if(isLandEquipment === true){
      disabled = true
      defaultValue = MANUAL.value
    }
    const fields = [
      { name: '序列号', key: 'serial', type: 'input', rules: maxChartsRules },
      { name: '机房位置', key: 'houseLocation', type: 'input', rules: maxChartsRules },
      { name: '物理位置', key: 'houseLocation1', type: 'input', rules: maxChartsRules },
      { name: '资产组', key: 'assetGroups', mode: 'multiple', type: 'select', data: groupList, config: { name: 'value', value: 'id' } },
      { name: '维护方式', key: 'installType', type: 'select', disabled, data: MAINTENANCE_TYPE, defaultValue },
      { name: '购买日期', key: 'buyDate', type: 'date', disabledDate: (cur)=> this.disabledBuyDate(cur), onChange: this.buyDateChange },
      { name: '保修期', key: 'warranty', type: 'input', rules: maxChartsRules },
      { name: '到期时间', key: 'serviceLife', type: 'date', disabledDate: (cur)=> this.disabledServiceLifeDate(cur), allowClear: false, defaultValue: serviceLife },
      { name: '接口数目',
        key: 'interfaceSize',
        type: 'input',
        rules: [
          { pattern: regExp.exportValuePattern, validator: (rule, value, callback)=>{ this.validatorMinAndMax(rule, value, callback, 0, 127) }, message: '格式错误, 请输入0-127整数' }
        ],
        shows: [ NETWORK_DEVICE.value ]
      },
      { name: '固件版本', key: 'firmwareVersion', rules: maxChartsRules, type: 'input', shows: [ NETWORK_DEVICE.value ] },
      { name: '子网掩码',
        key: 'subnetMask',
        type: 'input',
        rules: [ { pattern: regExp.ipRegex, message: '请输入正确格式的子网掩码' }],
        shows: [ NETWORK_DEVICE.value ]
      },
      { name: '是否无线',
        key: 'isWireless',
        type: 'select',
        shows: [ NETWORK_DEVICE.value ],
        defaultValue: '0',
        data: [ { name: '是', value: '1' }, { name: '否', value: '0' } ]
      },
      { name: '外网IP',
        key: 'outerIp',
        type: 'input',
        rules: [ { pattern: regExp.ipRegex, message: '请输入正确格式的外网IP' }],
        shows: [ NETWORK_DEVICE.value ]
      },
      { name: 'dram大小',
        rules: [ ...this.floatNumberValidator ],
        key: 'dramSize',
        type: 'input',
        suffix: 'MB',
        shows: [ NETWORK_DEVICE.value ]
      },
      { name: '预计带宽',
        key: 'expectBandwidth',
        type: 'input',
        rules: [
          { pattern: regExp.exportValuePattern, validator: (rule, value, callback)=>{ this.validatorMinAndMax(rule, value, callback) }, message: '格式错误, 请输入0-9999999整数' }
        ],
        suffix: 'M',
        shows: [ NETWORK_DEVICE.value ]
      },
      { name: '配置寄存器',
        rules: [
          { pattern: regExp.exportValuePattern, validator: (rule, value, callback)=>{ this.validatorMinAndMax(rule, value, callback) }, message: '格式错误, 请输入0-9999999整数' }
        ],
        key: 'register',
        type: 'input',
        shows: [ NETWORK_DEVICE.value ]
      },
      { name: 'ncrm大小',
        rules: [ ...this.floatNumberValidator ],
        key: 'ncrmSize',
        type: 'input',
        suffix: 'MB',
        shows: [ NETWORK_DEVICE.value ]
      },
      { name: 'cpu(版本)',
        key: 'cpuVersion',
        rules: maxChartsRules,
        type: 'input',
        shows: [ NETWORK_DEVICE.value ] },
      { name: 'cpu大小',
        rules: [ ...this.floatNumberValidator ],
        key: 'cpuSize',
        type: 'input',
        shows: [ NETWORK_DEVICE.value ] },
      { name: 'flash大小',
        rules: [ ...this.floatNumberValidator ],
        suffix: 'MB',
        key: 'flashSize',
        type: 'input',
        shows: [ NETWORK_DEVICE.value ] },
      { name: 'IOS',
        key: 'ios',
        rules: maxChartsRules,
        type: 'input',
        shows: [ NETWORK_DEVICE.value ]
      },
      { name: '单机磁盘数', key: 'diskNumber', type: 'number', min: 0, step: 1, precision: 0, rules: [
        { pattern: regExp.exportValuePattern, validator: (rule, value, callback)=>{ this.validatorMinAndMax(rule, value, callback) }, message: '格式错误, 请输入0-9999999整数' }
      ], shows: [ STORAGE_DEVICE.value ] },
      { name: '高速缓存',
        key: 'highCache',
        type: 'input',
        rules: maxChartsRules,
        shows: [ STORAGE_DEVICE.value ] },
      { name: '内置接口',
        key: 'innerInterface',
        rules: maxChartsRules,
        type: 'input',
        shows: [ STORAGE_DEVICE.value ]
      },
      { name: 'RAID支持', key: 'raidSupport', type: 'select', data: [{ name: '是', value: '是' }, { name: '否', value: '否' }], shows: [ STORAGE_DEVICE.value ] },
      { name: '平均传输率',
        key: 'averageTransferRate',
        rules: maxChartsRules,
        type: 'input',
        shows: [ STORAGE_DEVICE.value ]
      },
      { name: '固件',
        key: 'firmwareVersion',
        type: 'input',
        rules: maxChartsRules,
        shows: [ STORAGE_DEVICE.value ]
      },
      { name: 'OS版本',
        key: 'osVersion',
        type: 'input',
        rules: maxChartsRules,
        shows: [ STORAGE_DEVICE.value ]
      },
      { name: '驱动器数量', key: 'driverNumber', min: 0, step: 1, precision: 0,
        rules: [
          { pattern: regExp.exportValuePattern, validator: (rule, value, callback)=>{ this.validatorMinAndMax(rule, value, callback) }, message: '格式错误, 请输入0-9999999整数' }
        ]
        , type: 'number', shows: [ STORAGE_DEVICE.value ] }
    ]
    return fields.filter(e=>{
      return e.shows ? e.shows.includes(parseInt(categoryModel, 10)) : true
    })
  }
  render () {
    const fields = this.generateFields()
    const { form, Item } = this.props
    return (
      <div className="asset-maintenance-info">
        <CommonForm
          column={4}
          fields={fields}
          form={form}
          FormItem={Item}
          formLayout={formLayout}
        />
        <CommonForm
          column={1}
          fields={fields2}
          form={form}
          FormItem={Item}
          formLayout={formLayout2}
        />
      </div>
    )
  }
}

export default connect(({ staticAsset }) => ({
  isLandEquipment: staticAsset.isLandEquipment
}))(Maintenance)
