import React, { PureComponent } from 'react'
import { connect } from 'dva'
import { Form, Radio, Input, Upload, Icon, message, Button, Select } from 'antd'
import { createHeaders, beforeUpload } from '@/utils/common'
import { BASELINE_OPERATE_TYPE, CONFIG_STATUS } from '@a/js/enume'
import api from '@/services/api'
import * as regExp from '@u/regExp'
import './style.less'

const { Item } = Form
const { Group } = Radio
const { TextArea } = Input
const Option = Select.Option
const passMap = {
  pass: 1,
  noPass: 0
}
const formItemLayout = {
  labelCol: {
    span: 6
  },
  wrapperCol: {
    span: 12
  }
}

export class SubmitForm extends PureComponent {
  state = {
    fileList: [],
    isPass: undefined,                          // 是否通过
    usersByRoleCodeAndAreaIdList: [],           // 配置加固执行人列表
    fileAccept: '.rar, .zip, .7z, .doc, .docx, .pdf, .jpg, .png, .txt, .xlsx, .xls'
  }
  componentDidMount () {
    this.uuids1 = []
    this.getList()
  }
  // 获取配置加固执行人列表
  getList = () => {
    const { areaId } = this.props
    api.getUsersByRoleCodeAndAreaId({
      flowId: 4,
      flowNodeTag: 'config_steady',
      areaId
    }).then(response => {
      if (response && response.head && response.head.code === '200') {
        this.setState({
          usersByRoleCodeAndAreaIdList: response.body
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
    fileList.filter((e) => e.status === 'error').forEach((file) => {
      message.info(file.name + '上传超时！')
    })
    //服务器处理失败
    fileList.filter((e) => e.status === 'done' && e.response && e.response.head.code !== '200' && e.percent === 100 && !this.uuids1.includes(e.uid)).forEach((file) => {
      // 如果提示上传失败，下次上传时，不在提示
      this.uuids1.push(file.uid)
      message.info('上传 ' + file.name + ' 失败！')
    })
    // 所有文件上传完成时，排除上传失败文件，刷新上传列表
    const list = fileList.filter((e) => e.status === 'done')
    if (list.length === fileList.length) {
      this.uuids1 = []
      this.setState({
        fileList: list.filter((e) => e.response && e.response.head.code === '200')
      })
    }
  }
  handleSubmit = (e) => {
    const { state } = this.props
    this.props.form.validateFields((err, value) => {
      if (!err) {
        state === BASELINE_OPERATE_TYPE.CHECK ? this.saveCheck(value) : this.saveReinforce(value)
      }
    })
  }
  // 保存核查
  saveCheck = value => {
    const { usersByRoleCodeAndAreaIdList } = this.state
    const { remark, isPass, fixUser, uploadFiles } = value
    const { waitingConfigId, taskId, status, assetId, baselineTemplateId } = this.props
    let files = []
    if (uploadFiles) {
      files = uploadFiles.fileList.map(item => {
        let init = item.response.body[0].id
        return init
      })
    }
    const fixUserList = []
    usersByRoleCodeAndAreaIdList.forEach(item => {
      fixUserList.push(item.stringId)
    })
    const postParams = {
      waitingConfigId,
      taskId,
      checkRemark: remark,
      fileIdList: files,
      isPass,
      fixUser: fixUser === 'all' ? fixUserList.join(',') : fixUser,
      isAllFixer: fixUser === 'all' ? 1 : 0
    }
    if (!postParams.fixUser) delete postParams.fixUser
    api.saveCheck(postParams).then(response => {
      if (response && response.head && response.head.code === '200') {
        // （后端执行，前端不必再调取此接口）当状态为核查待确认时，且核查结果提交未通过，需调取自动加固接口
        // if (status === CONFIG_STATUS.checkWaitConfirm && isPass === passMap.noPass) {
        //   // api.automaticReinforce({
        //   //   primaryKey: waitingConfigId
        //   // }).then(response => {
        //   //   if (response && response.head && response.head.code === '200') {
        //   //     message.success('操作成功！')
        //   //     this.getNewList()
        //   //   }
        //   // })
        // }
        // 当核查结果为通过时，需要更新资产绑定的模板
        if (isPass === passMap.pass){
          api.updateAssetTemplate({
            assetId,
            baselineTemplateId
          }).then(response => {
            if (response && response.head && response.head.code === '200') {
              message.success('操作成功！')
              this.getNewList()
            }
          })
        } else {
          message.success('操作成功！')
          this.getNewList()
        }
      }
    })
  }
  // 保存加固
  saveReinforce = value => {
    const { remark, isPass, uploadFiles } = value
    const { waitingConfigId, taskId, assetId, baselineTemplateId } = this.props
    let files = []
    if (uploadFiles) {
      files = uploadFiles.fileList.map(item => {
        let init = item.response.body[0].id
        return init
      })
    }
    api.saveReinforce({
      waitingConfigId,
      taskId,
      fixRemark: remark,
      fileIdList: files,
      isPass
    }).then(response => {
      if (response && response.head && response.head.code === '200') {
        // 当加固结果为完成时，需要更新资产绑定的模板
        if (isPass === passMap.pass){
          api.updateAssetTemplate({
            assetId,
            baselineTemplateId
          }).then(response => {
            if (response && response.head && response.head.code === '200') {
              message.success('操作成功！')
              this.getNewList()
            }
          })
        } else {
          message.success('操作成功！')
          this.getNewList()
        }
      }
    })
  }
  getNewList = () => {
    this.props.onClose()
    this.props.getList()
  }
  // 修改是否通过
  passChange = e => {
    this.setState({
      isPass: e.target.value
    })
  }
  render () {
    const {
      fileAccept,
      fileList,
      isPass,
      usersByRoleCodeAndAreaIdList
    } = this.state
    const { form, state, waitingConfigId, isBatch } = this.props
    const { getFieldDecorator } = form
    const uploadProps = {
      name: 'upload',
      accept: fileAccept,
      action: '/api/v1/config/file/baselineUpload',
      headers: createHeaders(),
      multiple: true,
      data: {
        ids: [waitingConfigId]
      },
      onChange: this.uploadChange,
      fileList,
      beforeUpload: ((file, fileLists) => beforeUpload(file, fileLists, fileList, 10, 'MB', 5, regExp.fileTypePattern, 80))
    }
    return (
      <div className="check-result-wrap">
        <h3 className="title">
          {state === BASELINE_OPERATE_TYPE.CHECK && <span>填写核查结果</span>}
          {state === BASELINE_OPERATE_TYPE.REINFORCE && <span>填写加固结果</span>}
        </h3>
        <Form>
          <div className="check-result">
            {state === BASELINE_OPERATE_TYPE.CHECK &&
              <Item {...formItemLayout} label="核查结果">
                {getFieldDecorator('isPass', {
                  rules: [{ required: true, message: '请选择核查结果' }]
                })(
                  <Group onChange={this.passChange}>
                    <Radio value={passMap.pass}>通过</Radio>
                    <Radio value={passMap.noPass}>未通过</Radio>
                  </Group>
                )}
              </Item>
            }
            {state === BASELINE_OPERATE_TYPE.REINFORCE &&
              <Item {...formItemLayout} label="加固结果">
                {getFieldDecorator('isPass', {
                  rules: [{ required: true, message: '请选择加固结果' }]
                })(
                  <Group onChange={this.passChange}>
                    <Radio value={passMap.pass}>完成</Radio>
                    <Radio value={passMap.noPass}>未完成</Radio>
                  </Group>
                )}
              </Item>
            }
            {/* 核查，且核查结果选择未通过时，需选择配置加固执行人 */}
            {state === BASELINE_OPERATE_TYPE.CHECK && isPass === passMap.noPass &&
              <Item label="配置加固执行人" {...formItemLayout}>
                {getFieldDecorator('fixUser', {
                  rules: [{ required: true, message: '请选择配置加固执行人' }]
                })(
                  <Select
                    placeholder="请选择"
                    showSearch
                    filterOption={(input, option) =>
                      option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                    }
                  >
                    {usersByRoleCodeAndAreaIdList.length ? <Option value='all'>全部</Option> : null}
                    {usersByRoleCodeAndAreaIdList && usersByRoleCodeAndAreaIdList.map((item, index) => {
                      return (<Option value={item.stringId} key={index}>{item.name}</Option>)
                    })}
                  </Select>
                )}
              </Item>
            }
            <Item {...formItemLayout} label="备注">
              {getFieldDecorator('remark', {
                rules: [{
                  required: isPass === passMap.noPass,
                  message: '请输入备注'
                }, { max: 300, message: '请输入1-300个字符' }]
              })(
                <TextArea placeholder="请输入备注" rows={3} />
              )}
            </Item>
            <Item {...formItemLayout} label="上传附件">
              {getFieldDecorator('uploadFiles', {
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
                  <p>支持扩展名：.rar .zip .7z .doc .docx .pdf .jpg .png .txt .xlsx .xls</p>
                </div>
              </div>
            </Item>
          </div>
          <div className="button-center" style={{ border: 'none' }}>
            <div>
              <Button type='primary' onClick={this.handleSubmit}>确定</Button>
              <Button type='primary' ghost onClick={this.getNewList}>取消</Button>
            </div>
          </div>
        </Form>
      </div>
    )
  }
}
const SubmitFormWrap = Form.create()(SubmitForm)
export default connect()(SubmitFormWrap)
