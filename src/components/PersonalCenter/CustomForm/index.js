import { Component } from 'react'
import {  Form, Button, Row, Col, Input } from 'antd'

import './style.less'
const FormItem = Form.Item

class CustomForm extends Component {
  constructor (props) {
    super(props)
    this.state = {}
  }
  formItemLayout = {
    labelCol: {
      span: 4
    },
    wrapperCol: {
      span: 20
    }
  }
  // 清空所有输入框的值
  clearInput = () => {
    this.props.form.resetFields()
  }
  onSubmit = (e) => {
    const { onSubmit } = this.props
    e.preventDefault()
    this.props.form.validateFields((err, values) => {
      if (!err) {
        onSubmit && onSubmit(values)
      }
    })
  }
  render (){
    const { columns, form: { getFieldDecorator } } = this.props
    return(
      <div>
        <Form layout="horizontal" onSubmit={this.onSubmit}>
          {columns.map((el)=>{
            if(el.type === 'text'){
              return <FormItem { ...this.formItemLayout} label={el.label} key={ el.name }>
                {
                  getFieldDecorator(el.name, {
                    initialValue: el.value,
                    rules: el.rules || []
                  })(<Input autoComplete="off" type="text" style={ el.style } className="" placeholder={ el.placeholder }/>)
                }
              </FormItem>
            }else if(el.type === 'btn'){
              return(
                <Row key={el.name}>
                  <Col {...this.formItemLayout.labelCol}></Col>
                  <Col {...this.formItemLayout.wrapperCol}>
                    <div className="Button-center personalPwdChange-btns">
                      <Button type="primary" htmlType="submit" className="submit">保存</Button>
                    </div>
                  </Col>
                </Row>
              )
            }else {
              return null
            }
          })}
        </Form>

      </div>
    )
  }
}

export default Form.create()(CustomForm)
