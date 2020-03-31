import { PureComponent } from 'react'
import { connect } from 'dva'
import { Button, Form, Table, message } from 'antd'
import { Link } from 'dva/router'
import moment from 'moment'
import Api from '@/services/api'
import { transliteration, TooltipFn, cacheSearchParameter, evalSearchParam, removeCriteria } from '@/utils/common'
import hasAuth from '@/utils/auth'
import PropTypes from 'prop-types'
import { debounce, cloneDeep } from 'lodash'
import ModalConfirm from '@/components/common/ModalConfirm'
import { assetsPermission } from '@a/permission'
import Search from '@/components/common/Search'

@Form.create()
class AssetGroupManager extends PureComponent{
  state = {
    PrefixCls: 'AssetGroupManager',
    currentPage: 1,
    pageSize: 10,
    showAlert: false, //安装弹窗
    alertItem: '',
    name: null, //资产组名称
    createUser: '', //创建人
    userInAssetList: [] // 使用者
  }

  static defaultProps ={
    groupManagerBody: { items: [], totalRecords: '' }
  }

  static propTypes={
    groupManagerBody: PropTypes.object
  }

  getUser = async () =>{
    //创建人
    await Api.assetGroupCreateUser().then((data)=>{
      if(data && data.head && data.head.code === '200'){
        this.setState({ userInAssetList: data.body })
      }
    })
  }

  logoutCB=()=>{
    const that = this
    const { alertItem } = this.state
    Api.removeGroupItems({ stringId: alertItem.stringId }).then((data)=>{
      if(data.head && data.head.code === '200'){
        message.success('操作成功！')
        that.getGroupManagerList()
        that.getUser()
      }
    })
    this.setState({ showAlert: false, alertItem: '' })
  }

  //注销
  logout=item=>{
    this.setState({ showAlert: true, alertItem: item })
  }

  //提交表单
  onSubmit = values => {
    this.setState({
      currentPage: 1,
      name: values.name,
      createUser: values.createUser
    }, this.getGroupManagerList)

  }

  //重置表单信息
  handleReset = ()=>{
    removeCriteria(false, this.props.history)
    this.setState({
      currentPage: 1,
      name: null,
      createUser: ''
    },  ()=>this.getGroupManagerList(true))
  }

  //翻页
  pageChange = (page, pageSize)=>{
    this.setState({
      currentPage: page,
      pageSize: pageSize
    }, this.getGroupManagerList)
  }

  //**接口开始 副作用 */
  getGroupManagerList=debounce(iscache=>{
    const state = this.state
    const { history, dispatch } = this.props
    const pagingParameter = {
      currentPage: state.currentPage,
      pageSize: state.pageSize
    }
    const values = {
      name: state.name,
      createUser: state.createUser
    }
    const payload = {
      ...pagingParameter,
      ...values
    }
    !iscache && cacheSearchParameter([{
      page: pagingParameter,
      parameter: { ...values }
    }], history, 0)
    dispatch({ type: 'asset/getGroupManagerList', payload: payload })
  }, 300)

  render (){
    const {
      userInAssetList,
      currentPage,
      pageSize,
      PrefixCls,
      showAlert
    } = this.state
    const {
      form: { getFieldDecorator },
      groupManagerBody
    } = this.props

    const columns = [ {
      title: '资产组名称',
      dataIndex: 'name',
      key: 'name',
      isShow: true,
      width: '24%',
      render: text=>TooltipFn(text)
    }, {
      title: '创建人',
      dataIndex: 'createUserName',
      key: 'createUserName',
      isShow: true,
      width: '10%',
      render: text=>TooltipFn(text)
    }, {
      title: '资产明细',
      dataIndex: 'assetList',
      key: 'assetList',
      isShow: true,
      width: '16%',
      render: (text, scope)=>TooltipFn(scope.assetList.join(','))
    }, {
      title: '备注信息',
      dataIndex: 'memo',
      key: 'memo',
      isShow: true,
      width: '16%',
      render: text=>TooltipFn(text)
    }, {
      title: '创建时间',
      dataIndex: 'gmtCreate',
      key: 'gmtCreate',
      isShow: true,
      width: '16%',
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
              hasAuth(assetsPermission.ASSET_ZCZ_BJ) ? (
                <Link
                  to={ `/asset/group/update?stringId=${transliteration(scope.stringId)}` }>变更</Link>
              ) : null
            }
            {
              hasAuth(assetsPermission.ASSET_ZCZ_ZX) ? <a onClick={()=>this.logout(scope)}>注销</a> : null
            }
            {
              hasAuth(assetsPermission.ASSET_ZCZ_CK) ?
                <Link to={{
                  pathname: '/asset/group/details',
                  search: `stringId=${transliteration(scope.stringId)}`,
                  state: { rCaches: 1 }
                }}>查看</Link>
                : null
            }
          </div>
        )
      }
    }]

    const logoutInfo = {
      visible: showAlert,
      onOk: this.logoutCB,
      onCancel: ()=>this.setState({ showAlert: false }),
      children: (<p className="model-text">确认是否需要注销？</p>)
    }
    const defaultFields = [
      { label: '资产组名称', key: 'name', type: 'input', placeholder: '请输入', maxLength: 30 },
      { label: '创建人', key: 'createUser', type: 'select',  data: cloneDeep(userInAssetList).map(v=>{[v.value, v.name] = [v.id, v.value]
        return v
      }) }
    ]

    return(
      <section className={`main-table-content ${PrefixCls}`}>
        <div className="search-bar">
          <Search defaultFields={ defaultFields }
            onSubmit={ this.onSubmit }
            onReset={ this.onReset }
            wrappedComponentRef={search => { search && (this.searchForm = search.props.form) }}
          />
        </div>
        <div className="table-wrap">
          <div className="table-btn">
            <div className="left-btn">
              <Link to={{ pathname: '/asset/group/register', params: { id: 'Friday' } }}>
                {hasAuth(assetsPermission.ASSET_ZCZ_DJ)
                  ? <Button
                    type="primary"
                    onClick = {
                      () => {
                        this.props.dispatch({
                          type: 'asset/saveRegisterInfo',
                          payload: {
                            allList: { items: [] },
                            assetGroupName: '',
                            remark: ''
                          }
                        })
                      }
                    }
                  >登记
                  </Button>
                  : null}
              </Link>
            </div>
          </div>
          <Table
            rowKey='stringId'
            columns={columns}
            dataSource={groupManagerBody.items}
            pagination={{
              showQuickJumper: true,
              showSizeChanger: groupManagerBody.totalRecords > 10,
              pageSizeOptions: ['10', '20', '30', '40'],
              onShowSizeChange: this.pageChange,
              showTotal: () => `共 ${groupManagerBody.totalRecords} 条数据`,
              current: currentPage,
              PageSize: pageSize,
              total: groupManagerBody.totalRecords,
              onChange: this.pageChange
            }}
          />
        </div>
        <ModalConfirm props={logoutInfo}/>
      </section>
    )
  }

  async componentDidMount (){
    // 根据页面获取列表数据
    await this.getUser()

    const { list } = evalSearchParam(this, {}, false) || {}
    if(list && list[0]){
      const { page, parameter } = list[0]
      this.searchForm.setFieldsValue( parameter )
      this.setState({
        ...page,
        ...parameter
      }, this.getGroupManagerList)
    }else{
      this.getGroupManagerList(true)
    }
  }

}

export default connect(({ asset }) => ({
  groupManagerBody: asset.groupManagerBody,
  userInAssetList: asset.userInAssetList
}))(AssetGroupManager)

