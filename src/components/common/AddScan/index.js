import { Component } from 'react'
import { Form, Row, Col, Select, Input, Button } from 'antd'
import './index.less'
import RelationAlert from '@/components/BaseSetting/RelationAlert'
import SoftList from '@/components/common/SoftModal'

const { Item } = Form
const { Option } = Select

export default class SettingRegisterFooter extends Component {
  constructor (props) {
    super(props)
    this.state = {
      list: [],
      handle: true,
      config: props.config,
      num: undefined,
      serveListn: false,
      configAlertShow: false,
      softAlertShow: false,
      checkKey: '',
      showText: false
    }
    this.elIndex = 0
    this.checkType = []
  }
  //渲染组件
  renderItem = (item, key) => {
    let el
    let { isScan, isChange, value } = this.props
    let { showText } = this.state
    if(isChange && key.includes('scanStatus')){
      let index = key.split('_')[2]
      let len = value && value.length
      // 变更时 基准项等于X 变更内容只有删除/变更
      if(len && value[index - len - 1] !== undefined){
        let idx = index - len - 1
        if(value[idx].scanType === 0 && value[idx].scanVerifi === 0){
          item.data = [{ name: '删除', value: 1 }, { name: '变更', value: 2 }]
        }else if(value[idx].scanType === 0 && value[idx].scanVerifi === 1){
          // 变更时 基准项不等于X 变更内容只有新增
          item.data = [{ name: '新增', value: 0 }]
        }else{
          item.data = [{ name: '新增', value: 0 }, { name: '删除', value: 1 }, { name: '变更', value: 2 }]
        }
      }
    }
    switch (true) {
      case item.type === 'select':
        el = (
          <Select
            placeholder={'请选择'}
            defaultActiveFirstOption={false}
            filterOption={false}
            notFoundContent={false}
            onSelect={(v, opt) => this.setKey(v, opt, key)}
            getPopupContainer={triggerNode => triggerNode.parentNode}
            allowClear
            disabled={ isScan ? (isChange && key.includes('scanStatus') ? false : true) : false }
          >
            {
              item.data.map((opt, i) => {
                return (
                  <Option value={opt.value} key={opt.value} label={opt.name} ids={opt.value}>{opt.name}</Option>
                )
              })
            }
          </Select>
        )
        break
      case item.type === 'input':
        el = <Input placeholder={ showText ? '请选择需要变更为...' : '请点击选择基准项/黑名单/白名单' } autoComplete='off' disabled={ isScan ? (isChange && key.includes('scanContent') ? false : true) : false } onClick={(v)=>this.checkAlert(v, key)} readOnly style={{ cursor: isScan ? ( isChange && key.includes('scanContent') ? 'pointer' : 'not-allowed') : 'pointer' }}/>
        break
      default:
        el = <Input placeholder="" autoComplete='off' hidden style={{ width: 0 }}/>
        break
    }
    return el
  }
  setKey = (v, opt, key) => {
    let { isChange } = this.props
    let index = key.split('_')[2]
    if(key.includes('scanType') || (key.includes('scanStatus'))){
      this.setState({
        checkKey: key
      })
      if(this.checkType[index] === undefined){
        this.checkType.push(v)
      }
      else this.checkType.splice(index, 0, v)
    }
    if(isChange)
      this.changeAlert(v, key)
  }
  checkAlert =(v, key)=>{
    let { isScan, isChange } = this.props
    let index = key.split('_')[2]
    if(isChange)
      this.changeAlert(v, key)
    if(!isScan && this.checkType.length){
      if(this.checkType[index] === 0){
        this.setState({
          configAlertShow: true
        })
      }else{
        this.setState({
          softAlertShow: true
        })
      }
    }
  }
  changeAlert=(v, key)=>{
    let index = key.split('_')[2]
    let { value, form, isChange, statusChange } = this.props
    if(value && value.length && isChange){
      let len = value && value.length
      let idx = index - len - 1
      if(key.includes('scanStatus')){
        statusChange(true)
        let checked = key.split('_')[0] + '_scanContent_' + key.split('_')[2]
        if (v === 2) {
          this.setState({
            showText: true
          })
          form.setFieldsValue({ [checked]: '' })
        } else if (v !== 2) {
          this.setState({
            showText: false
          })
          form.setFieldsValue({ [checked]: value[idx].scanContent })
        }
      } else if (key.includes('scanContent')) {
        let scanStatusKey = key.split('_')[0] + '_scanStatus_' + key.split('_')[2]
        let scanStatus = form.getFieldsValue([scanStatusKey])
        if(scanStatus[scanStatusKey] === 2)
          if(value[idx].scanType === 0)
            this.statusChange(true)
          else this.setState({
            softAlertShow: true
          })
      }
    }
  }
  statusChange = (isShow)=>{
    this.setState({
      configAlertShow: isShow
    })
  }
  //点击添加
  elAdd = (obs, idx = 1, field) => {
    const list = [].concat(this.state.list)
    list.push(this.each(2, obs))
    this.elIndex += 1
    this.setState({
      list
    })
  }
  //编列key
  each = (n, item) => {
    const { field, isChange } = this.props
    let index = isChange ? 6 : 5
    let _item = JSON.parse(JSON.stringify(item))
    for (let i = 0; i < index; i++) {
      _item[i].key = `${field}_${_item[i].key}_${this.elIndex}`
    }
    // console.log(_item)
    return _item
  }
  //点击删除
  elRemove = (index, field) => {
    let { list } = this.state
    if (list.length) {
      this.setState({ list: list.filter((el, i) => i !== index) })
      this.checkType.filter((el, i) => i !== index)
    }
  }
  //遍历匹配的key,赋予默认值
  eachKey = () => {
    //挂载在组件的数据
    let { value } = this.props
    let { config } = this.state
    let init = []
    for (let now of value) {
      const arr = Object.keys(now)
      init.push(config.map(item => {
        //找到匹配的字段
        let res = arr.filter(n => n === item.key)[0]
        //避免同一stack
        let items = JSON.parse(JSON.stringify(item))
        items.value = res === 'configId' && now.softId ? now['softId'] : now[res]
        return items
      }))
    }
    init = init.map(item => {
      let init = this.each(2, item)
      this.elIndex += 1
      return init
    })
    this.setState({
      list: init
    }, ()=>{
      this.setState({
        handle: false
      })
    })
  }
  check = (nowKey, key) => {
    let checked = nowKey.split('_')[0] + '_' + key + '_' + nowKey.split('_')[2]
    const { form } = this.props
    let ob = form.getFieldsValue([checked])
    if (ob[checked] !== undefined && ob[checked] !== null) {
      return true
    }
    return false
  }
  saveAlerts = (object) => {
    let { checkKey } = this.state
    let key = checkKey.split('_')[0] + '_scanContent_' + checkKey.split('_')[2]
    let key_id = checkKey.split('_')[0] + '_configId_' + checkKey.split('_')[2]
    let defineValue = checkKey.split('_')[0] + '_defineValue_' + checkKey.split('_')[2]
    this.setState({
      softAlertShow: false,
      configAlertShow: false
    })
    const { form } = this.props
    let name = ''
    if(object.ruleId){
      name = object.name + '/' + object.ruleId + '/' + (object.defineValue || '--')
    }else{
      name = object.manufacturer + '/' + object.softwareName + '/' + (object.edition || '--')
    }
    form.setFieldsValue({ [key]: name, [key_id]: object.stringId, [defineValue]: object.defineValue })
  }
  closeAlerts = ()=>{
    this.setState({
      softAlertShow: false,
      configAlertShow: false
    })
  }
  componentDidMount () {
    if (sessionStorage.service)
      sessionStorage.removeItem('service')
    let { config } = this.props
    this.elAdd(config, 0)
  }
  componentWillUnmount () {
    sessionStorage.removeItem('service')
  }
  render () {
    let { list, config, configAlertShow, softAlertShow } = this.state
    const { value, title, form, field, isScan, os, isChange } = this.props
    const { getFieldDecorator } = form
    // 有数据时
    if (value && value.length && this.state.handle) {
      this.eachKey()
    }
    return (
      <div className="condition-create">
        <div className="header-title">
          <div>{title}</div>
          {isScan ? null : <div>
            <Button type="link" icon='plus' onClick={() => this.elAdd(config, 1, field)}>新增</Button>
          </div>}
        </div>
        {
          list.length ? <Row>
            {
              list.map((item, n) => {
                return (
                  <div className="create-form-item" key={n} data-indexs={n}>
                    {
                      item.map((now, i) =>
                        <Col span={ now.type ? 7 : 1 } key={i}>
                          <Item label={''}>
                            {getFieldDecorator(now.key,
                              {
                                initialValue: now.value, rules: [{
                                  required: this.check(now.key, now.required), message: now.message
                                }]
                              })(
                              this.renderItem(now, now.key)
                            )}
                          </Item>
                        </Col>
                      )
                    }
                    {
                      !isScan && list.length > 1 ? (
                        <Col span={2}><div className="Item-footer-delete">
                          <Button type="link" icon='minus' onClick={() => this.elRemove(n, field)}>删除</Button>
                        </div></Col>
                      )
                        : null
                    }
                  </div>
                )
              })
            }
          </Row> : null
        }
        {/* 基准项信息 */}
        <RelationAlert
          visible={configAlertShow}
          removeBusinessIds={[]}
          os={os || ''}
          showSingle={true}
          isChange={isChange}
          saveAlerts={this.saveAlerts}
          closeAlerts={this.closeAlerts} />
        <SoftList
          os={os || ''}
          removeBusinessIds={[]}
          visible={softAlertShow}
          isChange={isChange}
          showSingle={true}
          saveAlerts={this.saveAlerts}
          closeAlerts={this.closeAlerts} />
      </div>
    )
  }
}