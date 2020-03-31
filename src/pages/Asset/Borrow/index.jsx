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
import { BORROW_STATUS } from '@a/js/enume'
import AssetReturnDetails from './ReturnDetails'
import { TableBtns } from '@c/index'

@Form.create()
class AssetBusiness extends PureComponent{
  state = {
    PrefixCls: 'AssetBusiness',
    currentPage: 1,
    pageSize: 10,
    visible: false, //归还弹窗
    alertItem: {},
    name: null, //名称
    gmtModified: '', //更新时间
    sortName: '',
    sortOrder: '',
    businessList: { item: [], totalRecords: 0 }
  }

  logoutCB=()=>{
    const that = this
    const { alertItem } = this.state
    this.ReturnDetails.getData()
    // Api.deleteBusiness({ uniqueId: alertItem.uniqueId }).then((data)=>{
    //   if(data.head && data.head.code === '200'){
    //     message.success('操作成功！')
    //     that.getBusinessList()
    //   }
    // })
    this.setState({ visible: false, alertItem: {} })
  }

  //归还
  logout=item=>{
    console.log(item)
    this.setState({ visible: true, alertItem: item })
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

  //导出
  exportAssets = () => {
    const state = this.state
    const seekTerm = {
      ...this.exportGetData(),
      sortName: state.sortName,
      sortOrder: state.sortOrder
    }
    // Api.getAssetList({ ...seekTerm }).then(res => {
    //   if (res && res.head && res.head.code === '200') {
    //     //总数为0 ，测试要求前端判断
    //     if (res.body && res.body.totalRecords && res.body.totalRecords !== 0) {
    //       this.setState({ exportVisible: true, seekTerm })
    //     } else {
    //       message.error('暂无数据可导出!')
    //     }
    //   }
    // })
  }

  render (){
    const {
      currentPage,
      pageSize,
      PrefixCls,
      visible,
      businessList,
      alertItem,
      exportVisible
    } = this.state

    const columns = [ {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      isShow: true,
      width: '24%',
      render: text=>TooltipFn(text)
    }, {
      title: '编号',
      dataIndex: 'description',
      key: 'description',
      isShow: true,
      width: '10%',
      render: text=>TooltipFn(text)
    }, {
      title: '类型',
      dataIndex: 'assetCount',
      key: 'assetCount',
      isShow: true,
      width: '16%',
      sorter: true,
      render: text=>TooltipFn(text)
    }, {
      title: 'key',
      dataIndex: 'importance',
      key: 'importance',
      isShow: true,
      width: '16%',
      sorter: true
    //   render: text=>TooltipFn((SOURCE_LEVEL.filter(item=>item.value === text)[0] || {}).name)
    },  {
      title: '状态',
      dataIndex: 'assetCount1',
      key: 'assetCount1',
      isShow: true,
      width: '16%',
      sorter: true,
      render: text=>TooltipFn(text)
    },  {
      title: '当前使用者',
      dataIndex: 'assetCount2',
      key: 'assetCount2',
      isShow: true,
      width: '16%',
      sorter: true,
      render: text=>TooltipFn(text)
    }, {
      title: '出借日期',
      dataIndex: 'gmtModified',
      key: 'gmtModified2',
      isShow: true,
      width: '16%',
      sorter: true,
      render: (text) => { return (<span className="tabTimeCss">{moment(text).format('YYYY-MM-DD HH:mm:ss')}</span>)}
    }, {
      title: '出借时间',
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
              hasAuth(assetsPermission.ASSET_ZCZ_ZX) ? <a onClick={()=>this.logout(scope)}>归还</a> : null
            }
            {
              hasAuth(assetsPermission.ASSET_ZCZ_BJ) ? (
                <Link
                  to={ `/asset/borrow/history?uniqueId=${transliteration(scope.uniqueId)}` }>历史情况</Link>
              ) : null
            }
            {
              hasAuth(assetsPermission.ASSET_ZCZ_BJ) ? (
                <Link
                  to={ `/asset/borrow/details?uniqueId=${transliteration(scope.uniqueId)}` }>出借</Link>
              ) : null
            }
          </div>
        )
      }
    }]

    const logoutInfo = {
      visible: visible,
      onOk: this.logoutCB,
      width: 600,
      onCancel: ()=>this.setState({ visible: false }),
      children: (<AssetReturnDetails children = {(now)=>this.ReturnDetails = now} alertItem={alertItem}/>)
    }

    const defaultFields = [
      { label: '综合查询', key: 'name', type: 'input', placeholder: '名称/编号/key' },
      { label: '类型', key: 'entryStatus', multiple: true, type: 'select', data: [] },
      { label: '状态', key: 'entryStatus2', type: 'select', data: BORROW_STATUS }
    ]

    const fieldList = [
      { label: '当前使用者', key: 'entryStatus3', multiple: true, type: 'select', data: [] },
      { label: '出借日期', key: 'gmtModified', type: 'dateRange' }
    ]

    const leftBtns = [
      { label: '导出', onClick: this.exportAssets, check: () => hasAuth(assetsPermission.ASSET_EXPORT) }
    ]

    return(
      <section className={`main-table-content ${PrefixCls}`}>
        <div className="search-bar">
          <Search defaultFields={ defaultFields } fieldList={fieldList} onSubmit={ this.onSubmit } onReset={ this.handleReset } wrappedComponentRef={search => { search && (this.searchForm = search.props.form) }}/>
        </div>
        <div className="table-wrap">
          <TableBtns leftBtns={leftBtns}/>
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

