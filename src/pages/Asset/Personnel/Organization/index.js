import { Component } from 'react'
import { connect } from 'dva'
import { Form } from 'antd'
// import './style.less'
import Subfield from '@/components/System/Subfield'
import hasAuth from '@/utils/auth'
import { assetsPermission } from '@a/permission'

class AssetPersonnelOrganization extends Component {
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
    const init = [assetsPermission.ASSET_ZZJG_EDIT, assetsPermission.ASSET_ZZJG_ADD, assetsPermission.ASSET_ZZJG_DEL, assetsPermission.ASSET_ZZJG_SAVE].map((item, i) => {
      return hasAuth(item) ? auth[i] : undefined
    }).filter(item => item !== undefined)
    return init
  }
  render () {
    const { treeData, elList } = this.state
    return (
      <div className="main-table-content common-tree">
        <div className="system-Asset">
          <Subfield iData={treeData}
            title='组织机构'
            handle={['updateDepartment', 'saveDepartment', 'deleteDepartmentById']}
            apiConfig={{
              api: 'getDepartmentTree',
              config: {}
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

const mapStateToProps = ({ assetOrganization }) => {
  return { treeData: assetOrganization.departmentNode }
}

const AssetPersonnelOrganizationForm = Form.create()(AssetPersonnelOrganization)

export default connect(mapStateToProps)(AssetPersonnelOrganizationForm)
