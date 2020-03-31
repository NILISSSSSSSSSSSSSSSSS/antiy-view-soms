import { Component } from 'react'
import { connect } from 'dva'
import { withRouter } from 'react-router-dom'
import { Form, Input, Col, Select, DatePicker, Button, Message, message } from 'antd'
import moment from 'moment'
import AppendixDetailAndChange from '@/components/PatchManage/AppendixDetailAndChange'
import api from '@/services/api'
import {
  PATCH_INSTALL,
  PATCH_INTERNET,
  PATCH_INTERACTIVE,
  PATCH_HOT,
  PATCH_SOURCE,
  PATCH_STATUS,
  PATCH_LEVEL } from '@a/js/enume'
import { analysisUrl } from '@u/common'
import './style.less'

const Option = Select.Option
const { Item } = Form
const TextArea = Input.TextArea

@withRouter
@Form.create()
class PatchChangeForm extends Component {
  constructor (props) {
    super(props)
    this.state = {
      number: analysisUrl(props.location.search).id,
      detailData: {},
      accessoryList: []
    }
  }
  componentDidMount () {
    const { number } = this.state
    if(number) this.getPatchDetail(number)
    // //获取补丁详情
    // this.props.dispatch({ type: 'bugPatch/getPatchDetail', payload: { param: id } })
  }
  //获取补丁详情
  getPatchDetail = (number)=>{
    api.getPatchInfos({
      antiyPatchNumber: number
    }).then(data=>{
      const { patchNumber,
        patchName,
        patchLevel,
        patchStatus,
        pathSource,
        publishTime,
        hotfix,
        patchInfoFrom,
        userInteraction,
        networkStatus,
        description,
        patchAuditOpinions,
        uninstallStep } = data.body
      this.props.form.setFieldsValue({
        patchNumber,
        patchName,
        patchLevel,
        patchStatus: Number(patchStatus),
        publishTime: moment(publishTime),
        pathSource,
        hotfix,
        patchInfoFrom,
        userInteraction,
        networkStatus,
        description,
        patchAuditOpinions,
        uninstallStep
      })
    })
  }
   //提交
   handleSubmit = (e) => {
     e.preventDefault()
     const { tabIs } = this.props
     const { number } = this.state
     this.props.form.validateFields((err, values) => {
       if (!err) {
         const adjunct = this.adjunct.saveAccessoryList()
         const each = (data)=>{
           let init =  data.map((item)=>{
             item.antiyPatchNumber = number
             item.categoryId = String(item.categoryId)
             return item
           })
           return init
         }
         if(number){
           if(adjunct.add.length)
             each(adjunct.add)
           values.antiyPatchNumber = number
         }else  if(!adjunct.add.length ){
           Message.error('关联附件信息不能为空！', 5)
           return
         }
         adjunct.add.forEach((item)=>{
           if(item.createTimes) delete item.createTimes
         })
         values.publishTime = values.publishTime.valueOf()
         const init = {
           ...values,
           deletePatchNumber: adjunct.delete,
           patchEntityRequest: adjunct.add
         }
         if(!adjunct.delete.length) delete init.deletePatchNumber
         api[number ? 'postPatchEdits' : 'postPatchRegister'](init).then(data => {
           Message.success(`${number ? '变更' : '登记'}成功！`)
           this.setState({ number: data.body })
           tabIs(true, data.body)
           this.adjunct.resetList(data.body)
           // if(number) this.props.history.goBack()
         })
       } else {
         message.info('请完善必填项信息！')
       }
     })
   }

