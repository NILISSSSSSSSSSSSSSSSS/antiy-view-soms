import { Component } from 'react'
import { Form, Table, Modal, Input, Button } from 'antd'
import Tooltip from '@/components/common/CustomTooltip'
import api from '@/services/api'
import hasAuth from '@/utils/auth'
import { safetyPermission } from '@a/permission'
import './styles.less'

const { Item } = Form
const FormLayout = {
  labelCol: {
    span: 6
  },
  wrapperCol: {
    span: 12
  }
}
class ThresholdConfig extends Component {
  constructor (props) {
    super(props)
    this.configAuth = safetyPermission.SAFETY_XN_THRESHOLD_BG
    this.hasChangeAuth = hasAuth(this.configAuth)
    this.state = {
      perModal: false,
      perList: [],
      recoed: {}
    }
    this.columns = [
      {
        title: '性能类型',
        dataIndex: 'typeName',
        key: 'typeName'
      },
      {
        title: '临界值',
        dataIndex: 'threshold',
        key: 'threshold',
        render: (text) => text ? `${text}%` : null
      },
      {
        title: '告警等级',
        dataIndex: 'alarmNewLevel',
        key: 'alarmNewLevel',
        render: (text) => {
          switch (text) {
            case 1: return '紧急'
            case 2: return '重要'
            case 3: return '次要'
            case 4: return '提示'
            default: break
          }
        }
      },
      {
        title: '告警名称',
        dataIndex: 'alarmName',
        key: 'alarmName'
      },
      {
        title: '对系统影响',
        dataIndex: 'influence',
        key: 'influence',
        render: (text) => {
          return (
            <Tooltip title={text}>
              {text}
            </Tooltip>
          )
        }
      },
      {
        title: '操作',
        key: 'operate',
        render: (recoed) => {
          return (
            this.hasChangeAuth && (
              <div className="operate-wrap">
                <a onClick={() => { this.setState({ perModal: true, recoed }) }}>变更</a>
              </div>
            )
          )
        }
      }
    ]
  }
  componentDidMount () {
    this.getPerList()
  }
  // 获取告警规则列表
  getPerList = () => {
    api.getAlarmPerSafetyList().then((data) => {
      if (data.head && data.head.code === '200') {
        this.setState({
          perList: data.body
        })
      }
    })
  }
  onCancel = () => {
    this.setState({
      perModal: false
    })
  }
  onSubmit = (e) => {
    e.preventDefault()
    const { recoed: { stringId: primaryKey } } = this.state
    this.props.form.validateFields((err, values) => {
      if (!err) {
        const value = {
          primaryKey,
          ...values
        }
        // 设置提交
        api.changeAlarmPerSafetyList({ ...value }).then((data) => {
          if (data.head && data.head.code === '200') {
            this.getPerList()
            this.setState({ perModal: false })
          }
        })
      }
    })
  }
  render () {
    const { perList, perModal, recoed } = this.state
    const { getFieldDecorator } = this.props.form
    return (
      <div className="table-wrap">
        <Table rowKey="stringId" columns={this.columns} dataSource={perList} pagination={false} />
        {
          perModal && <Modal
            visible={true}
            onCancel={this.onCancel}
            title="告警临界值设置"
            width={600}
            footer={null}
          >
            <Form onSubmit={this.onSubmit}>
              <Item {...FormLayout} label='临界值'>
                {
                  getFieldDecorator('threshold', {
                    rules: [{ required: true, message: '请输入临界值' }, { pattern: /^([1-9][0-9]{0,1}|100)$/, message: '请输入1-100之间的整数' }],
                    initialValue: recoed.threshold
                  })(
                    <Input autoComplete="off" addonAfter='%' />
                  )
                }
              </Item>
              <div className="Button-center">
                <div>
                  <Button type="primary" htmlType='submit' className="threshold-config-submit">提交</Button>
                  <Button type="primary" ghost onClick={this.onCancel}>取消</Button>
                </div>
              </div>
            </Form>
          </Modal>
        }
      </div>
    )
  }
}
export default Form.create()(ThresholdConfig)
