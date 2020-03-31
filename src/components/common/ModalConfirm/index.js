import { Modal } from 'antd'
import './style.less'

export default ({ props }) => {
  const { visible, onOk, onCancel, children, footer = true, width = 400 } = props
  let isfooter = {}
  if(!footer){
    isfooter = {
      footer: null
    }
  }
  return (
    <Modal visible={visible}
      width={width}
      destroyOnClose
      onOk={onOk}
      onCancel={onCancel}
      {...isfooter}
      className="Modal_Confirm"
    >
      {children}
    </Modal>
  )
}
