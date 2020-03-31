import { Component } from 'react'
import {
  Button, Modal
} from 'antd'
import { connect } from 'dva'
import './style.less'

class AssetModal extends Component{
  state={
    PrefixCls: 'AssetModal'
  }
  render (){
    const { data: { title, visible, width, onOk, onCancel, children, isFooter = true, onText = '确定' }, loading } = this.props
    return(
      <Modal title={title}
        visible={visible}
        width={width}
        onCancel={onCancel}
        destroyOnClose
        // className={`over-scroll-modal ${this.state.PrefixCls}`}
        className={`${this.state.PrefixCls}`}
        footer={isFooter ? [
          <Button key='confirm' type='primary' onClick={onOk} disabled={loading}>
            {onText}
          </Button>,
          <Button key='cancel' style={{ marginLeft: 20 }}  onClick={onCancel}>
            取消
          </Button>
        ] : null}
      >
        <div className={`form-content ${width !== 1100 ? 'padding' : null}`}>
          {children}
        </div>
      </Modal>
    )
  }
}

export default connect(({ asset }) => ({
  loading: asset.importAssetLoading
}))(AssetModal)
