import { PureComponent, Fragment } from 'react'
import { connect } from 'dva'
import moment from 'moment'
import { Button, Input, Form, Table, Modal, TreeSelect,
  message, Checkbox, Popover, Icon  } from 'antd'
import './style.less'
import Register from './register'
import api from '@/services/api'
import hasAuth from '@/utils/auth'
import PropTypes from 'prop-types'
import { debounce, cloneDeep } from 'lodash'
import { TableBtns } from '@c/index'
import { emptyFilter, evalSearchParam, cacheSearchParameter, removeCriteria, TooltipFn } from '@/utils/common'
import ModalConfirm from '@/components/common/ModalConfirm'
import { assetsPermission } from '@a/permission'

const FormItem = Form.Item
const TreeNode = TreeSelect.TreeNode

@Form.create()
class AssetPersonnelIdentity extends PureComponent{
  state = {
    PrefixCls: 'AssetPersonnelIdentity',
    currentPage: 1,
    pageSize: 10,
    name: '', //姓名
    mobile: '', //手机号
    departmentId: '', //所属组织
    baseInfo: false, //登记弹出框
    initScope: null,
    modelState: 1,
    showAlert: false, //注释弹窗
    alertItem: '',
    columns: [
      {
        title: '姓名',
        key: 'name',
        dataIndex: 'name',
        isShow: true,
        width: '30%',
        render: text=>TooltipFn(text)
      }, {
        title: '所属组织',
        key: 'departmentName',
        dataIndex: 'departmentName',
        isShow: true,
        width: '18%',
        render: text=>TooltipFn(text)
      }, {
        title: '手机号',
        key: 'mobile',
        dataIndex: 'mobile',
        isShow: true,
        width: '18%',
        render: text=>TooltipFn(text)
      },  {
        title: 'key',
        key: 'mobile',
        dataIndex: 'mobile',
        isShow: true,
        render: text=>TooltipFn(text)
      }, {
        title: '创建时间',
        key: 'gmtCreate',
        width: '16%',
        dataIndex: 'gmtCreate',
        isShow: true,
        render: (text) => { return (<span className="tabTimeCss">{moment(text).format('YYYY-MM-DD HH:mm:ss')}</span>)}
      }, {
        title: '电子邮件',
        dataIndex: 'name33',
        key: 'name33',
        width: '80px',
        isShow: false,
        render: text => TooltipFn(text)
      },  {
        title: 'qq号',
        dataIndex: 'name34',
        key: 'name34',
        width: '80px',
        isShow: false,
        render: text => TooltipFn(text)
      },  {
        title: '微信号',
        dataIndex: 'name35',
        key: 'name35',
        width: '80px',
        isShow: false,
        render: text => TooltipFn(text)
      },  {
        title: '住址',
        dataIndex: 'name36',
        key: 'name36',
        width: '80px',
        isShow: false,
        render: text => TooltipFn(text)
      },  {
        title: '创建人',
        dataIndex: 'name37',
        key: 'name37',
        width: '80px',
        isShow: false,
        render: text => TooltipFn(text)
      }, {
        title: '更新时间',
        dataIndex: 'name38',
        key: 'name38',
        width: '80px',
        isShow: false,
        render: text => TooltipFn(text)
      }],
    columnsFixed: {
      title: () => {
        const columns = this.state.columns.slice(5)
        const content = (
          <div className="table-header-select">
            {columns.map(item => {
              if (item.key !== 'order' && item.key !== 'operate') {
                return (<Checkbox key={item.key} checked={item.isShow} onClick={() => this.tableHeaderChange(item)}>{item.title}</Checkbox>)
              } else {
                return null
              }
            })}
          </div>
        )

        return (
          <Fragment>操作 <span className="custom-column">
            <Popover getPopupContainer={triggerNode => triggerNode.parentNode} placement="bottomRight" trigger="click" content={content}>
              <Icon type="setting" className="icons" />
            </Popover>
          </span>
          </Fragment>)
      },
      key: 'operate',
      width: '18%',
      isShow: true,
      render: (text, scoped)=>{
        return (<div className="operate-wrap">
          {
            hasAuth(assetsPermission.ASSET_RYSF_BJ) ? <a onClick={() =>{
              scoped.handleN = 2
              this.register(2, scoped)
            }}>变更</a> : null
          }
          {
            hasAuth(assetsPermission.ASSET_RYSF_ZX) ? <a onClick={() =>(this.showConfirm(scoped))}>注销</a> : null
          }
          {
            hasAuth(assetsPermission.ASSET_RYSF_CK) ? <a onClick={() =>{
              scoped.handleN = 3
              this.register(3, scoped)
            }}>查看</a> : null
          }
        </div>)
      }
    }
  }

  static defaultProps ={
    personnelIdentityManagerBody: { items: [], totalRecords: '' }
  }

  static propTypes={
    personnelIdentityManagerBody: PropTypes.object,
    departmentNode: PropTypes.object  //部门
  }

  //修改table 头部
  tableHeaderChange = (column) => {
    const columns = cloneDeep(this.state.columns)
    columns.forEach(item => {
      if (item.key === column.key) item.isShow = !item.isShow
    })
    this.setState({ columns })
  }

