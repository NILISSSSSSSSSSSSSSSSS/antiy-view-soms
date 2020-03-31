import React, { Component } from 'react'
import { withRouter } from 'dva/router'
import { Form, Input, Col, Select, Button, message, DatePicker, InputNumber } from 'antd'
import moment from 'moment'
import { debounce } from 'lodash'
import { THREAT_GRADE } from '@a/js/enume'
import { analysisUrl } from '@u/common'
import api from '@/services/api'
import * as regExp from '@/utils/regExp'
import CatgoryList from '@c/BugManage/CatgoryList'
import './index.less'

const Option = Select.Option
const { Item } = Form
const TextArea = Input.TextArea
const formLayout = {
  labelCol: {
    span: 4
  },
  wrapperCol: {
    span: 18
  }
}
const formLayoutBlock = {
  labelCol: {
    span: 2
  },
  wrapperCol: {
    span: 22
  }
}
//动态表单所需的常量
const VULNUMBERS = ['CNNVD', 'CVE', 'CNVD', '其他']
const CVSS = ['V2.0', 'V3.0']
const _VULNUMBERS = {
  'CNNVD': 'cnnvd',
  'CVE': 'cve',
  'CNVD': 'cnvd',
  '其他': 'otherNo'
}
@withRouter
@Form.create()
class BugChangeForm extends Component {
  constructor (props) {
    super(props)
    this.state = {
      //动态添加表单
      vulKeysList: [0],
      vulId: 0,
      cvssKeysList: [0],
      cvssId: 0,
      //编辑才会存在id
      number: props.location.search !== '' ? analysisUrl(props.location.search).number : null,
      detailData: {},
      //漏洞类型列表
      bugTypeList: [],
      data: [],
      value: [],
      vulNumbers: JSON.parse(JSON.stringify(VULNUMBERS)),
      cvss: JSON.parse(JSON.stringify(CVSS)),
      //品类型号数据
      businessIds: []
    }
  }
  componentDidMount () {
    this.getListVulType()
    const { number } = this.state
    number && this.getDetail()
  }

