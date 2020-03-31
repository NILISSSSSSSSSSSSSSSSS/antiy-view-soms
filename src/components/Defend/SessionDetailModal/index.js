import React, { Component } from 'react'
import CommonModal from '@/components/common/Modal'
import api from '@/services/api'
import './style.less'

export class SessionDetail extends Component {
  state = {
    session: []
  }
  UNSAFE_componentWillReceiveProps (nextProps) {
    if (nextProps.visible && JSON.stringify(this.props.visible) !== JSON.stringify(nextProps.visible)) {
      api.getSessionDetail({
        stringId: nextProps.id
      }).then(response => {
        if (response && response.head && response.head.code === '200') {
          this.setState({
            session: response.body
          })
        }
      })
    }
  }
  render () {
    const { visible, onClose } = this.props
    const { session } = this.state
    return (
      <CommonModal
        type="normal"
        className="session-detail-modal"
        title="会话详情"
        visible={visible}
        width={650}
        onClose={onClose}
      >
        <div className="session-list">
          {
            session.length ? session.map((item, index) => {
              return (
                <div className="session-item" key={item.stringId}>
                  <p className="command">command:{item.command}</p>
                  <p className="output">output:{item.output}</p>
                </div>
              )
            }) : <div className="empty-placeholder"></div>
          }
        </div>
      </CommonModal>
    )
  }
}
export default SessionDetail
