import { Component, Fragment } from 'react'
import { Checkbox, Icon } from 'antd'
import api from '@/services/api'
import { map } from 'lodash'

const CheckboxGroup = Checkbox.Group

class BaseLineOsType extends Component {
  constructor (props) {
    super(props)
    this.state = {
      childrenCheckBox: { isShow: false, checkedList: [], children: [] },
      allList: [],
      checkBox: null
    }
  }
  /**
   * 确认
   */
  componentDidMount () {
    let { showOs } = this.props
    if (showOs)
      this.getBaseLineTypeByOs() //获取适用系统
  }
  getBaseLineTypeByOs = () => {
    let { showType } = this.props
    api.getBaseLineTypeBy({ name: '操作系统' }).then(res => {
      let list = [{ name: '适用系统：', key: 'os', hasCheckBox: true, children: res.body, node: res.body && res.body[0].parentNode }]
      this.setState({
        allList: list
      }, () => {
        if (showType) {
          this.getBaseLineType() //获取基准类型
        } else {
          let { allList } = this.state
          this.setState({
            checkBox: allList
          })
        }
      })
    })
  }
  getBaseLineType = () => {
    api.getBaseLineType().then(res => {
      let list = [{ name: '基准类型：', key: 'type', hasCheckBox: true, children: res.body, node: res.body && res.body[0].parentNode }]
      let { allList } = this.state
      allList = allList.concat(list)
      this.setState({
        checkBox: allList
      })
    })
  }
  //渲染复选框筛选
  renderCheckBox = () => {
    let { checkBox, childrenCheckBox } = this.state
    let { isShow, name, children, checkedList, checkAll } = childrenCheckBox
    console.log(this.state.childrenCheckBox)
    return checkBox && checkBox.map((item, index) => {
      return item.name ? <div className="check-item" key={index}>
        <span className="check-label" style={{ marginLeft: '25px' }}>{item.name}</span>
        <div style={{ marginLeft: '-10px' }}>
          {
            item.children.map(subItem => {
              let { name, node, indeterminate, children = null, checkAll = false, checked = false } = subItem
              const props = { checked: children ? checkAll : checked }
              return <Fragment key={node}>
                <div className="check-inline">
                  <Checkbox
                    key={node}
                    indeterminate={indeterminate}
                    onChange={e => this.onCheckAllChange(e, subItem)}
                    {...props}
                  >
                    {name}
                  </Checkbox>
                  {children &&
                    <Fragment>
                      <span className="down-icon-box">
                        <Icon type={ subItem.isShow ? 'up' : 'down' } onClick={() => this.showCheckBox(subItem)} />
                      </span>
                    </Fragment>
                  }
                </div>
              </Fragment>
            })
          }
        </div>
        {
          item.hasCheckBox && item.isShow && <div className={'children-box ' + (isShow ? 'show' : 'hide')}>
            <p className="check-label">{item.key === 'type' ? '适用' + name : name }</p>}
            <CheckboxGroup
              options={map(children, 'name')}
              value={ checkAll ? map(checkedList, 'name') : checkedList }
              onChange={(checkedList) => {
                this.onCheckChange(checkedList, childrenCheckBox)
              }}
            />
          </div>
        }
      </div> : null
    })
  }
  /**
   * 展开
   * @param subItem object 当前选择的父级类型
   */
  showCheckBox = (subItem) => {
    let { checkBox } = this.state
    const children = this.geChildrenCheckBox(subItem)
    console.log(subItem, children)
    checkBox = this.closeOther(subItem)
    children.isShow = !subItem.isShow
    checkBox = JSON.parse(JSON.stringify(checkBox))
    const childrenCheckBox = JSON.parse(JSON.stringify(children))
    this.setState({
      checkBox,
      childrenCheckBox
    })
    console.log(this.state.checkBox, this.state.childrenCheckBox)
  }
  /**
   * 关闭其他子复选框
   * @param subItem object 当前选择的父级复选框
   * @return checkBox array 关闭后的所有复选框数据
   */
  closeOther = (subItem) => {
    let { checkBox } = this.state
    checkBox.forEach(item => {
      item.children.forEach(data => {
        if (data.node !== subItem.node) {
          data.isShow = false
        }
      })
      if (item.node === subItem.parentNode)
        item.isShow = true
      else item.isShow = false
    })
    return checkBox
  }
  /**
   * 子集选择
   * @param checkedList array 所选中的子级列表
   * @param subItem object 当前选择父级复选框
   */
  onCheckChange = (checkedList, faterData) => {
    let { checkBox } = this.state
    const children = this.geChildrenCheckBox(faterData) || {}
    children.checkedList = checkedList
    children.indeterminate = !!checkedList.length && checkedList.length < faterData.children.length
    children.checkAll = checkedList.length === faterData.children.length
    checkBox = JSON.parse(JSON.stringify(checkBox))
    const childrenCheckBox = JSON.parse(JSON.stringify(children))
    childrenCheckBox.isShow = true
    this.setState({
      checkBox,
      childrenCheckBox
    })
    console.log(this.state.checkBox, this.state.childrenCheckBox)
  }
  /**
   * 获取当前选中复选框的子级数据
   * @param subItem object 当前选择的父级复选框
   * @return children array 子级数据
   */
  geChildrenCheckBox = (subItem) => {
    console.log(subItem)
    let { checkBox } = this.state
    const father = checkBox.filter(item => item.node === subItem.parentNode)[0]
    const children = father.children.filter(item => item.node === subItem.node)[0]
    console.log(children)
    return children
  }
  /**
   * 父级选择
   * @param e object DOM
   * @param subItem object 当前选择的父级类型
   */
  onCheckAllChange = (e, faterData) => {
    console.log(e, faterData)
    let { checkBox } = this.state
    const children = this.geChildrenCheckBox(faterData)
    if (!faterData.children) {
      children.checked = e.target.checked
    } else {
      checkBox = this.closeOther(faterData)
      children.checkedList = e.target.checked ? faterData.children : []
      children.indeterminate = false
      children.isShow = true
      children.checkAll = e.target.checked
      const childrenCheckBox = JSON.parse(JSON.stringify(children))
      childrenCheckBox.isShow = true
      this.setState({
        childrenCheckBox
      })
    }
    checkBox = JSON.parse(JSON.stringify(checkBox))
    this.setState({
      checkBox
    })
    console.log(this.state.checkBox, this.state.childrenCheckBox)
  }
  //获取列表参数
  getParams = () => {
    const { checkBox } = this.state
    //复选框参数
    const checkBoxParams = this.creatCheckBoxParams(checkBox)
    return {
      checkBox: checkBoxParams
    }
  }
  //组装复选框参数
  creatCheckBoxParams = () => {
    const { checkBox } = this.state
    //复选框参数
    const checkBoxParams = []
    checkBox.forEach(item => {
      if (item.name) {
        const value = []
        item.children.forEach(subItem => {
          //有子集复选框
          if (subItem.children) {
            const checkedList = subItem.checkedList
            if (checkedList.length) {
              const list = checkedList.map(i => i.node)
              value.push(...list)
            }
          } else {
            if (subItem.checked) {
              value.push(subItem.value)
            }
          }
        })
        if (value.length) {
          checkBoxParams.push({
            key: item.key,
            value
          })
        }
      }
    })
    return checkBoxParams
  }
  render () {
    return (
      <div className="check-box no-touch">
        {this.renderCheckBox()}
      </div>
    )
  }
}
export default BaseLineOsType