  render () {
    const { detailData, bugTypeList, vulKeysList, cvssKeysList, number } = this.state
    const { getFieldDecorator, getFieldValue } = this.props.form
    getFieldDecorator('vulKeys', { initialValue: vulKeysList })
    getFieldDecorator('cvssKeys', { initialValue: cvssKeysList })
    const vulKeys = getFieldValue('vulKeys')
    const cvssKeys = getFieldValue('cvssKeys')
    //漏洞编号
    const vulNumbers = this.getVulNumbers(getFieldDecorator, vulKeys)
    //CVSS
    const cvss = this.getCvss(getFieldDecorator, cvssKeys)
    return (
      <div className="edit-form-content">
        <Form className="bug-edit-form">
          <p className="bug-title">漏洞信息</p>
          <div className="form-wrap clearfix">
            <div className="clearfix">
              <Col span={24} className="inline-form-item add-form-item number-form-item">
                {vulNumbers}
              </Col>
              <Col span={24} className="inline-form-item add-form-item cvss-form-item">
                {cvss}
              </Col>
            </div>
            <Col span={8} className="form-layout">
              <Item {...formLayout} label="漏洞名称">
                {
                  getFieldDecorator('vulName', {
                    rules: [
                      { required: true, message: '请输入漏洞名称！' },
                      { message: '最多512个字符！', max: 512 },
                      { whitespace: true, message: '不能为空字符！' }
                    ],
                    initialValue: detailData.vulName
                  })(
                    <Input autoComplete="off" placeholder="请输入" allowClear />
                  )
                }
              </Item>
            </Col>
            <Col span={8} className="form-layout">
              <Item {...formLayout} label="漏洞类型">
                {
                  getFieldDecorator('vulType', {
                    rules: [{ required: true, message: '请选择漏洞类型！' }],
                    initialValue: detailData.vulType && detailData.vulType + ''
                  })(
                    <Select
                      showSearch
                      optionFilterProp="children"
                      getPopupContainer={triggerNode => triggerNode.parentNode}
                      placeholder="请选择" >
                      {
                        bugTypeList.map((item, index) => {
                          return (<Option key={item.id}>{item.name}</Option>)
                        })
                      }
                    </Select>
                  )
                }
              </Item>
            </Col>
            <Col span={8} className="form-layout">
              <Item {...formLayout}  label="发布时间">
                {
                  getFieldDecorator('vulReleaseTime', {
                    rules: [{ required: true, message: '请选择发布时间！' }],
                    initialValue: detailData.vulReleaseTime ? moment(detailData.vulReleaseTime) : null
                  })(
                    <DatePicker
                      getCalendarContainer={triggerNode => triggerNode.parentNode}
                      placeholder='请选择日期'
                      disabledDate={(current) => current && current > moment().endOf('day')} />
                  )
                }
              </Item>
            </Col>
            <Col span={8} className="form-layout">
              <Item {...formLayout} label="危害等级">
                {
                  getFieldDecorator('warnLevel', {
                    rules: [{ required: true, message: '请选择危害等级！' }],
                    initialValue: detailData.warnLevel && detailData.warnLevel + ''
                  })(
                    <Select
                      showSearch
                      optionFilterProp="children"
                      getPopupContainer={triggerNode => triggerNode.parentNode}
                      placeholder="请选择" >
                      {
                        THREAT_GRADE.map((item, index) => {
                          return (<Option key={item.value}>{item.name}</Option>)
                        })
                      }
                    </Select>
                  )
                }
              </Item>
            </Col>
            <Col span={8} className="form-layout">
              <Item {...formLayout} label="漏洞来源">
                {
                  getFieldDecorator('vulSource', {
                    rules: [
                      { message: '最多512个字符！', max: 512 },
                      { whitespace: true, message: '不能为空字符！' }
                    ],
                    initialValue: detailData.vulSource
                  })(
                    <Input autoComplete="off" placeholder="请输入" allowClear />
                  )
                }
              </Item>
            </Col>
            <Col span={24} className="form-block">
              <Item {...formLayoutBlock} label="漏洞描述">
                {
                  getFieldDecorator('vulDesc', {
                    rules: [
                      { message: '最多1024个字符！', max: 1024 },
                      { whitespace: true, message: '不能为空字符！' }
                    ],
                    initialValue: detailData.vulDesc
                  })(
                    <TextArea rows={4} placeholder="请输入" />
                  )
                }
              </Item>
            </Col>
          </div>
        </Form>
        <CatgoryList
          catgoryList={ref => this.catgoryList = ref}
          type={number ? 'change' : 'register'}
          showSizeChanger={number ? false : true}
          listData={detailData.vulnCpeResponseList || []}
          getCatgory={this.getCatgory}
        />
        <div className="button-center" style={{ paddingTop: '30px 0 0 0' }}>
          <div>
            <Button type="primary" onClick={this.handleSubmit} style={{ marginRight: 0 }}>保存</Button>
          </div>
        </div>
      </div>
    )
  }

