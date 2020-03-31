import React, { Component, Fragment } from 'react'
import { withRouter } from 'react-router-dom'
import { string, func, array, bool } from 'prop-types'
import { message, Modal, Icon } from 'antd'
import { TableBtns, DeleteTable } from '@c/index'
import AddCatgoryModal from '@c/BugManage/AddCatgoryModal'
import { TooltipFn, analysisUrl, getAfterDeletePage } from '@u/common'
import '@/pages/BugManage/index.less'

const { confirm } = Modal

@withRouter
//漏洞品类型号
class CatgoryList extends Component {
  //type:change为是编辑，detail为详情,from:bug | patch
  static propTypes = {
    type: string,
    from: string,
    showSizeChanger: bool,
    getCatgory: func,
    resetTable: func,
    //品类型号数据
    listData: array
  }
  constructor (props) {
    super(props)
    this.state = {
      number: analysisUrl(props.location.search).number,
      currentStringId: null,
      selectedRowKeys: [],
      body: {},
      //全量数据
      allList: props.listData,
      currentPage: 1,
      pageSize: 10,
      addVisible: false
    }
  }
  componentDidMount () {
    const { type } = this.props
    type === 'change' && this.props.catgoryList(this)
  }

  UNSAFE_componentWillReceiveProps (nextProps) {
    // 更新列表数据
    if (JSON.stringify(this.props.listData) !== JSON.stringify(nextProps.listData)) {
      const { currentPage, pageSize } = this.state
      this.setState({
        allList: nextProps.listData
      }, () => {
        this.getCacheList(nextProps.listData, currentPage, pageSize)
      })
    }
  }

  render () {
    const { body, currentPage, pageSize, addVisible, selectedRowKeys, allList } = this.state
    const { type, showSizeChanger } = this.props
    //是否能删除和添加操作
    const isOperate = type === 'change' || type === 'register'
    const rowSelection = isOperate ? {
      selectedRowKeys,
      onChange: (selectedRowKeys, selectedRows) => {
        this.setState({
          selectedRowKeys
        })
      }
    } : null
    const columns = [
      {
        title: '厂商',
        dataIndex: 'supplier',
        render: text => TooltipFn (text)
      },
      {
        title: '名称',
        dataIndex: 'productName',
        render: text => TooltipFn (text)
      },
      {
        title: '版本',
        dataIndex: 'version',
        render: text => TooltipFn (text)
      },
      {
        title: '系统版本',
        dataIndex: 'sysVersion',
        render: text => TooltipFn (text)
      },
      {
        title: '语言',
        dataIndex: 'language',
        render: text => TooltipFn (text)
      },
      {
        title: '软件版本',
        dataIndex: 'softVersion',
        render: text => TooltipFn (text)
      },
      {
        title: '软件平台',
        dataIndex: 'softPlatform',
        render: text => TooltipFn (text)
      },
      {
        title: '硬件平台',
        dataIndex: 'hardPlatform',
        render: text => TooltipFn (text)
      }
    ]
    return (
      <Fragment>
        <section className="bugPatch-content">
          <div className="table-wrap bug-table-warp">
            <p className="bug-title">{isOperate && <span style={{ marginRight: 4, color: '#f5222d' }}>*</span>}漏洞影响品类型号</p>
            {
              isOperate && <TableBtns
                leftBtns={[
                  { label: '添加品类型号', onClick: () => this.setState({ addVisible: true }) }
                ]
                }
                rightBtns={[
                  { label: '删除', onClick: this.deleteBatch }
                ]} />
            }
            <DeleteTable
              rowKey="businessId"
              body={body}
              rowSelection={rowSelection}
              columns={columns}
              pageSize={pageSize}
              current={currentPage}
              onChange={this.changePage}
              onShowSizeChange={this.changeSize}
              showSizeChanger={showSizeChanger}
              onDelete={this.deleteSigle}
              isDelete={isOperate}
              isShow={isOperate} />
            {
              isOperate &&
            <Fragment>
              {
                addVisible &&
                <AddCatgoryModal
                  url="getBugCategory"
                  removeBusinessIds={allList.map(item => item.businessId)}
                  visible={addVisible}
                  onClose={() => this.setState({ addVisible: false })}
                  onConfirm={this.onConfirm} />
              }
            </Fragment>
            }
          </div>
        </section>

      </Fragment>
    )
  }

  //添加品类型号
  onConfirm = (data) => {
    let { allList, pageSize } = this.state
    const { getCatgory } = this.props
    allList.unshift(...data)
    const body = {
      items: allList.slice(0, pageSize),
      totalRecords: allList.length
    }
    this.setState({
      body,
      currentPage: 1,
      allList,
      selectedRowKeys: [],
      addVisible: false
    })
    getCatgory(allList)
  }

  //state删除
  deleteState = () => {
    const { getCatgory } = this.props
    let { allList, selectedRowKeys, currentStringId, currentPage, pageSize } = this.state
    const deleteIds = currentStringId ? [currentStringId] : selectedRowKeys
    let data = []
    allList.forEach(item => {
      if (!deleteIds.includes(item.businessId)) {
        data.push(item)
      }
    })
    currentPage = getAfterDeletePage(data.length, currentPage, pageSize)
    this.setState({
      allList: data,
      currentStringId: null,
      selectedRowKeys: [],
      currentPage
    })
    this.getCacheList(data, currentPage, pageSize)
    getCatgory(data)
  }

  //删除确认框
  deleteConfirm = () => {
    confirm({
      icon: <Icon type="close" onClick={() => { Modal.destroyAll() }} />,
      content: '确认删除品类型号？',
      okText: '确认',
      onOk: () => {
        this.deleteState()
      },
      onCancel: () => {
        this.setState({
          currentStringId: null
        })
      }
    })
  }

  //批量删除
  deleteBatch = () => {
    const { selectedRowKeys } = this.state
    if (selectedRowKeys.length === 0) {
      message.info('请选择数据！')
      return false
    }
    this.deleteConfirm()
  }

  //单个删除
  deleteSigle = (id) => {
    this.setState({
      currentStringId: id
    })
    this.deleteConfirm()
  }

  //漏洞登记：获取列表
  getCacheList = (data, currentPage, pageSize) => {
    let items = data.filter((item, index) => index >= (currentPage * pageSize - pageSize) && index < (currentPage * pageSize))
    const body = {
      items,
      totalRecords: data.length
    }
    this.setState({
      body
    })
  }

  //分页
  changePage = (currentPage, pageSize) => {
    this.setState({
      pageSize,
      currentPage
    }, () => {
      const { allList } = this.state
      this.getCacheList(allList, currentPage, pageSize)
    })
  }

  changeSize = (currentPage, pageSize) => {
    this.setState({
      selectedRowKeys: [],
      selectedRows: []
    })
    this.changePage(currentPage, pageSize)
  }

  //编辑后重置，父组件需要调用此方法
  handleReset = () => {
    let { allList, pageSize } = this.state
    const body = {
      items: allList.slice(0, pageSize),
      totalRecords: allList.length
    }
    this.setState({
      body,
      selectedRowKeys: [],
      selectedRows: [],
      currentPage: 1,
      pageSize: 10
    })
  }

}
export default CatgoryList

