import { Component } from 'react'
import { Modal, Button } from 'antd'
import './index.less'

export default class ConFirm extends Component{
  // constructor (props){
  //   super(props)
  //   this.state = {}
  // }
  /**
   * 确认
   */
  onOk = () => {
    const { onOk } = this.props
    onOk && onOk()
  }
  onCancel = () => {
    const { onCancel } = this.props
    onCancel && onCancel()
  }
  render (){
    const { title, text = '您有文件正在传输，现在离开终止传输，是否放弃？' } = this.props
    return (
      <Modal
        title={title}
        closable={false}
        visible={true}
        maskClosable={false}
        footer={<div className="custom-confirm" >
          <Button className="btn" onClick={this.onOk} type="primary">确定</Button>
          <Button className="btn cancelBtn" onClick={this.onCancel} type="default">取消</Button>
        </div>}>
        {text}
      </Modal>
    )
  }
}
