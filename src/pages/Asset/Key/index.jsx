import { PureComponent } from 'react'
import { connect } from 'dva'
import moment from 'moment'
import { Form, Table, Modal } from 'antd'
import Register from './register'
import api from '@/services/api'
import hasAuth from '@/utils/auth'
import PropTypes from 'prop-types'
import { debounce } from 'lodash'
import { evalSearchParam, cacheSearchParameter, removeCriteria, TooltipFn } from '@/utils/common'
import ModalConfirm from '@/components/common/ModalConfirm'
import { assetsPermission } from '@a/permission'
import Search from '@/components/common/Search'
import { KEY_STATUS } from '@a/js/enume'
import { TableBtns } from '@c/index'

@Form.create()
class AssetPersonnelIdentity extends PureComponent{
  state = {
    PrefixCls: 'AssetPersonnelIdentity',
    currentPage: 1,
    pageSize: 10,
    name: '', //姓名
    mobile: '', //手机号
    departmentId: '', //所属组织
    gmtModified: null, //领用时间
    visible: false, //登记弹出框
    initScope: null,
    modelState: 1,
    showAlert: false, //注释弹窗
    showAlertType: null,
    alertItem: '' //删除 冻结选中数据
  }

  static defaultProps ={
    personnelIdentityManagerBody: { items: [], totalRecords: '' }
  }

  static propTypes={
    personnelIdentityManagerBody: PropTypes.object
  }

  //导入
  exportAssets=()=>{

  }

  //提交表单 执行查询
  onSubmit=values=>{
    this.setState({
      currentPage: 1,
      name: values.name,
      mobile: values.mobile,
      departmentId: values.departmentId,
      gmtModified: values.gmtModified
    }, this.getPersonnelIdentityManagerList)
  }

  handleReset = (e)=>{
    removeCriteria(false, this.props.history)
    this.setState({
      currentPage: 1,
      name: '',
      mobile: '',
      departmentId: '',
      gmtModified: ''
    }, ()=>this.getPersonnelIdentityManagerList(true))
  }

  //展开登记弹窗
  register = (state, scope)=>{
    this.setState({
      visible: true,
      modelState: state,
      initScope: scope
    })
  }

  //登记表单放弃
  infoCancel = ()=>{
    this.setState({
      visible: false,
      temp1: false
    })
  }

  //变更表单放弃
  infoCancel3 = ()=>{
    this.setState({
      visible: false,
      temp3: false
    })
  }

  //翻页
  pageChange = (page, pageSize)=>{
    this.setState({
      currentPage: page,
      pageSize: pageSize
    }, this.getPersonnelIdentityManagerList)
  }

  //   删除 冻结
  showConfirmCB=()=>{
    //（解冻  归还）
    const { alertItem, showAlertType } = this.state
    const that = this
    if(showAlertType === 'delete'){
      // api.deleteUser({ stringId: alertItem.stringId }).then(res => {
    //   // todo 处理成功 弹窗 处理失败
    //   if(res && res.head && res.head.code === '200' ){
    //     //todo  清除上传组件列表值pageIndex: page,
    //     message.success('删除用户成功')
    //     that.getPersonnelIdentityManagerList()
    //   }
    // })
    // return void(0)
    }
    // api.deleteUser({ stringId: alertItem.stringId }).then(res => {
    //   // todo 处理成功 弹窗 处理失败
    //   if(res && res.head && res.head.code === '200' ){
    //     //todo  清除上传组件列表值pageIndex: page,
    //     message.success('删除用户成功')
    //     that.getPersonnelIdentityManagerList()
    //   }
    // })
    this.setState({ showAlert: false, alertItem: '' })
  }

  //当点击注销时，显示该确认框
  showConfirm = (item) =>(type)=> {
    this.setState({ showAlert: true, alertItem: item, showAlertType: type })
  }

  confirmSucess=(type)=>{
    let content = ''
    if(type === 'return'){
      content = '归还'
    }else{
      content = '解冻'
    }
    Modal.success({
      content: `${content}成功！`
    })
  }

  //**接口开始 */

  //列表
  getPersonnelIdentityManagerList=debounce(iscache=>{
    const { dispatch, history } = this.props
    const state = this.state
    const pagingParameter = {
      currentPage: state.currentPage,
      pageSize: state.pageSize
    }
    const parameter = {
      name: state.name,
      mobile: state.mobile,
      departmentId: state.departmentId,
      gmtModified: state.gmtModified
    }
    const payload = {
      ...pagingParameter,
      ...parameter
    }
    !iscache && cacheSearchParameter([{
      page: pagingParameter,
      parameter: parameter
    }], history, 0)
    dispatch({ type: 'asset/getPersonnelIdentityManagerList', payload })
  }, 300)

