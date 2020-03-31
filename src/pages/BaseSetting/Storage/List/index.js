import React, { Component, Fragment } from 'react'
import { connect } from 'dva'
import { SOURCE_LIST, SOURCE_LEVEL } from '@a/js/enume'
import { TooltipFn, transliteration, cacheSearchParameter, evalSearchParam } from '@u/common'
import hasAuth from '@/utils/auth'
import { Form, Table, Pagination } from 'antd'
import { debounce } from 'lodash'
import api from '@/services/api'
import { Search } from '@c/index'  //引入方式
import { configPermission } from '@a/permission'

export class SettingInformations extends Component {
  constructor (props) {
    super(props)
    this.state = {
      pagingParameter: {
        pageSize: 10,
        currentPage: 1
      },
      osList: this.props.osList || [],
      typeList: this.props.typeList || [],
      body: null,
      values: {},
      sorter: { sortName: '', sortOrder: '' },
      checkedOsList: [] //选中的适用系统
    }
  }
  componentDidMount () {
    let { list } = evalSearchParam(this, {}, false) || {}
    if (list) {
      this.searchForm.setFieldsValue({ ...list[0].parameter })
      this.setState({ pagingParameter: list[0].page, values: list[0].parameter }, () => this.getList())
    } else {
      this.getList(false, false)
    }
    this.props.dispatch({ type: 'baseSetting/getBaseLineType' })
    this.props.dispatch({ type: 'baseSetting/getConfigOsList', payload: { name: '操作系统' } })
  }
  UNSAFE_componentWillReceiveProps (nextProps) {
    // 更新列表数据
    if (nextProps.osList && JSON.stringify(this.props.osList) !== JSON.stringify(nextProps.osList)) {
      this.setState({
        osList: nextProps.osList
      })
    }
    if (nextProps.typeList && JSON.stringify(this.props.typeList) !== JSON.stringify(nextProps.typeList)) {
      this.setState({
        typeList: nextProps.typeList
      })
    }
  }
  render () {
    let { pagingParameter, body, sorter, osList, typeList } = this.state
    let list = [], total = 0
    if (body) {
      list = body.items
      total = Number(body.totalRecords)
    }
    const columns = [
      {
        title: '名称',
        key: 'name',
        dataIndex: 'name',
        width: '14%',
        render: text => TooltipFn(text)
      },
      {
        title: '编号',
        key: 'ruleId',
        dataIndex: 'ruleId',
        width: '14%',
        render: text => TooltipFn(text)
      },
      {
        title: '规范',
        key: 'source',
        width: '10%',
        dataIndex: 'source',
        render: (text) => {
          if (text) {
            return (<span>{SOURCE_LIST[text - 1].name}</span>)
          } else {
            return <span></span>
          }
        }
      },
      {
        title: '安全级别',
        key: 'level',
        dataIndex: 'level',
        sorter: true,
        width: '10%',
        sortOrder: sorter.sortOrder,
        sortDirections: ['descend', 'ascend'],
        render: (text) => {
          return (text && text !== 4 ? SOURCE_LEVEL[text - 1].name : '--')
        }
      },
      {
        title: '基准类型',
        key: 'typeName',
        dataIndex: 'typeName',
        width: '14%',
        render: text => TooltipFn(text)
      },
      {
        title: '适用系统',
        key: 'osName',
        dataIndex: 'osName',
        width: '14%',
        render: text => TooltipFn(text)
      },
      {
        title: '操作',
        key: 'operate',
        width: '16%',
        render: (record) => {
          return (
            <div className="operate-wrap">
              <Fragment>
                {
                  hasAuth(configPermission.baseitemView) &&
                  <a onClick={() => this.checkValid(record)}>查看</a>
                }
              </Fragment>
            </div>
          )
        }
      }
    ]
    const defaultFields = [
      { type: 'input', label: '综合查询', placeholder: '请输入基准项名称、编号', key: 'multiply', allowClear: true, maxLength: 30 }
    ]
    const  fields =  [{ type: 'select', multiple: false, label: '安全级别', placeholder: '请输入', key: 'level', data: SOURCE_LEVEL },
      { type: 'select', multiple: false, label: '检测规范', placeholder: '请输入', key: 'source', data: SOURCE_LIST },
      { type: 'treeSelect', multiple: true, placeholder: '全部', label: '适用系统', key: 'osList', data: osList, config: { name: 'name', value: 'node' }, treeDefaultExpandAll: false },
      { type: 'treeSelect', multiple: true, placeholder: '全部', label: '基准类型', key: 'typeList', data: typeList, config: { name: 'name', value: 'node' }, treeDefaultExpandAll: false }]
    return (
      <div className="main-table-content">
        <div className="search-bar">
          <Search defaultFields={defaultFields}  fieldList={fields} onSubmit={this.handleSubmit} showOs = {true} showType= {true} onReset={this.handleReset} wrappedComponentRef={search => { search && (this.searchForm = search.props.form) }} showExpand={false}/>
        </div>
        {/* 列表+分页 */}
        <div className="table-wrap">
          <Table rowKey="stringId" onChange={this.handleTableChange} columns={columns} dataSource={list} pagination={false}
          />
          {total > 0 && <Pagination
            className="table-pagination"
            total={total}
            showTotal={(total) => `共 ${total || 0} 条数据`}
            showSizeChanger={total > 10 ? true : false}
            showQuickJumper
            onChange={this.changePage}
            onShowSizeChange={this.changePage}
            pageSize={pagingParameter.pageSize}
            current={pagingParameter.currentPage} />
          }
        </div>
      </div>
    )
  }
  //适用系统选择
  onOsChange = value => {
    let { typeList } = this.state
    if(value && value[0])
      this.setState({ checkedOsList: value })
    else this.setState({ checkedOsList: [typeList && typeList.childrenNode[0].node] })
  }
  //查看该基准项是否存在，存在跳转
  checkValid = (record) => {
    this.props.history.push(`storage/detail?stringId=${transliteration(record.stringId)}`)
  }
  //表单重置
  handleReset = () => {
    sessionStorage.removeItem('searchParameter')
    const pagingParameter = {
      pageSize: 10,
      currentPage: 1
    }
    this.setState({
      values: {},
      sorter: {
        sortOrder: '',
        sortName: ''
      },
      pagingParameter
    }, () => {
      this.getList(false, false)
    })
  }
  //表头排序
  handleTableChange = (pagination, filters, sorter) => {
    this.setState({
      pagingParameter: {
        pageSize: 10,
        currentPage: 1
      },
      sorter: {
        sortName: sorter.columnKey === 'gmtCreate' ? 'gmt_create' : sorter.columnKey,
        sortOrder: sorter.columnKey === 'level' ? sorter.order : ''
      }
    }, () => {
      this.getList()
    })
  }
  //表单查询
  handleSubmit = (values) => {
    const { pagingParameter } = this.state
    this.setState({
      pagingParameter: {
        pageSize: pagingParameter.pageSize,
        currentPage: 1
      },
      values
    }, () => {
      this.getList()
    })
  }
  //获取列表,isCache:是否缓存分页数据
  getList = (sort = true, isCache = true) => {
    let { values, pagingParameter, sorter } = this.state
    if (isCache) {
      cacheSearchParameter([{
        page: pagingParameter,
        parameter: { ...values, ...sorter }
      }], this.props.history)
    }
    let param = sort ? { ...pagingParameter, ...values, ...sorter } : { ...pagingParameter }
    if (param.sortOrder === 'ascend') {
      param.sortOrder = 'asc'
    } else if (param.sortOrder === 'descend') {
      param.sortOrder = 'desc'
    }
    if (!param.sortOrder) {
      delete param.sortOrder
    }
    if (!param.sortName) {
      delete param.sortName
    }
    api.baselineItemQuery(param).then(response => {
      this.setState({
        body: response.body
      })
    })
  }
  //分页
  changePage = (currentPage, pageSize) => {
    this.setState({
      pagingParameter: {
        pageSize,
        currentPage
      }
    }, () => {
      this.getList()
    })
  }
}
//映射model内的数据操作系统
const mapStateToProps = ({ baseSetting }) => {
  return {
    osList: baseSetting.osList,
    typeList: baseSetting.typeList
  }
}
const SettingInformation = Form.create()(SettingInformations)
export default connect(mapStateToProps)(SettingInformation)
