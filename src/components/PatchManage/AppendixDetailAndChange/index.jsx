import { Component, Fragment } from 'react'
import { withRouter } from 'react-router-dom'
import { Message, Table, Pagination, Modal, Icon } from 'antd'
import { string } from 'prop-types'
import { TableBtns } from '@c/index'
import AddAppendixForm from '@c/PatchManage/AddAppendixForm'
import { download, TooltipFn, analysisUrl, transliteration } from '@u/common'
import api from '@/services/api'
import './index.less'

const { confirm } = Modal
@withRouter
class AppendixDetailAndChange extends Component {
  //type:change为是编辑，detail为详情
  static propTypes = {
    type: string
  }
  constructor (props) {
    super(props)
    this.state = {
      id: analysisUrl(props.location.search).id,
      formVisible: false,
      currentStringId: null,
      selectedRowKeys: [],
      body: {
        items: [],
        total: 0
      },
      currentPage: 1,
      pageSize: 10,
      selectedRows: [],
      addList: [], //新增附件
      iDataList: [], //前端分页数据
      deleteList: [] //删除数据
    }
  }

  componentDidMount () {
    this.props.adjunct(this)
    if (this.state.id){
      this.getList()
    }
  }

  saveAccessoryList = () => {
    const { addList, deleteList } = this.state
    return {
      add: addList,
      delete: deleteList
    }
  }

  render () {
    const { type } = this.props
    const isChange = type === 'change'
    const { body, currentPage, pageSize, selectedRowKeys, formVisible, iDataList, id } = this.state
    let list = [], total = 0
    if (body.items.length) {
      list = iDataList
      total = body.items.length
    }
    const isDisabled = total === 1
    const rowSelection = isChange ? {
      selectedRowKeys,
      onChange: (selectedRowKeys, selectedRows) => {
        this.setState({
          selectedRowKeys,
          selectedRows
        })
      }
    } : null
    let Sta = analysisUrl(this.props.location.search)
    let columns = [
      {
        title: '版本号',
        dataIndex: 'patchVersion',
        render: text => TooltipFn(text)
      },
      {
        title: '附件大小',
        dataIndex: 'fileSizeStr',
        render: text => TooltipFn(text)
      },
      {
        title: '附件名称',
        dataIndex: 'fileName',
        render: text => TooltipFn(text)
      },
      {
        title: '附件MD5码',
        dataIndex: 'fileMd5',
        render: text => TooltipFn(text)
      },
      {
        title: '品类型号名称',
        dataIndex: 'productName',
        render: text => TooltipFn(text)
      },
      // {
      //   title: '附件信息',
      //   dataIndex: 'fileLink',
      //   render: (text, record) => {
      //     return <a>
      //       <img
      //         onClick={() => this.down(record)}
      //         src={require('@a/download.svg')} alt="" style={{ width: 22 }} />
      //     </a>
      //   }
      // },
      {
        title: '原始下载链接',
        dataIndex: 'originalUrl',
        render: text => TooltipFn(text)
      }
    ]
    isChange && columns.push({
      title: '操作',
      dataIndex: 'stringId',
      key: 'stringId',
      width: 180,
      render: (text, record, i) => {
        return (
          <div className="operate-wrap">
            <a className={isDisabled ? 'disable-btn' : null} onClick={() => { this.confirm(record, i) }} disabled={isDisabled}>删除</a>
          </div>
        )
      }
    })
    // if( !isChange) columns.splice(5, 0, {
    //   title: '附件信息',
    //   dataIndex: 'fileLink',
    //   render: (text, record) => {
    //     return <a>
    //       <img
    //         onClick={() => this.down(record)}
    //         src={require('@a/download.svg')} alt="" style={{ width: 22 }} />
    //     </a>
    //   }
    // })
    return (
      <div className="table-wrap patch-append">
        <p className="patch-title">关联附件信息</p>
        {
          isChange && <TableBtns leftBtns={[
            { label: '新增', onClick: () => this.setState({ formVisible: true }) }
          ]}
          rightBtns={[
            { label: '删除', onClick: this.deleteBatch, disabled: body.items && body.items.length > 1  ? false : true }
          ]}
          />
        }
        {/* 列表 */}
        <Table
          rowKey="index"
          rowSelection={rowSelection}
          columns={columns}
          dataSource={list}
          pagination={false}
        />
        {/* 分页 */}
        {
          total > 0 && <Pagination className="table-pagination"
            pageSize={pageSize}
            current={currentPage}
            onChange={this.pageChange}
            onShowSizeChange={this.pageChange}
            total={total}
            showTotal={(total) => `共 ${total || 0} 条数据`}
            showSizeChanger={total > 10 && !id ? true : false }
            showQuickJumper={ total > 10 && ['regsiter', 'edit'].includes(Sta.from) || Sta.from === undefined ? true : false }
          />
        }
        {
          isChange &&
          <Fragment>
            <AddAppendixForm
              visible={formVisible}
              onSubmit={this.handleSubmit}
              onClose={() => this.setState({ formVisible: false })}
            />
          </Fragment>
        }
      </div>
    )
  }

