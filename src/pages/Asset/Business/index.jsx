import { PureComponent, Fragment } from 'react'
import { Button, Form, Table, message } from 'antd'
import { Link } from 'dva/router'
import moment from 'moment'
import Api from '@/services/api'
import { transliteration, TooltipFn, cacheSearchParameter, evalSearchParam, removeCriteria } from '@/utils/common'
import hasAuth from '@/utils/auth'
import { debounce } from 'lodash'
import ModalConfirm from '@/components/common/ModalConfirm'
import { assetsPermission } from '@a/permission'
import Search from '@/components/common/Search'
import { SOURCE_LEVEL } from '@a/js/enume'

@Form.create()
class AssetBusiness extends PureComponent{
  state = {
    PrefixCls: 'AssetBusiness',
    currentPage: 1,
    pageSize: 10,
    showAlert: false, //删除弹窗
    alertItem: '',
    name: null, //名称
    gmtModified: '', //更新时间
    sortName: '',
    sortOrder: '',
    businessList: { item: [], totalRecords: 0 }
  }

  logoutCB=()=>{
    const that = this
    const { alertItem } = this.state
    Api.deleteBusiness({ uniqueId: alertItem.uniqueId }).then((data)=>{
      if(data.head && data.head.code === '200'){
        message.success('操作成功！')
        that.getBusinessList()
      }
    })
    this.setState({ showAlert: false, alertItem: '' })
  }

  //删除
  logout=item=>{
    console.log(item)
    this.setState({ showAlert: true, alertItem: item })
  }

  //提交表单
  onSubmit = values => {
    this.setState({
      currentPage: 1,
      name: values.name,
      gmtModified: values.gmtModified
    }, this.getBusinessList)

  }

  //重置表单信息
  handleReset = ()=>{
    removeCriteria(false, this.props.history)
    this.setState({
      currentPage: 1,
      name: null,
      gmtModified: ''
    }, ()=>this.getBusinessList(true))
  }

  //翻页
  pageChange = (page, pageSize)=>{
    this.setState({
      currentPage: page,
      pageSize: pageSize
    }, this.getBusinessList)
  }

  //排序
  handleTableSort = (pagination, filters, sorter) => {
    let order
    if(sorter.order === 'descend'){
      order = 'desc'
    }else if(sorter.order === 'ascend'){
      order = 'asc'
    }else{
      order = ''
    }
    this.setState({
      sortOrder: order,
      sortName: sorter.field
    }, this.getBusinessList)
  }
  //查询时间控制
  submitControl = (val, type) => {
    return moment(moment(val).format('YYYY-MM-DD') + type).unix() * 1000
  }

  //**接口开始 副作用 */
  getBusinessList=debounce(iscache=>{
    const state = this.state
    const [gmtModifiedStart, gmtModifiedEnd] = state.gmtModified || [null, null]
    const pagingParameter = {
      currentPage: state.currentPage,
      pageSize: state.pageSize
    }
    const parameter = {
      name: state.name,
      sortOrder: state.sortOrder,
      sortName: state.sortName
    }
    const payload = {
      ...pagingParameter,
      ...parameter,
      gmtModifiedStart: gmtModifiedStart ? this.submitControl(gmtModifiedStart, ' 00:00:00') : '',
      gmtModifiedEnd: gmtModifiedEnd ? this.submitControl(gmtModifiedEnd, ' 23:59:59') : ''
    }
    !iscache && cacheSearchParameter([{
      page: pagingParameter,
      parameter: {
        ...parameter,
        gmtModified: state.gmtModified
      }
    }], this.props.history, 0)
    Api.getBusinessList(payload).then(res => {
      if (res && res.head && res.head.code === '200') {
        this.setState({ businessList: res.body })
      }
    })
  }, 300)

