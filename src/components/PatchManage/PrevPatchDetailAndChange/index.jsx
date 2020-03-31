import { Component, Fragment } from 'react'
import { withRouter } from 'react-router-dom'
import { Message, Modal, Icon } from 'antd'
import PropTypes from 'prop-types'
import DeleteTable from '@c/PatchManage/DeleteTable'
import AddPatchModal from '@c/PatchManage/AddPatchModal'
import { TableBtns } from '@c/index'
import { TooltipFn, getAfterDeletePage } from '@u/common'
import api from '@/services/api'

const { confirm } = Modal
@withRouter
class PrevPatchDetailAndChange extends Component {
  //type:change为是编辑，detail为详情
  static propTypes = {
    type: PropTypes.string
  }
  constructor (props) {
    super(props)
    this.state = {
      id: props.id,
      currentStringId: null,
      selectedRowKeys: [],
      formVisible: false,
      body: {},
      currentPage: 1,
      pageSize: 10
    }
  }

  componentDidMount () {
    this.getList()
  }

  render () {
    const { type } = this.props
    const isChange = type === 'change'
    const { id, body, currentPage, pageSize, selectedRowKeys, formVisible } = this.state
    const rowSelection = isChange ? {
      selectedRowKeys,
      onChange: (selectedRowKeys, selectedRows) => {
        this.setState({
          selectedRowKeys
        })
      }
    } : null
    const columns = [
      {
        title: '前置补丁编号',
        dataIndex: 'antiyNumber',
        render: text => TooltipFn(text)
      },
      {
        title: '前置补丁名称',
        dataIndex: 'patchName',
        render: text => TooltipFn(text)
      }
    ]
    return (
      <div className="table-wrap">
        {
          isChange && <TableBtns leftBtns={[
            { label: '新增', onClick: () => this.setState({ formVisible: true }) }
          ]}
          rightBtns={[
            { label: '删除', onClick: this.deleteBatch }
          ]} />
        }
        <DeleteTable
          body={body}
          rowSelection={rowSelection}
          columns={columns}
          pageSize={pageSize}
          current={currentPage}
          onChange={this.pageChange}
          onDelete={this.deleteSigle}
          onShowSizeChange={this.pageChange}
          isDelete={isChange}
          isShow={isChange}
          rowKey={'patchNumber'} />
        {
          isChange &&
          <Fragment>
            <AddPatchModal
              data={id}
              title="新增前置补丁"
              visible={formVisible}
              onCancel={() => this.setState({ formVisible: false })}
              onSubmit={this.handleSubmit}
            />
          </Fragment>
        }
      </div>
    )
  }

  //提交表单,callBack:子组件回调函数
  handleSubmit = (values, callBack) => {
    if (values.length > 5) {
      Message.info('一次性最多只能选择5个前置补丁！')
      return false
    }
    const { id } = this.state
    api.deletePatchAdd({
      currentPatchId: id,
      prePatchIds: values
    }).then(response => {
      this.setState({
        formVisible: false,
        currentPage: 1,
        pageSize: 10
      })
      callBack()
      Message.success('新增成功')
      this.getList()
    })
  }

  //提交删除
  deletePost = async () => {
    let { body, currentPage, pageSize, selectedRowKeys, currentStringId, id } = this.state
    const deleteIds = currentStringId ? [currentStringId] : selectedRowKeys
    await api.deletePatchPre({
      currentPatchId: id,
      prePatchIds: deleteIds
    }).then(response => {
      this.setState({
        selectedRowKeys: [],
        currentStringId: null
      })
      Message.success('删除成功')
      const total = body.totalRecords - deleteIds.length
      currentPage = getAfterDeletePage(total, currentPage, pageSize)
    })
    await this.getList(currentPage, pageSize)
    //当获取到列表数据后再更新页码，不然会有显示问题
    this.setState({
      currentPage,
      pageSize
    })
  }

  //确认操作
  confirm = (type) => {
    confirm({
      icon: <Icon type="close" onClick={() => { Modal.destroyAll() }} />,
      content: '确认删除补丁？',
      okText: '确认',
      onOk: () => {
        this.deletePost()
      },
      onCancel: () => {
        this.setState({
          currentStringId: null
        })
      }
    })
  }

  //删除多选
  deleteBatch = (stringId) => {
    const { selectedRowKeys } = this.state
    if (selectedRowKeys.length === 0) {
      Message.info('请选择数据！')
      return false
    }
    this.confirm()
  }

  //删除单选
  deleteSigle = (id) => {
    this.setState({ currentStringId: id })
    this.confirm()
  }

  //分页
  pageChange = (currentPage, pageSize) => {
    this.setState({
      currentPage,
      pageSize
    })
    this.getList(currentPage, pageSize)
  }

  //获取列表
  getList = async (currentPage = 1, pageSize = 10) => {
    const { id } = this.state
    const param = {
      antiyPatchNumber: id,
      currentPage,
      pageSize
    }
    await api.getPrePatchList(param).then(response => {
      const body = response.body || {}
      this.setState({
        body
      })
    })
  }
}

export default PrevPatchDetailAndChange
