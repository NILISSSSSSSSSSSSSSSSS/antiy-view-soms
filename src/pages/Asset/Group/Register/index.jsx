import { Component } from 'react'
import { Table,  Row, Col, Form, Input, Button, Modal, message } from 'antd'
import './style.less'
import Alerts from './assetAlert'
import api from '@/services/api'
import { connect } from 'dva'
import { NavLink } from 'dva/router'
import moment from 'moment'
import { analysisUrl, transliteration, TooltipFn } from '@/utils/common'
import ModalConfirm from '@/components/common/ModalConfirm'

const FormItem = Form.Item

@Form.create()
class AssetGroupRegister extends Component{
  state = {
    PrefixCls: 'AssetGroupRegister',
    alertShow: false,
    pageIndex: 1,
    showAlert: false, //弹窗状态
    isSelect: null, //是否选择试删除
    alertItem: '', //弹窗带的资产
    pageSize: undefined,
    list: { items: [], total: 0 },
    rowsSelectedList: [],  //勾选数据
    selectedRowKeys: [],   //勾选数据编号
    recordArray: [],
    stringIds: analysisUrl(this.props.location.search).stringId,
    params: {},
    initKeys: []  //勾选传递到下个组件数据编号
  }

  //初始化init
  initValue = (params)=>{
    api.getAssetList(params).then(data=>{
      if(data && data.head && data.head.code === '200'){
        if(data.body)
          this.setState({
            list: {
              items: data.body.items || [],
              total: data.body.totalRecords
            }
          })
      }
    })
  }

  // saveRegisterInfo = () => {
  //   // 保存备注信息及勾选中的列表
  //   this.props.dispatch({
  //     type: 'asset/saveRegisterInfo',
  //     payload: {
  //       allList: this.state.list,
  //       assetGroupName: this.props.form.getFieldValue('assetGroupName'),
  //       remark: this.props.form.getFieldValue('remark')
  //     }
  //   })
  // }

  //返回上级
  callBack = ()=>{
    this.props.history.push('/asset/group')
  }

  //保存弹窗所选信息
  saveAlert =(value)=>{
    let { list } = this.state
    let hash = []
    list.items = list.items.concat(value)
    list.items.forEach((item, i) => {
      if(!(hash.some((now)=>now.stringId === item.stringId)))
        hash.push(item)
    })
    this.setState({ list: { items: hash, total: hash.length } })
  }

  //取消查找资产弹窗
  cancelAlert =()=>{
    this.setState({ alertShow: false })
  }

  //modal is ok
  deleteOnOk=()=>{
    this.state.isSelect ? this.delAllSelectCB() : this.onDeleteCB()
    this.setState({ showAlert: false })
  }

  onDeleteCB=()=>{
    let { list, recordArray, alertItem } = this.state
    recordArray.push(alertItem.stringId)
    list.items = list.items.filter((now, i) => alertItem.stringId !== now.stringId)
    list.total = list.items.length
    this.setState({ list, recordArray })
  }

  //删除某行资产
  onDelete = (item) => {
    this.setState({ showAlert: true, isSelect: false, alertItem: item })
  }

  delAllSelectCB = () => {
    let {
      rowsSelectedList,
      list,
      recordArray
    } = this.state
    rowsSelectedList.forEach((item) => recordArray.push(item.stringId))
    rowsSelectedList.forEach(item => {
      list.items.splice(list.items.indexOf(item), 1)
    })
    list.total = list.items.length
    this.setState({
      selectedRowKeys: [],
      list,
      rowsSelectedList: [],
      recordArray
    })
  }

  //删除勾选的
  delAllSelect = () => {
    let { rowsSelectedList } = this.state
    if(!rowsSelectedList.length){
      message.info('没有勾选的数据')
      return
    }
    this.setState({ showAlert: true, isSelect: true })
  }

  //查找资产
  findAsset=()=>{
    const { list } = this.state
    this.setState({ alertShow: true, initKeys: list.items.map(now=>now.stringId) })
  }

  // 提交表单回调
  onSubmitCb=res=>val=>{
    if (res && res.head && res.head.code === '200') {
      this.props.form.resetFields()
      message.success(`${val}成功`)
      this.callBack()
    } else {
      message.warn(`${val}失败`)
    }
  }