  //提交表单,callBack:子组件回调函数
  handleSubmit = (values, callBack) => {
    const { currentPage, pageSize, body, addList } = this.state
    values.createTimes = new Date().valueOf()
    body.items.unshift(values)
    body.items.forEach((item, i)=>{
      item.index = i
    })
    addList.unshift(values)
    this.setState({ formVisible: false, addList })
    this.operationIdata(this.iDataNumber(body.items, currentPage, pageSize))
    callBack()
  }

  //确认操作
  confirm = (row, res = false) => {
    let { id } = this.state
    if(id){
      confirm({
        icon: <Icon type="close" onClick={() => { Modal.destroyAll() }} />,
        content: '确认删除附件信息？',
        okText: '确认',
        onOk: () => {
          this.deleteSigle(row, res)
        },
        onCancel: () => {}
      })
    }else{
      this.deleteSigle(row, res)
    }
  }

  //删除多选
  deleteBatch = (stringId) => {
    const { selectedRowKeys, body, selectedRows } = this.state
    if (selectedRowKeys.length === 0) {
      Message.info('请选择数据！')
      return false
    }
    if (selectedRowKeys.length === body.items.length) {
      Message.info('不能将附件全部删除！')
      return false
    }
    this.confirm(selectedRows, true)
  }
  //分页
  pageChange = (currentPage, pageSize) => {
    let { body } = this.state
    this.setState({
      currentPage,
      pageSize
      // selectedRowKeys: []
    })
    this.operationIdata(this.iDataNumber(body.items, currentPage, pageSize))
  }
  //手动分页数据
  operationIdata = (filtrate = {}) => {
    let { body } = this.state
    body.items = filtrate.items
    this.setState({ iDataList: filtrate.iData, body })
  }
  //分页数据
  iDataNumber = (iDataList, currentPage, pageSize) => {
    let init
    if (currentPage <= 1)
      init = iDataList.filter((item, i) => i < (currentPage * pageSize))
    else if (currentPage > 1)
      init = iDataList.filter((item, i) => i < (currentPage * pageSize) && i >= ((currentPage - 1) * pageSize))
    iDataList = iDataList.map((item, i)=>{
      item.index = i
      return item
    })
    return {
      iData: init,
      items: iDataList
    }
  }
  //删除单选
  deleteSigle = (re, multiple = false ) => {
    let dl = []
    let init = [].concat(re)
    let { body, deleteList, currentPage, pageSize, addList } = this.state
    init.forEach(item=>{
      if(item.id){
        dl.push(item.id)
        body.items = body.items.filter((now, i) => item.id !== now.id)
      }else{
        body.items = body.items.filter((now, i) => item.createTimes !== now.createTimes)
        addList = addList.filter((now, i) => item.createTimes !== now.createTimes)
      }
    })
    deleteList = deleteList.concat(dl)
    this.setState({ deleteList, addList })
    if( currentPage > 1){
      if(!((currentPage * pageSize) >= body.items.length && body.items.length > ((currentPage - 1) * pageSize))){
        currentPage -= 1
        this.setState({ currentPage })
      }
    }
    if(multiple) this.setState({ selectedRowKeys: [], selectedRows: [] })
    this.operationIdata(this.iDataNumber(body.items, currentPage, pageSize))
  }
  // 有编号时重新获取数据
  resetList=(id)=>{
    let { currentPage, pageSize } = this.state
    if(id){
      this.setState({
        body: {
          items: [],
          total: 0
        },
        id,
        addList: [], //新增附件
        iDataList: [], //前端分页数据
        deleteList: [] }, ()=>this.getList(currentPage, pageSize))
    }
  }

  //获取列表
  getList = async (currentPage = 1, pageSize = 10) => {
    const { id } = this.state
    const param = {
      antiyPatchNumber: id
    }
    await api.getPatchRegisterAccessory(param).then(response => {
      let body  = {
        items: [],
        total: 0
      }
      body.items = response.body || []
      // for(let i = 0; i < 10 ; i++){
      //   body.items.push({
      //     fileName: i
      //   })
      // }
      body.items.forEach((item, i)=>{
        item.index = i
      })
      this.setState({
        body,
        iDataList: body.items.filter((item, i) => i < (currentPage * pageSize))
      })
    })
  }

  //下载
  down = (record) => {
    let params = {
      fileUrl: record.fileLink,
      fileName: transliteration(record.fileName)
    }
    // const headers = createHeaders(params) // 把请求参数传入到函数，生成headers
    // params = Object.assign(headers, params) // 把请求参数和headers合并，生成新的请求参数
    // window.open(`/api/v1/patch/file/download?${qs.stringify(params)}`)
    // /v1/patch/file/download
    download('/api/v1/patch/file/download', params)
  }
}

export default AppendixDetailAndChange
