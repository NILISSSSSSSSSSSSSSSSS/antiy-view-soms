import { Component } from 'react'
import { connect } from 'dva/index'
import { Modal, Table } from 'antd/lib/index'
import Tooltip from '@/components/common/CustomTooltip'
import api from '@/services/api'
// import {  analysisUrl } from '@/utils/common'

class templateForm extends Component {
  constructor (props) {
    super(props)
    this.state = {
      tablist: [],
      listColumns: [
        {
          title: '终端名称',
          key: 'name',
          dataIndex: 'name',
          render: (text)=><Tooltip title={text}>{text}</Tooltip>
        },
        {
          title: '资产编号',
          key: 'number',
          dataIndex: 'number',
          render: (text)=><Tooltip title={text}>{text}</Tooltip>
        },
        {
          title: '区域',
          key: 'areaName',
          dataIndex: 'areaName',
          render: (text)=><Tooltip title={text}>{text}</Tooltip>
        },
        {
          title: '使用者',
          key: 'responsibleUserName',
          dataIndex: 'responsibleUserName',
          render: (text)=><Tooltip title={text}>{text}</Tooltip>
        },
        {
          title: 'IP地址',
          key: 'ip',
          dataIndex: 'ip',
          width: 200,
          render: (text)=><Tooltip title={text}>{text}</Tooltip>
        },
        {
          title: 'Mac地址',
          key: 'mac',
          dataIndex: 'mac',
          width: 160,
          render: (text)=><Tooltip title={text}>{text}</Tooltip>
        }
      ]
    }
  }
  componentDidMount () {
    // this.getList()
  }
  UNSAFE_componentWillReceiveProps (nextProps) {
    if (nextProps.visible && JSON.stringify(this.props.visible) !== JSON.stringify(nextProps.visible)) {
      this.setState({ visible: nextProps.visible }, ()=>{ this.getList()})
    }
  }
  render () {
    let { listColumns, tablist } = this.state
    const { visible } = this.props
    return (
      <Modal visible={visible} onOk={()=>this.props.onCancel()} onCancel={()=>this.props.onCancel()} width={1200} footer={null} title="终端列表">
        <Table columns={listColumns} dataSource={tablist} pagination={false} className="modelTable"/>
      </Modal>
    )
  }
  getList = ()=>{
    let id = this.props.id
    api.getthreateventaptrel({ primaryKey: id }).then(response => {
      if (response && response.head && response.head.code === '200' ) {
        this.setState({
          tablist: (response.body || []).map((e, i)=>({ key: i, ...e }))
        })
      }
    })
  }
}
export default connect()(templateForm)