  //提交表单 执行查询
  onSubmit=(e)=>{
    e.preventDefault()
    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.setState({
          currentPage: 1,
          name: values.name,
          mobile: values.mobile,
          departmentId: values.departmentId
        }, this.getPersonnelIdentityManagerList)
      }
    })
  }

  handleReset = (e)=>{
    removeCriteria(false, this.props.history)
    this.props.form.resetFields()
    this.setState({
      currentPage: 1,
      name: '',
      mobile: '',
      departmentId: ''
    }, ()=>this.getPersonnelIdentityManagerList(true))
  }

  //展开登记弹窗
  register = (state, scope)=>{
    this.setState({
      baseInfo: true,
      modelState: state,
      initScope: scope
    })
  }

  //登记表单放弃
  infoCancel = ()=>{
    this.setState({
      baseInfo: false,
      temp1: false
    })
  }
  //查看详情表单放弃
  infoCancel2 = ()=>{
    this.setState({
      baseInfo: false,
      temp2: false
    })
  }
  //变更表单放弃
  infoCancel3 = ()=>{
    this.setState({
      baseInfo: false,
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

  //加载树结构的下拉列表
  getTreeNode = (data) => {
    return data ?  (
      <TreeNode value={data.stringId} title={data.name} key= {`${data.stringId}`}>
        {data.childrenNode && data.childrenNode.length ? (
          data.childrenNode.map(item =>this.getTreeNode(item))
        ) : null}
      </TreeNode>
    ) : null
  }

  showConfirmCB=()=>{
    const { alertItem } = this.state
    const that = this
    api.deleteUser({ stringId: alertItem.stringId }).then(res => {
      // todo 处理成功 弹窗 处理失败
      if(res && res.head && res.head.code === '200' ){
        //todo  清除上传组件列表值pageIndex: page,
        message.success('删除用户成功')
        that.getPersonnelIdentityManagerList()
      }
    })
    this.setState({ showAlert: false, alertItem: '' })
  }

  //当点击注销时，显示该确认框
  showConfirm = (item) => {
    this.setState({ showAlert: true, alertItem: item })
  }

  //**接口开始 */
  //部门
  getDepartmentNode=()=>{
    const { dispatch } = this.props
    dispatch({ type: 'asset/getDepartmentNode' })
  }

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
      departmentId: state.departmentId
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
      baseInfo,
      initScope,
      PrefixCls,
      showAlert
    } = this.state
    let {
      personnelIdentityManagerBody: {
        items,
        totalRecords
      },
      departmentNode,
      form: { getFieldDecorator }
    } = this.props

    const showConfirm = {
      visible: showAlert,
      onOk: this.showConfirmCB,
      onCancel: ()=>this.setState({ showAlert: false }),
      children: (<p className="model-text">确定删除该用户?</p>)
    }

    const leftBtns = [
      { label: '登记', onClick: ()=>this.register(1, null), check: () => hasAuth(assetsPermission.ASSET_RYSF_DJ) },
      { label: '导入', onClick: () => this.setState({ importVisible: true }), check: () => hasAuth(assetsPermission.ASSET_IMPORT) },
      { label: '模板下载', onClick: () => this.setState({ templateShow: true }), check: () => hasAuth(assetsPermission.ASSET_MBXZ) }
    ]

    const columns = this.state.columns.filter(item => item.isShow)
    columns.push(this.state.columnsFixed)

    return(
      <section className={`main-table-content ${PrefixCls}`}>
        <div className="search-bar">
          <Form className="filter-form new-flex-layout" layout="inline" onSubmit={this.onSubmit}>
            <FormItem label="姓名:">
              {getFieldDecorator('name')(
                <Input autoComplete='off' className="filter-form-item" maxLength={30} placeholder="请输入" />
              )}
            </FormItem>
            <FormItem label="手机号:" className='item-separation'>
              {getFieldDecorator('mobile')(
                <Input autoComplete='off' maxLength={11} className="filter-form-item" placeholder="请输入 "/>
              )}
            </FormItem>
            <FormItem label="所属组织:">
              {getFieldDecorator('departmentId')(
                <TreeSelect
                  showSearch
                  dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                  placeholder="全部"
                  allowClear
                  getPopupContainer={triggerNode => triggerNode.parentNode}
                  treeDefaultExpandAll
                  onChange={this.onChange}
                  treeNodeFilterProp='title'
                >
                  {this.getTreeNode(departmentNode)}
                </TreeSelect>
              )}
            </FormItem>
            <FormItem label="key:">
              {getFieldDecorator('key')(
                <Input autoComplete='off' maxLength={30} className="filter-form-item" placeholder="请输入 "/>
              )}
            </FormItem>
            <FormItem className="search-item" style={{ marginLeft: 55 }}>
              <Button type="primary" htmlType="submit">查询</Button>
              <Button type="primary" ghost onClick={this.handleReset}>重置</Button>
            </FormItem>
          </Form>
        </div>
        <div className="table-wrap">
          <TableBtns leftBtns={leftBtns} />
          <Table
            scroll={{ x: true }}
            rowKey='stringId'
            columns={columns}
            dataSource={items}
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

        <Modal visible = {baseInfo }
          title={['登记', '变更', '查看'][Number(modelState) - 1]}
          destroyOnClose
          onCancel={this.infoCancel}
          className='over-scroll-modal'
          footer={null} width={650}>
          <Register list={departmentNode}
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
    const { list } = evalSearchParam(this) || {}
    if(list && list[0]){
      const { page, parameter } = list[0]
      this.setState({
        ...page,
        ...parameter
      }, this.getPersonnelIdentityManagerList)
    }else{
      this.getPersonnelIdentityManagerList(true)
    }
    this.getDepartmentNode()
  }

}

export default connect(({ asset }) => ({
  personnelIdentityManagerBody: asset.personnelIdentityManagerBody,
  departmentNode: asset.departmentNode
}))(AssetPersonnelIdentity)
