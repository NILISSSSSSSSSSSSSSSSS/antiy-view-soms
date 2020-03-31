import { Component } from 'react'
import { Message, Button, Row, Col, Select } from 'antd'
import api from '@/services/api'
import Hurdle from './Hurdle'
import ShowForm from './ModelForm'
import com from './common'
import PropTypes from 'prop-types'
import HintAlertConfirm from '@/components/System/HintAlert'
// import { findNodeByStringID } from '@/utils/common'
import './style.less'
const { Option } = Select
let eachTree = []
let timeout

export default class DataSubfield extends Component {
  constructor (props) {
    super(props)
    this.state = {
      treeData: this.props.iData, //树的原数据
      keyArray: [], //分栏元素 数组
      title: this.props.title, //标题文字
      handleText: '',
      formData: {},
      handle: this.props.handle,
      authList: this.props.authList,
      searchdata: [], //模糊查询
      searchV: sessionStorage.searchV || '', //搜索文字
      init: [], //选中搜索下拉框结果
      changes: false, //是否通过功能按钮操作
      changesID: '', //选中节点的ID
      searchShow: true,
      deleteState: false,
      hintConfig: {},
      hintShow: false,
      nowId: '' //当前Id
    }
  }

  static propTypes = {
    title: PropTypes.array,
    iData: PropTypes.string,
    handle: PropTypes.array,
    apiConfig: PropTypes.object,
    authList: PropTypes.array
  }

  async componentDidMount () {
    await this.update()
    if (sessionStorage.columnsList && sessionStorage.searchV !== '') this.sure(null, true)
  }
  componentDidUpdate () {
    //数据更新时 控制滚动条
    this.scrollLeft()
  }
  //保存數據
  saveData = (iData) => {
    let { changes, changesID, keyArray, deleteState, nowId } = this.state
    eachTree = []
    this.eachTree(iData)
    let keyArrays =
      [{
        fullName: '虚拟父级',
        fullSpell: null,
        levelType: 0,
        shortName: null,
        shortSpell: null,
        status: 1,
        stringId: 'all', parentId: 'all', childrenNode: JSON.parse(JSON.stringify(iData))
      }]
    this.setState({
      treeData: keyArrays
    }, () => {
      //分栏数组没有数据时
      if (!changes && !keyArray.length) {
        this.setState({ keyArray: keyArrays })
        return
      }
      //通过功能按钮操作
      if (changes) {
        let arr = com.findPathByLeafId(changesID, iData) //找到节点当中的所有相关联父级节点的
        let parentID = keyArray.filter(el => el.stringId === changesID) //获取父级ID
        let child = arr.filter(el => el.stringId === changesID) //获取子级node
        let initList = arr.filter(el => el.stringId === parentID[0].parentId)//获取父级node
        keyArray[0].childrenNode = iData
        //更新元素数组中childrenNode
        for (let i = 0; i < keyArray.length; i++) {
          if (keyArray[i].stringId === parentID[0].parentId)
            keyArray[i] = initList[0]
          else if (keyArray[i].stringId === changesID && child.length)
            keyArray[i] = child[0]
        }
        //执行删除操作 放弃没有关联的分栏
        if (deleteState) {
          keyArray = keyArray.slice(0, arr.length + 1)
          this.setState({ deleteState: false })
        }
        this.setState({ keyArray }, ()=>{
          if(nowId) this.changeEl()
        })
      }
    })
  }
  //指定滚动条位置
  scrollLeft = () => {
    const div = document.querySelector('.subfield-main-tree .subfield-tree')
    div.scrollLeft = div.scrollWidth
  }
  //编辑节点
  redactNode = (item) => {
    let { title } = this.state
    this.ShowForm.show(title + '修改', 1)
    this.setState({ formData: item })
  }
  //点击节点
  clickNode = (item) => {
    let { keyArray, treeData } = this.state
    // 查找是否已经点击当前栏
    const currentRowIndex = keyArray.findIndex((e) => {
      return e.stringId === item.parentId
    })
    const exist = treeData[0].childrenNode.findIndex((e) => e.parentId === item.parentId)
    const isStair = treeData[0].childrenNode.filter(e => e.stringId === item.stringId)
    const node = eachTree.filter(e => e.stringId === item.stringId)
    let _keyArray = []
    if (currentRowIndex !== -1) {
      _keyArray = [...keyArray].slice(0, currentRowIndex + 1).concat(node)
    } else if (exist >= 0) {
      _keyArray = [...keyArray].slice(0, 1).concat(isStair[0])
    } else {
      _keyArray = [...keyArray].concat(item)
    }
    this.setState({ keyArray: _keyArray })
  }
  //删除节点
  deleteNode = (item, text) => {
    //弹窗配置
    const init = {
      text,
      submit: () => this.handleAlert(item),
      onCancel: () => this.setState({ hintShow: false })
    }
    this.setState({ hintConfig: init, hintShow: true })
  }
  //confirm确认
  handleAlert = (item) => {
    let { handle, title } = this.state
    let param
    if (!title.includes('区域')) {
      param = { primaryKey: item.stringId }
    } else {
      param = { id: item.stringId }
    }
    api[handle[2]](param).then(res => {
      if (res && res.head && res.head.code === '200') {
        Message.success('删除成功')
        this.setState({
          changesID: item.parentId,
          changes: true,
          deleteState: true
        }, ()=>{
          this.update()
          if(sessionStorage.columnsList){
            let initData = JSON.parse(sessionStorage.columnsList)
            //如果有 清除缓存中同样的数据
            initData.forEach((opt, i)=>{
              if(opt.stringId === item.stringId) initData.splice(i, 1)
            })
            sessionStorage.columnsList = JSON.stringify(initData)
          }
        })
        this.setState({ hintShow: false })
      }
    })
  }
  //增加节点
  addNode = (item) => {
    let { title } = this.state
    this.ShowForm.show(title + '添加', 2)
    this.setState({
      formData: {
        parentId: item.stringId,
        stringId: undefined,
        fullName: undefined
      }
    })
  }
  //更新整个树
  update = async () => {
    const { apiConfig } = this.props
    await api[apiConfig.api](apiConfig.config).then((res) => {
      this.saveData(res.body ? [res.body] : [])
    })
  }
  //执行功能按钮操作
  handles = (item) => {
    this.setState({
      changesID: item.id,
      changes: 1,
      nowId: item.nowId
    }, this.update)
  }
  //重置
  handleReset = () => {
    let { treeData } = this.state
    this.setState({ keyArray: treeData, searchV: '', searchdata: [], searchShow: true })
    sessionStorage.removeItem('columnsList')
    sessionStorage.removeItem('searchV')
  }
  //递归整个树
  eachTree = (iData) => {
    iData.forEach(item => {
      if (item.childrenNode && item.childrenNode.length) {
        eachTree = eachTree.concat(item.childrenNode)
        this.eachTree(item.childrenNode)
      } else {
        if (eachTree.every(el => el.stringId !== item.stringId))
          eachTree = eachTree.concat([item])
      }
    })
  }
  //搜索
  handleSearch = () => {
    const { searchV } = this.state
    if (timeout) {
      clearTimeout(timeout)
      timeout = null
    }
    const handle = () => {
      if (searchV.length) {
        let filt = eachTree.filter(now => (now.fullName || now.name).toLowerCase().indexOf(searchV.toLowerCase()) > -1)
        if (filt.length) this.setState({ searchdata: filt })
        else this.setState({ searchShow: true, searchdata: [] })
      } else {
        this.setState({ searchShow: true, searchdata: [] })
      }
    }
    timeout = setTimeout(handle, 200)
  }
  //搜索结果更改
  selectOpt = (key, opt) => {
    let { treeData } = this.state
    let initList = com.findPathByLeafId(key, treeData)
    this.setState({
      init: initList,
      searchV: opt.props.children,
      searchShow: false
    })
  }
  changeEl = ()=>{
    let arr = document.querySelectorAll('li.ant-tree-treenode-selected')
    for (let i = 0; i < arr.length; i++) {
      arr[i].parentElement.parentElement.scrollTop = arr[i].offsetTop / 2
    }
  }
  //提交搜索结果 更新元素
  sure = (e, obj = false) => {
    let { init, searchV, treeData } = this.state
    if (obj) {
      let iData = JSON.parse(sessionStorage.columnsList)
      init =  com.findPathByLeafId(iData[iData.length - 1].stringId, treeData)

    }
    if (init.length) {
      this.setState({ keyArray: init }, () => {
        this.changeEl()
      })
      sessionStorage.setItem('columnsList', JSON.stringify(init))
      sessionStorage.setItem('searchV', searchV)
    }
  }

