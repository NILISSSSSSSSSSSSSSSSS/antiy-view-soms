import { Component, Fragment } from 'react'
import { connect } from 'dva'
import { Form, InputNumber, Message, Modal, Radio } from 'antd'
import { download } from '@/utils/common'
import { exportValuePattern } from '@/utils/regExp'
const { Item } = Form
const RadioGroup = Radio.Group

class Export extends Component {
  constructor (props) {
    super(props)
    this.state = {
      valueList: [],
      value: null
    }
  }
  componentDidMount () {
    this.setValueList()
  }

  render () {
    const { valueList, value } = this.state
    const { getFieldDecorator } = this.props.form
    const { total, exportVisible, threshold } = this.props.exportModal
    const formItemLayout = {
      labelCol: {
        span: 4
      }
    }
    const title = total <= threshold ? null : '导出'
    return (
      <div>
        <Modal
          className="export-modal"
          title={title}
          width={total <= threshold ? 400 : 600}
          visible={exportVisible}
          onCancel={this.onCancel}
          onOk={this.onOk}>
          {
            total <= threshold ? <p className="model-text">请确认是否导出当前数据？</p> :
              <div className="form-content">
                <Form className="filter-form export-form" layout="inline">
                  <Item {...formItemLayout} label="导出数量">
                    {getFieldDecorator('number', {
                      rules: [
                        { required: true, message: '请选择区间值' }
                      ]
                    })(
                      <RadioGroup onChange={this.selectChange} className="export-radio">
                        {
                          valueList.map(item => {
                            return <Radio key={item} value={item}>{item}</Radio>
                          })
                        }
                        <Radio value="-1">自定义</Radio>
                      </RadioGroup>
                    )}
                  </Item>
                  <br />
                  {
                    value === '-1' && <Fragment>
                      <Item {...formItemLayout} label="自定义">
                        {getFieldDecorator('start', {
                          rules: [
                            { required: true, message: '请输入开始值' },
                            { pattern: exportValuePattern, message: '请输入正整数' },
                            { validator: (rule, value, callback) => this.validator(rule, value, callback, total) }
                          ]
                        })(
                          <InputNumber min={1} onChange={this.inputChange} />
                        )}
                        <span className="export-modal-split">-</span>
                      </Item>
                      <Item {...formItemLayout}>
                        {getFieldDecorator('end', {
                          rules: [
                            { required: true, message: '请输入结束值' },
                            { pattern: exportValuePattern, message: '请输入正整数' },
                            { validator: (rule, value, callback) => this.validator(rule, value, callback, total) }
                          ]
                        })(
                          <InputNumber min={1} onChange={this.inputChange} />
                        )}
                        （最多50000条）
                      </Item>
                      <Item>
                        <p style={{ marginLeft: 100 }}>导出数量过多可能会导致等待时间较长甚至系统无响应！</p>
                      </Item>
                    </Fragment>
                  }
                </Form>
              </div>
          }
        </Modal>
      </div>
    )
  }

  //起始值校验
  validator = (rule, value, callback, total) => {
    if (value > total) {
      callback('不能大于分段的最大值')
    } else {
      callback()
    }
  }

  //提交
  onOk = () => {
    const { searchValues, url, total, threshold } = this.props.exportModal
    //阈值5000直接导出
    if (total <= threshold) {
      download(url, searchValues)
      Message.success('系统正在导出，请等待', 5)
      this.onCancel()
      return false
    }
    this.props.form.validateFields((err, values) => {
      if (!err) {
        if (!this.checkData(values)) {
          return false
        }
        delete values.number
        values = { ...values, ...searchValues }
        download(url, values)
        Message.success('系统正在导出，请等待', 5)
        this.onCancel()
      }
    })
  }

  //导出校验
  checkData = (values) => {
    const { start, end } = values
    if (values.number === '-1') {
      if (start > end) {
        Message.info('结束值必须大于或等于开始值')
        return false
      }
      if (end - start > 49999) {
        Message.info('导出数量不能超过50000条')
        return false
      }
    } else {
      const [start, end] = values.number.split('-')
      values.start = start - 0
      values.end = end - 0
    }
    return true
  }

  //设置分段区间值
  setValueList = () => {
    const { total, threshold } = this.props.exportModal
    let valueList = [], start = 0, end = 0
    while (end < total) {
      start = end + 1
      end += threshold
      end = end >= total ? total : end
      valueList.push(`${start}-${end}`)
    }
    this.setState({
      valueList
    })
  }

  selectChange = (e) => {
    this.setState({
      value: e.target.value
    })
  }

  //取消
  onCancel = () => {
    this.setState({ value: null })
    this.props.form.resetFields()
    this.props.handleCancelExport()
  }
}

const ExportForm = Form.create()(Export)
export default connect()(ExportForm)
