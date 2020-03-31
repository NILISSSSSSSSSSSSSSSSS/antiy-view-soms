import { PureComponent, Fragment } from 'react'
import { Table } from 'antd'
import { debounce } from 'lodash'
import PropTypes from 'prop-types'
import moment from 'moment'
import { disabledDateTime, TooltipFn } from '@/utils/common'
import Search from '@/components/common/Search'

class BorrowAlert extends PureComponent{
  state = {
    PrefixCls: 'BorrowAlert',
    initStatus: {},
    currentPage: 1,
    pageSize: 10,
    selectedRowKeys: [],
    selectedRows: []
  }

  static defaultProps ={

  }

  static propTypes={
    alertItem: PropTypes.object
  }

  getData=()=>{
    return this.state.selectedRowKeys
  }

  onSubmit=value=>{

  }

  handleReset=()=>{

  }

  //**接口开始 副作用 */
  getBusinessList=debounce(()=>{
    // initStatus
  }, 300)

  render (){
    const { PrefixCls, initStatus, currentPage, pageSize, selectedRowKeys } = this.state

    const columns = [
      {
        title: '审批单编号',
        dataIndex: 'name',
        key: 'name',
        width: '12%',
        render: text=>TooltipFn(text)
      }, {
        title: '审批类型',
        dataIndex: 'name1',
        key: 'name1',
        width: '12%',
        render: text=>TooltipFn(text)
      }, {
        title: '申请人',
        dataIndex: 'name23',
        key: 'name23',
        width: '12%',
        render: text=>TooltipFn(text)
      }, {
        title: '时间',
        dataIndex: 'name3',
        key: 'name3',
        width: '12%',

        render: text => TooltipFn(moment(text).format('YYYY-MM-DD HH:mm:ss'))
      }
    ]

    const defaultFields = [
      { label: '综合查询', key: 'multipleQuery', type: 'input', placeholder: '名称/编号/IP/MAC' }
    ]

    const rowSelection = {
      type: 'radio',
      selectedRowKeys,
      onChange: (selectedRowKeys, selectedRows) => {
        this.setState({
          selectedRowKeys, selectedRows
        })
      }
    }

    const initStatus2 = [
      {
        name: 666,
        name1: 666,
        name23: 666,
        name3: 666
      }
    ]

    return(
      <div className={`${PrefixCls} form-content`}>
        <Search defaultFields={ defaultFields } onSubmit={ this.onSubmit } onReset={ this.handleReset }/>
        <div className="table-wrap">
          <Table
            rowKey='stringId'
            columns={columns}
            dataSource={initStatus2}
            rowSelection={rowSelection}
            pagination={{
              className: 'table-pagination',
              showQuickJumper: true,
              // showSizeChanger: true,
              pageSizeOptions: ['10', '20', '30', '40'],
              // onShowSizeChange: this.pageChange,
              showTotal: () => `共 ${initStatus.totalRecords} 条数据`,
              current: currentPage,
              pageSize: pageSize,
              total: initStatus.totalRecords,
              onChange: this.pageChange
            }}
          />
        </div>
      </div>
    )
  }

  componentDidMount (){
    //   this.props.alertItem
    this.props.children(this)
  }

}

export default BorrowAlert

