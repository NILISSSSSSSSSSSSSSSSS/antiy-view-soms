import { Component } from 'react'
import { connect } from 'dva'
import { Form } from 'antd'
import hasAuth from '@/utils/auth'
// import './style.less'
// import hasAuth from '@/utils/auth'
// import * as regExp from '@/utils/regExp'
import Subfield from '@/components/System/Subfield'
import { systemPermission } from '@a/permission'
// import AddTreeModal from '@/components/System/AreaTreeModal'
class SystemAsset extends Component {
  constructor (props) {
    super(props)
    this.state = {
      treeData: this.props.treeData,
      elList: []
    }
  }

  componentDidMount () {
    //获取管理区域树数据
    // this.getTree()
  }

  UNSAFE_componentWillReceiveProps (nextProps) {
    if (JSON.stringify(this.props.treeData) !== JSON.stringify(nextProps.treeData)) {
      this.setState({
        treeData: nextProps.treeData
      })
    }
  }

  authority = () => {
    const auth = ['edit', 'add', 'delete', 'save']
    const init = [systemPermission.sysAreaEdit, systemPermission.sysAreaAdd, systemPermission.sysAreaDelete, systemPermission.sysAreaSave].map((item, i) => {
      return hasAuth(item) ? auth[i] : undefined
    }).filter(item => item !== undefined)
    return init
  }
  render () {
    const { treeData, elList } = this.state
    return (
      <div className="main-table-content common-tree">
        <div className="system-Asset">
          <Subfield
            iData={treeData}
            title='区域'
            handle={['updateSingle', 'saveSingle', 'deleteSingle']}
            apiConfig={{
              api: 'getTree',
              config: {
                userId: sessionStorage.getItem('id')
              }
            }}
            authList={this.authority()}></Subfield>
          {
            elList
          }
        </div>
      </div>
    )
  }
}

const mapStateToProps = ({ system }) => {
  return { treeData: system.treeData }
}

const SystemAssetForm = Form.create()(SystemAsset)

export default connect(mapStateToProps)(SystemAssetForm)