  // 提交表单
  onSubmit = (e) => {
    e.preventDefault()
    this.props.form.validateFields((err, values) => {
      if (!err) {
        values = {
          'name': values.assetGroupName,
          'memo': values.remark
        }
        let { list, recordArray } = this.state
        values.assetIds = list.items.length ? list.items.map(now=>now.stringId) : []
        if(this.state.stringId) {
          values.id = this.state.stringId
          values.deleteAssetIds = new Set(recordArray)
          api.updateAssetGroup(values).then(res => {
            this.onSubmitCb(res)('变更')
          })
        } else {
          //需要根据返回值进行相应的操作
          api.saveAssetGroup(values).then(res => {
            this.onSubmitCb(res)('登记')
          })
        }
      }
    })
  }

  render (){
    let { list, alertShow, initKeys, selectedRowKeys, stringIds, params, PrefixCls, showAlert } = this.state
    const  { form: { getFieldDecorator } } = this.props

    const formItemLayout = {
      labelCol: {
        span: 3
      },
      wrapperCol: {
        span: 7
      }
    }

    const columns = [{
      title: '序号',
      dataIndex: 'num',
      key: 'num',
      isShow: true,
      width: '6%',
      render: (text, scope, index)=>
        index + 1
    }, {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      isShow: true,
      width: '12%',
      render: text=>TooltipFn(text)
    }, {
      title: '编号',
      dataIndex: 'number',
      key: 'number',
      isShow: true,
      width: '12%',
      render: text=>TooltipFn(text)
    }, {
      title: '资产类型',
      dataIndex: 'categoryModelName',
      key: 'categoryModelName',
      isShow: true,
      width: '10%',
      render: text=>TooltipFn(text)
    },
    {
      title: 'IP',
      dataIndex: 'ips',
      key: 'ips',
      isShow: true,
      width: '10%',
      render: text=>TooltipFn(text)
    }, {
      title: 'MAC',
      dataIndex: 'macs',
      key: 'macs',
      isShow: true,
      width: '12%',
      render: text=>TooltipFn(text)
    },
    // {
    //   title: '资产组',
    //   dataIndex: 'assetGroup',
    //   key: 'assetGroup',
    //   isShow: true,
    //   width: '10%',
    //   render: text=>TooltipFn(text)
    // },
    {
      title: '状态',
      dataIndex: 'assetStatus',
      key: 'assetStatus',
      isShow: true,
      width: '10%',
      render: (text)=>(<span>
        { [ '待登记', '不予登记', '待配置', '待验证', '待入网', '待检查', '已入网', '待退役', '已退役'][Number(text) - 1]}</span>)
    }, {
      title: '首次发现时间',
      dataIndex: 'gmtCreate',
      key: 'gmtCreate',
      width: 168,
      sorter: (a, b) => a.gmtCreate - b.gmtCreate,
      render: (text) => (<span>{moment(text).format('YYYY-MM-DD HH:mm:ss')}</span>),
      isShow: true
    }, {
      title: '操作',
      isShow: true,
      width: '14%',
      key: 'operate',
      render: (text, record)=>{
        return (
          <Row style={{ textAlign: 'center' }}>
            <Col span={12}>
              <span>
                <NavLink to={`/asset/manage/detail?id=${transliteration(record.stringId)}`} target="_blank">
                  <span className='alertColor'>查看</span>
                </NavLink>
              </span>
            </Col>
            <Col span={12}>
              <a onClick={ () => this.onDelete(record)}>
                <span className='alertColor'>移除</span>
              </a>
            </Col>
          </Row>)
      }
    }]

    const deleteInfo = {
      visible: showAlert,
      onOk: this.deleteOnOk,
      onCancel: ()=>this.setState({ showAlert: false }),
      children: (<p className="model-text">是否移除选中数据？</p>)
    }

    const rowSelection = {
      selectedRowKeys,
      onChange: (selectedRowKeys, selectedRows) => {
        this.setState({
          selectedRowKeys,
          rowsSelectedList: selectedRows
        })
      },
      getCheckboxProps: record => ({
        disabled: record.name === 'Disabled User', // Column configuration not to be checked
        name: record.name
      })
    }
    return(
      <div className={`${PrefixCls}`}>
        <article className="group-register">
          <Row>
            <Col span={24}>
              <Form layout="horizontal">
                <div className="detail-content">
                  <FormItem {...formItemLayout} label='资产组名称'>
                    {getFieldDecorator('assetGroupName', {
                      rules: [
                        { required: true, message: '请输入' },
                        { message: '最多60个字符！', max: 60 }
                      ]
                    })(
                      <Input autoComplete='off' placeholder="请输入" style={{ width: 200 }} />
                    ) }
                  </FormItem>
                  <FormItem {...formItemLayout} label="备注信息">
                    {getFieldDecorator('remark', {
                      rules: [
                        { message: '最多300个字符！', max: 300 }
                      ]
                    })(
                      <Input.TextArea rows={4} placeholder="请输入..." style={{ resize: 'none' }} />
                    )}
                  </FormItem>
                  <FormItem {...formItemLayout} label="资产选择">
                    {getFieldDecorator('assetSelect')(
                      <Button type="primary" onClick={this.findAsset}
                      >查找资产
                      </Button>
                    )}
                  </FormItem>
                </div>
                <div className="table-wrap">
                  <div className="table-btn">
                    <div></div> {/*占位*/}
                    <div className="right-btn">
                      <Button type="primary" onClick={ this.delAllSelect}>移除</Button>
                    </div>
                  </div>
                  <Table
                    rowKey="stringId"
                    rowSelection={rowSelection}
                    columns={columns}
                    dataSource={list.items}
                    pagination={false}
                    scroll={{ y: 450 }}
                  />
                  <div className="total">共 {list.total} 条数据</div>
                </div>
                <footer className="Button-center">
                  <div>
                    <Button type="primary" onClick={this.onSubmit}>确认</Button>
                    <Button type="primary" className="back-btn" ghost onClick={this.callBack }>取消</Button>
                  </div>
                </footer>
              </Form>
            </Col>
          </Row>
        </article>
        <Modal  title="查找资产"
          destroyOnClose
          width={1100}
          className='over-scroll-modal'
          onCancel={()=>{
            this.setState({ alertShow: false })
            this.Alerts.handleReset()
          }}
          visible = {alertShow} footer={null} >
          <Alerts children = {(now)=>this.Alerts = now} saveAlert={this.saveAlert}
            params = { params } initKeys={initKeys}
            cancelAlert={this.cancelAlert} stringIds={ stringIds }></Alerts>
        </Modal>

        <ModalConfirm props={deleteInfo}/>
      </div>
    )
  }

