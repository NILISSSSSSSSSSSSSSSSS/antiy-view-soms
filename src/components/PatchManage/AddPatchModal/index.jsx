import { Component } from 'react'
import { Form, Modal, Button, Select, Spin } from 'antd'
import debounce from 'lodash/debounce'
import api from '@/services/api'

const { Option } = Select
const { Item } = Form
const formItemLayout = {
  labelCol: {
    span: 7
  },
  wrapperCol: {
    span: 12
  }
}

@Form.create()
class AddPatchModal extends Component {
  constructor (props) {
    super(props)
    this.lastFetchId = 0
    this.fetchUser = debounce(this.fetchUser, 500)
    this.state = {
      data: [],
      value: [],
      fetching: false
    }
  }
  componentDidMount () {

  }

  render () {
    const { visible, title } = this.props
    const { getFieldDecorator } = this.props.form
    const { fetching, data } = this.state
    return (
      <Modal
        className="over-scroll-modal"
        title={title}
        width={650}
        visible={visible}
        maskClosable={false}
        footer={null}
        onCancel={this.handleCancel}>
        <div className="content-wrap">
          <Form>
            <div className="form-wrap">
              <Item {...formItemLayout} label="补丁编号">
                {
                  getFieldDecorator('e', {
                    rules: [{ required: true, message: '请输入补丁编号！' }]
                  })(
                    <Select
                      allowClear
                      placeholder="请输入"
                      mode="multiple"
                      labelInValue
                      notFoundContent={fetching ? <Spin size="small" /> : '暂无数据'}
                      filterOption={false}
                      onSearch={this.fetchUser}
                      onChange={this.handleChange}
                      style={{ width: '100%' }}
                    >
                      {data.map(d => (
                        <Option key={d.value}>{d.text}</Option>
                      ))}
                    </Select>
                  )
                }
              </Item>
              <div className="button-center">
                <div>
                  <Button type="primary" onClick={this.handleSubmit}>提交</Button>
                  <Button type="primary" ghost onClick={this.handleCancel}>取消</Button>
                </div>
              </div>
            </div>
          </Form>
        </div>
      </Modal>
    )
  }

  //提交
  handleSubmit = () => {
    this.props.form.validateFields((err, values) => {
      if (!err) {
        const { onSubmit, form } = this.props
        onSubmit(values.e.map(item => item.key), () => {
          form.resetFields()
        })
      }
    })
  }

  //取消
  handleCancel = () => {
    const { onCancel, form } = this.props
    form.resetFields()
    onCancel()
  }

  //模糊查询
  fetchUser = value => {
    this.lastFetchId += 1
    const fetchId = this.lastFetchId
    this.setState({ data: [], fetching: true })
    const { data } = this.props
    let param = {
      pageSize: 50,
      currentPage: 1,
      currentPatchNumber: data,
      prePatchNumber: value
    }

    api.deletePatchFilter(param).then(response => {
      if (fetchId !== this.lastFetchId) {
        return
      }
      if (response.body && response.body.items) {
        const datas = response.body.items.map(item => {
          return {
            text: item.patchNumber,
            value: item.antiyPatchNumber
          }
        })
        this.setState({ data: datas, fetching: false })
      }

    })
  };

  handleChange = value => {
    this.setState({
      value,
      data: [],
      fetching: false
    })
  }
}

export default AddPatchModal