  //提交
  handleSubmit = () => {
    this.props.form.validateFields((err, values) => {
      if (!err) {
        const { businessIds } = this.state
        if (!businessIds.length) {
          message.info('请添加品类型号！')
          return false
        }
        let { cvssSelect, cvssInput, vulSelect, vulInput } = values
        //漏洞编号,CVSS判空，由于是必填项需要过滤删除后的空值
        vulSelect = vulSelect.filter(item => item)
        vulInput = vulInput.filter(item => item)
        for (let i = 0; i < vulSelect.length; i++) {
          if (!vulInput[i]) {
            message.info('请输入漏洞编号！')
            return false
          }
        }
        //CVSS判空
        for (let i = 0; i < cvssSelect.length; i++) {
          if ((cvssSelect[i] || cvssInput[i] || cvssInput[i] === 0) && !(cvssSelect[i] && (cvssInput[i] || cvssInput[i] === 0) )) {
            message.info('CVSS下拉框和输入框都需要填写！')
            return false
          }
        }
        //处理漏洞编号
        vulSelect.forEach((item, index) => {
          values[_VULNUMBERS[item]] = vulInput[index]
        })
        //处理漏洞CVSS
        cvssSelect = cvssSelect.filter(item => item)
        cvssInput = cvssInput.filter(item => item || item === 0)
        values.metrics = []
        cvssSelect.forEach((item, index) => {
          values.metrics.push(`${item}-${cvssInput[index]}`)
        })

        values = this.getValues(values)
        const { number } = this.state
        number ? this.editPost(values) : this.registerPost(values)
      } else {
        message.info('请完善必填项信息！')
      }
    })
  }

  //获取新的数据
  getValues = (values) => {
    const { businessIds } = this.state
    //品类型号
    values.businessIds = businessIds
    //漏洞标识 1 突发漏洞 2 四库漏洞
    values.vulnSource = 1
    //后台定义和获取详情时候不一致，故重置提交的数据
    values.vulnName = values.vulName
    values.cnnvdId = values.cnnvd
    values.cnvdId = values.cnvd
    values.cveId = values.cve
    values.otherId = values.otherNo
    values.description = values.vulDesc
    values.source = values.vulSource
    values.vulnType  = values.vulType
    values.publishedDate  = new Date(values.vulReleaseTime).getTime()
    delete values.vulName
    delete values.vulSelect
    delete values.vulInput
    delete values.cvssSelect
    delete values.cvssInput
    delete values.cvssKeys
    delete values.vulKeys
    delete values.cnnvd
    delete values.cnvd
    delete values.cve
    delete values.otherNo
    delete values.vulDesc
    delete values.cvss
    delete values.vulSource
    delete values.vulType
    delete values.vulReleaseTime
    return values
  }

  //编辑漏洞
  editPost = debounce((values) => {
    const { number } = this.state
    values.antiyVulnId = number
    api.editVulnInfo(values).then(response => {
      if(response && response.head && response.head.code === '200' ){
        message.success('变更成功！')
        this.catgoryList.handleReset()
      }
    })
  }, 1000, { leading: true, trailing: false })

  //登记漏洞
  registerPost = debounce((values) => {
    api.vulnRegister(values).then(response => {
      if(response && response.head && response.head.code === '200' ){
        const { antiyVulnId, id } = response.body
        message.success('保存成功！')
        this.props.history.push(`/bugpatch/bugmanage/unexpected/change?id=${id}&number=${antiyVulnId}`)
      }
    })
  }, 1000, { leading: true, trailing: false })

  //获取漏洞编号
  getVulNumbers = (getFieldDecorator, keys = []) => {
    const { vulNumbers } = this.state
    return keys.map((k, index) => (
      <div className="add-form-box" key={k}>
        <div className="custom-label required-label">漏洞编号</div>
        <Item style={{ marginRight: '1%' }}>
          {
            getFieldDecorator(`vulSelect[${k}]`, {
              rules: [{ required: true, message: '请选择漏洞编号！' }]
            })(
              <Select
                optionFilterProp="children"
                getPopupContainer={triggerNode => triggerNode.parentNode}
                placeholder="请选择"
                onChange={value => this.handleChange(value, 'vulNumbers')}>
                {
                  vulNumbers.map(item => {
                    return (<Option key={item}>{item}</Option>)
                  })
                }
              </Select>
            )
          }
        </Item>
        <Item>
          {
            getFieldDecorator(`vulInput[${k}]`, {
              rules: [
                { required: true, message: '请输入漏洞编号！' },
                { whitespace: true, message: '不能为空字符！' },
                { message: '最多60个字符！', max: 60 }
              ]
            })(
              <Input autoComplete="off" placeholder="请输入" allowClear />
            )
          }
        </Item>
        <div className="form-btn">
          {this.getBtn({
            k,
            index,
            length: keys.length,
            max: 4,
            id: 'vulId',
            keys: 'vulKeys'
          })}
        </div>
      </div>
    ))
  }