  render (){
    const {
      currentPage,
      pageSize,
      PrefixCls,
      showAlert,
      businessList
    } = this.state

    const columns = [ {
      title: '业务名',
      dataIndex: 'name',
      key: 'name',
      isShow: true,
      width: '24%',
      render: text=>TooltipFn(text)
    }, {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      isShow: true,
      width: '10%',
      render: text=>TooltipFn(text)
    }, {
      title: '关联资产',
      dataIndex: 'assetCount',
      key: 'assetCount',
      isShow: true,
      width: '16%',
      sorter: true,
      render: text=>TooltipFn(text)
    }, {
      title: '重要性',
      dataIndex: 'importance',
      key: 'importance',
      isShow: true,
      width: '16%',
      sorter: true,
      render: text=>TooltipFn((SOURCE_LEVEL.filter(item=>item.value === text)[0] || {}).name)
    }, {
      title: '更新时间',
      dataIndex: 'gmtModified',
      key: 'gmtModified',
      isShow: true,
      width: '16%',
      sorter: true,
      render: (text) => { return (<span className="tabTimeCss">{moment(text).format('YYYY-MM-DD HH:mm:ss')}</span>)}
    }, {
      title: '操作',
      isShow: true,
      key: 'operate',
      width: '18%',
      render: (text, scope)=>{
        return (
          <div className="operate-wrap">
            {
              hasAuth(assetsPermission.ASSET_ZCZ_ZX) ? <a onClick={()=>this.logout(scope)}>删除</a> : null
            }
            {
              hasAuth(assetsPermission.ASSET_ZCZ_CK) ?
                <Link to={{
                  pathname: '/asset/business/details',
                  search: `uniqueId=${transliteration(scope.uniqueId)}`,
                  state: { rCaches: 1 }
                }}>查看</Link>
                : null
            }
            {
              hasAuth(assetsPermission.ASSET_ZCZ_BJ) ? (
                <Link
                  to={ `/asset/business/update?uniqueId=${transliteration(scope.uniqueId)}` }>编辑</Link>
              ) : null
            }
          </div>
        )
      }
    }]

    const logoutInfo = {
      visible: showAlert,
      onOk: this.logoutCB,
      onCancel: ()=>this.setState({ showAlert: false }),
      children: (<Fragment>
        <p className="model-text">确认要删除吗？</p>
        <p className="model-text">删除后将无法恢复！</p>
      </Fragment>)
    }

    const defaultFields = [
      { label: '业务名称', key: 'name', type: 'input', placeholder: '请输入业务名称' },
      { label: '更新时间', key: 'gmtModified', type: 'dateRange' }
    ]

    return(
      <section className={`main-table-content ${PrefixCls}`}>
        <div className="search-bar">
          <Search defaultFields={ defaultFields } onSubmit={ this.onSubmit } onReset={ this.handleReset } wrappedComponentRef={search => { search && (this.searchForm = search.props.form) }}/>
        </div>
        <div className="table-wrap">
          <div className="table-btn">
            <div className="left-btn">
              <Link to={{ pathname: '/asset/business/register', params: { id: 'Friday' } }}>
                {hasAuth(assetsPermission.ASSET_ZCZ_DJ)
                  ? <Button
                    type="primary"
                    // onClick = {
                    //   () => {
                    //     this.props.dispatch({
                    //       type: 'asset/saveRegisterInfo',
                    //       payload: {
                    //         allList: { items: [] },
                    //         assetGroupName: '',
                    //         remark: ''
                    //       }
                    //     })
                    //   }
                    // }
                  >新增
                  </Button>
                  : null}
              </Link>
            </div>
          </div>
          <Table
            rowKey='uniqueId'
            columns={columns}
            dataSource={businessList.items}
            onChange={this.handleTableSort}
            pagination={{
              showQuickJumper: true,
              showSizeChanger: businessList.totalRecords > 10,
              pageSizeOptions: ['10', '20', '30', '40'],
              onShowSizeChange: this.pageChange,
              showTotal: () => `共 ${businessList.totalRecords} 条数据`,
              current: currentPage,
              PageSize: pageSize,
              total: businessList.totalRecords,
              onChange: this.pageChange
            }}
          />
        </div>
        <ModalConfirm props={logoutInfo}/>
      </section>
    )
  }

  async componentDidMount (){

    const { list } = evalSearchParam(this, {}, false) || {}
    if(list && list[0]){
      const { page, parameter } = list[0]
      this.searchForm.setFieldsValue( parameter )
      this.setState({
        ...page,
        ...parameter
      }, this.getBusinessList)
    }else{
      this.getBusinessList(true)
    }
  }

}

export default AssetBusiness

