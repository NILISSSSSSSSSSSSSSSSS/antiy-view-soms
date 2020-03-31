import React, { Component } from 'react'
import { connect } from 'dva'
import { Form } from 'antd'
import CommonModal from '@/components/common/Modal'
import './style.less'

export class RidManange extends Component {
  modalHandleSubmit = () => {
    this.props.submit()
  }
  render () {
    const { visible, onClose } = this.props
    return (
      <CommonModal
        type="confirm"
        className="rid-manage-modal"
        title=""
        visible={visible}
        width={650}
        onConfirm={this.modalHandleSubmit}
        onClose={onClose}
      >
        <div className="text-content">
          <h1><img className="icon" src={require('@/assets/login-warn.svg')} alt="warn" />确认踢出该安全设备？</h1>
          <p>踢出后，将无法对其进行远程运维！</p>
        </div>
      </CommonModal>
    )
  }
}
const RidManangeModal = Form.create()(RidManange)
export default connect()(RidManangeModal)
