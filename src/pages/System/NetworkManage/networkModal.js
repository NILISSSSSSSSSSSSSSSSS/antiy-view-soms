import React, { Component } from 'react'
import { connect } from 'dva'
import { Modal, Form, Input, Button, Row, TreeSelect, message, InputNumber, Select  } from 'antd'
import api from '@/services/api'
import * as regExp from '@/utils/regExp'
import { validateFloatingPoint } from '@u/regExp'
import { debounce } from 'lodash'
import './style.less'

const { Item } = Form
const TreeNode = TreeSelect.TreeNode
const { Option } = Select

const formItemLayout = {
  labelCol: {
    span: 8
  },
  wrapperCol: {
    span: 12
  }
}
export class ModalForm extends Component {
  constructor (props) {
    super(props)
    this.state = {
      result: '',
      areaName: '',
      areaId: '',
      ip: '',
      ipEnd: '',
      treeData: [] //区域数
    }
    this.handleSubmit = debounce(this.handleSubmit, 800)
  }
  componentDidMount () {
    api.getLoginUserTree().then(iData => {
      this.setState({
        treeData: iData.body ? [iData.body] : []
      })
    })
  }

  render () {
    const { props, form } = this.props
    const { getFieldDecorator } = form
    const { treeData, ip, ipEnd } = this.state
    let start = props.modalData && props.modalData.ipStart && props.modalData.ipStart.split('.')[3]
    let end = props.modalData && props.modalData.ipEnd && props.modalData.ipEnd.split('.')[3]
    return (
      <Modal
        className="over-scroll-modal"
        title={props.title}
        width='650px'
        footer={null}
        maskClosable={false} visible={props.visible} onOk={this.handleSubmit} onCancel={() => {
          props.onCancel()
          this.resetForm()
        }}>
        <Form>
          <div className="form-content">
            <Row>
              <Item label="网段名称：" {...formItemLayout}>
                {getFieldDecorator('name', {
                  rules: [{ required: true, message: '请输入网段名称' }, { whitespace: true, message: '输入字符中不能有空格！' }, { message: '最多80个字符！', max: 80 }],
                  initialValue: props.modalData && props.modalData.name
                })(
                  <Input autoComplete="off" placeholder="请输入" />
                )}
              </Item>
            </Row>
            <Row>
              <Item label="区域范围：" {...formItemLayout}>
                {getFieldDecorator('areaId', {
                  initialValue: props.modalData && props.modalData.areaName,
                  rules: [{ required: true, message: '请选择区域' }]
                })(
                  <TreeSelect
                    dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                    placeholder="请选择"
                    allowClear
                    dropdownClassName='net-ant-select'
                    treeCheckStrictly={true}
                    treeDefaultExpandAll
                    onChange={this.onChange}
                  >
                    {
                      this.renderTreeNodes(treeData)
                    }
                  </TreeSelect>
                )}
              </Item>
            </Row>
            <Row>
              <Item label="IP起始地址：" {...formItemLayout}>
                {ipEnd && <span style={{ marginLeft: '12px', color: 'rgba(0, 0, 0, 0.65)' }}>{ipEnd}</span>}
                {getFieldDecorator('ipStart', {
                  rules: [{ required: true, message: '请输入IP起始地址' }, {
                    pattern: ipEnd ? regExp.ipLast : regExp.ipRegex, message: '格式错误,请输入正确IP地址！'
                  }],
                  initialValue: ipEnd ? start : props.modalData && props.modalData.ipStart
                })(
                  this.renderItem(ipEnd, 1)
                )}
              </Item>
            </Row>
            <Row>
              <Item label="IP结束地址：" {...formItemLayout}>
                {ip && <span style={{ marginLeft: '12px', color: 'rgba(0, 0, 0, 0.65)' }}>{ip}</span>}
                {getFieldDecorator('ipEnd', {
                  rules: [{ required: true, message: '请输入IP结束地址' }, {
                    pattern: ip ? regExp.ipLast : regExp.ipRegex, message: '格式错误,请输入正确IP地址！'
                  }],
                  initialValue: ip ? end : props.modalData && props.modalData.ipEnd
                })(
                  this.renderItem(ip, 2)
                )}
              </Item>
            </Row>
            <Row>
              <Item label="网络类型" {...formItemLayout}>
                {getFieldDecorator('type', {
                  initialValue: props.type && props.modalData.type,
                  rules: [{ required: true, message: '请选择网络类型' }]
                })(
                  <Select placeholder='请选择网络类型'>
                    <Option key='0' value="0">0</Option>
                  </Select>
                )}
              </Item>
            </Row>
          </div>
        </Form>
        <div className="Button-center">
          <div>
            <Button type="primary" onClick={this.handleSubmit} disabled={this.state.result}>确定</Button>
            <Button style={{ marginLeft: '8px' }} type='primary' ghost onClick={() => {
              props.onCancel()
              this.resetForm()
            }}>取消</Button>
          </div>
        </div>
      </Modal>)
  }
  renderItem = (data, index) => {
    if (!data)
      return (
        <Input autoComplete="off" placeholder={index === 1 ? '例如：1.1.1.1' : '例如：1.1.1.9'} onChange={(val) => this.IpChange(val, index)} />
      )
    else return (
      <InputNumber style={{ width: '50%' }} min={0} max={255} placeholder="请输入" precision={0} parser={value => validateFloatingPoint(value)}></InputNumber>
    )
  }
  onChange = (val, label, extra) => {
    this.setState({
      areaId: val,
      areaName: label[0]
    })
  }
  //Ip改变
  IpChange = (val, index) => {
    if (regExp.ipRegex.test(val.currentTarget.value)) {
      let ip = val.currentTarget.value && val.currentTarget.value.split('.').slice(0, 3).join('.') + '.'
      if (index === 1) {
        this.setState({ ip })
      }
      else {
        this.setState({ ipEnd: ip })
      }
    }
  }
  //生成管理区域树
  renderTreeNodes = data => data.map(item => {
    return (
      <TreeNode value={item.stringId} title={item.fullName} key={item.stringId} disabled={!!item.childrenNode.length}>
        {
          item.childrenNode && item.childrenNode.length ? (
            this.renderTreeNodes(item.childrenNode)
          ) : null
        }
      </TreeNode>)
  })
  //提交表单
  handleSubmit = () => {
    const { props } = this.props
    let { areaName, areaId, ip, ipEnd } = this.state
    this.props.form.validateFields((err, values) => {
      if (!err) {
        if (Number(values.ipEnd)) {
          values.ipEnd = ip + '' + (values.ipEnd > 255 ? '255' : values.ipEnd)
        } else if (Number(values.ipStart)) {
          values.ipStart = ipEnd + '' + (values.ipStart > 255 ? '255' : values.ipStart)
        }
        if (Number(values.ipStart.split('.')[3]) < Number(values.ipEnd.split('.')[3])) {
          let port = props.modalData.stringId && props.modalData ? 'updateNetsegment' : 'addNetsegment'
          values.areaName = areaName ? areaName : props.modalData.areaName
          values.areaId = areaId ? areaId : props.modalData.areaId
          if (props.modalData) {
            values.id = props.modalData.stringId
          }
          api[port](values).then(res => {
            setTimeout(() => {
              this.resetForm()
            }, 100)
            message.success('操作成功')
            props.onOk()
          })
        } else {
          message.error('起始值应小于结束值')
        }
      }
    })
  }
  resetForm = () => {
    this.props.form.resetFields()
    this.setState({
      ip: '',
      ipEnd: ''
    })
  }
}
const ModalFormWrap = Form.create()(ModalForm)
export default connect()(ModalFormWrap)