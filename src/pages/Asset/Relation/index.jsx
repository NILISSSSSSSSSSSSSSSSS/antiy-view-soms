import { PureComponent } from 'react'
import { connect } from 'dva'
import { Form, Table } from 'antd'
import './style.less'
import { TooltipFn, transliteration, cacheSearchParameter, evalSearchParam, removeCriteria } from '@/utils/common'
import { Link } from 'dva/router'
import { withRouter } from 'dva/router'
import PropTypes from 'prop-types'
import { debounce } from 'lodash'
import hasAuth from '@/utils/auth'
import { assetsPermission } from '@a/permission'
import { HARD_ASSET_TL_TYPE } from '@a/js/enume'
import Search from '@/components/common/Search'

@withRouter
@Form.create()
class RelationList extends PureComponent{
  state = {
    PrefixCls: 'RelationList',
    //表单开始
    categoryModels: [],
    assetNumber: '',
    assetName: '',
    currentPage: 1,
    areaIds: [],
    pageSize: 10,
    sortName: 'noBind',  //排序名字
    sortOrder: '',  //排序方式
    //表单结束
    typeList: [],
    userInAssetList: [] // 使用者

  }

  static propTypes={
    assetLinkedList: PropTypes.object,
    userAreaTree: PropTypes.object  //区域树
  }

  //提交表单
  onSubmit = values => {
    this.setState({
      categoryModels: values.categoryModels,
      assetNumber: values.assetNumber,
      assetName: values.assetName,
      currentPage: 1,
      areaIds: values.areaIds
    }, this.assetLinkedList)
  }

  //重置表单信息
  handleReset = ()=>{
    // this.props.form.resetFields()
    removeCriteria()
    this.setState({
      currentPage: 1,
      categoryModels: [],
      assetNumber: '',
      assetName: '',
      sortOrder: '',
      areaIds: []
    }, ()=> this.assetLinkedList(true))
  }

  //翻页
  pageChange = (page, pageSize)=>{
    this.setState({
      currentPage: page,
      pageSize: pageSize
    }, this.assetLinkedList)
  }

  //排序
  handleTableSort = (pagination, filters, sorter) => {
    let order
    if(sorter.order === 'descend'){
      order = 'DESC'
    }else if(sorter.order === 'ascend'){
      order = 'ASC'
    }else{
      order = ''
    }
    this.setState({
      sortOrder: order
    }, this.assetLinkedList)
  }

  //**副作用开始 */
  //列表
  assetLinkedList=debounce((iscache = false)=>{
    const state = this.state
    const { history, dispatch } = this.props
    const pagingParameter = {
      currentPage: state.currentPage,
      pageSize: state.pageSize
    }
    const values = {
      categoryModels: state.categoryModels,
      assetNumber: state.assetNumber,
      assetName: state.assetName,
      sortName: state.sortName,
      sortOrder: state.sortOrder,
      areaIds: state.areaIds
    }
    const payload = {
      ...pagingParameter,
      ...values
    }
    !iscache && cacheSearchParameter([{
      page: pagingParameter,
      parameter: { ...values }
    }], history, 0)
    dispatch({ type: 'asset/assetLinkedList', payload: payload })
  }, 300)

  render (){
    const { currentPage, pageSize, PrefixCls, sortOrder } = this.state
    const {
      form: { getFieldDecorator },
      assetLinkedList,
      userAreaTree
    } = this.props

    const columns = [{
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      isShow: true,
      width: '20%',
      render: text=>TooltipFn(text)
    }, {
      title: '编号',
      dataIndex: 'number',
      key: 'number',
      isShow: true,
      width: '18%',
      render: text=>TooltipFn(text)
    },  {
      title: '区域',
      dataIndex: 'areaName',
      key: 'areaName',
      isShow: true,
      width: '12%',
      render: text=>TooltipFn(text)
    }, {
      title: '资产类型',
      dataIndex: 'categoryModelName',
      key: 'categoryModelName',
      isShow: true,
      width: '12%',
      render: text=>TooltipFn(text)
    }, {
      title: '可绑定数量',
      dataIndex: 'canBind',
      key: 'canBind',
      isShow: true,
      width: '12%',
      render: text=>TooltipFn(text)
    }, {
      title: '未绑定数量',
      dataIndex: 'noBind',
      key: 'noBind',
      sorter: true,
      sortOrder: sortOrder === 'DESC' ? 'descend' : sortOrder === 'ASC' ? 'ascend' : '',
      isShow: true,
      width: '12%',
      render: text=>TooltipFn(text)
    }, {
      title: '操作',
      dataIndex: 'operate',
      key: 'operate',
      isShow: true,
      width: '14%',
      render: (text, record) => (
        <div className="operate-wrap">
          {hasAuth(assetsPermission.ASSET_TL_SET) &&
          <Link to={{
            pathname: '/asset/relation/setting',
            search: `assetId=${transliteration(record.assetId)}&net=${record.categoryModel}`,
            state: { rCaches: 1 }
          }}>通联设置</Link>
          }

          {hasAuth(assetsPermission.ASSET_TL_CK) &&
          <Link to={{
            pathname: '/asset/relation/details',
            search: `assetId=${transliteration(record.assetId)}&net=${record.categoryModel}`,
            state: { rCaches: 1 }
          }}>查看</Link>}
        </div>
      )
    }]

    const defaultFields = [
      { label: '资产类型', key: 'categoryModels', type: 'select', multiple: true, placeholder: '全部', data: HARD_ASSET_TL_TYPE },
      { label: '区域', key: 'areaIds', type: 'treeSelect', placeholder: '全部', multiple: true, showSearch: true, data: userAreaTree, treeCheckable: false, config: { name: 'fullName', value: 'stringId' }, showCheckedStrategy: 'child' },
      { label: '名称', key: 'assetName', type: 'input', placeholder: '请输入名称', maxLength: 30 },
      { label: '编号', key: 'assetNumber', type: 'input', placeholder: '请输入名称', maxLength: 30 }
    ]

    return(
      <div className={`main-table-content ${PrefixCls}`}>
        <div className="search-bar">
          <Search defaultFields={ defaultFields }
            onSubmit={ this.onSubmit }
            onReset={ this.handleReset }
            wrappedComponentRef={search => { search && (this.searchForm = search.props.form) }}
          />
        </div>
        <div className="table-wrap">
          <Table
            rowKey='assetId'
            columns={columns}
            dataSource={assetLinkedList.items}
            onChange={this.handleTableSort}
            pagination={{
              showQuickJumper: true,
              showSizeChanger: assetLinkedList.totalRecords > 10,
              pageSizeOptions: ['10', '20', '30', '40'],
              onShowSizeChange: this.pageChange,
              showTotal: () => `共 ${assetLinkedList.totalRecords} 条数据`,
              current: currentPage,
              pageSize: pageSize,
              total: assetLinkedList.totalRecords,
              onChange: this.pageChange
            }}
          />
        </div>
      </div>
    )
  }

  async componentDidMount (){
    await this.props.dispatch({ type: 'asset/getUserAreaTree' }) // 区域树

    const { list } = evalSearchParam(this, {}, false) || {}
    if(list && list[0]){
      const { page, parameter } = list[0]
      this.searchForm.setFieldsValue( parameter )
      this.setState({
        ...page,
        ...parameter
      }, this.assetLinkedList)
    }else{
      this.assetLinkedList(true)
    }
  }
}

export default connect(({ asset }) => ({
  assetLinkedList: asset.assetLinkedList,
  userAreaTree: asset.userAreaTree
}))(RelationList)
