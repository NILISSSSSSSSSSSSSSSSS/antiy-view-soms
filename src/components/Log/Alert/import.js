
import { Component } from 'react'
import { Modal, Form, Row, Input, Button, message } from 'antd'
import { download } from '@/utils/common'

class logAlertImport extends Component{
  constructor (props){
    super(props)
    this.state = {
      url: this.props.url,
      showNumber: false,
      params: this.props.params
    }
  }

  componentDidMount (){
    this.props.imports(this)
  }
  render (){
    let { showNumber } = this.state
    let { getFieldDecorator } = this.props.form
    return(
      <div>
        <Modal title='自定义导出数目' visible={showNumber}
          onOK={(e)=>this.postData(e)}
          onCancel={this.handleCancel} width={400}
          footer={[
            <Button key="back" onClick={this.handleCancel}>取消</Button>,
            <Button key="submit" type="primary"  onClick={(e)=>{ this.postData(e) }}>
              确定
            </Button>
          ]}>
          <Form className="filter-form" layout="inline" onSubmit={this.postData}>
            <Row>
              <Form.Item label="起始条数">
                {
                  getFieldDecorator('exportBegin', {
                    rules: [{ required: true, message: '请输入起始条数!' },
                      { pattern: /^\d+$/g, message: '只能输入数字！' }]
                  })(
                    <Input autoComplete="off"  placeholder="请输入开始条数" />
                  )
                }
              </Form.Item>
              <Form.Item label="结束条数">
                {
                  getFieldDecorator('exportEnd',  {
                    rules: [{ required: true, message: '请输入结束条数!' },
                      { pattern: /^\d+$/g, message: '只能输入数字！' }]
                  })(
                    <Input autoComplete="off"  placeholder="请输入结束条数" />
                  )
                }
              </Form.Item>
            </Row>
          </Form>
        </Modal>
      </div>
    )
  }
  //取消
  handleCancel= ()=>{
    this.setState({ showNumber: false })
  }
  //show
  show=()=>{
    this.setState({ showNumber: true })
  }
  //下载数据
  postData=(e)=>{
    e.preventDefault()
    this.props.form.validateFields((err, { exportBegin, exportEnd }) => {
      if(!err){
        let { url, params } = this.state
        let init = (Number(exportEnd) - Number(exportBegin))
        if(init <= 5000 && init > 0 ){
          params.exportBegin = exportBegin
          params.exportEnd = exportEnd
          download(url, params)
          this.setState({ showNumber: false })
        }else{
          message.info('自定义导出数目不能大于5000条且不能小于1!')
        }
      }
    })
  }
}
const logAlertImports = Form.create()(logAlertImport)
export default logAlertImports