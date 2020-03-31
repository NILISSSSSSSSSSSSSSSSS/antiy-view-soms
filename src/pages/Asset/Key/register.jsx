import { PureComponent, Fragment } from 'react'
import { Button, Input, Row, Col, Form, message, Select, DatePicker } from 'antd'
import api from '@/services/api'
import * as regExp from '@/utils/regExp'
import { throttle } from 'lodash'
import PropTypes from 'prop-types'
import { KEY_STATUS } from '@a/js/enume'
import moment from 'moment'

const FormItem = Form.Item
const { Option } = Select

@Form.create()
class AssetPersonnelIdentitysRegister extends PureComponent{
  state = {
    infoFrom: {},
    initStatus: this.props.initStatus ?  this.props.initStatus : {},
    modelState: this.props.model,
    handleState: 1,
    maxLength: 30 //验证最大长度
  }

  static defaultProps ={
    PrefixCls: 'AssetPersonnelIdentity'
  }

  static propTypes={
    PrefixCls: PropTypes.string.isRequired
  }

   // 禁止选择的月份
   disabledDate = (type, current) => {
     //  const { values } = this.state
     //  const { future, recentlyDay } = this.props
     //  // 禁用未来时间
     //  const isAfter = moment(current.format('YYYY-MM-DD') + ' 00:00:00').isAfter(moment(moment().format('YYYY-MM-DD') + ' 00:00:00'))
     //  if (isAfter && !future) {
     //    return isAfter
     //  }
     //  // 如果有recentlyDay（最近多少天），这recentlyDay之前都被禁用
     //  let recentlyDayDisabled = false
     //  if (typeof recentlyDay === 'number') {
     //    const now = moment(moment().format('YYYY-MM-DD') + ' 00:00:00').valueOf()
     //    const cur = moment(current.format('YYYY-MM-DD') + ' 00:00:00').valueOf()
     //    // 是否在近期多少天内
     //    recentlyDayDisabled = cur < (now - ((recentlyDay - 1) * 24 * 60 * 60 * 1000))
     //  }
     //  if (type === 'start') { // 不能选择比结束日期还晚的时间,同一天可选
     //    return values[1] ? (current.isSame(values[1], 'day') ? false : (current.isAfter(values[1]) || recentlyDayDisabled)) : (recentlyDayDisabled || false)
     //  } else { // 不能选择比开始日期还早的时间,同一天可选
     //    return values[0] ? (current.isSame(values[0], 'day') ? false : (current.isBefore(values[0]) || recentlyDayDisabled)) : (recentlyDayDisabled || false)
     //  }
   }

  onCancel = () => {
    this.props.form.resetFields()
    this.props.onCancel()
  }

  initData=()=>{
    const { modelState } = this.state
    const that = this
    switch(modelState){
      case (1):
        that.props.form.resetFields()
        break
      default:
        break
    }
  }

  //**接口开始 */
  //登记表单提交
  infoSubmit = throttle((e)=>{
    e.preventDefault()
    let _t = this
    let { modelState } = this.state
    this.props.form.validateFields((err, values) => {
      let { name, qq, email, departmentId, mobile, weixin, position, address, detailAddress } = values
      if (!err) {
        values = {
          name,
          qq,
          email,
          departmentId,
          mobile,
          weixin,
          //职位
          position,
          //住址
          address,
          //详细地址
          detailAddress
        }
        if(_t.props.initStatus)
          values.id = _t.props.initStatus.stringId
        //this.props.dispatch({ type: 'workOrder/add', payload: values })  无返回值调用方式
        //需要根据返回值进行相应的操作
        api[ modelState === 2 ? 'updateUser' : 'userAdd'](values).then(response => {
          // todo 处理成功 弹窗 处理失败
          if(response && response.head && response.head.code === '200' ){
            this.props.form.resetFields()
            //todo  清除上传组件列表值
            message.success(`${ modelState === 2 ? '变更' : '登记'}成功`)
            this.props.onCancel()
            this.props.refresh()
          }else {
            message.error(`${ modelState === 2 ? '变更' : '登记'}失败` + response && response.body)
          }
        }).catch(err => {
        })
      }
    })
  }, 5000, { trailing: false })

