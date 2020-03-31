import { Component } from 'react'
import { CommonModal } from '@c'
import { generateRules } from '@/utils/common'
import api from '@/services/api'

export default class AssetBugModal extends Component {
  constructor (props){
    super(props)
    this.state = {
      disposeUserList: [] // 提交的运维人员列表
    }
  }
  componentDidMount () {
    this.getUser()
  }
  /**
   * 获取指派提交处理人员列表
   */
  getUser = () => {
    const config = this.props.config
    api.getUsersByRoleCodeAndAreaId(config.userParam).then(res=>{
      this.setState({ disposeUserList: res.body || [] })
    })
  }
  /**
   * 确认
   * @param values
   */
  onSubmit = (values) => {
    const param = { ...values }
    const { disposeUserList } = this.state
    const { onConfirm } = this.props
    if(values.disposeUserId === 'all'){
      param.disposeUserId = disposeUserList.map(e=>e.stringId).join(',')
    }
    onConfirm(param)
  }
  render () {
    const { visible, onClose, config = {} } = this.props
    const { disposeUserList } = this.state
    const fields = [
      { type: 'select', name: '运维人员', showSearch: true, defaultValue: 'all',  data: [{ name: '全部', stringId: 'all' }].concat(disposeUserList), key: 'disposeUserId', rules: [{ required: true, message: '请选择运维人员' }] },
      { type: 'textArea', rows: 4, name: `${config.name}${config.name === '漏洞' ? '修复' : '安装'}建议`, key: 'vulRepairMemo', rules: [{ required: true, message: `请输入${config.name}${config.name === '漏洞' ? '修复' : '安装'}建议` }, ...generateRules(500) ] }
    ]
    const formLayout = {
      labelCol: {
        span: 8
      },
      wrapperCol: {
        span: 14
      }
    }
    return (
      <CommonModal
        type="form"
        title={`${config.name}处置`}
        width={650}
        column={1}
        fields={fields}
        visible={visible}
        oktext='确定'
        formLayout={formLayout}
        value={this.onSubmit}
        onClose={onClose}
      />
    )
  }
}
