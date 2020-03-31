import { PureComponent, Fragment } from 'react'
import { transliteration } from '@/utils/common'
import { Select, Form, Input, DatePicker, Switch, Button, Modal } from 'antd'
import { debounce } from 'lodash'
import DetailFiedls from '@c/common/DetailFiedls'
import { BORROW_STATUS } from '@a/js/enume'
import moment from 'moment'
import BorrowAlert from './BorrowAlert'
import api from '@/services/api'

const FormItem = Form.Item
const { TextArea } = Input
const { Option } = Select

@Form.create()
class AssetOaHandle extends PureComponent{
  state = {
    PrefixCls: 'AssetOaHandle',
    lendVal: null,
    assetData: {},
    applicantData: {},
    approvalData: {},
    isApproval: false,
    visible: false
  }

  //返回上级
  callBack = ()=>{
    this.props.history.push('/asset/borrow')
  }

  goApproval=(e)=>{
    // window.open(`/#//asset/manage/detail?number=${transliteration(e)}`)

  }

  //借出人
  changeLend=lendVal=>{
    this.setState({ lendVal })
    // api.getBusinessList({ lendVal }).then(res => {
    //   if (res && res.head && res.head.code === '200') {
    //     this.setState({ approvalData: res.body })
    //   }
    // })
  }

  changeApproval=isApproval=>{
    this.setState({ isApproval })
  }

  //关联审批表
  openAlert=(visible = true)=>{
    this.setState({ visible })
  }

  //确定审批表
  handleOk=()=>{
    console.log(this.BorrowAlert.getData())
    this.openAlert(false)
  }

  onSubmit=debounce(()=>{
    this.props.form.validateFields((err, values) => {
      if (err) return void(0)
      console.log(values)
    })
  }, 300)

  //**接口开始 副作用 */
  getBusinessList=debounce(iscache=>{

  }, 300)

  render (){
    const { PrefixCls, assetData, applicantData, approvalData, isApproval, visible } = this.state
    const { form: { getFieldDecorator } } = this.props

    const assetFields = [
      { key: 'name', name: '资产名称' },
      { key: 'key', name: 'key' },
      { key: 'operationSystemName', name: '资产类型' },
      { key: 'number', name: '资产编号' }
    ]

    const applicantFields = [
      { key: 'name', name: '借出人' },
      { key: 'operationSystemName', name: '手机号' },
      { key: 'number', name: '所属组织' },
      { key: 'key', name: 'key' }
    ]

    const approvalFields = [
      { key: 'name', name: '审批单号', render: e=><a onClick={()=>this.goApproval(e)}>{e}</a> },
      { key: 'operationSystemName', name: '申请资产信息' },
      { key: 'number', name: '申请人' },
      { key: 'key', name: '所属单位' }
    ]
    const formItemLayout = {
      labelCol: {
        span: 5
      },
      wrapperCol: {
        span: 18
      }
    }

    return(
      <Fragment>
        <p className="detail-title">资产信息：</p>
        <div className="detail-content asset-group-detail-content">
          <DetailFiedls fields={assetFields} data={assetData} />
        </div>
        <p className="detail-title">申请人：</p>
        <div className="detail-content asset-group-detail-content" style={{ color: '#98ACD9' }}>
          选择借出人：
          <Select style={{ width: 120 }} onChange={this.changeLend} placeholder="请选择">
            <Option key='1' value={1}>人员1</Option>
            <Option key='2' value={2}>人员2</Option>
          </Select>
          <DetailFiedls fields={applicantFields} data={applicantData} />
        </div>

        <p className="detail-title">审批信息：</p>
        <div className="detail-content asset-group-detail-content" style={{ color: '#98ACD9' }}>
          是否有审批表：
          <Switch onChange={this.changeApproval} />
          {isApproval && <Button onClick={this.openAlert} style={{ marginLeft: 20 }}>关联审批表</Button>}
          <DetailFiedls fields={approvalFields} data={approvalData} />
        </div>
        <p className="detail-title">出借信息：</p>
        <Form layout="horizontal">

          <FormItem {...formItemLayout} label={'出借状态'}>
            {getFieldDecorator('operator', {
            })(
              <Select showSearch
                allowClear
                getPopupContainer={triggerNode => triggerNode.parentNode}
                placeholder="请选择"
                optionFilterProp="children">
                {BORROW_STATUS.map(
                  (now, index)=>(<Option value = {now.value} key={now.value}>{now.name}</Option>))
                }
              </Select>
            ) }
          </FormItem>

          <FormItem {...formItemLayout} label={'出借日期'}>
            {getFieldDecorator('operator2', {
            })(
              <DatePicker placeholder='请选择！' disabledDate={(current)=>current && current < moment().endOf('day')}/>
            ) }
          </FormItem>

          <FormItem {...formItemLayout} label={'归还时间'}>
            {getFieldDecorator('operator3', {
            })(
              <DatePicker placeholder='请选择！' disabledDate={(current)=>current && current < moment().endOf('day')}/>
            ) }
          </FormItem>

          <FormItem {...formItemLayout} label={'出借目的'}>
            {getFieldDecorator('note', {
              rules: [
                { message: '最多300个字符！', max: 300 }
              ]
            })(
              <TextArea rows={6} placeholder="请输入" style={{ resize: 'none' }} />
            )}
          </FormItem>
        </Form>

        <footer className="Button-center">
          <div>
            <Button type="primary" onClick={this.onSubmit}>提交</Button>
            <Button type="primary" className="back-btn" ghost onClick={this.callBack }>取消</Button>
          </div>
        </footer>
        <Modal  title="选择审批单"
          destroyOnClose
          width={800}
          className='over-scroll-modal'
          onCancel={()=>this.openAlert(false)}
          onOk={this.handleOk}
          visible = {visible}>
          <BorrowAlert children = {(now)=>this.BorrowAlert = now}/>
        </Modal>
      </Fragment>
    )
  }

  componentDidMount (){
  }

}

export default AssetOaHandle

