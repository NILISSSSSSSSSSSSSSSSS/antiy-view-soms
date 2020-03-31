import { Component } from 'react'
import { Modal } from 'antd'
// import api from '@/services/api'
import './style.less'

export default class ModelForm extends Component {
  constructor (props) {
    super(props)
    this.state = {
    }
  }
  render () {
    const { hinitConfig, visible } = this.props
    return (
      <Modal visible={visible} title='' onCancel={hinitConfig.onCancel} width={400} className="AdmitModel"
        onOk={hinitConfig.submit}>
        <p className="hints-alert-content model-text">{hinitConfig.text}</p>
      </Modal>
    )
  }
}