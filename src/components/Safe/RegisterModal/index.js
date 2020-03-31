import { Component } from 'react'
import { Form, Button, Message, Modal } from 'antd'
import Tooltip from '@/components/common/CustomTooltip'
import moment from 'moment'
import api from '@/services/api'
import { createHeaders, strUnescape } from '@/utils/common'
import UploadFile from '@/components/common/UploadFile'
import * as regExp from '@/utils/regExp'
import CheckTypeAndCode from '@/components/common/CheckTypeAndCode'
import RegisterForm from '@/components/common/RegisterForm'
import ModalConfirm from '@/components/common/ModalConfirm'

import './style.less'

const { Item } = Form
// 包文件上传类型，要与正则验证统一
const uploadFileType = [ 'rar', 'tar', '7z', 'zip', 'tgz', 'gz', 'deb', 'rpm', 'bin', 'dpkg', 'bz' ]
//版本库管理登记
class SafeRegister extends Component {
  constructor (props) {
    super(props)
    this.state = {
      fileList: [],
      manualDoc: [],
      data: {},
      confirm: false,
      checkCode: {}, // 检验方式的信息
      supplierList: [],
      nameList: [],
      versionList: []
    }
    // 获取url的参数
    this.urlParams = this.props
    this.title = null
  }
  // 升级包文件格式的正则pattern, size升级包文件的大小 5G
  upgradePackage = { pattern: regExp.safetyUpFilePattern, size: 5 * 1024 }

  // 升级包说明文件格式的正则upgradePackage size升级包说明文件的大小 200M
  upgradePackageInstructions = { pattern: regExp.instructionsPattern, size: 200 }
  componentDidMount () {
    let type = this.urlParams.type
    if(type !== 'add') {
      this.queryPackageDetail()
    }else if(type === 'add') {
      this.getSupplierList()
    }
  }
  /**
   * 生成标题信息
   * @returns {null|*|string}
   */
  generateTitle = () => {
    if(this.title){
      return this.title
    }
    const { type, from } = this.urlParams
    let change = ''
    let fromAdss = ''
    if(type === 'isChange'){
      change = '变更'
    }else if(type === 'add' || type === 'again'){
      change = '登记'
    }
    if(from === 'feature'){
      fromAdss = '特征库'
    }else if(from === 'version'){
      fromAdss = '版本'
    }
    this.title = fromAdss + change
    return  fromAdss + change
  }
  /**
   * 上传文件的验证
   * @param file 上传的文件
   * @param rule 验证规则
   * @param type 上传文件的类型
   */
  beforeUpload = (file, rule = {}, type) =>{
    const keys = ['pattern', 'size']
    const nameArr = (file.name || '').split('.')
    const fileFormat = nameArr[nameArr.length - 1]
    // 设置了多少个个规则
    const rulesKeys = Object.keys(rule)
    // 校验格式
    const result = keys.filter((e)=>{
      if(e === 'pattern'){ // 文件格式验证
        return rule[e].test(fileFormat)
      }else if(e === 'size') { // 文件大小验证，正则传递进来的是MB
        return (rule[e] * 1024 * 1024) >= file.size
      }
      return false
    })
    // 只有上传安装包时才必须填写MD5的值
    if(type === 'package'){
      // 只有输入MD5的值之后才可上传
      const md5 = this.props.form.getFieldValue('checkCode') || {}
      if(!(md5.code || '').trim()){
        Message.info('请先输入MD5值')
        return  Promise.reject('请先输入MD5值')
      }
    }
    if(result.length === rulesKeys.length){
      return  Promise.resolve(file)
    }else {
      if(!result.includes('size')){
        Message.info(`文件大小超过${rule.size >= 1024 ? rule.size / 1024 : rule.size}${type === 'package' ? 'GB' : 'MB'}`)
      }else if(!result.includes('pattern')){
        Message.info('文件格式不正确')
      }
      return  Promise.reject('文件格式不正确')
    }
  }

