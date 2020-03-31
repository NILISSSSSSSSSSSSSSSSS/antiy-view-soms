import { Component, Fragment } from 'react'
import { Tree, Row, Col, Icon, Tooltip } from 'antd'
import { systemPermission, assetsPermission } from '@a/permission'
import hasAuth from '@/utils/auth'
const { TreeNode } = Tree
class Hurdle  extends Component {
  constructor (props) {
    super(props)
    this.state = {
      treeData: props.iData,
      index: props.index,
      parents: props.parents
    }
  }
  UNSAFE_componentWillReceiveProps (nextProps){
    if(JSON.parse(JSON.stringify(this.props.iData)) !== JSON.parse(JSON.stringify(nextProps.iData))){
      this.setState({ treeData: nextProps.iData })
    }
  }
  //变更选中
  changeSelect=(item, level)=>{
    this.setState({ selectedKeyss: item.map(now=> now.key), index: level - 1 })
  }

  render () {
    let { treeData } = this.state
    const { selectedKeys } = this.props
    return (
      <div className="tree-show">
        <Tree
          defaultExpandAll={true}
          selectedKeys= {selectedKeys}
        >
          {
            treeData.length ? treeData.map(item=>(
              <TreeNode
                title={this.addMenuHandle(item)}
                key={item.stringId}
                level={item.levelType}
                dataRef={item} />
            )) : null
          }
        </Tree>
      </div>
    )
  }
  //菜单添加功能按钮l
  addMenuHandle =(item) => {
    const { keyArray } = this.props.parents.state

    const { authList } = this.props.parents.props
    let name = item.fullName || item.name
    if(item.isDefault === undefined){
      item.isDefault = 1
    }
    //是否出现增加按钮
    const addShow = name && authList.includes('add')
    //是否出现删除按钮
    const deleteShow =  keyArray[0].childrenNode[0].levelType < item.levelType && authList.includes('delete') && item.isDefault
    return (<Row className="row-container" onClick={(e)=>{
      e.preventDefault()
      this.props.clickNode(item)
    }}>
      <Col span={14}>
        <Fragment>
          <Tooltip title={name} placement="topLeft" overlayClassName='tree-show-menu-bubble'
            getPopupContainer={triggerNode => triggerNode.parentNode}
          >
            <span className="tree-show-menu-title">{name}</span>
          </Tooltip>
        </Fragment>
      </Col>
      <Col span={10}>
        <span className="icon-handle">
          {
            //节点修改
            ( name &&  authList.includes('edit') && item.isDefault ) ? (
              <Icon type="edit" onClick={(e) =>{
                e.preventDefault()
                this.state.parents.redactNode(item)
              }} />) : null
          }
          {
            name && addShow ? (
              <Icon type="plus-circle" onClick={(e) =>{ //增加节点
                e.preventDefault()
                this.state.parents.addNode(item)
              }} />) : null
          }
          {
            ( name && deleteShow ) ? <Icon type="minus-circle" onClick={(e)=>{ //节点删除
              e.preventDefault()
              this.state.parents.deleteNode(item, '确认删除该节点？')
            }}/> : null
          }
        </span>
        {
          item.childrenNode && item.childrenNode.length ?  <Icon type='caret-right' className='lower-level' onClick={()=>{
            this.props.clickNode(item)
          }}/> : null
        }
      </Col>
    </Row>)
  }
}
export default Hurdle
