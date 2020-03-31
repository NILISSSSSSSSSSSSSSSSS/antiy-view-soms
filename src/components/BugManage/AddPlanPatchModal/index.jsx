import React, { PureComponent, Fragment } from 'react'
import { Table, Pagination, message } from 'antd'
import { uniqBy } from 'lodash'
import { func, bool, array } from 'prop-types'
import { Search, CommonModal } from '@c/index'
import api from '@/services/api'
import { TooltipFn, transliteration } from '@u/common'

class AddPlanPatchModal extends PureComponent {
  static propTypes = {
    onClose: func,
    onConfirm: func,
    visible: bool,
    //已存在的补丁编号列表，后端去重需要的参数
    existPatchNumber: array
  }
  state = {
    selectedRowKeys: [],
    selectedAllRows: [],
    body: {},
    currentPage: 1,
    pageSize: 10,
    values: {}
  }
  componentDidMount () {
    this.getList({
      currentPage: 1,
      pageSize: 10
    })
  }
  render () {
    const { pageSize, currentPage, body, selectedRowKeys, selectedAllRows } = this.state
    const { visible, onClose } = this.props
    const defaultFields = [
      { type: 'input', label: '补丁编号', placeholder: '请输入', key: 'patchNumber', allowClear: true }
    ]
    const columns = [
      {
        title: '补丁编号',
        dataIndex: 'patchNumber',
        render: text => TooltipFn (text)
      },
      {
        title: '补丁名称',
        dataIndex: 'patchName',
        render: text => TooltipFn (text)
      },
      {
        title: '前置补丁',
        dataIndex: 'prePatchNumber',
        render: text => TooltipFn (text)
      },
      {
        title: '补丁等级',
        dataIndex: 'patchLevelStr',
        render: (text) => {
          return text  || '--'
        }
      },
      {
        title: '操作',
        dataIndex: 'stringId',
        key: 'stringId',
        width: 180,
        render: (text, record) => {
          const id = record.antiyPatchNumber
          return (
            <div className="operate-wrap">
              <a onClick={() => this.checkAlive(id, `/bugpatch/patchmanage/information/detail?id=${transliteration(id)}`)}>查看</a>
            </div>
          )
        }
      }
    ]
    let list  = [], total = 0
    if (body.items){
      list = body.items
      total =  body.totalRecords
    }
    const rowSelection = {
      selectedRowKeys,
      onChange: (selectedRowKeys, selectedRows) => {
        this.setState({
          selectedRowKeys,
          selectedAllRows: uniqBy([...selectedAllRows, ...selectedRows], 'antiyPatchNumber')
        })
      }
    }
    return (
      <Fragment>
        <CommonModal
          title="新增补丁"
          type="search"
          visible={visible}
          width={1200}
          oktext='保存'
          onConfirm={this.onConfirm}
          onClose={onClose}
        >
          <div className="main-table-content">
            <div className="search-bar">
              <Search defaultFields={defaultFields} onSubmit={(values) => this.onSearch(values)} onReset={this.onReset}/>
            </div>
            <div className="table-wrap">
              {/* 列表 */}
              <Table
                rowKey="antiyPatchNumber"
                rowSelection={rowSelection}
                columns={columns}
                dataSource={list}
                pagination={false} />
              {/* 分页 */}
              {
                total > 0 && <Pagination className="table-pagination"
                  style={{ marginBottom: 20 }}
                  pageSize={pageSize}
                  current={currentPage}
                  onChange={this.changePage}
                  onShowSizeChange={this.changePage}
                  total={total}
                  showTotal={(total) => `共 ${total || 0} 条数据`}
                  showQuickJumper />
              }
            </div>
          </div>
        </CommonModal>
      </Fragment>
    )
  }

  //表单查询
  onSearch = (values) => {
    this.setState({
      values,
      currentPage: 1,
      selectedRowKeys: [],
      selectedAllRows: []
    }, () => {
      this.getList({
        currentPage: 1,
        pageSize: 10,
        ...values
      })
    })
  }

  //表单重置
  onReset = () => {
    this.setState({
      values: {},
      currentPage: 1,
      pageSize: 10,
      selectedRowKeys: [],
      selectedAllRows: []
    }, () => {
      this.getList({
        currentPage: 1,
        pageSize: 10
      })
    })
  }

  //获取列表
  getList = (param) => {
    const { existPatchNumber } = this.props
    param.existPatchNumber = existPatchNumber
    api.bugQueryPatch(param).then(response => {
      if(response && response.body && response.head.code === '200' ){
        const body = response.body || {}
        this.setState({
          body
        })
      }
    })
  }

  //分页
  changePage = (currentPage, pageSize) => {
    this.setState({
      pageSize,
      currentPage
    }, () => {
      const { values } = this.state
      const param = {
        currentPage,
        pageSize,
        ...values
      }
      this.getList(param)
    })
  }

  //确认提交
  onConfirm = () => {
    const { onConfirm } = this.props
    const { selectedRowKeys, selectedAllRows } = this.state
    if (selectedRowKeys.length === 0) {
      message.info('请选择数据！')
      return false
    }
    let data = []
    selectedAllRows.forEach(item => {
      if (selectedRowKeys.includes(item.antiyPatchNumber)) {
        data.push(item)
      }
    })
    onConfirm(data)
  }

  //查看是否被删除
  checkAlive = (id, url) => {
    window.open(`/#${url}`)
    // api.checkPatch({
    //   param: id
    // }).then(response => {
    //   if (!response.body) {
    //     window.open(`/#${url}`)
    //   } else {
    //     Message.error('该补丁已被删除！')
    //   }
    // })
  }
}
export default AddPlanPatchModal

