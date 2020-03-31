import { Component } from 'react'
import { Button, message } from 'antd'
import CommonForm from '@c/common/Form'
import api from '@/services/api'
import './index.less'

const formLayout = {
  labelCol: {
    span: 8
  },
  wrapperCol: {
    span: 16
  }
}
// const sourceRegister = 'register' // 正常登记来源
const sourceAppear = 'appear' // 上报来源
const SAFETY_CHECK = { name: '安全检查', value: 'safetyCheck', flowNodeTag: 'safety_check', flowId: 3 }
const TEMPLATE_IMPLEMENT = { name: '模板实施', value: 'templateImplement', flowNodeTag: 'template_implement', flowId: 3 }
const CONFIG_BASE = { name: '基准配置', value: 'configBase', flowNodeTag: 'config_base', flowId: 4 }
const CHECK_TEMPLATE = { name: '配置装机模板审核', value: 'InstallTemplateCheck', flowNodeTag: 'check_template', flowId: 5 }

/**
 * @param defaultValue { * } 下一步骤的默认选项值
 * @param nextStep { Array } [{ name, value }] 下一步骤的选项
 * @param source { String } register | appear
 *                register 可以选择下一步骤
 *                appear 不能选择下一步骤， 并且下一步骤的默认选项 为 defaultValue
 * @param nextOperatorList {Array} [ { name, value }] 下一步骤执行人列表
 * @param onSubmit {Function}  提交回调
 * @param form {Function}  父级的form
 * @param Item {Function}  父级的FormItem
 * @param nextKey {String}  下一步执行步骤的key
 * @param nextExecutorKey {String}  下一步执行步骤执行人的key
 * @param areaId {String}  区域ID， 获取下一步执人的区域
 * @param needAreaID {Boolean}  是否必须要资产区域ID才能进行下一步选择
 * @param hasFields {Array}  []， 获取下一步执人的区域
 */
export default class Operation extends Component {
  static defaultProps = {
    nextExecutorKey: 'nextExecutor',
    nextKey: 'nextStep',
    needAreaID: false,
    isGetUser: true // 获取下一步执行人
  }
  constructor (props) {
    super(props)
    this.state = {
      nextOperatorList: [],
      selectNextStep: {},
      nextStep: [{ name: '请选择', value: null }, SAFETY_CHECK, TEMPLATE_IMPLEMENT]
    }
  }
  componentDidMount () {
    this.initSelect(this.props)
  }

  UNSAFE_componentWillReceiveProps (nextProps, nextContext) {
    const { defaultValue: nextDefaultValue, areaId, needAreaID, isGetUser, hasFields } = nextProps
    const { defaultValue, areaId: thisPropsAreaId, nextExecutorKey, nextKey, form } = this.props
    if(nextDefaultValue !== defaultValue && nextDefaultValue){
      this.initSelect(nextProps)
    }
    const _hasFields = hasFields || [nextKey, nextExecutorKey]
    // 不显示下一步执行人时，清除选择的数据及列表
    if(!_hasFields.length){
      this.setState({ selectNextStep: {}, nextOperatorList: [] })
    }
    const _thisPropsAreaId = thisPropsAreaId || []
    const _areaId = areaId || []
    const { selectNextStep } = this.state
    const selectUser = form.getFieldValue(nextExecutorKey)
    // 已经选择下一步执行人之后，再变更资产归属区域时，这进行提示，并且清除选择的下一步执行人
    if(selectNextStep.value && needAreaID && _thisPropsAreaId[0] !== _areaId[0] && isGetUser){
      setTimeout(()=>{
        _areaId[0] && this.selectNextStep(selectNextStep.value)
        if(selectUser && selectUser !== 'all'){
          message.info('资产归属区域变更，请重新选择下一步骤执行人')
          form.resetFields([nextExecutorKey])
        }
      })
    }
  }
  /**
   * 初始选择
   * @param props
   */
  initSelect = (props = {}) => {
    const { source, areaId, defaultValue, isGetUser } = props
    let selectNextStep = void 0
    if (source === sourceAppear && isGetUser) {
      if(defaultValue === SAFETY_CHECK.value){
        selectNextStep = SAFETY_CHECK
      }else if(defaultValue === TEMPLATE_IMPLEMENT.value){
        selectNextStep = TEMPLATE_IMPLEMENT
      }else if(defaultValue === CHECK_TEMPLATE.value){
        selectNextStep = CHECK_TEMPLATE
      }else if(defaultValue === CONFIG_BASE.value){
        selectNextStep = CONFIG_BASE
      }
      if(selectNextStep){
        this.getNextUser({ areaId, flowNodeTag: selectNextStep.flowNodeTag, flowId: selectNextStep.flowId })
        this.setState({ selectNextStep })
      }
    }
  }

