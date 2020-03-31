import { Component } from 'react'
import { Table,  Row, Col, Form, Input, Button, Modal, message, Select } from 'antd'
import './style.less'
import Alerts from './assetAlert'
import api from '@/services/api'
import { analysisUrl, TooltipFn } from '@/utils/common'
import ModalConfirm from '@/components/common/ModalConfirm'
import { TableBtns } from '@c/index'
import Search from '@/components/common/Search'
import { cloneDeep, debounce } from 'lodash'

const FormItem = Form.Item
const { Option }  =  Select

@Form.create()
class AssetBusinessRegister extends Component{
  state = {
    PrefixCls: 'AssetBusinessRegister',
    alertShow: false,
    showAlert: false, //弹窗状态
    isSelect: null, //是否选择试删除
    alertItem: '', //弹窗带的资产
    list: { items: [], total: 0 },
    selectedRowKeys: [],   //勾选数据编号
    recordArray: [], //变更用
    initKeys: [],  //勾选传递到下个组件数据编号
    uniqueId: analysisUrl(this.props.location.search).uniqueId
  }

  onSubmitSearch=values=>{
    console.log(values.mul)
    // cloneDeep(this.slist)
  }

  onReset=()=>{

  }

  busChange=(record, val)=>{
    let { list } = this.state
    list.items.forEach(item=>{if(item.stringId === record.stringId) item.businessInfluence = val })
    this.setState({ list })
  }

  //初始化init
  initValue = (params)=>{
    api.getBusinessInfo(params).then(res=>{
      if(res && res.head && res.head.code === '200'){
        const formInfo = {
          name: res.body.name,
          importance: res.body.importance,
          description: res.body.description
        }
        this.props.form.setFieldsValue(formInfo)
      }
    })
    api.businessAndAsset(params).then(res=>{
      if(res && res.head && res.head.code === '200'){
        this.setState({
          list: {
            items: res.body || [],
            total: res.body.length
          }
        })
      }
    })
  }

  //返回上级
  callBack = ()=>{
    this.props.history.push('/asset/business')
  }

