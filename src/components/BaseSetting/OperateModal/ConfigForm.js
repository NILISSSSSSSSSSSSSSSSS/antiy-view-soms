import React, { PureComponent } from 'react'
import { connect } from 'dva'
import { Spin, Form, Radio, Input, Upload, Icon, message, Select, Button } from 'antd'
import { createHeaders, beforeUpload } from '@/utils/common'
import api from '@/services/api'
import * as regExp from '@u/regExp'
import './style.less'

const { Item } = Form
const { Group } = Radio
const { TextArea } = Input
const Option = Select.Option
const formItemLayout = {
  labelCol: {
    span: 6
  },
  wrapperCol: {
    span: 12
  }
}

export class ConfigForm extends PureComponent {
    state = {
      loading: true,
      fileList: [],
      usersByRoleCodeAndAreaIdList: [],
      fileAccept: '.doc .docx .pdf .jpg .png .zip'
    }
    componentDidMount () {
      this.uuids1 = []
      this.getList()
    }
    // 获取配置核查执行人列表
    getList = () => {
      const { areaId } = this.props
      api.getUsersByRoleCodeAndAreaId({
        flowId: 4,
        flowNodeTag: 'config_check',
        areaId
      }).then(response => {
        if(response && response.head && response.head.code === '200' ){
          this.setState({
            usersByRoleCodeAndAreaIdList: response.body,
            loading: false
          })
        }
      })
    }
    uploadChange = (info) => {
      let fileList = info.fileList
      this.setState({
        fileList
      })
      // 网络失败
      fileList.filter((e)=>e.status === 'error').forEach((file)=>{
        message.info(file.name + '上传超时！')
      })
      //服务器处理失败
      fileList.filter((e)=>e.status === 'done' && e.response && e.response.head.code !== '200' && e.percent === 100 && !this.uuids1.includes(e.uid)).forEach((file)=>{
        // 如果提示上传失败，下次上传时，不在提示
        this.uuids1.push(file.uid)
        message.info('上传 ' + file.name + ' 失败！')
      })
      // 所有文件上传完成时，排除上传失败文件，刷新上传列表
      const list = fileList.filter((e)=>e.status === 'done')
      if(list.length === fileList.length){
        this.uuids1 = []
        this.setState({
          fileList: list.filter((e)=>e.response && e.response.head.code === '200')
        })
      }
    }
    handleSubmit = (e) => {
      const { usersByRoleCodeAndAreaIdList } = this.state
      const allUserList = []
      usersByRoleCodeAndAreaIdList.forEach(item => {
        allUserList.push(item.stringId)
      })
      this.props.form.validateFields((err, value) => {
        if (!err) {
          let { checkUser, configUrl } = value
          let files = []
          value.checkUser = checkUser === 'all' ? allUserList : checkUser
          if (configUrl) {
            files = configUrl.fileList.map(item => {
              let init = item.response.body[0].id
              return init
            })
          }
          value.configUrl = files
          this.props.configSubmit(value)
        }
      })
    }
    render () {
      const {
        fileAccept,
        fileList,
        usersByRoleCodeAndAreaIdList,
        loading
      } = this.state
      const { form, onClose, waitingConfigId } = this.props
      const { getFieldDecorator } = form
      const uploadProps = {
        name: 'upload',
        accept: fileAccept,
        action: '/api/v1/config/file/baselineUpload',
        headers: createHeaders(),
        multiple: true,
        data: {
          ids: waitingConfigId
        },
        onChange: this.uploadChange,
        fileList,
        beforeUpload: ((file, fileLists) => beforeUpload(file, fileLists, fileList, 10, 'MB', 5, regExp.fileTypePattern, 80))
      }
      return (
        <div className="check-result-wrap" style={{ 'marginTop': 0 }}>
          <Spin spinning={loading}>
            <Form>
              <div className="check-result">
                <Item {...formItemLayout} label="核查方式">
                  {getFieldDecorator('checkType', {
                    rules: [{ required: true, message: '请选择核查方式' }]
                  })(
                    <Group onChange={this.onChange} value={this.state.value}>
                      <Radio value={2}>自动</Radio>
                      <Radio value={1}>人工</Radio>
                    </Group>
                  )}
                </Item>
                <Item label="配置核查执行人" {...formItemLayout}>
                  {getFieldDecorator('checkUser', {
                    rules: [{ required: true, message: '请选择配置核查执行人' }],
                    initialValue: 'all'
                  })(
                    <Select
                      placeholder="请选择"
                      showSearch
                      filterOption={(input, option) =>
                        option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                      }
                    >
                      {usersByRoleCodeAndAreaIdList.length ? <Option value='all' key='all'>全部</Option> : null}
                      {usersByRoleCodeAndAreaIdList && usersByRoleCodeAndAreaIdList.map((item, index) => {
                        return (<Option value={item.stringId} key={index} >{item.name}</Option>)
                      })}
                    </Select>
                  )}
                </Item>
                <Item {...formItemLayout} label="备注">
                  {getFieldDecorator('remark', {
                    rules: [{ required: false, message: '请输入备注' }, { max: 300, message: '请输入1-300个字符' }]
                  })(
                    <TextArea placeholder="请输入备注" rows={3} />
                  )}
                </Item>
                <Item {...formItemLayout} label="上传附件">
                  {getFieldDecorator('configUrl', {
                    rules: [{ required: false }]
                  })(
                    <Upload {...uploadProps}>
                      <div className='work-order-add-upload'>
                        <Icon type='plus' />
                        &nbsp;&nbsp;选择附件&nbsp;&nbsp;
                      </div>
                    </Upload>
                  )}
                  <div className="format">
                    <div>
                      <p>支持上传大小：10M</p>
                      <p>支持扩展名：.doc .docx .pdf .jpg .png .zip</p>
                    </div>
                  </div>
                </Item>
              </div>
            </Form>
          </Spin>
          <div className="button-center" style={{ border: 'none' }}>
            <div>
              <Button type='primary' onClick={this.handleSubmit}>确定</Button>
              <Button type='primary' ghost onClick={onClose}>取消</Button>
            </div>
          </div>
        </div>
      )
    }
}
const ConfigFormWrap = Form.create()(ConfigForm)
export default connect()(ConfigFormWrap)