  //获取CVSS
  getCvss = (getFieldDecorator, keys = []) => {
    const { cvss } = this.state
    return keys.map((k, index) => (
      <div className="add-form-box" key={k}>
        <div className="custom-label">CVSS</div>
        <Item style={{ marginRight: '1%' }}>
          {
            getFieldDecorator(`cvssSelect[${k}]`, {
            })(
              <Select
                allowClear
                optionFilterProp="children"
                getPopupContainer={triggerNode => triggerNode.parentNode}
                placeholder="请选择"
                onChange={value => this.handleChange(value, 'cvss')}>
                {
                  cvss.map(item => {
                    return (<Option key={item}>{item}</Option>)
                  })
                }
              </Select>
            )
          }
        </Item>
        <Item>
          {
            getFieldDecorator(`cvssInput[${k}]`, {
            })(
              <InputNumber
                min={0.0}
                max={10}
                step={0.1}
                parser={value => regExp.validateOneFloat(value)}
                autoComplete="off"
                placeholder="请输入" />
            )
          }
        </Item>
        <div className="form-btn">
          {this.getBtn({
            k,
            index,
            length: keys.length,
            max: 2,
            id: 'cvssId',
            keys: 'cvssKeys'
          })}
        </div>
      </div>
    ))
  }

  /**
   * 获取新增或删除按钮
   * @param k {String} 循环的值
   * @param index {Number} 下标
   * @param length {Number} 长度
   * @param max {Number} 最多生成表单的数量
   * @param id {String} vulId | cvssId
   * @param keys {String} vulKeys | cvssKeys
   * @return jsx
   */
  getBtn = ({ k, index, length, max, id, keys }) => {
    return index === 0 ?
      (
        length === max ?
          <img className="disabled-add" src={require('@a/images/biaodanxinzeng2.svg')} alt="" /> :
          <img onClick={() => this.handleAdd(id, keys)} src={require('@a/images/biaodanxinzeng.svg')} alt="" />
      ) :
      <img onClick={() => this.handleDelete(k, keys)} src={require('@a/images/biaodanshanchu.svg')}  alt="" />
  }

  /**
   * 下拉框选择
   * @param value {String} 选择的值
   * @param type {String} 漏洞编号和CVSS的state名称
   */
  handleChange = (value, type) => {
    let stateSelect = this.state[type]
    const { form } = this.props
    const index = stateSelect.findIndex(item => item === value)
    //移除当前选中项
    stateSelect.splice(index, 1)
    this.setState({
      [type]: stateSelect
    }, () => {
      let select, allSelect
      if (type === 'vulNumbers') {
        select = 'vulSelect'
        allSelect = VULNUMBERS
      } else {
        select = 'cvssSelect'
        allSelect = CVSS
      }
      //当前选择的编号列表
      let arr = []
      const vulSelect = form.getFieldsValue()[select]
      allSelect.forEach(item => {
        if (!vulSelect.includes(item)) arr.push(item)
      })
      this.setState({
        [type]: arr
      })
    })
  }

  /**
   * 删除表单
   * @param k {String} 下拉框所选择的值
   * @param keys {String} 漏洞编号与CVSS表单的标记
   */
  handleDelete = (k, keys) => {
    const { form } = this.props
    const _keys = form.getFieldValue(keys)
    if (_keys.length === 1) {
      return
    }
    form.setFieldsValue({
      [keys]: _keys.filter(key => key !== k)
    }, () => {
      let select, allSelect, stateSelect
      if (keys === 'vulKeys') {
        select = 'vulSelect'
        stateSelect = 'vulNumbers'
        allSelect = VULNUMBERS
      } else {
        select = 'cvssSelect'
        stateSelect = 'cvss'
        allSelect = CVSS
      }
      //当前选择的列表
      let _select = form.getFieldsValue()[select]
      let arr = []
      _select = _select.filter(item => item)
      //过滤删除后的空值
      allSelect.forEach(item => {
        if (!_select.includes(item)) arr.push(item)
      })
      this.setState({
        [stateSelect]: arr
      })
    })
  }

