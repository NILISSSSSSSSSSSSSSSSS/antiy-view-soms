import { Component } from 'react'
import { connect } from 'dva'
import { Table } from 'antd'
import { Link } from 'dva/router'
import moment from 'moment'
import { transliteration } from '@/utils/common'
// const TabPane = Tabs.TabPane
class RoleWorkflowForm extends Component {
  constructor (props) {
    super(props)
    this.state = {
      userList: this.props.userList || [],
      typeList: [' 补丁', '漏洞', '资产', '配置', '资产', '资产', '资产'],
      columns: [
        {
          title: '模块',
          key: 'on',
          dataIndex: 'on',
          render: (text, scope, index) => {
            return (<span>{this.state.typeList[index]}</span>)
          }
        },
        {
          title: '流程名称',
          key: 'name',
          dataIndex: 'name'
        },
        {
          title: '更新时间',
          key: 'gmtModified',
          dataIndex: 'gmtModified',
          render: (text) => { return (<span className="tabTimeCss">{moment(text).format('YYYY-MM-DD HH:mm:ss')}</span>) }
        },
        {
          title: '操作',
          key: 'tag',
          dataIndex: 'tag',
          render: (text, record) => {
            return (
              <div className="operate-wrap">
                {
                  text === 'hard_dj' && <Link to={`/system/setsystem/roleworkflow/hardwareregister?flowId=${transliteration(record.stringId)}`}>编辑</Link>
                }
                {
                  text === 'asset_ty' ? <Link to={`/system/setsystem/roleworkflow/hardwareback?flowId=${transliteration(record.stringId)}`}>编辑</Link> : null
                }
                {
                  text === 'template_flow' ? <Link to={`/system/setsystem/roleworkflow/assetinstall?flowId=${transliteration(record.stringId)}`}>编辑</Link> : null
                }
                {
                  text === 'config' ? <Link to={`/system/setsystem/roleworkflow/baseLine?flowId=${transliteration(record.stringId)}`}>编辑</Link> : null
                }
                {
                  text === 'vul_repair' ? <Link to={`/system/setsystem/roleworkflow/vulregister?flowId=${transliteration(record.stringId)}`}>编辑</Link> : null
                }
                {
                  text === 'patch_install' ? <Link to={`/system/setsystem/roleworkflow/patchregister?flowId=${transliteration(record.stringId)}`}>编辑</Link> : null
                }
                {
                  text === 'asset_bf' ? <Link to={`/system/setsystem/roleworkflow/scrap?flowId=${transliteration(record.stringId)}`}>编辑</Link> : null
                }
              </div>
            )
          }
        }]
    }
  }
  componentDidMount () {
    this.props.dispatch({ type: 'system/getworkflowList' })
  }
  UNSAFE_componentWillReceiveProps (nextProps) {
    // 更新列表数据
    if (JSON.stringify(this.props.userList) !== JSON.stringify(nextProps.userList)) {
      this.setState({
        userList: nextProps.userList
      })
    }
  }
  render () {
    let { userList, columns } = this.state
    return (
      <div className="main-table-content">
        <div className="table-wrap">
          <Table rowKey="stringId" columns={columns} dataSource={userList} pagination={false} />
        </div>
      </div>
    )
  }
}
const mapStateToProps = ({ system }) => {
  return { userList: system.workflowList }
}
export default connect(mapStateToProps)(RoleWorkflowForm)
