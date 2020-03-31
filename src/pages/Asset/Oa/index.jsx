import { PureComponent } from 'react'
import { Form, Table } from 'antd'
import { Link } from 'dva/router'
import moment from 'moment'
import Api from '@/services/api'
import { transliteration, TooltipFn, cacheSearchParameter, evalSearchParam, removeCriteria } from '@/utils/common'
import hasAuth from '@/utils/auth'
import { debounce } from 'lodash'
import { assetsPermission } from '@a/permission'
import Search from '@/components/common/Search'
import { OA_STATUS, OA_TYPE } from '@a/js/enume'
import { CommonModal } from '@c'
import './style.less'
import OaDetail from './OaDetail'

@Form.create()
class AssetOa extends PureComponent{
  state = {
    PrefixCls: 'AssetOa',
    currentPage: 1,
    pageSize: 10,
    visible: false, //删除弹窗
    alertItem: '',
    name: null, //名称
    gmtModified: '', //更新时间
    sortName: '',
    sortOrder: '',
    businessList: { item: [], totalRecords: 0 },
    initStatus: {} //订单详情
  }

  //查看
  lookDetail=item=>{
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
      visible,
      businessList,
      initStatus
    } = this.state

    const columns = [ {
      title: '流水号',
      dataIndex: 'name',
      key: 'name',
      isShow: true,
      width: '24%',
      render: text=>TooltipFn(text)
    }, {
      title: '订单类型',
      dataIndex: 'description',
      key: 'description',
      isShow: true,
      width: '10%',
      render: text=>TooltipFn(text)
    }, {
      title: '时间',
      dataIndex: 'gmtModified',
      key: 'gmtModified',
      isShow: true,
      width: '16%',
      sorter: true,
      render: (text) => { return (<span className="tabTimeCss">{moment(text).format('YYYY-MM-DD HH:mm:ss')}</span>)}
    }, {
      title: '订单状态',
      dataIndex: 'importance',
      key: 'importance',
      isShow: true,
      width: '16%',
      sorter: true
    //   render: text=>TooltipFn((SOURCE_LEVEL.filter(item=>item.value === text)[0] || {}).name)
    }, {
      title: '操作',
      isShow: true,
      key: 'operate',
      width: '18%',
      render: (text, scope)=>{
        return (
          <div className="operate-wrap">
            {
              hasAuth(assetsPermission.ASSET_ZCZ_ZX) ? <a onClick={()=>this.lookDetail(scope)}>查看</a> : null
            }
            {
              hasAuth(assetsPermission.ASSET_ZCZ_BJ) ? (
                <Link
                  to={ `/asset/oa/handle?stringId=${transliteration(scope.stringId)}&&description=1` }>处理</Link>
              ) : null
            }
          </div>
        )
      }
    }]

    const defaultFields = [
      { label: '流水号', key: 'name', type: 'input', placeholder: '请输入业务名称' },
      { label: '订单类型', key: 'entryStatus', multiple: true, type: 'select', data: OA_STATUS },
      { label: '时间', key: 'gmtModified', type: 'dateRange' },
      { label: '订单状态', key: 'entryStatus2', multiple: true, type: 'select', data: OA_TYPE }
    ]

    return(
      <section className={`main-table-content ${PrefixCls}`}>
        <div className="search-bar">
          <Search defaultFields={ defaultFields } onSubmit={ this.onSubmit } onReset={ this.handleReset } wrappedComponentRef={search => { search && (this.searchForm = search.props.form) }}/>
        </div>
        <div className="table-wrap">
          <Table
            rowKey='uniqueId'
            columns={columns}
            dataSource={businessList.items}
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
        <CommonModal
          title={'订单详情'}
          type='search'
          isOk={false}
          visible={visible}
          className='assetOaModal'
          onClose={()=>this.setState({ visible: false })}
          noText={'关闭'}
          children={<OaDetail initStatus={initStatus}/>}
        />
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

export default AssetOa