  render () {
    let {
      handle,
      searchV,
      keyArray,
      formData,
      handleText,
      searchdata,
      searchShow,
      hintConfig,
      hintShow,
      nowId,
      authList
    } = this.state
    const options = searchdata.map(d => (<Option key={d.stringId}>{d.fullName || d.name}</Option>))
    return (
      <div className="subfield-main-tree">
        <header>
          <Row>
            <Col span={14}>
              <Select
                style={{ width: 'calc(100% - 55%)' }}
                showSearch
                value={searchV}
                placeholder='搜索'
                showArrow={false}
                defaultActiveFirstOption={false}
                filterOption={false}
                onSearch={(v) => this.setState({ searchV: v }, () => {
                  this.handleSearch()
                })}
                onSelect={this.selectOpt}
                notFoundContent={null}
              >
                {options}
              </Select>
              <Button type={searchShow ? '' : 'primary'} size={'large'} disabled={searchShow} onClick={this.sure}>查询</Button>
              <Button type="primary" size={'large'} ghost onClick={this.handleReset}>重置</Button>
            </Col>
          </Row>
        </header>
        <div className='subfield-tree'>
          {
            keyArray.map((item, i) => {
              const selectedKeys = []
              if (keyArray[i + 1]) {
                selectedKeys.push(keyArray[i + 1].stringId)
              }
              if (item.childrenNode && item.childrenNode.length) {
                if(!selectedKeys.length && nowId ){
                  selectedKeys.push(nowId)
                }
                return (<Hurdle
                  selectedKeys={selectedKeys}
                  iData={item.childrenNode}
                  key={item.stringId}
                  index={item.stringId}
                  clickNode={this.clickNode}
                  parents={this}
                />)
              }
              return null
            })
          }
        </div>
        <ShowForm
          ShowForm={(now) => this.ShowForm = now}
          title={handleText}
          update={this.update}
          handles={(now) => this.handles(now)}
          formData={formData}
          authList={authList}
          handle={handle}></ShowForm>
        <HintAlertConfirm hinitConfig={hintConfig} visible={hintShow}></HintAlertConfirm>
      </div>
    )
  }
}