  render () {
    let {
      currentPage,
      pageSize,
      modelState,
      visible,
      initScope,
      PrefixCls,
      showAlert,
      showAlertType
    } = this.state
    let {
      personnelIdentityManagerBody: {
        items,
        totalRecords
      }
    } = this.props

    const columns = [
      {
        title: 'key编号',
        key: 'name',
        dataIndex: 'name',
        isShow: true,
        width: '30%',
        render: text=>TooltipFn(text)
      }, {
        title: '使用者',
        key: 'departmentName',
        dataIndex: 'departmentName',
        isShow: true,
        width: '18%',
        render: text=>TooltipFn(text)
      }, {
        title: '当前状态',
        key: 'mobile',
        dataIndex: 'mobile',
        isShow: true,
        width: '18%',
        render: text=>TooltipFn(text)
      }, {
        title: '领用时间',
        key: 'gmtCreate',
        width: '16%',
        dataIndex: 'gmtCreate',
        isShow: true,
        render: (text) => { return (<span className="tabTimeCss">{moment(text).format('YYYY-MM-DD HH:mm:ss')}</span>)}
      }, {
        title: '操作',
        key: 'operate',
        width: '18%',
        isShow: true,
        render: (text, scoped)=>{
          return (<div className="operate-wrap">
            {
              hasAuth(assetsPermission.ASSET_RYSF_BJ) ? <a onClick={() =>{
                scoped.handleN = 2
                this.register(2, scoped)
              }}>领用</a> : null
            }
            {
              hasAuth(assetsPermission.ASSET_RYSF_ZX) ? <a onClick={() =>(this.showConfirm(scoped)('delete'))}>删除</a> : null
            }
            {
              hasAuth(assetsPermission.ASSET_RYSF_ZX) ? <a onClick={() =>(this.confirmSucess('return'))}>归还</a> : null
            }
            {
              hasAuth(assetsPermission.ASSET_RYSF_ZX) ? <a onClick={() =>(this.showConfirm(scoped)('frozen'))}>冻结</a> : null
            }
            {
              hasAuth(assetsPermission.ASSET_RYSF_ZX) ? <a onClick={() =>(this.confirmSucess('thaw'))}>解冻</a> : null
            }
          </div>)
        }
      }
    ]

    const showConfirm = {
      visible: showAlert,
      onOk: this.showConfirmCB,
      onCancel: ()=>this.setState({ showAlert: false }),
      children: (<p className="model-text">{showAlertType === 'delete' ? '确定要删除吗?' : '确定要冻结吗?'}</p>)
    }

    const defaultFields = [
      { label: 'key编号', key: 'name', type: 'input', placeholder: '请输入名称', maxLength: 30 },
      { label: '使用者', key: 'mobile', type: 'input', placeholder: '请输入名称', maxLength: 30 },
      { label: '当前状态', key: 'departmentId', type: 'select', placeholder: '全部', data: KEY_STATUS },
      { label: '领用时间', key: 'gmtModified', type: 'dateRange' }
    ]

    const leftBtns = [
      { label: '登记', onClick: ()=>this.register(1, null), check: () => hasAuth(assetsPermission.ASSET_DJ) },
      { label: '导入', onClick: this.exportAssets, check: () => hasAuth(assetsPermission.ASSET_EXPORT) }
    ]
    const items2 = [
      {
        name: 666,
        departmentName: 666,
        mobile: 666,
        gmtCreate: 2000
      }
    ]

    return(
      <section className={`main-table-content ${PrefixCls}`}>
        <div className="search-bar">
          <Search defaultFields={ defaultFields }
            onSubmit={ this.onSubmit }
            onReset={ this.handleReset }
            wrappedComponentRef={search => { search && (this.searchForm = search.props.form) }}
          />
        </div>
        <div className="table-wrap">
          <TableBtns leftBtns={leftBtns} />
          <Table
            rowKey='stringId'
            columns={columns}
            dataSource={items2}
            pagination={{
              current: currentPage,
              pageSize: pageSize,
              showQuickJumper: true,
              showSizeChanger: totalRecords > 10,
              pageSizeOptions: ['10', '20', '30', '40'],
              onShowSizeChange: this.pageChange,
              showTotal: () => `共 ${totalRecords} 条数据`,
              defaultCurrent: 1,
              defaultPageSize: 10,
              total: totalRecords,
              onChange: this.pageChange
            }}
          />
        </div>

        <Modal visible = {visible }
          title={['登记', '领用'][Number(modelState) - 1]}
          destroyOnClose
          onCancel={this.infoCancel}
          className='over-scroll-modal'
          footer={null} width={650}>
          <Register list={[]}
            PrefixCls={PrefixCls}
            model={ modelState }
            initStatus={initScope}
            onCancel = {this.infoCancel}
            refresh={this.getPersonnelIdentityManagerList} />
        </Modal>

        <ModalConfirm props={showConfirm}/>
      </section>
    )
  }

  //根据页面获取列表数据
  componentDidMount () {

    const { list } = evalSearchParam(this, {}, false) || {}
    if(list && list[0]){
      const { page, parameter } = list[0]
      this.searchForm.setFieldsValue( parameter )
      this.setState({
        ...page,
        ...parameter
      }, this.getPersonnelIdentityManagerList)
    }else{
      this.getPersonnelIdentityManagerList(true)
    }
  }

}

export default connect(({ asset }) => ({
  personnelIdentityManagerBody: asset.personnelIdentityManagerBody
}))(AssetPersonnelIdentity)