  // 禁用提交按钮
  generateSubmitBtnDisabled = () => {
    if(this.packageUpdating === 'uploading' || this.docUpdating === 'uploading'){
      return true
    }
    return false
  }
  getMD5Value = () => {
    const md5 = this.props.form.getFieldValue('checkCode') || ''
    return md5.code
  }
  //提交表单
  handleSubmit = (e) => {
    e.preventDefault()
    this.props.form.validateFields((err, values) => {
      if (!err) {
        if (values.filepaths && values.filepaths && values.filepaths.length === 0) {
          Message.info('请选择包文件')
          return
        }
        let text, url
        const { id, from, type } = this.urlParams
        delete values.supplier
        delete values.relevanceName
        values.filepath = JSON.stringify(this.getFiles(values.filepaths))
        delete values.filepaths
        if (values.manualDocs && values.manualDocs.length) {
          values.manualDoc = JSON.stringify(this.getFiles(values.manualDocs))
        }else {
          values.manualDoc = null
        }
        if(values.checkCode){
          values.checkType = values.checkCode.type
          values.checkCode = values.checkCode.code
        }
        delete values.manualDocs
        values.publishDate = new Date(values.publishDate).getTime()
        if (from === 'feature') {
          values.featureLibraryVersion = values.version
          values.featureLibraryName  = values.name
          values.featureLibraryNumber   = values.number
          values.summary = values.describ
          values.categoryId = values.categoryModel
          values.publishTime = values.publishDate
          values.useDirection = values.manualDoc
          values.versionLibraryStatus  = values.status
          delete values.status
          delete values.name
          delete values.version
          delete values.number
          delete values.describ
          delete values.categoryModel
          delete values.publishDate
          delete values.manualDoc
        }else {
          values.upgradePackageStatus  = values.status
          delete values.status
        }
        text = '变更'
        if(type === 'add' || type === 'again'){
          text = '登记'
        }
        //变更添加id
        if (type !== 'add') {
          values.stringId = id
        }

        if (from === 'version') {
          url = type === 'add' ? 'safeSingle' : 'safeUpdate'
        } else {
          url = type === 'add' ? 'featureSave' : 'featureUpdate'
        }

        api[url](values).then(response => {
          if(response && response.head && response.head.code === '200' ){
            Message.success(`${text}成功`)
            // this.goToBack(type)
            const { onOk } = this.props
            onOk && onOk(type)
          }
        }).catch(() => {})
      }
    })
  }

  //过滤提交的文件
  getFiles = (data = []) => {
    let list = []
    data.forEach(item => {
      if (item.response) {
        list.push(item.response.body[0])
      } else {
        list.push(item)
      }})
    return list
  }
  //包文件上传
  /**
   * @param fileList
   * @param status fail 失败， done，成功 uploading：上传中
   */
  uploadFile = (fileList, status) => {
    this.packageUpdating = status
    const { type } = this.urlParams
    // 删除上传文件时,登记时可用删除，变更时不能删除文件，只是提交时不上传说明书
    if(!fileList.length && 'isChange' !== type){
      const { fileList: upFileList } = this.state
      this.deleteFile(upFileList, '删除包文件成功', ()=>{
        this.props.form.resetFields(['filepaths'] )
      })
    }
    this.setState({
      fileList: fileList
    })
    if(status === 'done'){
      this.props.form.setFieldsValue({ filepaths: fileList } )
    }
  }

