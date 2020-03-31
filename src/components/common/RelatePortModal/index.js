import React, { Component } from 'react'
import { Button, InputNumber } from 'antd'
import { CommonModal } from '@c/index'
import PropTypes from 'prop-types'
import './index.less'
import { validateFloatingPoint } from '@u/regExp'
/**
 * props
 * @param request {Function} 请求的方法，传递进来，内部进行请求，不予外部交互
 * @param visible {Boolean} 弹窗是否显示
 * @param title {String} 弹窗标题
 * @param onSubmit {Function} Function(keys|[], list|[])=> void 点击保存按钮回调函数，参数1为选择的stringId， 参数第2位为选中的列表数据
 * @param onCancel {Function} 关闭弹出
 */
class RelatePortModal extends Component {
  static propTypes = {
    request: PropTypes.func
  }
  constructor (props) {
    super(props)
    this.state = {
      portList: [''], //提交端口
      errArr: [], //错误端口
      nullArr: [] //空端口
    }
  }

  componentDidMount () {
  }

  UNSAFE_componentWillReceiveProps (nextProps){
    if (nextProps.visible === false) {
      this.setState({
        portList: [''],
        errArr: [],
        nullArr: []
      })
    }
  }
  /**
   * 关闭添加软件的弹窗
   */
  closeAddHardModal = () => {
    const { onClose } = this.props
    onClose && onClose()
  }
  addHardware = (keys, list) => {
    // console.log('选中的软件===》', keys, list)
    this.addKeys = keys
    this.list = list
  }
  /**
   * 提交数据
   */
  onSubmit = () =>{
    const { onSubmit } = this.props
    const { portList, errArr } = this.state
    // console.log('添加信息集合===》', portList)
    if(errArr.length){
      return
    }
    const nullArr = []
    portList.forEach((e, i)=>{
      if(e === ''){
        nullArr.push(i)
      }
    })
    if(nullArr.length){
      this.setState({ nullArr })
      return
    }
    onSubmit && onSubmit(portList)
  }
  /**
   * 新增端口行
   * @param idx{Number}
   */
  addRow = (idx) => {
    const { portList } = this.state
    const _portList = [ ...portList]
    _portList.splice(idx + 1, 0, '')
    // 从第6行时，滚动到底部
    if(idx + 1 >= 6){
      this.scrollToTop(idx + 1)
    }
    // console.log(_portList)
    this.setState({ portList: _portList })
  }
  /**
   * 删除端口行
   * @param idx{Number}
   */
  delRow = (idx) => {
    const { portList } = this.state
    const _portList = [ ...portList]
    _portList.splice(idx, 1)
    this.setState({ portList: _portList }, ()=>{
      // 删除行时，进行验证
      // this.onBlur()
      this.onDelRow(idx)
    })
  }
  //双错误跟随portList改变
  onDelRow=idx=>{
    const { errArr, nullArr, portList } = this.state

    const operationEmpty = Arr=>Arr.length > 0 ? Arr.filter(v=> v !== idx).map(v=>v > idx ? v - 1 : v) : Arr
    const operationErr = Arr=>{
      if(Arr.length === 0) return Arr
      if(portList.length === 1) return []
      const Arr2 = Arr.filter(v=> v !== idx).map(v=>v > idx ? v - 1 : v)
      return Arr2.length === 1 ? [] : Arr2
    }

    this.setState({
      errArr: operationErr(errArr),
      nullArr: operationEmpty(nullArr)
    })
  }
  /**
   * 改变当前位置端口的值
   * @param val {Number} 输入的值
   * @param idx
   */
  onChange = (val, idx) => {
    let _val =  val + ''
    if(val === null){
      _val =  ''
    }
    const { portList } = this.state
    const _portList = [ ...portList]
    _portList[idx] = _val
    this.isNull(_portList)
    this.setState({ portList: _portList })
  }
  /**
   * 输入框失焦验证
   */
  onBlur = () => {
    const { portList } = this.state
    const _portList = [ ...portList]
    const errArr = []
    const nullArr = []
    // 找出数组中相同项的下标
    _portList.forEach((e, i)=>{
      if(e === ''){
        nullArr.push(i)
      }
      _portList.forEach((el, id)=>{
        if(i !== id && _portList.filter(it=>el === it).length > 1 && el){
          errArr.push(id)
        }
      })
    })
    this.setState({ errArr: [...new Set(errArr)] })
  }
  isNull = (portList = []) => {
    const nullArr = []
    const { nullArr: oldNullArr } = this.state
    // 找出数组中相同项的下标
    portList.forEach((e, i)=>{
      if(e === '' && oldNullArr.includes(i)){
        nullArr.push(i)
      }
    })
    this.setState({ nullArr })
  }
  /**
   * 滚动到最底部行
   * @param idx 要滚动到哪一个行元素的下标
   */
  scrollToTop = (idx) =>{
    // 此处必须使用异步，否则dom节点还没刷新加载出来，就执行滚动
    setTimeout(()=>{
      const tmp = document.getElementById(`row-${idx}`)
      // 每行的上下margin总和
      const marginHeight = 8
      const clientHeight = tmp.clientHeight + marginHeight
      const describeHeight = 61 // 端口描述的高度，包括margin
      tmp.parentNode.parentNode.scrollTo({ top: describeHeight + (clientHeight * idx) })
    }, 100)
  }
  render () {
    const { portList, errArr, nullArr } = this.state
    const { visible, title } = this.props
    return (
      <CommonModal
        type="normal"
        visible={visible}
        title={title}
        width={650}
        onClose={this.closeAddHardModal}
      >
        <div className="relate-port-modal-content">
          <p className="relate-port-modal-title" id="describe">端口号范围：0~65535（整数）</p>
          {
            portList.map((e, i)=>{
              const err = errArr.includes(i)
              return (
                <div key={`${i}`} id={`row-${i}`} className={ `port-modal-item ${ err ? 'has-error' : '' }`}>
                  <span className="err-label">*</span>端口号: <InputNumber min={0} max={65535} precision={0} parser={value => validateFloatingPoint(value)} value={e} style={{ width: 200 }} onChange={(v)=>{this.onChange(v, i)}} onBlur={this.onBlur}/>
                  {
                    portList.length > 1 ? (<span className="relate-port-btn" onClick={()=>{this.delRow(i)}}>删除</span>) : null
                  }
                  {
                    portList.length - 1 === i && <span className="relate-port-btn" onClick={()=>{this.addRow(i)}}>新增</span>
                  }
                  <span className="err-msg" style={{ display: err ? 'inline-block' : 'none' }}>端口重复</span>
                  <span className="err-msg" style={{ display: nullArr.includes(i) ? 'inline-block' : 'none' }}>端口不能为空</span>
                </div>
              )
            })
          }
        </div>
        <div className="button-center">
          <div>
            <Button type="primary" onClick={this.onSubmit}>保存</Button>
            <Button type="primary" ghost onClick={this.closeAddHardModal}>取消</Button>
          </div>
        </div>
      </CommonModal>
    )
  }
}
export default RelatePortModal
