import { Component } from 'react'
import CustomModal from '@c/common/Modal'
import { Pagination, Table, message } from 'antd'
import Search from '@/components/common/Search'
import { transliteration } from '@/utils/common'
import Tooltip from '@/components/common/CustomTooltip'
import moment from 'moment'
const baseSettingColumns = [
  {
    title: '名称',
    dataIndex: 'name',
    key: 'name',
    render: (text)=><Tooltip title={text} />
  },
  {
    title: '编号',
    dataIndex: 'number',
    key: 'number',
    render: (text)=><Tooltip title={text} />
  },
  {
    title: '基准数量',
    dataIndex: 'configNum',
    key: 'configNum'
  },
  {
    title: '更新时间',
    dataIndex: 'gmtModified',
    key: 'gmtModified',
    render: (text)=> {
      return(<span className="tabTimeCss">{ text ? moment(text).format('YYYY-MM-DD HH:mm:ss') : ''}</span>)
    }
  },
  {
    title: '描述',
    dataIndex: 'description',
    key: 'description',
    render: (text)=><Tooltip title={text} />
  },
  {
    title: '操作',
    dataIndex: 'operate',
    key: 'operate',
    render: (text, record)=>{
      return (
        <div className = "operate-wrap" >
          <a onClick={()=>{ window.open('/#/basesetting/model/checkdetail?stringId=' + transliteration(record.stringId))}}>查看</a>
        </div>
      )
    }
  }
]
const softColumns = [
  {
    title: '名称',
    dataIndex: 'name',
    key: 'name',
    render: (text)=><Tooltip title={text} />
  },
  {
    title: '编号',
    dataIndex: 'numberCode',
    key: 'numberCode',
    render: (text)=><Tooltip title={text} />
  },
  {
    title: '补丁数量',
    dataIndex: 'patchNum',
    key: 'patchNum'
  },
  {
    title: '软件数量',
    dataIndex: 'softNum',
    key: 'softNum'
  },
  {
    title: '更新时间',
    dataIndex: 'gmtModified',
    key: 'gmtModified',
    render: (text)=>{
      return(<span className="tabTimeCss">{ text ? moment(text).format('YYYY-MM-DD HH:mm:ss') : ''}</span>)
    }
  },
  {
    title: '描述',
    dataIndex: 'description',
    key: 'description',
    render: (text)=><Tooltip title={text} />
  },
  {
    title: '操作',
    dataIndex: 'operate',
    key: 'operate',
    render: (text, record)=>{
      return (
        <div className = "operate-wrap" >
          <a onClick={()=>{ window.open('/#/asset/installtemplate/detail?stringId=' + transliteration(record.stringId))}}>查看</a>
        </div>
      )
    }
  }
]
const baseSetting = 'baseSetting'
// const softModal = 'softModal'
export default class BaseSettingModal extends Component {
  constructor (props) {
    super(props)
    this.state = {
      values: {},
      list: [],
      pageSize: 10,
      currentPage: 1,
      total: 1
    }
    this.selectRows = []
  }
  componentDidMount () {
    const { pageSize, currentPage } = this.state
    this.request({ pageSize, currentPage })
  }
  onChange = (key, list) => {
    this.selectRows = list
  }
  request = (params = {}) => {
    const { queryConfig: { getList } } = this.props
    getList && getList(params).then((res) => {
      const { items: list, totalRecords: total } = res.body || {}
      this.setState({ list, total })
    })
  }
  changePage = (currentPage, pageSize) => {
    this.setState({ currentPage, pageSize })
    this.request({ currentPage, pageSize })
  }
  onSearch = (values) => {
    const { pageSize } = this.state
    this.setState({ values, currentPage: 1 })
    this.request({ pageSize, currentPage: 1, ...values })
  }
  onReset = () => {
    const { pageSize } = this.state
    this.setState({ values: {}, currentPage: 1 })
    this.request({ pageSize, currentPage: 1 })
  }
  onConfirm = () => {
    const { onConfirm } = this.props
    if(!this.selectRows.length){
      message.info('请选择数据')
      return
    }
    onConfirm && onConfirm(this.selectRows)
  }
  render () {
    const { total, pageSize, currentPage, list } = this.state
    const { columns = baseSettingColumns, type, visible, onCancel } = this.props
    const defaultFields = [
      { label: '名称', key: 'name', type: 'input', placeholder: '请输入名称' },
      { label: '编号', key: type === baseSetting ? 'number' : 'numberCode', type: 'input', placeholder: '请输入编号' }
    ]
    const rowSelection = {
      type: 'radio',
      onChange: this.onChange
    }
    return (
      <CustomModal visible={visible} onConfirm={this.onConfirm} onClose={onCancel} type="search" width={1200} oktext="确认" title={ type === 'baseSetting' ? '配置基准模板' : '配置装机模板' }>
        <div className="main-table-content">
          <div className="search-bar">
            <Search defaultFields={ defaultFields } onSubmit={ this.onSearch } onReset={ this.onReset }/>
          </div>
          <div className="table-wrap">
            {/* 列表 */ }
            <Table
              rowKey="stringId"
              rowSelection={ rowSelection }
              columns={ type === baseSetting ? columns : softColumns }
              dataSource={ list }
              pagination={ false }/>
            {/* 分页 */ }
            {
              total > 0 && <Pagination
                className="table-pagination"
                style={ { marginBottom: 20 } }
                pageSize={ pageSize }
                current={ currentPage }
                onChange={ this.changePage }
                onShowSizeChange={ this.changePage }
                total={ total }
                showTotal={ (total) => `共 ${ total || 0 } 条数据` }
                showQuickJumper/>
            }
          </div>
        </div>
      </CustomModal>
    )
  }
}
