import { Component } from 'react'
import { Divider } from 'antd'
import CustomForm from '@c/common/Form'
import api from '@/services/api'
import IPAndMac from '../IPAndMac/IPAndMac'
import BusineAndImpact from '../BusineAndImpact'
import PortAndIp from '../../AssetCommon/PortAndIp'
import * as regExp from '@/utils/regExp'
import { connect } from 'dva'
import { MANUAL_REGISTER, HARD_ASSET_TYPE, COMPUTING_DEVICE, STORAGE_DEVICE, NETWORK_DEVICE, SAFETY_DEVICE, ASSETS_IMPORTANT, OTHER_DEVICE } from '@a/js/enume'
import './index.less'

const formLayout = {
  labelCol: {
    span: 6
  },
  wrapperCol: {
    span: 17
  }
}
const APPEAR = 'appear' // 变更操作类型
const ACTION_CHANGE = 'CHANGE' // 变更操作类型
const ACTION_REGISTER = 'REGISTER' // 登记操作类型
/**
 * @param onChangeType{Function} 类型变更的回调函数
 */
class AssetRegisterBaseInfo extends Component {
  constructor (props) {
    super(props)
    this.isInit = true
    this.state = {
      defaultDisabled: props.source === APPEAR, // 再次登记上报资产时，ip和mac有数据时是默认禁用
      manufacturer: '', // 选择的厂商
      name: '', // 选择的名称
      nameList: [], // 资产名称下拉选项
      userInAssetList: [], // 使用者列表
      OSList: [], // 操作系统
      userAreaTree: [], // 使用者列表
      SupplierList: [] // 使用者列表
    }
    this.fieldsValues = { categoryModel: parseInt(props.categoryModel, 10) || COMPUTING_DEVICE.value }
    this.IpAndMacResetKey = 0
  }
  static defaultProps ={
    action: 'CHANGE' //操作类型  change-变更（部分字段不可修改） register-登记（所有字段均可修改）
  }

  componentDidMount () {
    this.getUserInAsset()
    this.getAssetsOS()
    this.getUserAreaTree()
    this.getSupplierList()
  }
  UNSAFE_componentWillReceiveProps (nextProps, nextContext) {
    if(JSON.stringify(nextProps.data) !== JSON.stringify(this.props.data)){
      this.fieldsValues.categoryModel = parseInt(nextProps.data.categoryModel, 10)
      this.fieldsValues.manufacturer = nextProps.data.manufacturer
      this.fieldsValues.name = nextProps.data.name
      this.setFieldsValue(nextProps.data || {})
    }
  }

