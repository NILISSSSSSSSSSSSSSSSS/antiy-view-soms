import { Component, Fragment } from 'react'
import { withRouter } from 'dva/router'
import { Message } from 'antd'
import { string } from 'prop-types'
import { cloneDeep } from 'lodash'
import DeleteTable from '@c/PatchManage/DeleteTable'
import AddTableModal from '@c/PatchManage/AddTableModal'
import { CommonModal, TableBtns } from '@c/index'
import { TooltipFn, analysisUrl } from '@u/common'
import api from '@/services/api'
// import { getServicesList, getServeTypes } from '@services/assetServices'

@withRouter
class ServiceDetailAndChange extends Component {
  //type:change为是编辑，detail为详情,from:bug | patch
  static propTypes = {
    type: string,
    from: string
  }
  constructor (props) {
    super(props)
    this.state = {
      id: analysisUrl(props.location.search).id,
      deleteVisible: false,
      currentStringId: null,
      selectedRowKeys: [],
      modalBody: {},
      modalValues: {},
      body: {},
      currentPage: 1,
      pageSize: 10,
      addVisible: false,
      modalCurrentPage: 1,
      modalPageSize: 10,
      serveType: []
    }
  }

  componentDidMount () {
    // this.getList()
    //获取服务类型
    // getServeTypes().then( data => {
    //   let body = data.body
    //   body = body || []
    //   body.forEach(item => {
    //     item.value = item.businessId
    //   })
    //   this.setState({ serveType: body })
    // })
  }

  render () {
    const { type } = this.props
    const isChange = type === 'change'
    const { body, currentPage, pageSize, deleteVisible, addVisible, modalCurrentPage,
      modalPageSize, selectedRowKeys, modalBody, serveType } = this.state
    const rowSelection = isChange ? {
      selectedRowKeys,
      onChange: (selectedRowKeys, selectedRows) => {
        this.setState({
          selectedRowKeys
        })
      }
    } : null
    const defaultFields = [
      { type: 'input', label: '服务名', placeholder: '请输入', key: 'service', allowClear: true },
      { type: 'input', label: '显示名', placeholder: '请输入', key: 'displayName', allowClear: true },
      { type: 'select', label: '服务类型', placeholder: '请选择', key: 'serviceClasses', data: serveType, allowClear: true }
    ]
    const columns = [
      {
        title: '服务名',
        dataIndex: 'service',
        render: text => TooltipFn (text)
      },
      {
        title: '显示名',
        dataIndex: 'displayName',
        render: text => TooltipFn (text)
      },
      {
        title: '服务类型',
        dataIndex: 'serviceClassesStr',
        render: text => TooltipFn (text)
      },
      {
        title: '启动参数',
        dataIndex: 'startupParameter',
        render: text => TooltipFn (text)
      },
      {
        title: '描述',
        dataIndex: 'describ',
        render: text => TooltipFn (text)
      }
    ]
    //弹框列表
    const modalColumns = cloneDeep(columns)
    return (
      <Fragment>
        <div className="table-wrap">
          {
            isChange && <TableBtns leftBtns={[
              { label: '新增', onClick: this.addModal }
            ]}
            rightBtns={[
              { label: '删除', onClick: this.deleteBatch }
            ]} />
          }
          <DeleteTable
            rowKey="serviceId"
            body={body}
            rowSelection={rowSelection}
            columns={columns}
            pageSize={pageSize}
            current={currentPage}
            onChange={this.pageChange}
            onDelete={this.onDelete}
            onShowSizeChange={this.pageChange}
            isDelete={isChange}
            isShow={isChange} />
          {
            isChange &&
            <Fragment>
              <CommonModal
                type="confirm"
                visible={deleteVisible}
                onConfirm={this.deletePost}
                onClose={() => this.setState({ deleteVisible: false, currentStringId: null })}
              >
                <p className="confirm-text">确认删除服务？</p>
              </CommonModal>
              <AddTableModal
                title="新增服务"
                rowKey={'businessId'}
                pageSize={modalPageSize}
                current={modalCurrentPage}
                body={modalBody}
                columns={modalColumns}
                onChange={this.onModalPageChange}
                onSearch={this.onSearch}
                onReset={this.onReset}
                defaultFields={defaultFields}
                visible={addVisible}
                onConfirm={this.onConfirm}
                onClose={this.onClose}
              />
            </Fragment>
          }
        </div>
      </Fragment>
    )
  }

