import { PureComponent } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'dva'
import { Form, Modal, Button } from 'antd'
import CommonForm from '@c/common/Form'
import './style.less'

const FormItem = Form.Item
export class commonModal extends PureComponent {
  /**
   * 弹窗，类型包括form/normal/confirm
   * form类型：内含表单，有确认，取消按钮
   * normal类型：直接展示传入组建的节点内容， 无确认，取消按钮
   * confirm类型：直接展示传入组建的节点内容， 有确认，取消按钮， 弹窗宽度统一400
   */
  onSubmit = (e) => {
    const { type, onConfirm } = this.props
    if(type === 'form'){
      this.props.form.validateFields((err, values) => {
        if (!err) {
          this.props.value(values)
        }
      })
    } else {
      onConfirm()
    }
  }
  render () {
    const {
      type,
      visible,
      title,
      width,
      children,
      oktext,
      isOk = true,
      noText,
      okLoading,
      fields,
      column,
      form,
      formLayout,
      onClose,
      className
    } = this.props
    return (
      <Modal
        title={title}
        width={type !== 'confirm' ? width : 400}
        className={`over-scroll-modal ${className}`}
        footer={null}
        maskClosable={false}
        destroyOnClose={true}
        visible={visible}
        onCancel={onClose}
      >
        <div className="modal-content-wrap">
          {/* 表单弹窗 */}
          { type === 'form' &&
            <CommonForm
              column={column}
              fields={fields}
              form={form}
              FormItem={FormItem}
              formLayout={formLayout}
            ></CommonForm>
          }
          {/* 普通弹窗，确认弹窗 */}
          { (type === 'normal' || type === 'confirm' || type === 'search') &&
            <div className="children-wrap">{children}</div>
          }
        </div>
        {(type === 'form' || type === 'confirm' || type === 'search') &&
          <div className={`button-center ${type}-button-center`}>
            <div>
              {isOk && <Button type="primary" loading={okLoading} onClick={this.onSubmit}>{oktext}</Button>}
              <Button type="primary" ghost onClick={onClose}>{noText}</Button>
            </div>
          </div>
        }
      </Modal>
    )
  }
}
commonModal.propTypes = {
  type: PropTypes.string,
  visible: PropTypes.bool,
  isOk: PropTypes.bool,
  oktext: PropTypes.string,
  noText: PropTypes.string
}
commonModal.defaultProps = {
  oktext: '确认',
  noText: '取消',
  isOk: true,
  fields: [],
  column: 1,
  type: '',
  visible: false,
  className: ''
}

const commonModalForm = Form.create()(commonModal)
export default connect()(commonModalForm)
