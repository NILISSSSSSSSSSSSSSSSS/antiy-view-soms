import { Component } from 'react'
import { Row, Col, Button, Form, Input, Select, message } from 'antd'
import api from '@/services/api'
import { analysisUrl } from '@/utils/common'
import moment from 'moment'
import * as regExp from '@/utils/regExp'
import { debounce } from 'lodash'
import DetailFiedls from '@/components/common/DetailFiedls'

import './style.less'
const { Item } = Form
const { Option } = Select

class CommonDetail extends Component {
  constructor (props) {
    super(props)
    this.state = {
      body: {},
      softVersion: [],
      featureLibrary: []
    }
    this.urlParams = analysisUrl(this.props.location.search) || {}
    this.assetInfoList = [
      { name: '资产名称', key: 'name' },
      { name: '资产编号', key: 'number' },
      { name: 'IP地址', key: 'ip', showTips: false },
      { name: 'MAC地址', key: 'mac', showTips: false },
      {
        name: '发布时间', key: 'firstEnterNett', showTips: false,
        render: (timestamp) => {
          const text = timestamp <= 0 ? '' : moment(timestamp).format('YYYY-MM-DD HH:mm:ss')
          return text
        }
      },
      { name: '网络连接', key: 'networkState', showTips: false },
      { name: '区域', key: 'area' },
      { name: '机房位置', key: 'houseLocation' },
      { name: '描述', key: 'memo' }
    ]
    this.baseInfoList = [
      { key: 'manufacturer', label: '厂商', name: '厂商' },
      { key: 'name', label: '名称', name: '名称' },
      { key: 'version', label: '版本', name: '版本号' }
    ]
    this.Submit = debounce(this.Submit, 800)
  }
  componentDidMount () {
    //根据页面获取详情数据
    api.equipmentQueryById({ primaryKey: this.urlParams.assetId }).then(response => {
      if (response && response.head && response.head.code === '200') {
        this.setState({
          body: response.body || {}
        })
        this.getSoftVersion({ businessIds: [(response.body || {}).businessId] })
        this.getFeatureLibrary({ businessIds: [(response.body || {}).businessId] })
      }
    })

  }
  goBack = () => {
    this.props.history.goBack()
  }
  //提交
  Submit = (e) => {
    this.props.form.validateFields((err, values) => {
      if (!err) {
        const { type, assetId, stringId, manage } = this.urlParams
        if (type === 'change') {
          values.assetId = assetId
          values.isManage = values.isManage === 'true' ? 'false' : 'true'
          api.equipmentChange(values).then(response => {
            if (response && response.head && response.head.code === '200') {
              message.success('变更成功')
              this.goBack()
            }
          })
        } else {
          values = { assetId: assetId, stringId: stringId, isManage: manage, ...values }
          values.isManage = values.isManage === 'true' ? 'false' : 'true'
          api.equipmentDeleteAddById(values).then(response => {
            if (response && response.head && response.head.code === '200') {
              message.success('纳入成功')
              this.goBack()
            }
          })
        }
      }
    })
  }
  /**
   * 获取软件版本列表
   */
  getSoftVersion = (params) => {
    api.safetySoftVersion(params).then((res) => {
      if (res.head && res.head.code === '200') {
        this.setState({ softVersion: res.body })
      }
    })
  }
  /**
   * 获取特征库列表
   */
  getFeatureLibrary = (params) => {
    api.sefetyFeatureLibrary({ equipmentIn: true, ...params }).then((res) => {
      if (res.head && res.head.code === '200') {
        this.setState({ featureLibrary: res.body })
      }
    })
  }
  render () {
    const { getFieldDecorator } = this.props.form
    const { body, softVersion, featureLibrary } = this.state
    const { type } = this.urlParams
    // const formItemLayout = { labelCol: { span: 10 }, wrapperCol: { span: 14 } }
    const formItemLayout = {}
    const _featureLibrary = [{ label: '请选择', value: '' }].concat(featureLibrary.map((e) => ({ label: e, value: e })))
    const _softVersion = [{ label: '请选择', value: '' }].concat(softVersion.map((e) => ({ label: e, value: e })))
    // rules: [{ message: '最多300个字符！', max: 300 }]
    return (
      <div className="safe-change">
        <div className="safe-change-content">
          <Form className="change-from" labelCol={{ span: 12 }} wrapperCol={{ span: 12 }} onSubmit={(e) => {e.preventDefault(), this.Submit()}}>
            <div className="main-detail-content">
              <p className="detail-title">业务信息</p>
              <div className="detail-content detail-business">
                <Row>
                  <Col span={12}>
                    <Item label='软件版本' {...formItemLayout}>
                      {
                        getFieldDecorator('newVersion', {
                          rules: [{ required: true, message: '请选择软件版本' }],
                          initialValue: body.newVersion || ''
                        })(<Select disabled={type === 'change'} getPopupContainer={triggerNode => triggerNode.parentNode}>
                          {
                            _softVersion.map((it) => {
                              return (
                                <Option key={it.value} value={it.value}>{it.label}</Option>
                              )
                            })
                          }
                        </Select>)}
                    </Item>
                  </Col>
                  <Col span={12}>
                    <Item label='特征库版本' {...formItemLayout}>
                      {
                        getFieldDecorator('featureLibrary', {
                          rules: [{ required: true, message: '请选择特征库版本' }],
                          initialValue: body.maxPackageVersion || ''
                        })(<Select disabled={type === 'change'} getPopupContainer={triggerNode => triggerNode.parentNode}>
                          {
                            _featureLibrary.map((it) => {
                              return (
                                <Option key={it.value} value={it.value}>{it.label}</Option>
                              )
                            })
                          }
                        </Select>)}
                    </Item>
                  </Col>
                  <Col span={12}>
                    <Item label='URL地址' {...formItemLayout}>
                      {
                        getFieldDecorator('url', {
                          rules: [
                            { required: true, message: '请输入' },
                            { max: 300, message: '最多300字符' },
                            { pattern: regExp.httpRegex, message: '只支持http(s)://的url地址' }],
                          initialValue: body.url || 'http://'
                        })(<Input autoComplete="off" />)}
                    </Item>
                  </Col>
                  <Col span={12}>
                    <Item label='命令与控制通道检测引擎版本号' {...formItemLayout}>
                      {
                        getFieldDecorator('commandControlChannel', {
                          initialValue: body.commandControlChannel,
                          rules: [{ message: '最多30个字符！', max: 30 }]
                        })(<Input autoComplete="off" disabled={type === 'change'} />)}
                    </Item>
                  </Col>
                  <Col span={12}>
                    <Item label='AVLX检测引擎版本号' {...formItemLayout}>
                      {
                        getFieldDecorator('avlxVersion', {
                          initialValue: body.avlxVersion,
                          rules: [{ message: '最多30个字符！', max: 30 }]
                        })(<Input autoComplete="off" disabled={type === 'change'} />)}
                    </Item>
                  </Col>
                </Row>
              </div>
              <p className="detail-title">通用信息</p>
              <div className="detail-content detail-base-content">
                <DetailFiedls fields={this.assetInfoList.slice(0, 3)} data={body} />
                <div className="detail-content-equ">
                  <div className="detail-content-equ-label">关联设备</div>
                  <DetailFiedls fields={this.baseInfoList} data={body} />
                </div>
                <DetailFiedls fields={this.assetInfoList.slice(3, this.assetInfoList.length - 1)} data={body} />
                <DetailFiedls fields={this.assetInfoList.slice(this.assetInfoList.length - 1)} column={1} data={body} />
              </div>
            </div>
            <div className="Button-center">
              <div>
                <Button type="primary" htmlType="submit">提交</Button>
                <Button type="primary" ghost onClick={this.goBack} >返回</Button>
              </div>
            </div>
          </Form>
        </div>
      </div>
    )
  }
}
export default Form.create()(CommonDetail)
