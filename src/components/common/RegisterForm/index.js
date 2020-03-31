import { Input, Select, DatePicker, TreeSelect } from 'antd'
import _ from 'lodash'
import { Component } from 'react'
import './index.less'

const Option = Select.Option
const { TextArea } = Input
const TreeNode = TreeSelect.TreeNode

export default class  RegisterForm extends Component {
  renderItem = (filed, i) => {
    const { form, FormItem, formLayout = {} } = this.props
    const { getFieldDecorator } =  form || { }
    const { type, name, key, rules, placeholder = '请输入', data, config, defaultValue: initialValue, showSearch = true, onSearch, ...other } = filed || {}
    if(filed.component){
      const Component = filed.component
      return (
        <FormItem label={name} { ...formLayout} key={i}>
          {getFieldDecorator(key, {
            rules,
            initialValue
          })(Component)}
        </FormItem>
      )

    }if(type === 'hidden'){
      return  (
        <FormItem label={name} { ...formLayout} key={i} style={{ display: 'none' }}>
          {getFieldDecorator(key, {
            rules,
            initialValue
          })(<Input autoComplete="off" disabled={true} placeholder={placeholder || `请输入${name}`} className="form-item-warp" />)}
        </FormItem>
      )
    }else if(type === 'input'){
      return (
        <FormItem label={name} { ...formLayout} key={i}>
          {getFieldDecorator(key, {
            rules,
            initialValue
          })(
            <Input autoComplete="off" placeholder={placeholder || `请输入${name}`} className="form-item-warp" { ...other}/>
          )}
        </FormItem>
      )
    }else if(type === 'select'){
      return (
        <FormItem label={name} { ...formLayout} key={i}>
          {getFieldDecorator(key, {
            rules,
            initialValue
          })(
            <Select getPopupContainer={triggerNode => triggerNode.parentNode} placeholder={placeholder || `请选择入${name}`} className="form-item-warp" optionFilterProp="label" autocomplete="off" { ...other}>
              {(data || []).map((e)=>{
                return (
                  <Option value={e.value} key={e.value} label={e.label}>{e.label}</Option>
                )
              })}
            </Select>
          )}
        </FormItem>
      )
    }else if(type === 'date'){
      return (
        <FormItem label={name} { ...formLayout} key={i}>
          {getFieldDecorator(key, {
            initialValue
          })(
            <DatePicker getCalendarContainer={triggerNode => triggerNode.parentNode} { ...other} className="form-item-warp"  { ...other}/>
          )}
        </FormItem>
      )
    }else if(type === 'textArea'){
      return (
        <FormItem label={name} { ...formLayout} key={i}>
          {getFieldDecorator(key, {
            rules,
            initialValue
          })(
            <TextArea  placeholder={placeholder || '请选择'} className="form-item-warp" { ...other} { ...other}/>
          )}
        </FormItem>
      )
    }else if(type === 'selectTree'){
      return (
        <FormItem label={name} { ...formLayout} key={i}>
          {
            getFieldDecorator(key, {
              rules,
              initialValue
            })(
              <TreeSelect
                allowClear
                treeDefaultExpandAll
                className="form-item-warp"
                getPopupContainer={triggerNode => triggerNode.parentNode}
                // dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                placeholder={placeholder || '请选择'}
                treeNodeFilterProp='title'
                showSearch={showSearch}
                onSearch={onSearch}
                { ...other}
              >
                {
                  this.renderCategoryModelNodeTree(data || [], config)
                }
              </TreeSelect>
            )
          }
        </FormItem>
      )
    }
  }
  //渲染关联设备型号
  renderCategoryModelNodeTree = (data = [], config) => {
    const { name, value } = config || {}
    return data.map((el)=>{
      //末节点才可被选择
      el.disabled = false
      if(el.childrenNode && el.childrenNode.length){
        el.disabled = true
      }
      return (
        <TreeNode value={el[value || 'value']} disabled={el.disabled} title={el[name || 'name']} key= {`${el[value || 'value']}`}>
          {
            this.renderCategoryModelNodeTree(el.childrenNode || [], config)
          }
        </TreeNode>
      )
    })
  }
  render (){
    const { fields = [], column = 2 } = this.props
    return (
      <div className="register-from-content">
        {
          _.chunk(fields, column).map((el, idx)=>{
            // const className = column === 1 ? 'register-from-content-row register-from-content-one-row' : 'register-from-content-row'
            return (
              el.map((it, i)=>{
                return this.renderItem(it, i)
              })
            )
          })
        }
      </div>
    )
  }

}
