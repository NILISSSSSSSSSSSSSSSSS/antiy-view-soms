import React, { Component } from 'react'
import { Button, Input, Form, message, Spin, Select } from 'antd'
import api from '@/services/api'
import { connect } from 'dva'
import PropTypes from 'prop-types'
import './style.less'

const typeRequest = [
  api.assetImportComputer,
  api.assetImportNet,
  api.assetImportSafety,
  api.assetImportStorage,
  api.assetImportOthers
]

const FormItem = Form.Item
const Option = Select.Option
//导入资产
@Form.create()
@connect(({ asset }) => ({
  loading: asset.importAssetLoading
}))
class ImportAssets extends Component{
  state = {
    uploadFile: ''
  }

  static defaultProps ={
    PrefixCls: 'Information'
  }

  static propTypes={
    hardCategoryModelNode: PropTypes.object,
    PrefixCls: PropTypes.string
  }

  submitPost = (e) => {
    e.preventDefault()
    this.props.form.validateFields((err, values)=>{
      if(err)return void(0)
      this.submitPostCB(values)
    })
  }

  // 验证文件格式
  validator = (rule, value, callback) => {
    if(value){
      const arr = value.split('.')
      const regex = /^(xls(x)?)$/ig
      const data = arr[arr.length - 1].toLowerCase()

      if(!regex.test(data)){
        callback('请上传xls或者xlsx文件')
      }
    }
    callback()
  }

  inputCB=()=>{
    const { PrefixCls } = this.props
    const files = document.getElementById(`${PrefixCls}-uploads`)
    const name = files.files[0].name
    const fileName = name.substring(0, name.lastIndexOf('.'))
    if(fileName.length > 200){
      message.info('文件名长度最多200字符，请检查')
      return void(0)
    }
    this.props.form.setFieldsValue({ file: files.value })
    this.setState({ uploadFile: files.files[0] })
  }

  submitPostCbFin=()=>{
    const { form: { resetFields }, dispatch } = this.props
    dispatch({ type: 'asset/importAssetLoading', payload: false })
    resetFields()
    this.setState({ uploadFile: '' })
  }

  submitPostCbFn=res=>{
    if(res.body.indexOf('导入失败') !== -1){
      message.warning(res.body)
    }else {
      message.success(res.body)
      this.props.handleReset()
    }
  }

  // 副作用
  submitPostCB=values=>{
    const formData = new FormData()
    formData.append('file', this.state.uploadFile)
    this.props.dispatch({ type: 'asset/importAssetLoading', payload: true })
    typeRequest[values.category - 1]( formData).then((res)=>{
      if(res && res.head && res.head.code === '200' ){
        this.submitPostCbFn(res)
      }
    }).finally(()=>{
      this.submitPostCbFin()
    })
  }

  render () {
    const { form: { getFieldDecorator }, hardCategoryModelNode, PrefixCls, loading } = this.props
    const search = {
      labelCol: {
        span: 8
      },
      wrapperCol: {
        span: 16
      }
    }
    return(
      <Spin spinning={loading}>
        <div className={PrefixCls}>
          <Form layout="horizontal" onSubmit={this.submitPost}>
            <FormItem label='选择导入类型' {...search}>
              {getFieldDecorator('category',
                { rules: [{ required: true, message: '选择导入品类' }]
                })(
                <Select allowClear placeholder="请选择"
                  getPopupContainer={triggerNode => triggerNode.parentNode}
                  showSearch={false} >
                  {hardCategoryModelNode && hardCategoryModelNode.map((item, i)=>(
                    <Option value={i + 1} key={i}>{item}</Option>)
                  )}
                </Select>
              )}
            </FormItem>
            <div>
              <FormItem {...search} label="选择文件">
                {getFieldDecorator('file', {
                  rules: [
                    { required: true, message: '选择导入文件' },
                    { validator: this.validator }]
                })(
                  <Input autoComplete="off" style={{ width: 240 }} placeholder="请选择文件"/>
                ) }
              </FormItem>
              <input
                type='file' id={`${PrefixCls}-uploads`}
                accept=".xlsx,.xls"
                key={Math.random()} //此处key是强制让元素刷新， 否则上传同一个文件时 change 不生效
                onChange={this.inputCB}/>
            </div>
            <Button style={{ visibility: 'hidden' }} htmlType='submit' id='Information-alert-post' />
          </Form>
        </div>
      </Spin>
    )
  }
}

export default ImportAssets