  /**
   * 添加表单
   * @param id {String} 漏洞编号与CVSS表单的计数器
   * @param keys {String} 漏洞编号与CVSS表单的标记
   */
  handleAdd = (id, keys) => {
    const { form } = this.props
    const _keys = form.getFieldValue(keys)
    let _id = this.state[id] + 1
    const nextKeys = _keys.concat(_id)
    this.setState({
      [id]: _id
    })
    form.setFieldsValue({
      [keys]: nextKeys
    })
  }

  //登记时获取品类型号数据
  getCatgory = (data) => {
    this.setState({
      businessIds: data.map(item => item.businessId)
    })
  }

  //获取漏洞类型列表
  getListVulType = () => {
    api.getListVulType().then(response => {
      if(response && response.body && response.head && response.head.code === '200' ){
        const body = response.body || []
        this.setState({
          bugTypeList: body
        })
      }
    })
  }

  //获取漏洞详情
  getDetail = () => {
    api.vulnDetail({
      antiyVulnId: this.state.number
    }).then(response => {
      if(response && response.body && response.head && response.head.code === '200' ){
        let body = response.body
        body.cvss = body.cvss || []
        this.setState({
          detailData: body,
          businessIds: body.vulnCpeResponseList.map(item => item.businessId)
        })
        this.renderNumbers(body)
        this.renderCvss(body)
      }
    })
  }

  //动态生成漏洞编号表单
  renderNumbers = (body) => {
    const { form } = this.props
    let { vulNumbers } = this.state
    let vulKeysList = [0], vulId = 0, keys = []
    for (let key in _VULNUMBERS) {
      if (body[_VULNUMBERS[key]]) {
        //当前存在的编号
        keys.push(key)
        vulId ++
        vulKeysList.push(vulId)
        //删除已存在的下拉项
        const index = vulNumbers.findIndex(item => item === key)
        vulNumbers.splice(index, 1)
      }
    }
    //漏洞编号计数器
    vulId -= 1
    vulKeysList.splice(vulKeysList.length - 1, 1)
    this.setState({
      vulKeysList,
      vulId,
      vulNumbers
    }, () => {
      form.setFieldsValue({
        vulKeys: vulKeysList
      })
      //初始化动态表单赋值
      keys.forEach((item, index) => {
        form.setFieldsValue({
          [`vulSelect[${index}]`]: item,
          [`vulInput[${index}]`]: body[_VULNUMBERS[item]]
        })
      })
    })
  }

  //动态生成CVSS表单
  renderCvss = (body) => {
    let { form } = this.props, { cvss } = this.state, metrics = body.cvss
    let cvssKeysList = [], cvssId = metrics.length ? metrics.length - 1 : 0
    //初始化生成CVSS表单
    metrics.forEach((item, index) => {
      const value = item.split('-')[0]
      cvssKeysList.push(index)
      if (cvss) {
        //删除已存在的下拉项
        const index = cvss.findIndex(subItem => subItem === value)
        cvss.splice(index, 1)
      }
    })
    //为空就生成一条
    if (!cvssKeysList.length) {
      cvssKeysList = [0]
    }
    this.setState({
      cvssKeysList,
      cvssId,
      cvss
    }, () => {
      form.setFieldsValue({
        cvssKeys: cvssKeysList
      })
      metrics.forEach((item, index) => {
        const value = item.split('-')
        form.setFieldsValue({
          [`cvssSelect[${index}]`]: value[0],
          [`cvssInput[${index}]`]: value[1]
        })
      })
    })
  }

}

export default BugChangeForm