  async componentDidMount (){
    const {
      form: { setFieldsValue }
    } = this.props
    const urlSearch = analysisUrl(this.props.location.search)
    //如果传入有资产
    if (urlSearch && urlSearch.stringId) {
      this.setState({ stringId: urlSearch.stringId })
      await this.props.dispatch({ type: 'asset/getGroupQueryId', payload: {
        primaryKey: urlSearch.stringId
      } })
      this.initValue({ assetGroup: urlSearch.stringId, all: true })
      let forminfo = {}
      forminfo.assetGroupName = this.props.getGroupQueryId.name || null
      forminfo.remark = this.props.getGroupQueryId.memo || null
      await setFieldsValue(forminfo)
    }
    //以下都是测试要求的返回显示逻辑,要求所有数据都在
    // if (this.props.from === 'register') {
    //   this.setState({ alertShow: true }, () => {
    //     dispatch({ type: 'asset/saveOperateStatus', payload: { from: '' } })
    //   })
    // }else if (urlSearch && urlSearch.stringId) {
    //   this.initValue({ assetGroup: urlSearch.stringId, all: true })
    // }
    // if(allList){
    //   this.setState({ list: allList })
    // }
    // if(assetGroupName){
    //   this.props.form.setFieldsValue({
    //     assetGroupName: assetGroupName
    //   })
    // }
    // if(remark){
    //   setFieldsValue({
    //     remark: remark
    //   })
    // }
    // dispatch({
    //   type: 'asset/saveRegisterInfo',
    //   payload: {
    //     allList: { items: [], total: 0 },
    //     assetGroupName: '',
    //     remark: ''
    //   }
    // })
  }
}

export default connect(({ asset }) => ({
  from: asset.from,
  // allList: asset.allList,
  assetGroupName: asset.assetGroupName,
  remark: asset.remark,
  getGroupQueryId: asset.getGroupQueryId
}))(AssetGroupRegister)