  getNextUser = (params) => {
    api.getUsersByRoleCodeAndAreaId(params).then(res => {
      this.setState({ nextOperatorList: res.body })
      // 重新下一步骤时，重新选择人员
      setTimeout(() => {
        const { form, nextExecutorKey, data = {} } = this.props
        const value = data[nextExecutorKey] ? data[nextExecutorKey] : 'all'
        form.setFieldsValue({ [nextExecutorKey]: value })
      }, 0)
    })
  }
  onSubmit = (e) => {
    const { onSubmit, form, nextKey, nextExecutorKey } = this.props
    e.preventDefault()
    form.validateFields((err, values) => {
      const value = { memo: values.memo, [nextKey]: values[nextKey], [nextExecutorKey]: values[nextExecutorKey] }
      if (value[nextExecutorKey] === 'all') {
        const { nextOperatorList } = this.state
        value[nextExecutorKey] = nextOperatorList.map(e => e.stringId)
      } else {
        value[nextExecutorKey] = [values[nextExecutorKey]]
      }
      onSubmit && onSubmit(value)
    })
  }
  /**
   * 选择下一步
   * @param value
   */
  selectNextStep = (value) => {
    const { areaId, needAreaID, nextKey } = this.props
    if(needAreaID && (!areaId || !areaId.length)){
      message.info('请选择资产归属区域！')
      setTimeout(()=>{
        this.props.form.resetFields([nextKey])
      })
      return
    }
    let selectNextStep = {}
    // 下一步为安全检查时
    if (value === SAFETY_CHECK.value) {
      selectNextStep = SAFETY_CHECK
      this.getNextUser({ areaId, flowNodeTag: SAFETY_CHECK.flowNodeTag, flowId: SAFETY_CHECK.flowId })
    } else if (value === TEMPLATE_IMPLEMENT.value) { // 下一步为模板实施时
      selectNextStep = TEMPLATE_IMPLEMENT
      this.getNextUser({ areaId, flowNodeTag: TEMPLATE_IMPLEMENT.flowNodeTag, flowId: TEMPLATE_IMPLEMENT.flowId })
    } else if (value === CHECK_TEMPLATE.value) { // 下一步为模板审核时
      selectNextStep = CHECK_TEMPLATE
      this.getNextUser({ areaId, flowNodeTag: CHECK_TEMPLATE.flowNodeTag, flowId: CHECK_TEMPLATE.flowId })
    }
    this.setState({ selectNextStep })
  }
  render () {
    const { form, Item, source, nextStep, defaultValue, nextOperatorList, nextKey, nextExecutorKey, hasFields, type } = this.props
    const { nextOperatorList: list, nextStep: defaultNextStep } = this.state
    const _hasFields = hasFields || [nextKey, nextExecutorKey]

    const fields = [
      {
        name: type === 'installTemplate' ? '下一步骤' : '审批人',
        key: nextKey,
        type: 'select',
        show: _hasFields.includes(nextKey),
        defaultValue: source === sourceAppear ? defaultValue : void 0,
        disabled: source === sourceAppear,
        data: nextStep || defaultNextStep,
        onSelect: (value, option) => this.selectNextStep(value, option),
        rules: [{ required: true, message: '请选择下一执行步骤' }]
      },
      {
        name: type === 'installTemplate' ? '下一步执行人' : '准入执行人',
        key: nextExecutorKey,
        type: 'select',
        showSearch: true,
        show: _hasFields.includes(nextExecutorKey),
        config: { name: 'name', value: 'stringId' },
        data: nextOperatorList || [{ name: '全部', stringId: 'all' }].concat(list),
        rules: [{ required: true, message: '请选择下一步执行人' }]
      },
      {
        name: '备注',
        key: 'memo',
        show: _hasFields.includes('memo'),
        rules: [{ max: 300, message: '最多输入300字符' }],
        type: 'input'
      }
    ].filter(e => e.show)
    return (
      <div className="asset-register-operation">
        <div className="asset-register-operation-next">
          <CommonForm
            column={fields.length}
            fields={fields}
            form={form}
            FormItem={Item}
            formLayout={formLayout}
          />
        </div>
        <div className="asset-register-operation-submit">
          <Button type='primary' onClick={this.onSubmit}>提交</Button>
        </div>
      </div>
    )
  }
}
