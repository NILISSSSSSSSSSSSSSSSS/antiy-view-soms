import { PureComponent, Fragment } from 'react'
import { Table, Pagination } from 'antd'
import { NavLink } from 'dva/router'
import { number, object, func, array, bool, string } from 'prop-types'

class DeleteTable extends PureComponent {
  static propTypes = {
    rowSelection: object,
    pageSize: number,
    current: number,
    columns: array,
    body: object,
    onChange: func,
    onShowSizeChange: func,
    onDelete: func,
    isShow: bool,
    isCheck: bool,
    url: string,
    rowKey: string,
    linkId: string
  }

  render () {
    const { pageSize, current, body, onChange, onShowSizeChange, columns, isShow, isDelete, isCheck, onDelete, rowSelection, url, linkId = 'id', rowKey = 'stringId', showSizeChanger = true } = this.props
    isShow && columns.push({
      title: '操作',
      dataIndex: 'stringId',
      key: 'stringId',
      width: 180,
      render: (text, record) => {
        const id = record[rowKey]
        return (
          <div className="operate-wrap">
            {
              isCheck && <NavLink to={`${url}?${linkId}=${id}`} target='_blank'>查看</NavLink>
            }
            {
              isDelete && <a onClick={() => {onDelete(id)}}>删除</a>
            }
          </div>
        )
      }
    })
    let list  = [], total = 0
    if (body.items){
      list = body.items
      total =  body.totalRecords
    }
    return (
      <Fragment>
        {/* 列表 */}
        <Table
          rowKey={rowKey}
          rowSelection={rowSelection}
          columns={columns}
          dataSource={list}
          pagination={false}
        />
        {/* 分页 */}
        {
          total > 0 && <Pagination className="table-pagination"
            pageSize={pageSize}
            current={current}
            onChange={onChange}
            onShowSizeChange={onShowSizeChange}
            total={total}
            showTotal={(total) => `共 ${total || 0} 条数据`}
            showSizeChanger={showSizeChanger && total > 10}
            showQuickJumper
          />
        }
      </Fragment>
    )
  }

}
export default DeleteTable

