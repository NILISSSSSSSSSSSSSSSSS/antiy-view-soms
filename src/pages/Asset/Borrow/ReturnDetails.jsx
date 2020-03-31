import { PureComponent, Fragment } from 'react'
import { Row, Col, DatePicker, Form } from 'antd'
import { debounce } from 'lodash'
import PropTypes from 'prop-types'
import moment from 'moment'
import { disabledDateTime } from '@/utils/common'

const FormItem = Form.Item
@Form.create()
class AssetReturnDetails extends PureComponent{
  state = {
    PrefixCls: 'AssetReturnDetails',
    initStatus: {},
    date: null
  }

  static defaultProps ={

  }

  static propTypes={
    alertItem: PropTypes.object
  }

  getData=()=>{
    let date = null
    this.props.form.validateFields((err, values = {}) => {
      if(err) return void(0)
      date = moment(values.time).valueOf()
    })
    return date
  }

  //**接口开始 副作用 */
  getBusinessList=debounce(iscache=>{

  }, 300)

  render (){
    const { PrefixCls, initStatus } = this.state
    const { form: { getFieldDecorator } } = this.props

    const colStyle = {
      span: 4,
      offset: 2
    }

    return(
      <div className="oaDetail">
        <Row>
          <Col {...colStyle}><span className='detail-content-label'>借用人:</span></Col>
          <Col span={18}>{initStatus.name}</Col>
        </Row>
        <Row>
          <Col {...colStyle}><span className='detail-content-label'>是否有审批表:</span></Col>
          <Col span={18}>{initStatus.departmentName}</Col>
        </Row>
        <Row>
          <Col {...colStyle}><span className='detail-content-label'>状态:</span></Col>
          <Col span={18}>{initStatus.email}</Col>
        </Row>
        <Row>
          <Col {...colStyle}><span className='detail-content-label'>借出日期:</span></Col>
          <Col span={18}>{initStatus.qq}</Col>
        </Row>
        <Row>
          <Col {...colStyle}><span className='detail-content-label'>借用时间:</span></Col>
          <Col span={18}>{initStatus.weixin}</Col>
        </Row>
        <Row>
          <Col {...colStyle}><span className='detail-content-label'>借用目的:</span></Col>
          <Col span={18}>{initStatus.mobile}</Col>
        </Row>
        <Row>
          <Col offset={1} span= {1}> </Col>
          <Form layout="inline">
            <FormItem label="归还时间" className='item-date-container item-separation'>
              {getFieldDecorator('time', {
                rules: [
                  { required: true, message: '请选择！' }
                ]
              })(
                <DatePicker placeholder='请选择！' disabledDate={(current)=>current && current < moment().endOf('day')}/>
              )}
            </FormItem>
          </Form>
        </Row>
      </div>
    )
  }

  componentDidMount (){
    //   this.props.alertItem
    this.props.children(this)
  }

}

export default AssetReturnDetails

