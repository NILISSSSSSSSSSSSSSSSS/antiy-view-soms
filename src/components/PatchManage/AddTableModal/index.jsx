import { PureComponent, Fragment } from 'react'
import { Table, Pagination, Message } from 'antd'
import { number, object, func, string, array, bool } from 'prop-types'
import { Search, CommonModal } from '@c/index'

class AddTableModal extends PureComponent {
  state = {
    selectedRowKeys: []
  }
  static propTypes = {
    pageSize: number,
    current: number,
    body: object,
    onChange: func,
    onSearch: func,
    onReset: func,
    columns: array,
    defaultFields: array,
    title: string,
    visible: bool
  }

  render () {
    const { title, pageSize, current, body, columns, onSearch, onReset, defaultFields, visible, rowKey = 'stringId' } = this.props
    const { selectedRowKeys } = this.state
    const rowSelection = {
      selectedRowKeys,
      onChange: (selectedRowKeys, selectedRows) => {
        this.setState({
          selectedRowKeys
        })
      }
    }
    let list  = [], total = 0
    if (body.items){
      list = body.items
      total =  body.totalRecords
    }
    return (
      <Fragment>
        <CommonModal
          title={title}
          type="search"
          visible={visible}
          width={1200}
          oktext='保存'
          onConfirm={this.confirm}
          onClose={this.close}
        >
          <div className="main-table-content">
            <div className="search-bar">
              <Search defaultFields={defaultFields} onSubmit={(values) => onSearch(values)} onReset={onReset}/>
            </div>
            <div className="table-wrap">
              {/* 列表 */}
              <Table
                rowKey={rowKey}
                rowSelection={rowSelection}
                columns={columns}
                dataSource={list}
                pagination={false} />
              {/* 分页 */}
              {
                total > 0 && <Pagination className="table-pagination"
                  style={{ marginBottom: 20 }}
                  pageSize={pageSize}
                  current={current}
                  onChange={this.pageChange}
                  onShowSizeChange={this.pageChange}
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

  //关闭弹窗
  close = () => {
    const { onClose } = this.props
    this.setState({
      selectedRowKeys: []
    })
    onClose()
  }

  //确认提交
  confirm = () => {
    const { onConfirm } = this.props
    const { selectedRowKeys } = this.state
    if (selectedRowKeys.length === 0) {
      Message.info('请选择数据！')
      return false
    }
    onConfirm(selectedRowKeys, () => {
      this.setState({
        selectedRowKeys: []
      })
    })
  }

  pageChange = (currentPage, pageSize) => {
    this.props.onChange(currentPage, pageSize)
  }
}
export default AddTableModal

