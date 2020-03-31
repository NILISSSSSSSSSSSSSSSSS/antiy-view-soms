import { Component } from 'react'
import { connect } from 'dva'
import { Row, Col, Input, Form, Modal, Button, Radio, message } from 'antd'

import api from '@/services/api'
const { Item } = Form
const { Group }  =  Radio
const FormLayout = {
  labelCol: {
    span: 9
  },
  wrapperCol: {
    span: 15
  }
}
class  SaveModal extends Component {
  constructor (props){
    super(props)
    this.state = {
      show: false
    }
  }
  componentDidMount (){
    this.props.childrens(this)
  }
  showModal = (parm, values, id, detailData) => {
    if(parm === 'save'){
      this.setState({ show: true })
      this.setState({ parm, parmValues: values })
    }else if(parm === 'edit' && id.historySearch){
      this.setState({ show: true })
      this.setState({ parm, parmValues: values, id: id.historySearch, detailData })
    }else{
      message.warn('请选择一条模板修改！')
    }

  }
  Submit = (e) => {
    e.preventDefault()
    let { parm, parmValues, id } = this.state
    parmValues.noPatchCountType = parmValues.noPatchCounts && parmValues.noPatchCounts[0]
    parmValues.noPatchCount = parmValues.noPatchCounts && parmValues.noPatchCounts[1]
    parmValues.noVulCountType = parmValues.noVulCounts && parmValues.noVulCounts[0]
    parmValues.noVulCount = parmValues.noVulCounts && parmValues.noVulCounts[1]
    parmValues.patchCountType = parmValues.patchCounts && parmValues.patchCounts[0]
    parmValues.patchCount = parmValues.patchCounts && parmValues.patchCounts[1]
    parmValues.vulCountType = parmValues.vulCounts && parmValues.vulCounts[0]
    parmValues.vulCount = parmValues.vulCounts && parmValues.vulCounts[1]
    delete parmValues.vulCounts
    delete parmValues.patchCounts
    delete parmValues.noVulCounts
    delete parmValues.noPatchCounts
    this.props.form.validateFields( (err, values) => {
      if(!err){
        if(parm === 'save' ){
          api.saveAssetCompositionReport({ query: parmValues, ...values }).then( res => {
            this.props.getHistoryData()
            message.success('保存成功')
            if(values.identification !== 1){
              this.props.searchOnReset()
            }
          })
        }else{
          api.editAssetCompositionReport({ ...parmValues, ...values, id }).then( res => {
            this.props.getHistoryData()
            message.success('修改成功')
          })
        }
        this.setState({ show: false })
        this.props.form.resetFields()
      }
    })

  }
  // 关闭弹窗
  handleCancel = () => {
    this.props.form.resetFields()
    this.setState({ show: false })
  }
  render (){
    const { show, parm, detailData } = this.state
    const { getFieldDecorator } = this.props.form
    return(
      <div>
        <Modal
          className='over-scroll-modal'
          title={`${parm === 'save' ? '新建' : '修改'}条件`}
          visible={show}
          width={600}
          onCancel={this.handleCancel}
          footer={null}
        >
          <Form style={{ paddingLeft: 30 }} className="form-single" layout="horizontal" onSubmit={this.Submit} >
            <div className='form-content'>
              <Row>
                <Col span={24}>
                  <Item {...FormLayout} label="模板名称">
                    {
                      getFieldDecorator('name', { initialValue: detailData && detailData.name, rules: [{ required: true, message: '请输入！' } ] })(
                        <Input autoComplete="off" />
                      )
                    }
                  </Item>
                </Col>
              </Row>
              <Row>
                <Col span={24}>
                  <Item {...FormLayout} label="默认设置">
                    {
                      getFieldDecorator('identification', { initialValue: detailData && detailData.identification === 1 ? 1 : 0, rules: [{ required: true, message: '请选择！' } ] })(
                        <Group>
                          <Radio value={1} key={1}>是</Radio>
                          <Radio value={0} key={0}>否</Radio>
                        </Group>
                      )
                    }
                  </Item>
                </Col>
              </Row>
            </div>
            <div className="Button-center">
              <div>
                <Button type="primary" htmlType='submit'>确定</Button>
                <Button type="primary" ghost onClick={this.handleCancel}> 取消 </Button>
              </div>
            </div>
          </Form>
        </Modal>
      </div>
    )
  }
}
const mapStateToProps = ({ Logs }) => {
  return {
  }
}
const SaveModals = Form.create()(SaveModal)
export default connect(mapStateToProps)(SaveModals)