  // 获取使用者下拉列表数据
  getUserInAsset= ()=>{
    api.getUserInAsset().then((res)=>{
      this.setState({ userInAssetList: res.body })
    })
  }
  /**
   * 获取操作系统下拉选项, 搜索 productName 的模糊匹配操作系统
   * @param productName{String}输入查询操作系统的名称
   */
  getAssetsOS= (productName)=>{
    api.getAssetsOS({ productName }).then((res)=>{
      this.setState({ OSList: res.body })
    })
  }
  /**
   * 获取当前用户的区域选择树
   */
  getUserAreaTree= (productName)=>{
    api.getUserAreaTree({ productName }).then((res)=>{
      this.setState({ userAreaTree: res.body ? [ res.body ] : [] })
    })
  }
  /**
   * 获取厂商下拉列表
   * @param supplier{{supplier: *}} 搜索的厂商名称
   */
  getSupplierList= (supplier)=>{
    api.getSupplierList({ supplier }).then((res)=>{
      this.setState({ SupplierList: res.body.map(e=>({ name: e, value: e })) })
    })
  }
  /**
   * 获取名称下拉列表
   * @param name{{supplier: *}} 搜索的名称名称
   */
  getNameList= (name)=>{
    const { manufacturer: supplier } = this.fieldsValues
    api.getNameList({ supplier, name }).then((res)=>{
      this.setState({ nameList: res.body.map(e=>({ name: e, value: e })) })
    })
  }
  /**
   * 获取版本下拉列表
   * @param version{{supplier: *}} 搜索的版本名称
   */
  getVersionList= (version)=>{
    const { manufacturer: supplier, name } = this.fieldsValues
    api.getVersionList({ supplier, name, version }).then((res)=>{
      this.setState({ versionList: res.body })
    })
  }
  /**
   * @method onChange 任何字段变更后都会回调
   * @param obj
   */
  onChange = (obj) => {
    const { onChange, register } = this.props
    // 资产类型改变了，回显通用的数据，没有的则为空
    if(obj.categoryModel && obj.categoryModel !== this.fieldsValues.categoryModel){
      this.isInit = true
      if(register === 'new'){
        this.fieldsValues = { ...obj }
      }
    }
    this.fieldsValues = { ...this.fieldsValues, ...obj }
    // 向父级传递最新的数据
    onChange && onChange(this.fieldsValues)
    this.setState({ count: Math.random() })
  }
  /**
   *  厂商、名称、版本选择
   * @param type{String} 值为 manufacturer || name|| version
   * @param obj{Object} 其值为 { manufacturer: * } || { name: String }|| { version: String }
   */
  onSelect = (type, obj) => {
    const { onChange, form } = this.props
    const { versionList } = this.state
    this.fieldsValues = { ...this.fieldsValues, ...obj }
    const name = void 0
    const version = void 0
    if(type === 'manufacturer'){
      // 查询名称
      this.getNameList()
      this.fieldsValues.name = name
      this.fieldsValues.version = version
      this.fieldsValues.businessId = null
      form.setFieldsValue({ name, version })
    }else if(type === 'name'){
      // 查询版本
      this.getVersionList()
      this.fieldsValues.version = version
      this.fieldsValues.businessId = null
      form.setFieldsValue({ version })
    } else if(type === 'version'){
      const findObj = versionList.find(e=>e.id === obj.version)
      // 暂不执行操作
      this.fieldsValues.businessId = findObj.id
      this.fieldsValues.version = findObj.value
    }
    // 向父级传递最新的数据
    onChange && onChange(this.fieldsValues)
  }
  /**
   * ip、mac任何改变都会调用该函数
   */
  IpOnchange = (ips = [], macs = []) => {
    const types = this.generateIncludesType()
    types.includes('ip') && (this.fieldsValues.ip = ips.map(({ value: ip, net }) => ({ ip, net })))
    types.includes('mac') && (this.fieldsValues.mac = macs.map(({ value: mac }) => ({ mac })))
    const { onChange } = this.props
    onChange && onChange(this.fieldsValues)
  }
  /**
   * 网口与IP的变更的回调
   */
  portAndIpOnchange = (portAndIpList = []) => {
    this.fieldsValues.ip = portAndIpList.map(({ value: ip, keyCount }) => ({ ip, net: keyCount }))
    const { onChange } = this.props
    onChange && onChange(this.fieldsValues)
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
    const _value = Number(value)
    if(!_value && !isNaN(_value)){
      callback()
      return
    }
    if (isNaN(_value) || rule.pattern && !rule.pattern.test(value) || _value < min || _value > max){
      callback('')
    }
    callback()
  }
  renderFields = () => {
    const { action, data = {}, retirement, source, register, dispatch } = this.props
    const { userInAssetList, OSList, userAreaTree, SupplierList, nameList, versionList } = this.state
    let actionFields = []
    const { manufacturer, name } = this.fieldsValues
    // 退役再次登记时，资产类型不可编辑
    if(action === ACTION_REGISTER && retirement){
      actionFields = [
        // 注意 此处的render 渲染的是资产类型对应的显示名字，但是提交获取的值仍然为 categoryModel
        { name: '资产类型', key: 'categoryModel', type: 'detail', defaultValue: data.categoryModel, render: ()=>{ return data.categoryModelName } },
        {
          name: '厂商',
          key: 'manufacturer',
          type: 'select',
          showSearch: true,
          popover: '格式是英文数字和符号组合',
          onSearch: this.getSupplierList,
          onChange: (value) => this.onSelect('manufacturer', { manufacturer: value }),
          data: SupplierList,
          rules: [ { required: true, message: '请选择！' } ]
        },
        {
          name: '名称',
          key: 'name',
          type: 'select',
          data: nameList,
          showSearch: true,
          disabled: typeof manufacturer === 'undefined',
          onSearch: this.getNameList,
          onChange: (value) => this.onSelect('name', { name: value }),
          rules: [ { required: true, message: '请选择！' } ]
        },
        {
          name: '版本',
          key: 'version',
          type: 'select',
          config: { name: 'value', value: 'id' },
          disabled: typeof manufacturer === 'undefined' || typeof name === 'undefined',
          data: versionList,
          showSearch: true,
          onChange: (value) => this.onSelect('version', { version: value }),
          rules: [ { required: true, message: '请选择！' } ]
        },
        {
          name: '资产编号',
          key: 'number',
          type: 'input',
          rules: [
            { required: true, max: 30, validator: this.onChangeValidator }
          ]
        }
      ]
    }else if(action === ACTION_CHANGE){
      actionFields = [
        // 注意 此处的render 渲染的是资产类型对应的显示名字，但是提交获取的值仍然为 categoryModel
        { name: '资产类型', key: 'categoryModel', type: 'detail', defaultValue: data.categoryModel, render: ()=>{ return data.categoryModelName } },
        { name: '厂商', key: 'manufacturer', type: 'detail', defaultValue: data.manufacturer, render: ()=>{return data.manufacturer } },
        { name: '名称', key: 'name', type: 'detail', defaultValue: data.name, render: ()=>{ return data.name } },
        { name: '版本', key: 'version', type: 'detail', defaultValue: data.version, render: ()=>{ return data.version } },
        { name: '资产编号', key: 'number', type: 'detail', defaultValue: data.number, render: ()=>{ return data.number } }
      ]
    }else if(action === ACTION_REGISTER) {
      let list = HARD_ASSET_TYPE
      // 上报资产，不能选择存储设置
      if(source === APPEAR){
        list = HARD_ASSET_TYPE.filter(e=>e.value !== STORAGE_DEVICE.value )
      }
      let categoryModel = { name: '资产类型', key: 'categoryModel', type: 'select', defaultValue: this.fieldsValues.categoryModel, data: list, rules: [ { required: true, message: '请选择！' } ] }
      // 再次登记时，不可切换资产类型
      if(register === 'again'){
        categoryModel = { name: '资产类型', key: 'categoryModel', type: 'detail', defaultValue: data.categoryModel, render: ()=>{ return data.categoryModelName } }
      }
      actionFields = [
        categoryModel,
        {
          name: '厂商',
          key: 'manufacturer',
          type: 'select',
          showSearch: true,
          popover: '格式是英文数字和符号组合',
          onSearch: this.getSupplierList,
          onChange: (value) => this.onSelect('manufacturer', { manufacturer: value }),
          data: SupplierList,
          rules: [ { required: true, message: '请选择！' } ]
        },
        {
          name: '名称',
          key: 'name',
          type: 'select',
          data: nameList,
          showSearch: true,
          disabled: typeof manufacturer === 'undefined',
          onSearch: this.getNameList,
          onChange: (value) => this.onSelect('name', { name: value }),
          rules: [ { required: true, message: '请选择！' } ]
        },
        {
          name: '版本',
          key: 'version',
          type: 'select',
          config: { name: 'value', value: 'id' },
          disabled: typeof manufacturer === 'undefined' || typeof name === 'undefined',
          data: versionList,
          showSearch: true,
          onChange: (value) => this.onSelect('version', { version: value }),
          rules: [ { required: true, message: '请选择！' } ]
        },
        {
          name: '资产编号',
          key: 'number',
          type: 'input',
          rules: [
            { required: true, max: 30, validator: this.onChangeValidator }

          ]
        }
      ]
    }
    const fields = [
      ...actionFields,
      { name: '资产来源', key: 'assetSourceName', type: 'detail', shows: ()=> !!data.stringId, defaultValue: data.assetSourceName, render: ()=>{ return data.assetSourceName } },
      {
        name: '操作系统',
        key: 'operationSystem',
        showSearch: true,
        data: OSList,
        onSearch: this.getAssetsOS,
        config: { name: 'value', value: 'id' },
        type: 'select',
        allowClear: COMPUTING_DEVICE.value !== this.fieldsValues.categoryModel, // 非必填时，允许删除
        shows: [ COMPUTING_DEVICE.value, SAFETY_DEVICE.value ],
        rules: [ { required: COMPUTING_DEVICE.value === this.fieldsValues.categoryModel, message: '请选择！' } ]
      },
      {
        name: '操作系统名称',
        key: 'operationSystemName',
        shows: [ COMPUTING_DEVICE.value, SAFETY_DEVICE.value ],
        type: 'hidden'
      },
      { name: '最大存储量', key: 'maximumStorage', type: 'input', suffix: 'MB', shows: [ STORAGE_DEVICE.value ],
        rules: [
          { required: true, message: '请输入！' },
          // { pattern: regExp.exportValuePattern, message: '格式错误, 请输入0-9999999整数' },
          { pattern: regExp.exportValuePattern, validator: (rule, value, callback)=>{ this.validatorMinAndMax(rule, value, callback) }, message: '格式错误, 请输入0-9999999整数' }
        ] },
      { name: '重要程度', key: 'importanceDegree', type: 'select', rules: [ { required: true, message: '请选择！' } ], data: ASSETS_IMPORTANT },
      {
        name: '归属区域',
        key: 'areaId',
        type: 'selectTree',
        data: userAreaTree,
        config: { name: 'fullName', value: 'stringId', selectable: 'rootNode' },
        rules: [ { required: true, message: '请选择！' } ]
      },
      {
        name: '使用者',
        key: 'responsibleUserId',
        data: userInAssetList,
        config: { name: 'value', value: 'id' },
        type: 'select',
        rules: [ { required: true, message: '请选择！' } ]
      },
      {
        name: '是否孤岛设备',
        key: 'isLandEquipment',
        showSearch: true,
        data: [{ id: 1, value: '是' }, { id: 2, value: '否' }],
        // onSearch: this.getAssetsOS,
        config: { name: 'value', value: 'id' },
        type: 'select',
        // allowClear: COMPUTING_DEVICE.value !== this.fieldsValues.categoryModel, // 非必填时，允许删除
        shows: [ COMPUTING_DEVICE.value ],
        onChange: val=> dispatch({ type: 'staticAsset/save', payload: { isLandEquipment: val === 1 ? true : false } }),
        rules: [ { required: true, message: '请选择！' } ]
      },
      // {
      //   name: '从属业务',
      //   key: 'operationSystem2',
      //   showSearch: true,
      //   data: [{ id: 1, value: '支付' }, { id: 2, value: '语音' }, { id: 3, value: '视屏' }],
      //   // onSearch: this.getAssetsOS,
      //   config: { name: 'value', value: 'id' },
      //   type: 'select',
      //   // allowClear: COMPUTING_DEVICE.value !== this.fieldsValues.categoryModel, // 非必填时，允许删除
      //   shows: [ COMPUTING_DEVICE.value ],
      //   rules: [ { required: COMPUTING_DEVICE.value === this.fieldsValues.categoryModel, message: '请选择！' } ]
      // }, {
      //   name: '业务影响',
      //   key: 'operationSystem3',
      //   showSearch: true,
      //   data: [{ id: 1, value: '高' }, { id: 2, value: '中' }, { id: 3, value: '低' }],
      //   // onSearch: this.getAssetsOS,
      //   config: { name: 'value', value: 'id' },
      //   type: 'select',
      //   // allowClear: COMPUTING_DEVICE.value !== this.fieldsValues.categoryModel, // 非必填时，允许删除
      //   shows: [ COMPUTING_DEVICE.value ],
      //   rules: [ { required: COMPUTING_DEVICE.value === this.fieldsValues.categoryModel, message: '请选择！' } ]
      // },
      {
        name: '软件版本',
        key: 'newVersion',
        type: 'input',
        maxLength: 30,
        shows: ()=>(SAFETY_DEVICE.value === this.fieldsValues.categoryModel && this.fieldsValues.manufacturer !== 'antiy'), // 安天自己的设备时，不需要添加软件版本
        rules: [
          { required: true, message: '请输入软件版本！' },
          ...this.generateRules(8, [{ pattern: regExp.versionFormat, message: '格式为x|xx.x|xx.x|xx，x为数字' }])
        ]
      }
    ]
    return fields.filter((e)=>{
      if(typeof e.shows === 'function'){
        return e.shows()
      }else if(typeof e.shows === 'undefined'){
        return true
      }else {
        return e.shows.includes(this.fieldsValues.categoryModel)
      }
    })
  }
  /**
   * 生成验证规则
   * @param max 最多字符数
   * @param rules {Array} 验证规则
   * @returns {*[]}
   */
  generateRules = (max = 30, rules = []) => {
    return [
      { max, message: `最多输入${max}字符！` },
      { whitespace: true, message: '不能为空字符！' },
      ...rules
    ]
  }
  /**
   * 对编号的验证是否重复
   * @param rule
   * @param value
   * @param callback
   */
  onChangeValidator = ( rule, value, callback) => {
    if(this.timer){
      clearTimeout(this.timer)
    }
    value = value || ''
    if(rule.max && value.length > rule.max){
      callback(`最多输入${rule.max}字符`)
    }else if(rule.required && !value.length){
      callback('请输入')
    }else {
      return new Promise(()=>{
        this.timer = setTimeout(()=>{
          const { stringId } = this.props.data || {}
          api.CheckRepeatNumber({ number: value, stringId }).then((res)=>{
            if(res.body){
              callback('该编号已经被其他设备占用')
            }else {
              callback()
            }
          }).catch(()=>{
            callback('服务器异常')
          })
        }, 800)
      })
    }
  }
  /**
   * 给字段赋值
   */
  setFieldsValue = (data) => {
    if(!this.isInit){
      return
    }
    const { form } = this.props
    const fields = this.renderFields()
    const keys = fields.filter(e=>e.type !== 'detail').map(e=>e.key)
    const values = {}
    keys.forEach((key)=>{
      values[key] = data[key]
    })
    this.isInit = false
    data.manufacturer && this.getNameList()
    data.manufacturer && data.name && this.getVersionList()
    form.setFieldsValue(values)
  }
  //计算设置时有IP和MAC同时存在网络设备只要MAC
  generateIncludesType = () => {
    return this.fieldsValues.categoryModel === NETWORK_DEVICE.value ? ['mac'] : ['ip', 'mac']
  }
  render () {
    const { Item, form, data, action, assetData } = this.props
    const { defaultDisabled } = this.state
    const fields = this.renderFields()
    const newFields = fields.map((el)=>{
      if(el.type === 'input'){
        return { ...el, onChange: (e)=>{
          this.onChange({ [el.key]: e.target.value })
        } }
      }
      else if(el.type === 'select'){
        return { ...el, onChange: el.onChange ? el.onChange : (key, option)=>{
          const obj = { [el.key]: key }
          if(el.key === 'operationSystem'){
            const operationSystemName = option ? option.props.label : null
            form.setFieldsValue({ operationSystemName })
            obj.operationSystemName = operationSystemName
          }
          this.onChange(obj)
        } }
      }
      else if(el.type === 'selectTree'){
        return { ...el, onChange: el.onSelect ? void 0 : (key, option)=>{
          const obj = { [el.key]: key }
          this.onChange(obj)
        } }
      }
      else {
        return el
      }
    })
    // 含有IP和MAC同时存在的设备型号
    const hasIpAndMac = [COMPUTING_DEVICE.value, SAFETY_DEVICE.value, NETWORK_DEVICE.value, OTHER_DEVICE.value ]
    // 含有 网口和IP同时存在的设备
    const hasPortAndIp = [NETWORK_DEVICE.value]
    const column = 3
    let resetKey = this.fieldsValues.categoryModel
    return (
      <div className="asset-base-info">
        <CustomForm container="form" fields={ newFields } column={ column } form={ form } FormItem={ Item } formLayout={ formLayout }/>
        { [COMPUTING_DEVICE.value].includes(this.fieldsValues.categoryModel) && (
          <div>
            <Divider dashed />
            <BusineAndImpact
              form={ form }
              FormItem={ Item }
              column={ column }
              formLayout={ formLayout }
            />
          </div>
        ) }

        { hasIpAndMac.includes(this.fieldsValues.categoryModel) && (
          <div>
            <Divider dashed />
            <IPAndMac
              disabled={ defaultDisabled && data.assetSource !== MANUAL_REGISTER.value}
              action={action}
              required={ this.fieldsValues.categoryModel !== OTHER_DEVICE.value }
              data={data}
              assetData={assetData}
              resetKey={resetKey}
              //计算设置时有IP和MAC同时存在网络设备只要MAC
              includesType={this.generateIncludesType()}
              onChange={this.IpOnchange}
              form={ form }
              FormItem={ Item }
              column={ column }
              formLayout={ formLayout }
            />
          </div>
        ) }
        {
          hasPortAndIp.includes(this.fieldsValues.categoryModel) && (
            <div>
              <Divider dashed />
              <PortAndIp resetKey={resetKey} action={action} maxCount={100} data={data} column={ column } form={ form } FormItem={ Item } formLayout={ formLayout } onChange={this.portAndIpOnchange}/>
            </div>
          )
        }
      </div>
    )
  }
}

export default connect()(AssetRegisterBaseInfo)