  //新增服务,callBack:公共添加列表清空选择状态
  onConfirm = (data, callBack) => {
    const { id } = this.state
    const { from } = this.props
    const url = from === 'bug' ? 'AddBugServer' : 'AddPatchServer'
    const type = from === 'bug' ? 'antiyVulnId' : 'patchIds'
    const ids = from === 'bug' ? 'serviceId' : 'toBeOperatedIds'
    const param = {
      [type]: id,
      [ids]: data
    }
    api[url](param).then(response => {
      callBack()
      Message.success('新增成功！')
      this.onClose()
      this.getList()
    })
  }

  //表单查询
  onSearch = (modalValues) => {
    this.setState({
      modalValues,
      modalCurrentPage: 1
    }, () => {
      this.getModalList(1, 10)
    })
  }

  //表单重置
  onReset = () => {
    this.setState({
      modalValues: {},
      modalCurrentPage: 1,
      modalPageSize: 10
    }, () => {
      this.getModalList(1, 10)
    })
  }

  onClose = () => {
    this.setState({
      modalValues: {},
      modalCurrentPage: 1,
      modalPageSize: 10,
      addVisible: false,
      currentPage: 1,
      pageSize: 10
    })
  }

  //提交删除
  deletePost = () => {
    const { currentPage, pageSize, selectedRowKeys, currentStringId, id } = this.state
    const deleteIds = currentStringId ? [currentStringId] : selectedRowKeys
    const { from } = this.props
    const url = from === 'bug' ? 'deleteBugServer' : 'deletePatchServer'
    const type = from === 'bug' ? 'antiyVulnId' : 'patchIds'
    const ids = from === 'bug' ? 'serviceId' : 'toBeOperatedIds'
    this.setState({
      deleteVisible: false
    })
    api[url]({
      [type]: id,
      [ids]: deleteIds
    }).then(response => {
      this.setState({
        selectedRowKeys: [],
        currentStringId: null
      })
      Message.success('删除成功')
      this.getList(currentPage, pageSize)
    })
  }

  //删除多选
  deleteBatch = (stringId) => {
    const { selectedRowKeys } = this.state
    if (selectedRowKeys.length === 0) {
      Message.info('请选择数据！')
      return false
    }
    this.setState({
      deleteVisible: true
    })
  }

  //删除弹框显示
  onDelete = (id) => {
    this.setState({ deleteVisible: true, currentStringId: id })
  }

  pageChange = (currentPage, pageSize) => {
    this.setState({
      currentPage,
      pageSize
    })
    this.getList(currentPage, pageSize)
  }

  //获取关联的服务列表
  getList = (currentPage = 1, pageSize = 10) => {
    const { id } = this.state
    const { from } = this.props
    const url = from === 'bug' ? 'getBugServerList' : 'getPatchServerList'
    const type = from === 'bug' ? 'antiyVulnId' : 'antiyPatchNumber'
    const param = {
      [type]: id,
      currentPage,
      pageSize
    }
    api[url](param).then(response => {
      const body = response.body || {}
      if (param.currentPage !== 1 && body.items && body.items.length === 0) {
        this.setState({
          currentPage: param.currentPage - 1,
          pageSize: param.pageSize
        })
        this.getList(currentPage - 1, pageSize)
      } else {
        this.setState({
          body
        })
      }
    })
  }

  //获取弹窗列表
  getModalList = (currentPage, pageSize) => {
    const { modalValues, id } = this.state
    const { from } = this.props
    const serviceType = from === 'bug' ? 'vulServer' : 'patchServer'
    // getServicesList({
    //   serviceBusinessId: id,
    //   serviceType,
    //   isStorage: 1,
    //   ...modalValues,
    //   currentPage,
    //   pageSize
    // }).then(response => {
    //   this.setState({
    //     modalBody: response.data.body || {}
    //   })
    // })
  }

  //弹窗列表分页
  onModalPageChange = (modalCurrentPage, modalPageSize) => {
    this.setState({
      modalCurrentPage,
      modalPageSize
    })
    this.getModalList(modalCurrentPage, modalPageSize)
  }

  //新增弹框
  addModal = () => {
    this.setState({ addVisible: true })
    this.getModalList(1, 10)
  }
}

export default ServiceDetailAndChange