   render () {
     const { detailData } = this.state
     const { getFieldDecorator } = this.props.form

     return (
       <div className="edit-form-content patch-exigency-edit">
         <div className="patch-form">
           <p className="patch-title">补丁基本信息</p>
           <Form onSubmit={this.handleSubmit}>
             <div className="form-wrap" style={{ overflow: 'hidden' }}>
               <Col span={8}>
                 <Item label="补丁编号">
                   {
                     getFieldDecorator('patchNumber', {
                       rules: [
                         { required: true, message: '请输入补丁编号！' },
                         { message: '最多64个字符！', max: 64 },
                         { whitespace: true, message: '不能为空字符！' }
                       ],
                       initialValue: detailData.patchNumber
                     })(
                       <Input allowClear={detailData.patchNumber ? false : true} placeholder="请输入" autoComplete="off" disabled={detailData.patchNumber ? true : false} />
                     )
                   }
                 </Item>
               </Col>
               <Col span={8}>
                 <Item   label="补丁名称">
                   {
                     getFieldDecorator('patchName', {
                       rules: [
                         { required: true, message: '请输入补丁名称！' },
                         { message: '最多180个字符！', max: 180 },
                         { whitespace: true, message: '不能为空字符！' }
                       ],
                       initialValue: detailData.patchName
                     })(
                       <Input autoComplete="off" placeholder="请输入" allowClear />
                     )
                   }
                 </Item>
               </Col>
               <Col span={8}>
                 <Item   label="补丁等级">
                   {
                     getFieldDecorator('patchLevel', {
                       rules: [{ required: true, message: '请选择' }],
                       initialValue: detailData.patchLevel
                     })(
                       <Select
                         optionFilterProp="children"
                         getPopupContainer={triggerNode => triggerNode.parentNode}
                         placeholder="请选择" >
                         {
                           PATCH_LEVEL.map((item, index) => {
                             return (<Option value= {item.value} key={item.value}>{item.name}</Option>)
                           })
                         }
                       </Select>
                     )
                   }
                 </Item>
               </Col>
               <Col span={8}>
                 <Item   label="补丁状态">
                   {
                     getFieldDecorator('patchStatus', {
                       rules: [{ required: true, message: '请选择' }],
                       initialValue: detailData.patchStatus
                     })(
                       <Select
                         optionFilterProp="children"
                         getPopupContainer={triggerNode => triggerNode.parentNode}
                         placeholder="请选择" >
                         {
                           PATCH_STATUS.map((item, index) => {
                             return (<Option value= {item.value} key={Number(item.value)}>{item.name}</Option>)
                           })
                         }
                       </Select>
                     )
                   }
                 </Item>
               </Col>
               <Col span={8}>
                 <Item   label="补丁来源">
                   {
                     getFieldDecorator('pathSource', {
                       rules: [{ required: true, message: '请选择' }],
                       initialValue: detailData.patchSource
                     })(
                       <Select
                         optionFilterProp="children"
                         getPopupContainer={triggerNode => triggerNode.parentNode}
                         placeholder="请选择" >
                         {
                           PATCH_SOURCE.map((item, index) => {
                             return (<Option value= {item.value} key={item.name}>{item.name}</Option>)
                           })
                         }
                       </Select>
                     )
                   }
                 </Item>
               </Col>
               <Col span={8}>
                 <Item    label="发布时间">
                   {
                     getFieldDecorator('publishTime', {
                       rules: [{ required: true, message: '请选择发布时间！' }],
                       initialValue: detailData.publishTime && moment(detailData.publishTime - 0)
                     })(
                       <DatePicker
                         getCalendarContainer={triggerNode => triggerNode.parentNode}
                         placeholder='请选择日期'
                         disabledDate={(current) => current && current > moment().endOf('day')} />
                     )
                   }
                 </Item>
               </Col>
               <Col span={8}>
                 <Item   label="补丁信息来源">
                   {
                     getFieldDecorator('patchInfoFrom', {
                       rules: [
                         { required: true, message: '请输入补丁信息来源！' },
                         { message: '最多250个字符！', max: 250 },
                         { whitespace: true, message: '不能为空字符！' }
                       ],
                       initialValue: detailData.patchInfoFrom
                     })(
                       <Input autoComplete="off" placeholder="请输入" allowClear />
                     )
                   }
                 </Item>
               </Col>
               <Col span={8}>
                 <Item   label="补丁热支持">
                   {
                     getFieldDecorator('hotfix', {
                       rules: [{ required: true, message: '请选择' }],
                       initialValue: detailData.hotfix || undefined
                     })(
                       <Select
                         optionFilterProp="children"
                         getPopupContainer={triggerNode => triggerNode.parentNode}
                         placeholder="请选择" >
                         {
                           PATCH_HOT.map((item, index) => {
                             return (<Option value= {item.value} key={item.value}>{item.name}</Option>)
                           })
                         }
                       </Select>
                     )
                   }
                 </Item>
               </Col>
               <Col span={8}>
                 <Item   label="用户交互">
                   {
                     getFieldDecorator('userInteraction', {
                       initialValue: detailData.userInteraction || 0
                     })(
                       <Select
                         optionFilterProp="children"
                         getPopupContainer={triggerNode => triggerNode.parentNode}
                         placeholder="请选择" >
                         {
                           PATCH_INTERACTIVE.map((item, index) => {
                             return (<Option value= {item.value} key={item.value}>{item.name}</Option>)
                           })
                         }
                       </Select>
                     )
                   }
                 </Item>
               </Col>
               <Col span={8}>
                 <Item   label="联网状态">
                   {
                     getFieldDecorator('networkStatus', {
                       initialValue: detailData.networkStatus || 0
                     })(
                       <Select
                         optionFilterProp="children"
                         getPopupContainer={triggerNode => triggerNode.parentNode}
                         placeholder="请选择" >
                         {
                           PATCH_INTERNET.map((item, index) => {
                             return (<Option value= {item.value} key={item.value}>{item.name}</Option>)
                           })
                         }
                       </Select>
                     )
                   }
                 </Item>
               </Col>
               <Col span={8}>
                 <Item   label="独占方式安装">
                   {
                     getFieldDecorator('exclusiveInstall', {
                       initialValue: detailData.exclusiveInstall || 0
                     })(
                       <Select
                         optionFilterProp="children"
                         getPopupContainer={triggerNode => triggerNode.parentNode}
                         placeholder="请选择" >
                         {
                           PATCH_INSTALL.map((item, index) => {
                             return (<Option value= {item.value} key={index + item.name}>{item.name}</Option>)
                           })
                         }
                       </Select>
                     )
                   }
                 </Item>
               </Col>
               <Col span={24}>
                 <Item   label="补丁描述">
                   {
                     getFieldDecorator('description', {
                       rules: [
                         { required: true, message: '请输入补丁描述！' },
                         { message: '最多4000个字符！', max: 4000 },
                         { whitespace: true, message: '不能为空字符！' }
                       ],
                       initialValue: detailData.description
                     })(
                       <TextArea rows={6} placeholder="请输入" />
                     )
                   }
                 </Item>
               </Col>
               <Col span={24}>
                 <Item   label="补丁审核意见">
                   {
                     getFieldDecorator('patchAuditOpinions', {
                       rules: [
                         { required: true, message: '请输入补丁审核意见！' },
                         { message: '最多2000个字符！', max: 2000 },
                         { whitespace: true, message: '不能为空字符！' }
                       ],
                       initialValue: detailData.patchAuditOpinions
                     })(
                       <TextArea rows={6} placeholder="请输入" />
                     )
                   }
                 </Item>
               </Col>
               <Col span={24}>
                 <Item   label="卸载步骤">
                   {
                     getFieldDecorator('uninstallStep', {
                       rules: [
                         { message: '最多2000个字符！', max: 2000 },
                         { whitespace: true, message: '不能为空字符！' }
                       ],
                       initialValue: detailData.uninstallStep
                     })(
                       <TextArea rows={6} placeholder="请输入" />
                     )
                   }
                 </Item>
               </Col>
             </div>
           </Form>
         </div>
         <div className='accessory-info'>
           <AppendixDetailAndChange type='change' adjunct={(now)=>this.adjunct = now} />
         </div>
         <div className="button-center">
           <div>
             <Button type="primary" onClick={(e)=>this.handleSubmit(e)}>保存</Button>
           </div>
         </div>
       </div>
     )
   }
}
const mapStateToProps = ({ bugPatch }) => {
  return {
    // detailData: bugPatch.patchDetail
  }
}
export default connect(mapStateToProps)(PatchChangeForm)