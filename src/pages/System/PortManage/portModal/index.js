import React, { Component } from 'react'
import { connect } from 'dva'
import { Modal, Form, Input, Button, Row, message, Select } from 'antd'
import api from '@/services/api'
import * as regExp from '@/utils/regExp'
import './style.less'
import { debounce } from 'lodash'

const { Item } = Form

const formItemLayout = {
  labelCol: {
    span: 8
  },
  wrapperCol: {
    span: 12
  }
}
// const TextArea = Input.TextArea

export class ModalForm extends Component {
  constructor (props) {
    super(props)
    this.state = {
      result: true,
      portList: [],
      showInfo: true
    }
    this.handleSubmit = debounce(this.handleSubmit, 800)
  }
  componentDidMount () {
  }
  render () {
    const { props, form } = this.props
    const { getFieldDecorator } = form
    let { showInfo, portList } = this.state
    if (props.modalData && props.modalData.portDetail) {
      portList = props.modalData.portDetail.split(',')
    }
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
          <div className="form-content portModal">
            <Row>
              <Item label="端口组名称：" {...formItemLayout}>
                {getFieldDecorator('portGroupName', {
                  rules: [{ required: true, message: '请输入端口组名称' }, { whitespace: true, message: '输入字符中不能有空格！' }, { message: '最多80个字符！', max: 80 }],
                  initialValue: props.modalData ? props.modalData.portGroupName : ''
                })(
                  <Input autoComplete="off" placeholder="请输入" />
                )}
              </Item>
            </Row>
            <Row>
              <Item label="选择端口：" {...formItemLayout}>
                {getFieldDecorator('portDetail', {
                  initialValue: portList,
                  rules: [{ required: true, message: '请输入端口' }]
                })(
                  <Select mode="tags"
                    onFocus={() => {
                      this.setState({
                        showInfo: false
                      })
                    }}
                    autoFocus={!showInfo ? true : false}
                    maxTagTextLength={5000}
                    onBlur={() => {
                      this.setState({
                        showInfo: true
                      })
                    }}
                    onChange={(value) => {
                      this.checkCode(value)
                    }}
                    style={{ width: '100%' }}
                    className="port-tag-input"
                    placeholder=""
                    getPopupContainer={triggerNode => triggerNode.parentNode}>
                    {[]}
                  </Select>
                )}
              </Item>
            </Row>
            <div>{(showInfo && !this.props.form.getFieldValue('portDetail').length) && <p className="inputInfo"
              onClick={(e) => {
                e.preventDefault()
                document.querySelector('.port-tag-input').click()
                this.setState({
                  showInfo: false
                })
              }}>请输入单个端口，如：21；或输入端口范围,如：1-1000；输入数据按回车隔开</p>}</div>
          </div>
        </Form>
        <div className="Button-center">
          <div>
            <Button type="primary" onClick={this.handleSubmit} disabled={!this.state.result}>确定</Button>
            <Button style={{ marginLeft: '8px' }} type='primary' ghost onClick={() => {
              this.resetForm()
              props.onCancel()
            }}>取消</Button>
          </div>
        </div>
      </Modal>)
  }
  //表单提交
  handleSubmit = () => {
    const { props } = this.props
    this.props.form.validateFields((err, values) => {
      if (!err) {
        values.portDetail = values.portDetail.map((item) => {
          return (item)
        }).join(',')
        let port = props.modalData.primaryKey && props.modalData ? 'eitPortGroup' : 'addPortGroup'
        if (props.modalData)
          values.primaryKey = props.modalData.primaryKey
        api[port](values).then(res => {
          message.success('操作成功')
          setTimeout(() => {
            this.resetForm()
          }, 100)
          props.onOk()
        })
      }
    })
  }
  //输入端口号验证
  checkCode = (val) => {
    for (let i = 0; i < val.length; i++) {
      if (this.checkValid(val[i]) === false) {
        message.error('输入中有不符合正确格式的端口')
        this.setState({
          result: false
        })
        return
      } else {
        this.setState({
          result: true
        })
      }
    }
  }
  checkValid = (val) => {
    if (val && regExp.Portvalid.test(val)) {
      return true
    } else if (regExp.validatePort.test(val) && val) {
      let range = val.split('-')
      if ((Number(range[0]) < 65535 && Number(range[0]) >= 0) && (Number(range[0]) < Number(range[1])) && (Number(range[1]) <= 65535 && Number(range[1]) > 0)) {
        return true
      } else {
        return false
      }
    }
    else {
      return false
    }
  }
  //重置
  resetForm = () => {
    this.props.form.resetFields()
  }
}
const ModalFormWrap = Form.create()(ModalForm)
export default connect()(ModalFormWrap)