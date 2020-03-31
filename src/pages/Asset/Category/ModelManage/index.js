import { Component } from 'react'
import { connect } from 'dva'
import { Form } from 'antd'
import Subfield from '@/components/System/Subfield'
import api from '@/services/api'
class AssetCategoryModelManage extends Component {
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

  UNSAFE_componentWillReceiveProps ( nextProps ){
    if (JSON.stringify(this.props.treeData) !== JSON.stringify(nextProps.treeData)) {
      this.setState({
        treeData: nextProps.treeData
      })
    }
  }
  render () {
    const { treeData, elList } = this.state
    return (
      <div className="main-table-content common-tree">
        <div className="system-Asset">
          <Subfield iData={treeData} update={this.getTree}
            title='资产类型' handle={['editCategoryModel', 'addCategoryModel', 'deleteCategoryModel']} authList={['asset:pinleixinghao:edit', 'asset:pinleixinghao:add', 'asset:pinleixinghao:delete']} ></Subfield>
          {
            elList
          }
        </div>
      </div>
    )
  }
  //获取树
  getTree = async () => {
    let { treeData } = this.state
    let res = await api.getCategorymodelWithoutnode({}).then((iData)=>{
      if(iData.head && iData.head.code === '200'){
        if(!treeData.length){
          this.setState({ treeData: iData.body })
        }else if(this.props.success){
          this.props.success()
        }
        return iData.body
      }
    })
    return res || []
  }
}

const mapStateToProps = ({ asset }) => {
  return { treeData: asset.categoryNode }
}

const AssetCategoryModelForm = Form.create()(AssetCategoryModelManage)

export default connect(mapStateToProps)(AssetCategoryModelForm)