  //保存弹窗所选信息
  saveAlert =(value)=>{
    let { list } = this.state
    let hash = []
    list.items = list.items.concat(value)
    list.items.forEach((item, i) => {
      if(!(hash.some((now)=>now.stringId === item.stringId)))
        hash.unshift(item)
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
    const {
      list,
      recordArray,
      selectedRowKeys
    } = this.state
    const ListNew = {}
    ListNew.items = list.items.filter(v=>!selectedRowKeys.includes(v.stringId))
    ListNew.total = ListNew.items.length
    this.setState({
      selectedRowKeys: [],
      list: ListNew,
      recordArray
    })
  }

  //删除勾选的弹窗
  delAllSelect = () => {
    if(!this.state.selectedRowKeys.length){
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
  onSubmit = debounce((e) => {
    e.preventDefault()
    this.props.form.validateFields((err, values) => {
      if (err) return void(0)

      const { list } = this.state
      values.assetRelaList = list.items.length ? list.items.map(now=>({ assetId: now.stringId, businessInfluence: now.businessInfluence })) : []
      if(this.state.uniqueId) {
        values.uniqueId = this.state.uniqueId
        api.updateBusinessSingle(values).then(res => {
          this.onSubmitCb(res)('变更')
        })
      } else {
        //需要根据返回值进行相应的操作
        api.saveBusinessSingle(values).then(res => {
          this.onSubmitCb(res)('登记')
        })
      }

    })
  }, 300)

  render (){
    let { list, alertShow, initKeys, selectedRowKeys, stringIds, PrefixCls, showAlert } = this.state
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
    }, {
      title: '厂商',
      dataIndex: 'manufacturer',
      key: 'manufacturer',
      isShow: true,
      width: '10%',
      render: text=>TooltipFn(text)
    },
    {
      title: '资产组',
      dataIndex: 'assetGroup',
      key: 'assetGroup',
      isShow: true,
      width: '10%',
      render: text=>TooltipFn(text)
    }, {
      title: '业务影响',
      dataIndex: 'businessInfluence',
      key: 'businessInfluence',
      width: 168,
      isShow: true,
      render: (text, record)=>{
        return(
          <Select style={{ width: 80 }} defaultValue={text} onChange={(val)=>this.busChange(record, val)} placeholder='请选择'>
            <Option value={1}>高</Option>
            <Option value={2}>中</Option>
            <Option value={3}>低</Option>
          </Select>
        )
      }
    }, {
      title: '操作',
      isShow: true,
      width: '14%',
      key: 'operate',
      render: (text, record)=>{
        return (
          <Row style={{ textAlign: 'center' }}>
            <Col span={12}>
              <a onClick={ () => this.onDelete(record)}>
                <span className='alertColor'>删除</span>
              </a>
            </Col>
          </Row>)
      }
    }]

    const defaultFields = [
      { label: '综合查询', key: 'mul', type: 'input', placeholder: '请输入资产名称/编号/IP/MAC' }
    ]

    const deleteInfo = {
      visible: showAlert,
      onOk: this.deleteOnOk,
      onCancel: ()=>this.setState({ showAlert: false }),
      children: (<p className="model-text">是否删除选中数据？</p>)
    }

    const rowSelection = {
      selectedRowKeys,
      onChange: (selectedRowKeys, selectedRows) => {
        this.setState({
          selectedRowKeys
        })
      },
      getCheckboxProps: record => ({
        disabled: record.name === 'Disabled User', // Column configuration not to be checked
        name: record.name
      })
    }

    const leftBtns = [
      { label: '查找资产', onClick: this.findAsset }
    ]

    const rightBtns = [
      { label: '删除', onClick: this.delAllSelect }
    ]

    return(
      <div className={`${PrefixCls}`}>
        <article className="group-register">
          <Row>
            <Col span={24}>
              <Form layout="horizontal">
                <div className="detail-content">
                  <FormItem {...formItemLayout} label='业务名称'>
                    {getFieldDecorator('name', {
                      rules: [
                        { required: true, message: '请输入' },
                        { message: '最多50个字符！', max: 50 }
                      ]
                    })(
                      <Input autoComplete='off' placeholder="请输入" style={{ width: 200 }} />
                    ) }
                  </FormItem>
                  <FormItem {...formItemLayout} label="业务重要性">
                    {getFieldDecorator('importance', {
                      rules: [
                        { required: true, message: '请选择' }
                      ]
                    })(
                      <Select allowClear={true} placeholder="请选择" >
                        {
                          ['高', '中', '低'].map((item, index)=>{
                            return(<Option value={index + 1} key={index}>{item}</Option>)
                          })
                        }
                      </Select>
                    )}
                  </FormItem>
                  <FormItem {...formItemLayout} label="描述">
                    {getFieldDecorator('description', {
                      rules: [
                        { required: true, message: '请选择' },
                        { message: '最多50个字符！', max: 50 }
                      ]
                    })(
                      <Input.TextArea rows={4} placeholder="请输入..." style={{ resize: 'none' }} />
                    )}
                  </FormItem>
                </div>
              </Form>
              <div className="search-bar">
                <Search defaultFields={ defaultFields } onSubmit={ this.onSubmitSearch } onReset={ this.onReset }/>
              </div>
              <div className="table-wrap">
                <TableBtns leftBtns={leftBtns} rightBtns={rightBtns} />
                <Table
                  rowKey="stringId"
                  rowSelection={rowSelection}
                  columns={columns}
                  dataSource={list.items}
                  pagination={{
                    className: 'table-pagination',
                    showQuickJumper: true,
                    showSizeChanger: true,
                    pageSizeOptions: ['10', '20', '30', '40'],
                    // onShowSizeChange: this.pageChange,
                    showTotal: () => `共 ${list.total} 条数据`,
                    // current: currentPage,
                    // pageSize: pageSize,
                    total: list.total
                    // onChange: this.pageChange
                  }}
                />
              </div>
              <footer className="Button-center">
                <div>
                  <Button type="primary" onClick={this.onSubmit}>提交</Button>
                  <Button type="primary" className="back-btn" ghost onClick={this.callBack }>取消</Button>
                </div>
              </footer>
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
            initKeys={initKeys}
            cancelAlert={this.cancelAlert} stringIds={ stringIds }></Alerts>
        </Modal>

        <ModalConfirm props={deleteInfo}/>
      </div>
    )
  }

  async componentDidMount (){
    const { uniqueId } = this.state
    //如果传入有资产
    if(!uniqueId) return void(0)
    this.initValue({ uniqueId: uniqueId })
  }
}

export default AssetBusinessRegister

