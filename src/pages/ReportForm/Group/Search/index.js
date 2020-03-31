import React, { Component } from 'react'
import { connect } from 'dva'
import { Button, Form, Select, TreeSelect, message } from 'antd'
import SelectInput from '../SelectInput'
import './index.less'

const { Item } = Form
const { Option } = Select
const { TreeNode } = TreeSelect

class Search extends Component {
  constructor (props){
    super(props)
    this.state = {
      changeValue: 0,
      saveModal: false,
      flag: false,
      search: false
    }
  }

  componentDidMount (){
    this.props.children(this)
  }

  // 保存
  onSubmit = (e, parm) => {
    e.preventDefault()
    this.props.form.validateFields( (err, values) => {
      if(!err){
        if(values.areaIds || values.baselineTemplateIds || values.importanceDegrees || values.manufacturers ||
      (values.noPatchCounts && values.noPatchCounts[0] && values.noPatchCounts[1]) ||
      (values.noVulCounts && values.noVulCounts[0] && values.noVulCounts[1]) ||
      (values.patchCounts && values.patchCounts[0] && values.patchCounts[1]) ||
      (values.vulCounts && values.vulCounts[0] && values.vulCounts[1]) ){
          this.props.showEditModal(parm, values)
        }else{
          message.warn('模板内容无效！')
        }
      }
    })
  }
  // 查询
  onSearch = () => {
    this.props.form.validateFields( (err, values) => {
      values.noPatchCountType = values.noPatchCounts && values.noPatchCounts[0]
      values.noPatchCount = values.noPatchCounts && values.noPatchCounts[1]
      values.noVulCountType = values.noVulCounts && values.noVulCounts[0]
      values.noVulCount = values.noVulCounts && values.noVulCounts[1]
      values.patchCountType = values.patchCounts && values.patchCounts[0]
      values.patchCount = values.patchCounts && values.patchCounts[1]
      values.vulCountType = values.vulCounts && values.vulCounts[0]
      values.vulCount = values.vulCounts && values.vulCounts[1]
      delete values.vulCounts
      delete values.patchCounts
      delete values.noVulCounts
      delete values.noPatchCounts
      this.props.onSearch( values)
    })
  }

  onReset= () => {
    this.props.form.resetFields()
  }

  //加载区域树结构的下拉列表
  getTreeNode = data => {
    if(data) return (
      <TreeNode value={data.stringId} title={data['fullName']} key= {`${data.stringId}`}>
        {data.childrenNode && data.childrenNode.length ? (
          data.childrenNode.map(item =>
            this.getTreeNode(item)
          )
        ) : null
        }
      </TreeNode>
    )
  }
  render () {
    const { getFieldDecorator } = this.props.form
    const { parms } = this.props
    const { resetKey } = this.state
    return (
      <Form className='two-item-search' layout="inline" onReset={this.onReset}>
        { parms.map( (item, index) => {
          switch(item.type){
            case 'select':
              return (
                <Item className={item.paramClassName} label={item.label} key={index}>
                  {getFieldDecorator( item.key, { initialValue: item.initialValue === null ? undefined : item.initialValue } )(
                    <Select
                      getPopupContainer={triggerNode => triggerNode.parentNode}
                      mode={item.multiple}
                      onSelect={item.onSelect}
                      disabled={item.disabled}
                      placeholder={item.placeholder || '请选择'}>
                      { item.data.map((item, index) => {return <Option key={ index } value={item.value || item} >{item.name || item  }</Option> }) }
                    </Select>
                  )  }
                </Item>
              )
            case 'select-input':
              return(
                <Item label={item.label} className={item.paramClassName} key={index}>
                  {getFieldDecorator( item.key, { initialValue: item.initialValue } )( <SelectInput resetKey={resetKey} selectOptions={item.data} placeholder={item.placeholder} /> )  }
                </Item>
              )
            case 'select-tree':
              return(
                <Item label={item.label} key={index}>
                  {getFieldDecorator('areaIds', { initialValue: item.initialValue })(
                    <TreeSelect
                      showSearch
                      dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                      placeholder="全部"
                      allowClear
                      multiple
                      getPopupContainer={triggerNode => triggerNode.parentNode}
                      treeDefaultExpandAll
                      treeNodeFilterProp='title'
                    >
                      {this.getTreeNode(item.data)}
                    </TreeSelect>
                  )}
                </Item>
              )
            default:  break
          }

        })
        }
        <div className='two-item-search-btn btns-container'>
          <Button type='primary' onClick={(e)=>this.onSubmit(e, 'save')}>保存模板</Button>
          <Button type='primary'onClick={(e)=>this.onSubmit(e, 'edit')}>修改模板</Button>
        </div>
      </Form>
    )
  }
}
const Searchs = Form.create()(Search)

export default connect()(Searchs)