  render () {
    let { initStatus, modelState } = this.state
    const {
      form: { getFieldDecorator },
      PrefixCls
    } = this.props
    const alertLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 6 }
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 }
      }
    }
    const userType = [
      {
        value: 1,
        name: '设备'
      },
      {
        value: 2,
        name: '用户'
      }
    ]

    const FormView = (
      <Form layout="horizontal" className="form-content">
        <Row gutter={24}>
          <FormItem  {...alertLayout} label="Key编号:">
            {getFieldDecorator('name', {
              rules: [
                { required: true, message: '请输入！' },
                { message: '最多30个字符！', max: 30 }
              ],
              initialValue: this.props.initStatus ? initStatus.name : ''
            })(
              <Input autoComplete='off' placeholder="请输入"/>
            )}
          </FormItem>
          {
            modelState === 1 ?
              <FormItem  {...alertLayout} label="领用状态:">
                {getFieldDecorator('email', {
                  rules: [
                    { required: true, message: '请选择！' }
                  ],
                  initialValue: this.props.initStatus ? initStatus.email : ''
                })(
                  <Select placeholder="请选择！"
                    allowClear
                    getPopupContainer={triggerNode => triggerNode.parentNode}
                    showSearch={false}
                  >
                    {KEY_STATUS.map((item) => (
                      <Option value={item.value} key={item.value}>{item.name}</Option>)
                    )}
                  </Select>
                )}
              </FormItem>
              : (
                <Fragment>
                  <FormItem  {...alertLayout} label="使用者类型:">
                    {getFieldDecorator('email2', {
                      rules: [
                        { required: true, message: '请选择！' }
                      ],
                      initialValue: this.props.initStatus ? initStatus.email : ''
                    })(
                      <Select placeholder="请选择！"
                        allowClear
                        getPopupContainer={triggerNode => triggerNode.parentNode}
                        showSearch={false}
                      >
                        {userType.map((item) => (
                          <Option value={item.value} key={item.value}>{item.name}</Option>)
                        )}
                      </Select>
                    )}
                  </FormItem>
                  <FormItem  {...alertLayout} label="使用者:">
                    {getFieldDecorator('email3', {
                      rules: [
                        { required: true, message: '请选择！' }
                      ],
                      initialValue: this.props.initStatus ? initStatus.email : ''
                    })(
                      <Select placeholder="请选择！"
                        allowClear
                        getPopupContainer={triggerNode => triggerNode.parentNode}
                        showSearch={false}
                      >
                        <Option value={1} >666</Option>
                      </Select>
                    )}
                  </FormItem>
                  <FormItem  {...alertLayout} label="领用时间:">
                    {getFieldDecorator('gmtCreate', {
                      rules: [
                        { required: true, message: '请选择！' }
                      ],
                      initialValue: this.props.initStatus ? initStatus.email : ''
                    })(
                      <DatePicker getCalendarContainer={triggerNode => triggerNode.parentNode} placeholder='请选择' disabledDate={(date) => { return this.disabledDate('start', date) }} />
                    )}
                  </FormItem>

                </Fragment>
              )
          }

          {/* <FormItem {...alertLayout} label="qq号:">
            {getFieldDecorator('qq', { rules: [{ pattern: regExp.QQPattern, message: '无效QQ号！' },
              { max: 30, min: 5, message: 'QQ号长度为5-30位的数字！' }],
            initialValue: this.props.initStatus ? initStatus.qq : '' })(
              <Input autoComplete='off' placeholder="请输入qq号"/>
            )}
          </FormItem>
          <FormItem {...alertLayout} label="微信号:">
            {getFieldDecorator('weixin', { rules: [{ pattern: regExp.WXPattern, message: '无效微信号！' },
              { max: 30, min: 1, message: '微信号长度为1-30位！' }],
            initialValue: this.props.initStatus ? initStatus.weixin : '' })(
              <Input autoComplete='off' placeholder="请输入微信号"/>
            )}
          </FormItem>
          <FormItem {...alertLayout} label="手机号:">
            {getFieldDecorator('mobile', { rules: [{ pattern: regExp.newPhonePattern, message: '无效手机号！' }],
              initialValue: this.props.initStatus ? initStatus.mobile : '' })(
              <Input autoComplete='off' maxLength={11} placeholder="请输入手机号"/>
            )}
          </FormItem>
          <FormItem {...alertLayout} label="详细地址:">
            {getFieldDecorator('detailAddress', {
              rules: [
                { message: '最多100个字符！', max: 100 }
              ],
              initialValue: this.props.initStatus ? initStatus.detailAddress : ''
            })(
              <Input autoComplete='off' placeholder="请输入详细地址"/>
            )}
          </FormItem>
          <FormItem {...alertLayout} label="职位:">
            {getFieldDecorator('position', {
              rules: [
                { message: '最多30个字符！', max: 30 }
              ],
              initialValue: this.props.initStatus ? initStatus.position : ''
            })(
              <Input autoComplete='off'  placeholder="请输入职位"/>
            )}
          </FormItem> */}
        </Row>
      </Form>
    )

    return(
      <div className={PrefixCls}>
        {FormView}
        <Row className='Button-center'>
          <Col span={24} style={{ textAlign: 'center' }}>
            {/* 登记 */}
            { modelState === 1 ? <Button type="primary" onClick={this.infoSubmit}>确定</Button> : ''}
            {/* 领用 */}
            { modelState === 2 ? <Button type="primary" onClick={this.infoSubmit}>确定</Button> : ''}
            <Button type="primary" ghost onClick={this.onCancel}>取消</Button>
          </Col>
        </Row>
      </div>
    )
  }

  componentDidMount () {
    // this.initData()
  }

  UNSAFE_componentWillReceiveProps (nextProps) {
    //更新数据
    if(JSON.stringify(nextProps.initStatus) !== 'null')
      this.setState({
        initStatus: nextProps.initStatus
      }, ()=>{
        this.initData()
      })
      // }
      //更新数据
    if (JSON.stringify(this.props.model) !== JSON.stringify(nextProps.model)) {
      this.setState({
        modelState: nextProps.model
      })
    }
  }

}

export default AssetPersonnelIdentitysRegister
