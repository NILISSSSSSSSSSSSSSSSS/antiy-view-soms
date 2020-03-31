import { Component } from 'react'
import { connect } from 'dva'
import { Form, Button, Message, Modal, TreeSelect } from 'antd'
import api from '@/services/api'

const { Item } = Form
const TreeNode = TreeSelect.TreeNode
class SystemAdd extends Component {
  constructor (props) {
    super(props)
    this.state = {
      souceTreeData: this.props.treeData,
      targetTreeData: [],
      value: undefined
    }
  }

  componentDidMount () {

  }

  UNSAFE_componentWillReceiveProps (nextProps) {
    if (JSON.stringify(this.props.treeData) !== JSON.stringify(nextProps.treeData)) {
      this.setState({
        souceTreeData: nextProps.treeData,
        targetTreeData: JSON.parse(JSON.stringify(nextProps.treeData))
      })
    }
  }

  render () {
    let { souceTreeData, targetTreeData } = this.state
    const { getFieldDecorator } = this.props.form
    const { visible, isAdd } = this.props.areaModal
    const text = isAdd ? '合并' : '迁移'

    return (
      <div>
        <Modal
          className="system-asset-Modal"
          title={text}
          width={600}
          visible={visible}
          onCancel={this.handleCancel}
          footer={null}>
          <Form onSubmit={this.handleSubmit}>
            <Item label="将">
              {getFieldDecorator('sourceAreaIds', {
                rules: [{ required: true, message: '请选择源区域' }]
              })(
                <TreeSelect
                  style={{ width: 200 }}
                  dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                  placeholder="请选择源区域"
                  allowClear
                  multiple
                  treeDefaultExpandAll
                  onChange={this.onSouceChange}
                >
                  {
                    this.renderTreeNodes(souceTreeData)
                  }
                </TreeSelect>
              )}
            </Item>
            <Item label={`${text}到`}>
              {getFieldDecorator('targetAreaId', {
                rules: [{ required: true, message: '请选择目标区域' }]
              })(
                <TreeSelect
                  style={{ width: 200 }}
                  dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                  placeholder="请选择目标区域"
                  treeDefaultExpandAll
                  onChange={this.onTargetChange}
                >
                  {
                    this.renderTreeNodes(targetTreeData)
                  }
                </TreeSelect>
              )}
            </Item>
            <div className="btn-box" style={{ textAlign: 'right' }} >
              <Button onClick={this.handleCancel}>取消</Button>
              <Button style={{ marginLeft: '20px' }} type="primary" htmlType="submit">确定</Button>
            </div>
          </Form>
        </Modal>
      </div>
    )
  }

  //提交
  handleSubmit = (e) => {
    e.preventDefault()
    this.props.form.validateFields((err, values) => {
      if (!err) {
        let text, url
        if (this.props.areaModal.isAdd) {
          //合并源ID必须1个以上
          if (values.sourceAreaIds.length === 1 ) {
            Message.info('合并必须选择1个以上源区域')
            return false
          }
          text = '合并'
          url = 'mergeArea'
        } else {
          text = '迁移'
          url = 'migrateArea'
        }
        api[url](values).then(response => {
          if(response && response.head && response.head.code === '200' ){
            Message.success(`${text}成功！`)
            this.props.getTree()
            this.handleCancel()
          }
        }).catch(err => {})
      }
    })
  }

  //如果父节点禁用子节点全部禁用
  filterTreeDatachild=(data)=>{
    return data.map(item=>{
      item.disabled = true
      if(item.childrenNode){
        item.childrenNode = this.filterTreeDatachild(item.childrenNode)
      }
      return item
    })
  }

  //递归改变目标树数据
  filterTreeData = (data, id) => {
    return data.map(item => {
      if (item.stringId === id) {
        item.disabled = true
        if (item.childrenNode) {
          item.childrenNode = this.filterTreeDatachild(item.childrenNode)
        }
      }
      if (item.childrenNode) {
        item.childrenNode = this.filterTreeData(item.childrenNode, id)
      }
      return item
    })
  }

  //禁用目标树
  disabledTree = (extra) => {
    const { souceTreeData } = this.state
    //目标数据
    const targetDeepCopy = JSON.parse(JSON.stringify(souceTreeData))
    if (extra.length > 0) {
      extra.forEach(id => {
        this.setState({
          targetTreeData: this.filterTreeData(targetDeepCopy, id)
        })
      })
    } else {
      //清空时候还原目标数据
      this.setState({
        targetTreeData: targetDeepCopy
      })
    }
  }

  //设置源ID
  onSouceChange = (sourceAreaIds, label, extra) => {
    this.disabledTree(sourceAreaIds)
    this.props.form.setFieldsValue({
      sourceAreaIds,
      targetAreaId: null
    })
  }

  //设置目标ID
  onTargetChange = (targetAreaId) => {
    this.props.form.setFieldsValue({
      targetAreaId
    })
    this.setState({
      targetValue: targetAreaId
    })
  }

  //生成管理区域树
  renderTreeNodes = data => data.map(item => {
    if (!item) {
      return []
    }
    if (item.childrenNode) {
      return (
        <TreeNode disabled={item.disabled} value={item.stringId} title={item.fullName} key={item.stringId}>
          {this.renderTreeNodes(item.childrenNode)}
        </TreeNode>
      )
    }
    return <TreeNode disabled={item.disabled} value={item.stringId} title={item.fullName} key={item.stringId} />
  })

  //取消
  handleCancel = () => {
    this.setState({
      targetTreeData: JSON.parse(JSON.stringify(this.state.souceTreeData))
    })
    this.props.hideAddModal()
    this.props.form.resetFields()
  }
}

const SystemAddForm = Form.create()(SystemAdd)
export default connect()(SystemAddForm)
