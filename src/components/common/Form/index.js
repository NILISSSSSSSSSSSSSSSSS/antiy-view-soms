import { PureComponent } from 'react'
import { Form, Input, InputNumber, Col, Select, TreeSelect, DatePicker, Switch, Radio, TimePicker, Checkbox, Popover, Icon } from 'antd'
import { chunk } from 'lodash'
import DateRange from '@c/common/DateRange'
import PortAndIP from '@c/common/PortAndIP'
import AddScan from '@c/common/AddScan'
import './index.less'

const Option = Select.Option
const TreeNode = TreeSelect.TreeNode
const { TextArea } = Input
const renderPopverContent = content => {
  return (
    <span className="popover">
      {
        content ?
          <Popover content={content}>
            <Icon type='question-circle' />
          </Popover>
          : null
      }
    </span>
  )
}
// const PopoverInput = ({ inputType, name, placeholder, popover, ...other }) =>{
//   return (
//     <div>
//       <Input autoComplete="off" type={inputType} placeholder={placeholder || `请输入${name}`} className="form-item-warp" { ...other}/>
//       { renderPopverContent(popover) }
//     </div>
//   )
// }
/**
 * @param unAutoComplete 禁止自动填充
 */
class PopoverInput extends PureComponent {
  render () {
    const { inputType, name, placeholder, popover, show, percent, unAutoComplete, ...other } = this.props
    return (
      <div>
        {unAutoComplete && <Input name="hideText" style={{ display: 'none' }}></Input>}
        <Input autoComplete={unAutoComplete ? 'new-password' : 'off'} type={inputType} placeholder={placeholder || `请输入${name}`} className="form-item-warp" suffix={ percent && <span className='right-text'>%</span>  } {...other} />
        {renderPopverContent(popover)}
      </div>
    )
  }
}
const Detail = ({ value, render }) => {
  const result = render ? render() : value
  return <div>{result}</div>
}
class CommonForm extends PureComponent {
  state = {
  }
  renderPopverContent = content => {
    return (
      <span className="popover">
        {
          content ?
            <Popover content={content}>
              <Icon type='question-circle' />
            </Popover>
            : null
        }
      </span>
    )
  }
  validateDateRange = (rule, value, callback, message) => {
    if (!value[0] && message[0]) {
      callback(message[0])
    } else if (!value[1] && message[1]) {
      callback(message[1])
    } else {
      callback()
    }
  }
  /**
   * 渲染后缀提示信息
   * @param text
   * @return {*}
   */
  renderPopover = (text) => {
    if(!text) return
    return (
      <div className="popover-select">
        <Popover content={text}>
          <Icon type='question-circle' />
        </Popover>
      </div>
    )
  }
  /**
   * 下拉框、提示窗的挂载父节点
   */
  getPopupContainer = (triggerNode) => {
    const { container } = this.props
    if(container === 'form'){
      return triggerNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode
    }
    return triggerNode.parentNode
  }
  /**
   * 根据表单项的类型，渲染表单项
   * @param filed 表单项
   * @param i 表单项索引
   */
  renderFormItem = (filed, i) => {
    const { form, FormItem, formLayout = {} } = this.props
    const { getFieldDecorator } = form || {}
    const { type, validateTrigger, name, key, rules, inputType = 'text', placeholder, data, config, defaultValue: initialValue, onSearch, popover, percent, max, scanData = [], ...other } = filed || {}
    const { allowClear, disabled, showSearch = true } = other
    // 默认允许删除
    const _allowClear = { allowClear: true }
    //设置不允许被删除或者禁用时，不允许被删除
    if (typeof allowClear === 'boolean' && !allowClear || disabled) {
      _allowClear.allowClear = false
    }
    if (filed.component) {
      const Component = filed.component
      return (
        <FormItem label={name} {...formLayout} key={i}>
          {getFieldDecorator(key, {
            rules,
            validateTrigger,
            initialValue
          })(Component)}
        </FormItem>
      )

    } if (type === 'hidden') {
      return (
        <FormItem label={name} {...formLayout} key={filed.key} style={{ display: 'none' }}>
          {getFieldDecorator(key, {
            rules,
            validateTrigger,
            initialValue
          })(<Input autoComplete="off" disabled={true} placeholder={placeholder || `请输入${name}`} className="form-item-warp" />)}
        </FormItem>
      )
    } else if (type === 'input') {
      return (
        <FormItem label={name} {...formLayout} key={filed.key}>
          {getFieldDecorator(key, {
            rules,
            validateTrigger,
            initialValue
          })(
            <PopoverInput {..._allowClear} inputType={inputType} name={name} placeholder={placeholder} popover={popover} {...other} />
          )}
        </FormItem>
      )
    }else if (type === 'percentInput') {
      return (
        <FormItem label={name} {...formLayout} key={filed.key}>
          {getFieldDecorator(key, {
            rules,
            validateTrigger,
            initialValue
          })(
            <percentInput {..._allowClear} inputType={inputType} name={name} placeholder={placeholder} popover={popover} {...other} />
          )}
        </FormItem>
      )
    } else if (type === 'PortAndIP') {
      return (
        <FormItem label={name} {...formLayout}>
          {getFieldDecorator(key, {
            rules,
            validateTrigger,
            initialValue
          })(
            <PortAndIP {...other} />
          )}
        </FormItem>
      )
    } else if (type === 'AddScan') {
      return (
        <FormItem label={name} {...formLayout}>
          <AddScan title=''
            config={data} //基本配置项
            field={'baselineConfigInfoExt'}
            value={scanData}
            form={form} />
        </FormItem>
      )
    }
    else if (type === 'number') {
      return (
        <FormItem label={name} {...formLayout} key={filed.key}>
          {getFieldDecorator(key, {
            rules,
            validateTrigger,
            initialValue
          })(
            <InputNumber {..._allowClear} placeholder={placeholder} formatter={value => {return percent ? `${value}%` : value}} max={max} {...other} />
          )}
        </FormItem>
      )
    } else if (type === 'select') {
      const { name: configName, value: configValue } = config || {}
      return (
        <FormItem label={name} {...formLayout} key={filed.key} extra={this.renderPopover(popover)}>
          {getFieldDecorator(key, {
            rules,
            validateTrigger,
            initialValue
          })(
            <Select onSearch={onSearch} getPopupContainer={(triggerNode)=>this.getPopupContainer(triggerNode)} placeholder={placeholder || `请选择${name}`} className="form-item-warp" optionFilterProp="label" autocomplete="off" {...other}>
              {(data || []).map((e) => {
                const label = e[configName] || e.label || e.name || e.username || e.osName
                const value = e[configValue] || e.value || e.stringId || e.os || e.osCode
                return (
                  <Option value={value} key={value} label={label}>{label}</Option>
                )
              })}
            </Select>
          )}
        </FormItem>
      )
    } else if (type === 'selectTree') {
      return (
        <FormItem label={name} {...formLayout} key={filed.key}>
          {
            getFieldDecorator(key, {
              rules,
              validateTrigger,
              initialValue
            })(
              <TreeSelect
                allowClear
                treeDefaultExpandAll
                className="form-item-warp"
                getPopupContainer={(triggerNode)=>this.getPopupContainer(triggerNode)}
                placeholder={placeholder || '请选择'}
                treeNodeFilterProp='title'
                showSearch={showSearch}
                onSearch={onSearch}
                {...other}
              >
                {
                  this.renderCategoryModelNodeTree(data || [], config)
                }
              </TreeSelect>
            )
          }
        </FormItem>
      )
    } else if (type === 'date') {
      return (
        <FormItem label={name} {...formLayout} key={filed.key}>
          {getFieldDecorator(key, {
            rules,
            validateTrigger,
            initialValue
          })(
            <DatePicker getCalendarContainer={triggerNode => triggerNode.parentNode} {...other} className="form-item-warp"  {...other} />
          )}
        </FormItem>
      )
    } else if (type === 'timePicker') {
      return (
        <FormItem label={name} {...formLayout} key={filed.key}>
          {getFieldDecorator(key, {
            rules,
            validateTrigger,
            initialValue
          })(
            <TimePicker getCalendarContainer={triggerNode => triggerNode.parentNode} {...other} className="form-item-warp"  {...other} />
          )}
        </FormItem>
      )
    } else if (type === 'textArea') {
      return (
        <FormItem label={name} {...formLayout} key={filed.key}>
          {getFieldDecorator(key, {
            rules,
            validateTrigger,
            initialValue
          })(
            <TextArea placeholder={placeholder || '请输入'} className="form-item-warp" {...other} {...other} />
          )}
        </FormItem>
      )
    } else if (type === 'dateRange') {
      return (
        <FormItem label={name} {...formLayout} key={filed.key}>
          {getFieldDecorator(key, {
            // rules,
            rules: [{
              validator: (rule, value, callback) => {
                this.validateDateRange(rule, value, callback, filed.rules[0].message)
              }
            }],
            initialValue
          })(
            <DateRange {...other} />
          )}
        </FormItem>
      )
    } else if (type === 'switch') {
      return (
        <FormItem label={name} {...formLayout} key={filed.key}>
          {getFieldDecorator(key, {
            rules,
            validateTrigger,
            initialValue
          })(
            <span>
              <Switch {...other} /><span className="switch-label">{filed.switchLabel || ''}</span>
            </span>
          )}
        </FormItem>
      )
    } else if (type === 'radioGroup') {
      return (
        <FormItem label={name} {...formLayout} key={filed.key}>
          {getFieldDecorator(key, {
            rules,
            validateTrigger,
            initialValue
          })(
            <Radio.Group {...other}>
              {(data || []).map((e) => {
                return (
                  <Radio value={e.value} key={e.value}>{e.label}</Radio>
                )
              })}
            </Radio.Group>
          )}
        </FormItem>
      )
    } else if (type === 'checkboxGroup') {
      return (
        <FormItem label={name} {...formLayout} key={filed.key}>
          {getFieldDecorator(key, {
            rules,
            validateTrigger,
            initialValue
          })(
            <Checkbox.Group options={data || []} {...other}
            />
          )}
        </FormItem>
      )
    } else if (type === 'detail') {
      return (
        <FormItem label={name} {...formLayout} key={filed.key}>
          {getFieldDecorator(key, {
            rules,
            initialValue
          })(
            <Detail {...other} />
          )}
        </FormItem>
      )
    }
  }
  //渲染关联设备型号
  renderCategoryModelNodeTree = (data = [], config) => {
    const { name, value, selectable } = config || {}
    return data.map((el) => {
      // 所有节点可选
      el.disabled = false
      // 含有节点选择的配置
      if(selectable){
        /**
         * leafNode: 叶子节点可选，父节点，根节点不可选
         * parentNode: 叶子节点、父节点可选，根节点不可选
         * rootNode: 所有节点可选
         */
        if(selectable === 'rootNode'){
          // 所有节点可选
        } else if(selectable === 'parentNode' && el.levelType <= 1){ // 1 代表的是更节点
          // 根节点禁止选择
          el.disabled = true
        }else if(selectable === 'leafNode' && el.childrenNode && el.childrenNode.length){
          // 根节点、父节点禁止选择
          el.disabled = true
        }
      }else {
        if (el.childrenNode && el.childrenNode.length) {
          el.disabled = true
        }
      }
      return (
        <TreeNode value={el[value || 'value']} disabled={el.disabled} title={el[name || 'name']} key={`${el[value || 'value']}`}>
          {
            this.renderCategoryModelNodeTree(el.childrenNode || [], config)
          }
        </TreeNode>
      )
    })
  }
  /**
   * 表单内容，根据传入的column可判断需要渲染成几列显示的表单，默认一列
   */
  render () {
    const { fields, column } = this.props
    return (
      <div className='PopoverInput'>
        <div className="form-content">
          <Form>
            <div className="form-wrap">
              {
                chunk(fields, column).map((el, idx) => {
                  return (
                    el.map((it, i) => {
                      return (
                        it.type !== 'hidden' ?
                          <Col key={it.key} span={24 / column}>
                            {this.renderFormItem(it, i)}
                          </Col> : this.renderFormItem(it, i)
                      )
                    })
                  )
                })
              }
            </div>
          </Form>
        </div>
      </div>
    )
  }
}
CommonForm.propTypes = {
}
CommonForm.defaultProps = {
}

export default CommonForm