  /**
   * 删除上传的说明书文件、安装包
   */
  deleteFile = (fileList = [], msg = '', callback) => {
    const formData = new FormData()
    const list = fileList.filter((e)=>{
      return  e.response && e.response.head && e.response.head.code === '200'
    })
    if(list.length === fileList.length && fileList.length){
      formData.append('delUrls', fileList.map((e)=> {
        return e.response.body.map((it)=>it.fileUrl)
      }))
      fileList.length && api.deleteFile(formData).then((res)=>{
        if(res.head && res.head.code === '200'){
          callback()
          Message.success(msg)
        }
      })
    }
  }
  //说明书上传
  uploadDoc = (fileList, status) => {
    this.docUpdating = status
    const { type } = this.urlParams
    // 删除上传文件时,登记时可用删除，变更时不能删除文件，只是提交时不上传说明书
    if(!fileList.length && 'isChange' !== type){
      const { manualDoc } = this.state
      this.deleteFile(manualDoc, '删除说明书成功', ()=>{
        this.props.form.setFieldsValue({ manualDoc: [] })
      })
    }
    if(status === 'done'){
      this.props.form.setFieldsValue({ manualDoc: fileList } )
    }
    this.setState({
      manualDoc: fileList
    })
  }
  //查询详情
  queryPackageDetail = () => {
    const { id, from } = this.urlParams
    const url = from === 'version' ? 'queryPackageDetail' : 'featureQueryId'
    api[url]({
      primaryKey: id
    }).then(response => {
      const form = this.props.form
      if(response && response.head && response.head.code === '200' ){
        let data = from === 'feature' ? response.body.featureLibraryResponse : response.body.safetyUpgradePackageResponse
        try {
          data.filepath = strUnescape(data.filepath)
          data.filepath = JSON.parse(data.filepath) || []
        }catch (e) {
          data.filepath = []
        }
        const supplierList = []
        const nameList = []
        const versionList = []
        let fieldValue = {}
        let { relatedAssetManufacturer, relatedAssetName, businessId, relatedAssetVersion } = data || {}
        supplierList.push({ label: relatedAssetManufacturer, value: relatedAssetManufacturer })
        nameList.push({ label: relatedAssetName, value: relatedAssetName })
        versionList.push({ label: relatedAssetVersion, value: businessId })
        //特征库
        if (from === 'feature') {
          const { featureLibraryName, featureLibraryVersion, featureLibraryNumber, summary, publishTime, installTypeCode, featureLibraryStatusCode } = data
          try {
            data.useDirection = strUnescape(data.useDirection)
            // 转换成数据
            data.manualDoc = JSON.parse(data.useDirection) || []
          }catch (e) {
            data.manualDoc = []
          }
          fieldValue = {
            status: featureLibraryStatusCode,
            name: featureLibraryName,
            describ: summary,
            supplier: relatedAssetManufacturer,
            relevanceName: relatedAssetName,
            businessId: businessId,
            installType: installTypeCode,
            number: featureLibraryNumber,
            version: featureLibraryVersion,
            publishDate: publishTime ? moment(publishTime) : null
          }
        //版本
        } else {
          const { name, describ, publishDate, installType, number, version, upgradePackageStatus } = data
          try {
            data.manualDoc = strUnescape(data.manualDoc)
            // 转换成数据
            data.manualDoc = JSON.parse(data.manualDoc) || []
          }catch (e) {
            data.manualDoc = []
          }
          fieldValue = {
            status: upgradePackageStatus,
            name,
            supplier: relatedAssetManufacturer,
            relevanceName: relatedAssetName,
            businessId: businessId,
            describ,
            installType,
            number,
            version,
            publishDate: publishDate ? moment(publishDate) : null
          }
        }
        setTimeout(()=>{
          form.setFieldsValue(fieldValue)
        }, 1000)
        //展示已上传的文件
        this.setState({
          supplierList,
          nameList,
          versionList,
          //获取文件详情
          fileList: (data.filepath || []).map((item, index) => {
            return {
              uid: index,
              name: item.originFileName,
              currFileName: item.currFileName,
              fileSize: item.fileSize,
              fileUrl: item.fileUrl,
              md5: item.md5,
              originFileName: item.originFileName
            }
          }),
          manualDoc: (data.manualDoc || []).map((item, index) => ({
            uid: index,
            name: item.originFileName,
            currFileName: item.currFileName,
            fileSize: item.fileSize,
            fileUrl: item.fileUrl,
            md5: item.md5,
            originFileName: item.originFileName
          })),
          data
        })
      }
    }).catch(err => {
      console.log(err)
    })
  }
  /**
   * 点击返回按钮，
   */
  willBack = () => {
    // 包 或者 说明书正在上传时，弹出确认对话框
    if(this.docUpdating === 'uploading' || this.packageUpdating === 'uploading'){
      this.setState({ confirm: true })
    }else { // 没有上传时，直接返回
      this.goToBack()
    }
  }
  /**
   * 生成验证规则
   * @param max 最多字符数
   * @param rules {Array} 验证规则
   * @returns {*[]}
   */
  generateRules = (max = 30, rules = []) => {
    return [
      { max, message: `最多输入${max}字符！` },
      { whitespace: true, message: '不能为空字符！' },
      ...rules
    ]
  }
  goToBack = (type) => {
    const { onCancel } = this.props
    onCancel && onCancel(false, type)
  }
  validatorCode = (rule, value = {}, callback) => {
    const obj = { pattern: regExp.MD5Regex, message: 'MD5值格式错误，只能是32位大小写字母或者数字' }
    if(!value.code){
      callback('请输入校验码')
    }else if(!obj.pattern.test(value.code)){
      callback(obj.message)
    }
    callback()
  }
  /**
   * 获取厂商列表数据
   */
  getSupplierList = () => {
    return api.getSafetySupplier().then(res=>{
      const supplierList = (res.body || []).map(e=>({ label: e.val, value: e.val }))
      this.setState({ supplierList })
      return res
    })
  }
  /**
   * 获取名称列表数据
   */
  getNameList = (params) => {
    return api.getSafetyName(params).then(res=>{
      const nameList = (res.body || []).map(e=>({ label: e.val, value: e.val }))
      this.setState({ nameList })
      return res
    })
  }
  /**
   * 获取版本列表数据
   */
  getVersionList = (params) => {
    return api.getSafetyVersion(params).then(res=>{
      const versionList = (res.body || []).map(e=>({ label: e.val, value: e.businessId }))
      this.setState({ versionList })
      return res
    })
  }
  /**
   * 关联设备的厂商、名称、版本选择
   **/
  onSelect = (type, key) => {
    const {  form } = this.props
    const { supplier } = this.state || {}
    let _value = {}
    if(type === 'supplier'){
      key && this.getNameList({ supplier: [key] })
      _value = { relevanceName: void 0, businessId: void 0 }
    }else if(type === 'relevanceName'){
      key && this.getVersionList({ supplier: [ supplier ], name: [key] })
      _value = { supplier, relevanceName: key, businessId: void 0 }
    }else if(type === 'businessId'){
      //
    }
    form && form.setFieldsValue(_value)
    this.setState({ [type]: key })
  }
  render () {
    const { fileList, manualDoc, confirm, data: { checkCode, checkType }, supplierList, nameList, versionList } = this.state
    const { type, from } = this.urlParams
    const versionText = from === 'version' ? '升级包版本' : '特征库版本'
    const title = this.generateTitle()
    function disabledPublishDate (current) {
      return current > moment().endOf('day')
    }
    const uploadFilepath = {
      accept: uploadFileType.map((e)=>('.' + e)).join(','),
      action: '/api/v1/safety/file/upload',
      headers: createHeaders(),
      onChange: this.uploadFile,
      name: 'fileList',
      fileList,
      showUploadList: false,
      data: {
        fileUse: 'INSTALL_PACKAGE',
        md5: this.getMD5Value()
      },
      precondition: [{ key: 'MD5', value: this.getMD5Value(), required: true, msg: '请输入MD5值' }, { key: 'MD5', value: this.getMD5Value(), pattern: regExp.MD5Regex, msg: 'MD5值格式错误，只能是32位大小写字母或者数字' }],
      beforeUpload: (file) => { return this.beforeUpload(file, this.upgradePackage, 'package')}
      // fileList
    }
    const uploadDoc = {
      accept: '.7z,.rar,.tar,.zip,.pdf,.doc,.docx,.png,.jpg.txt',
      action: '/api/v1/safety/file/upload',
      headers: createHeaders(),
      onChange: this.uploadDoc,
      multiple: false,
      name: 'fileList',
      fileList: manualDoc,
      showUploadList: false,
      data: {
        fileUse: 'INSTALL_INTRODUCE_MANUAL'
      },
      beforeUpload: (file) => { return this.beforeUpload(file, this.upgradePackageInstructions, 'doc') }
    }
    // 版本号、设备资产类型禁用
    const disabledTypes = ['again', 'isChange']
    // 安装包、MD5值禁用
    const _disabledTypes = ['isChange']
    // 正规一行2列字段
    const fields1 = [
      { type: 'hidden', key: 'status', name: '' }, // 版本/特征库状态
      { type: 'input', key: 'name', name: '名称', rules: [{ required: true,  message: '请输入名称' },  ...this.generateRules()] },
      { type: 'input', key: 'version', name: versionText, disabled: disabledTypes.includes(type), rules: [{ required: true,  message: '请输入当前版本号' }, ...this.generateRules(8, [{ pattern: regExp.versionFormat, message: '格式为x|xx.x|xx.x|xx，x为数字' }])] }

    ]
    const fields2 = [
      { type: 'select', key: 'supplier', disabled: type !== 'add', name: '厂商', showSearch: true, placeholder: '请选择', data: supplierList, onChange: (key)=>this.onSelect('supplier', key), rules: [{ required: true, message: '请选择厂商！' }] },
      { type: 'select', key: 'relevanceName', disabled: type !== 'add', name: '名称', showSearch: true, placeholder: '请选择', data: nameList, onChange: (key)=>this.onSelect('relevanceName', key), rules: [{ required: true, message: '请选择名称！' }] },
      { type: 'select', key: 'businessId', disabled: type !== 'add', name: '版本', showSearch: true, placeholder: '请选择', data: versionList, onChange: (key)=>this.onSelect('businessId', key), rules: [{ required: true, message: '请选择版本！' }] }
    ]
    const fields3 = [
      { type: 'input', key: 'number', name: '升级包序列号', rules: [ ...this.generateRules(), { pattern: regExp.serialNumberPattern, message: '请输入数字或英文字符' } ] },
      { type: 'select', key: 'installType', name: '安装方式', placeholder: '请选择', defaultValue: 'MANUAL',  data: [ { label: '人工', value: 'MANUAL' }, { label: '自动', value: 'AUTO_MATIC' }] },
      { type: 'date', key: 'publishDate', name: '发布时间', disabledDate: disabledPublishDate },
      { type: 'textArea', key: 'describ', rows: 4, name: '摘要', placeholder: '请输入摘要(不能超过300个字符)', rules: [...this.generateRules(300)] }
    ]
    const manualDocsText = '安装说明书'
    // 一行1列字段
    const fieldsOther = [
      { type: '', key: 'checkCode', rules: [{ required: true,  message: '请选择校验方式' }, { validator: this.validatorCode }], defaultValue: { type: checkType || 'MD5', code: checkCode }, name: '校验方式', placeholder: '请输入序列号', component: <CheckTypeAndCode types={['MD5']} onChange={(v) => { this.setState({ checkCode: v })}} disabled={_disabledTypes.includes(type) || (this.packageUpdating === 'uploading' || this.packageUpdating === 'done')}/> },
      { type: '', key: 'filepaths', name: '包文件', defaultValue: fileList, rules: [{ required: true,  message: '请选择包文件' } ], component: _disabledTypes.includes(type) ? <div style={{
        textOverflow: 'ellipsis',
        overflow: 'hidden',
        whiteSpace: 'nowrap'
      }}>

        <Tooltip title={fileList.map((e)=>e.name || <span style={{ color: 'red' }}>上传文件时发生错误</span>)}>
          {fileList.map((e)=>e.name || <span style={{ color: 'red' }}>上传文件时发生错误</span>)}
        </Tooltip>
      </div> : <UploadFile cancelFile upload={uploadFilepath} text={'格式：' + uploadFileType.join('、') +  '，大小：5G'} fileList={fileList} serverConfigChecking={true}/> },
      { type: '', key: 'manualDocs', defaultValue: manualDoc, name: manualDocsText, component: <UploadFile upload={uploadDoc} text={'格式：rar、zip、7z、doc、docx、pdf、jpg、png、txt，大小：200M'} fileList={manualDoc} /> }
    ]
    const formLayout = {
      labelCol: {
        span: 8
      },
      wrapperCol: {
        span: 12
      }
    }
    const innerIpInfo = {
      visible: confirm,
      onOk: this.goToBack,
      onCancel: ()=>this.setState({ confirm: false }),
      children: (<p className="model-text">您有文件正在传输，现在离开终止传输，是否放弃？</p>)
    }
    return (
      <Modal maskClosable={false} title={title} className="safe-version-register-modal over-scroll-modal" visible={true} width={650} footer={null} onCancel={this.willBack}>
        { confirm ? <ModalConfirm props={innerIpInfo}/> : null }
        <Form className="safe-form" onSubmit={this.handleSubmit}>
          <div className="form-content">
            <RegisterForm fields={fields1} column={1} form={this.props.form} FormItem={Item} formLayout={formLayout}/>
            <div className="safe-form-equ">
              <div className="safe-form-equ-label">关联设备</div>
              <RegisterForm fields={fields2} column={1} form={this.props.form} FormItem={Item} formLayout={formLayout}/>
            </div>
            <RegisterForm fields={fields3} column={1} form={this.props.form} FormItem={Item} formLayout={formLayout}/>
            <RegisterForm fields={fieldsOther} column={1} form={this.props.form} FormItem={Item} formLayout={formLayout}/>
          </div>

          <div className="Button-center">
            <div>
              <Button type='primary' htmlType='submit' disabled={this.generateSubmitBtnDisabled()}>提交</Button>
              <Button className="back-btn" type='primary' ghost onClick={this.willBack}>取消</Button>
            </div>
          </div>
        </Form>
      </Modal>
    )
  }
}
const SafeRegisterForm = Form.create()(SafeRegister)
export default SafeRegisterForm
