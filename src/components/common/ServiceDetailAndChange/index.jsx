import { Component, Fragment } from 'react'
import { withRouter } from 'react-router-dom'
import { Message, Modal, Icon } from 'antd'
import { string } from 'prop-types'
import { cloneDeep, debounce } from 'lodash'
import AddTableModal from '@c/BugManage/AddTableModal'
import { TableBtns, DeleteTable } from '@c/index'
import { TooltipFn, analysisUrl, getAfterDeletePage } from '@u/common'
import api from '@/services/api'
import { SERVE_TYPE } from '@a/js/enume'

const { confirm } = Modal
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
      number: analysisUrl(props.location.search).number || props.id,
      currentStringId: null,
      selectedRowKeys: [],
      modalBody: {},
      modalValues: {},
      body: {},
      currentPage: 1,
      pageSize: 10,
      addVisible: false,
      modalCurrentPage: 1,
      modalPageSize: 10
    }
  }

  componentDidMount () {
    this.getList()
  }
  UNSAFE_componentWillReceiveProps (nextProps) {
    if(JSON.stringify(this.state.id) !== JSON.stringify(nextProps.id)){
      this.setState({ id: nextProps.id })
    }
  }

  render () {
    const { type } = this.props
    const isChange = type === 'change'
    const { body, currentPage, pageSize, addVisible, modalCurrentPage,
      modalPageSize, selectedRowKeys, modalBody } = this.state
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
      { type: 'select', label: '服务类型', placeholder: '全部', key: 'serviceClasses', data: SERVE_TYPE, allowClear: false }
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
            onDelete={this.deleteSigle}
            showSizeChanger={false}
            isDelete={isChange}
            isShow={isChange} />
          {
            isChange &&
            <Fragment>
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
  onConfirm = debounce((data, callBack) => {
    const { number } = this.state
    const { from } = this.props
    const url = from === 'bug' ? 'addVulnserver' : 'AddPatchServer'
    const type = from === 'bug' ? 'antiyVulnId' : 'patchIds'
    const ids = from === 'bug' ? 'serviceId' : 'serverId'
    const param = {
      [type]: number,
      [ids]: data
    }
    api[url](param).then(response => {
      callBack()
      Message.success('新增成功！')
      this.onClose()
      this.getList()
    })
  }, 1000, { leading: true, trailing: false })

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
  deletePost = async () => {
    let { body, currentPage, pageSize, selectedRowKeys, currentStringId, number } = this.state
    const deleteIds = currentStringId ? [currentStringId] : selectedRowKeys
    const { from } = this.props
    const url = from === 'bug' ? 'deleteVulnserver' : 'deletePatchServer'
    const type = from === 'bug' ? 'antiyVulnId' : 'patchIds'
    const ids = from === 'bug' ? 'serviceId' : 'serverId'
    this.setState({
      deleteVisible: false
    })
    await api[url]({
      [type]: number,
      [ids]: deleteIds
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
      content: '确认删除服务？',
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

  pageChange = (currentPage, pageSize) => {
    this.setState({
      currentPage,
      pageSize
    })
    this.getList(currentPage, pageSize)
  }

  //获取关联的服务列表
  getList = async (currentPage = 1, pageSize = 10) => {
    const { number } = this.state
    const { from } = this.props
    const url = from === 'bug' ? 'queryVulnserver' : 'getPatchServerList'
    const type = from === 'bug' ? 'antiyVulnId' : 'antiyPatchNumber'
    const param = {
      [type]: number,
      currentPage,
      pageSize
    }
    await api[url](param).then(response => {
      const body = response.body || {}
      this.setState({
        body
      })
    })
  }

  //获取弹窗列表
  getModalList = (currentPage, pageSize) => {
    const { modalValues, number } = this.state
    const { from } = this.props
    const serviceType = from === 'bug' ? 'vulServer' : 'patchServer'
    api.getAssetsysservicelib({
      serviceBusinessId: number,
      serviceType,
      isStorage: 1,
      ...modalValues,
      currentPage,
      pageSize
    }).then(response => {
      if(response && response.head && response.head.code === '200' ){
        this.setState({
          modalBody: response.body || {}
        })
      }
    })
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
