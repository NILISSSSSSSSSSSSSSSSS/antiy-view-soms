import { Component, default as React } from 'react'
import { Collapse, Form, message } from 'antd'
import moment from 'moment'
import BaseInfo from '@c/Asset/AssetRegister/BaseInfo'
import Template from '@c/Asset/AssetCommon/Template'
import Subassembly from '@c/Asset/AssetRegister/Subassembly'
import Maintenance from '@c/Asset/AssetRegister/Maintenance'
import Operation from '@c/common/Operation'
import Loading from '@/components/common/Loading'
import { HARD_ASSET_TYPE, ASSET_STATUS, DISK, AUTO, COMPUTING_DEVICE, STORAGE_DEVICE, NETWORK_DEVICE, SAFETY_DEVICE, OTHER_DEVICE, MANUAL_REGISTER } from '@a/js/enume'
import { analysisUrl } from '@/utils/common'
import { debounce } from 'lodash'
import Tooltip from '@/components/common/CustomTooltip'
import './index.less'
import api from '../../../../services/api'
import { download } from '../../../../utils/common'

const { Panel } = Collapse
const Item = Form.Item
const baseTemplate = 'baseTemplate'
const categoryModel = 'categoryModel'
const disk = 'disk'
const software = 'software'
const APPEAR = 'appear'
// 这几个设备有操作系统，没有选择操作系统时，无法选择模板
const disabledTemplateAssetType = [ COMPUTING_DEVICE ].map(e => e.value)
// 默认到期时间
const serviceLife = moment('2049-12-31')
@Form.create()
export default class AssetRegister extends Component {
  constructor (props) {
    super(props)
    const { source, register, id: primaryKey, categoryModel: _categoryModel, retirement } = analysisUrl(props.location.search)
    const categoryModel = parseInt(_categoryModel, 10)
    this.source = source
    this.retirement = retirement === 'true'
    this.register = register
    this.primaryKey = primaryKey
    this.isShowNextStep = {
      categoryModel: source === APPEAR && categoryModel === COMPUTING_DEVICE.value, // 上报计算机资产时，
      [baseTemplate]: false,
      [software]: false,
      [disk]: false
    } // 是否显示下一步操作
    this.subassemblyList = [] // 新增的组件列表
    this.assetGroupList = [] // 维护组件内部的资产组列表
    this.state = {
      preNodeInfo: {}, // 上一步驳回信息
      submitLoading: false, // 提交时的loading
      activeKey: ['1', '2'],
      defaultValueSubassemblyList: [], // CPE版本自带的组件列表
      baseInfo: {
        categoryModel: register === 'new' ? COMPUTING_DEVICE.value : categoryModel // 默认是计算设备,再次登记时采用的是资产的型号
      },
      templates: []
    }
  }

  componentDidMount () {
    if(this.register === 'again' || this.register === 'new' && this.primaryKey){
      this.getAssetData(this.primaryKey)
      this.getPreNodeInfo([this.primaryKey])
      if(this.register === 'new' && this.primaryKey && this.source === APPEAR){
        this.isShowNextStep[categoryModel] = true
      }
    }else {
      this.isShowNextStep[categoryModel] = true
    }
  }

  /**
   * 获取该资产上一步的驳回信息
   * @param ids
   */
  getPreNodeInfo = (ids) => {
    api.getPreNoteInfo({ ids }).then(res=>this.setState({ preNodeInfo: (res.body || []).length ? res.body[0] : {} }))
  }
  getAssetData = (primaryKey) => {
    api.getAssetHardWareById({ primaryKey }).then((res)=>{
      if(res && res.head && res.head.code === '200'){
        const { asset, assetNetworkEquipment, assetSafetyEquipment, assetStorageMedium, ...other } = res.body
        const data = { ...assetStorageMedium, ...assetSafetyEquipment, ...assetNetworkEquipment, ...asset, ...other }
        this.setState({ assetData: res.body, backUpAssetData: res.body, baseInfo: { ...data } })
      }
    })
  }
  /**
   * 提交登记事件
   * @param nextStep
   */
  onSubmit = debounce((nextStep) => {
    this.props.form.validateFields((err, values) => {
      const { baseInfo } = this.state
      let tempErr = false
      if(this.templateVerificationFuc && baseInfo.categoryModel === COMPUTING_DEVICE.value){
        tempErr = this.templateVerificationFuc()
      }else {
        if(baseInfo.categoryModel === COMPUTING_DEVICE.value){
          tempErr = true
        }
      }
      if(tempErr){
        // 模板没有选择时，展开模板
        const { activeKey } = this.state
        if(!activeKey.includes('2')){
          this.setState({ activeKey: [].concat(activeKey, '2') })
        }
      }
      if(err || tempErr) {
        message.error('请填写必填信息')
        return
      }
      let data = {}
      // 计算设备
      if(baseInfo.categoryModel === COMPUTING_DEVICE.value){
        data = this.generateComputingDeviceData(values)
      }else if(baseInfo.categoryModel === NETWORK_DEVICE.value) { // 网络设备
        data = this.generateNetWorkData(values)
      }else if(baseInfo.categoryModel === SAFETY_DEVICE.value) { // 安全设备
        data = this.generateSafetyData(values)
      }else if(baseInfo.categoryModel === STORAGE_DEVICE.value) { // 存储设置
        data = this.generateStorageData(values)
      }else if(baseInfo.categoryModel === OTHER_DEVICE.value) { // 其他设备
        data = this.generateOtherData(values)
      }
      // data.asset.stepNode = null
      if(Object.values(this.isShowNextStep).find(e=>e)){
        // 设置工作流
        const key = nextStep.nextStep === 'safetyCheck' ? 'safetyCheckUser' : 'templateImplementUser'
        data.manualStartActivityRequest = { formData: { [key]: nextStep.nextExecutor.join(','), admittanceResult: nextStep.nextStep } }
        data.asset.stepNode = nextStep.nextStep
        // 没有选择下一步执行人时，给出提示
        if(!nextStep.nextExecutor.length){
          message.info('没有选择执行人，请选择执行人！')
          return
        }
      }
      data.assemblyRequestList =  this.subassemblyList || []
      // 非存储设备时，包含IP和MAC
      if(baseInfo.categoryModel !== STORAGE_DEVICE.value){
        data.ipRelationRequests =  (baseInfo.ip || []).filter(e=>(e.ip)).map(({ ip, net })=>({ ip, net })) // ip\网口列表
        data.macRelationRequests =  (baseInfo.mac || []).filter(e=>e.mac).map(({ mac })=>({ mac })) // mac列表
      }
      /**
       * 到期时间不能早于购买时间
       */
      if(data.asset.buyDate && data.asset.serviceLife < data.asset.buyDate){
        message.info('到期时间不能早于购买时间！')
        return
      }
      this.assetRegister(data)
    })
  }, 800)
  /**
   * 资产登记
   * @param params
   */
  assetRegister = (params) => {
    this.setState({ submitLoading: true })
    // 未知资产 登记时
    if(this.register === 'again' || this.source === APPEAR){ // 上报资产、未知资产再次登记时，走变更接口
      const { assetData } = this.state
      const { asset, ...other } = params
      // 登记时，都要触发漏洞扫描（不区分新线上、线下、首次登记、再次登记）
      let obj = { needScan: true }
      // 流程变更时
      if(assetData.asset.waitingTaskReponse && asset.categoryModel === COMPUTING_DEVICE.value){
        obj.activityHandleRequest = other.manualStartActivityRequest
        obj.activityHandleRequest.taskId = assetData.asset.waitingTaskReponse ? assetData.asset.waitingTaskReponse.taskId : null
        delete other.manualStartActivityRequest
      }
      let disabledData = {}
      // 再次登记时，这些数据不可修改,或者界面隐藏改字段，实际要传递给后端的数据
      if(this.register === 'again'){
        disabledData = {
          // categoryModel: assetData.asset.categoryModel, //资产类型
          // manufacturer: assetData.asset.manufacturer, // 厂商
          // name: assetData.asset.name, // 名称
          // number: assetData.asset.number, // 资产编号
          // version: assetData.asset.version // 版本
          // 隐藏的字段
          assetSourceName: assetData.asset.assetSourceName,  // 资产来源
          assetSource: assetData.asset.assetSource // 资产来源
        }
      }
      const _params = {
        asset: {
          ...asset,
          ...disabledData
        },
        ...other,
        ...obj,
        // 再次登记时，如果是计算设备变更为非计算设备，并且是代办任务，则需要删除代办任务，否则不予处理
        cancelWaitingTask: assetData.asset.categoryModel === asset.categoryModel && asset.categoryModel === COMPUTING_DEVICE.value ? null : assetData.asset.waitingTaskReponse,
        assemblyRequestList: params.assemblyRequestList || []
      }
      api.changAsset(_params).then((res)=>{
        if(res.body && asset.nextStep === 'safetyCheck'){
          message.success(res.body)
        }else {
          message.success('资产登记成功')
        }
        const { push } = this.props.history
        push('/asset/manage')
        this.setState({ submitLoading: false })
      }).catch((err)=>{
        this.setState({ submitLoading: false })
        if(err === '资产已登记，无法重复提交！'){
          const { push } = this.props.history
          setTimeout(()=>{
            push('/asset/manage')
          }, 500)
        }
      })
    }else if(this.register === 'new'){ // 正常登记资产，登记时走登记接口
      // 新登记，需要漏洞扫描
      let obj = { needScan: true }
      api.saveAsset({ ...params, ...obj }).then((res)=>{
        if(res.body && params.asset.nextStep === 'safetyCheck'){
          message.success(res.body)
        }else {
          message.success('资产登记成功')
        }
        this.setState({ submitLoading: false })
        const { push } = this.props.history
        push('/asset/manage')
      }).catch(()=>{
        this.setState({ submitLoading: false })
      })
    }
  }
  /**
   * 生成计算设备提交数据
   */
  generateComputingDeviceData = (values) => {
    const { templates } = this.state
    return {
      asset: {
        ...this.generateAllDeviceCommonData(values),
        baselineTemplateId: templates[0] ? templates[0].stringId : null, // 基准模板ID
        installTemplateId: templates[1] ? templates[1].stringId : null, //装机模板ID
        operationSystem: values.operationSystem, // 操作系统
        operationSystemName: values.operationSystemName // 操作名称
      },
      assemblyRequestList: (this.subassemblyList || []).map(({ businessId, amount })=>({ businessId, amount })) // 关联组件列表
    }
  }
  /**
   * 生成网络设备提交数据
   */
  generateNetWorkData = (values) => {
    return {
      asset: {
        ...this.generateAllDeviceCommonData(values)
      },
      networkEquipment: {
        cpuSize: values.cpuSize, // cpu大小
        cpuVersion: values.cpuVersion, // cpu版本
        dramSize: values.dramSize, // DRAM大小
        expectBandwidth: values.expectBandwidth, // 预计带宽(M)
        firmwareVersion: values.firmwareVersion, // 固件版本
        flashSize: values.flashSize, // flash大小
        interfaceSize: values.interfaceSize, // 接口数量
        ios: values.ios, //
        isWireless: parseInt(values.isWireless || 0, 10), // 是否无线
        ncrmSize: values.ncrmSize, // NCRM大小
        outerIp: values.outerIp, // 外网IP
        portSize: values.portSize, // 网口数据
        register: values.register, // 配置寄存器(GB)
        subnetMask: values.subnetMask // 子网掩码
      }
    }
  }
  /**
   * 生成安全设备提交数据
   */
  generateSafetyData = (values) => {
    const { assetData = {} } = this.state
    return {
      asset: {
        ...this.generateAllDeviceCommonData(values),
        operationSystem: values.operationSystem, // 操作系统
        operationSystemName: values.operationSystemName // 操作名称
      },
      safetyEquipment: {
        assetId: assetData.asset ? assetData.asset.stringId : null,
        newVersion: values.newVersion // 软件版本
      }
    }
  }
  /**
   * 生成存储设备提交数据
   */
  generateStorageData = (values) => {
    const { assetData = {} } = this.state
    return {
      asset: {
        ...this.generateAllDeviceCommonData(values)
      },
      assetStorageMedium: {
        assetId: assetData.asset ? assetData.asset.stringId : null,
        averageTransferRate: values.averageTransferRate, // 平均数率
        diskNumber: values.diskNumber, // 单机磁盘数
        driverNumber: values.driverNumber, // 单机磁盘数
        firmwareVersion: values.firmwareVersion, // 固件版本
        highCache: values.highCache, // 高数缓存
        innerInterface: values.innerInterface, // 内置接口
        maximumStorage: values.maximumStorage, // 最大存储量
        osVersion: values.osVersion, // os版本
        raidSupport: values.raidSupport // RAID支持
      }
    }
  }
  /**
   * 生成其他设备提交数据
   */
  generateOtherData = (values) => {
    return {
      asset: this.generateAllDeviceCommonData(values)
    }
  }
  /**
   * 生成所有设备通用数据,返回通用数据 asset的对象
   * @return {Object}
   */
  generateAllDeviceCommonData = (values) => {
    const { baseInfo, assetData } = this.state
    return  {
      id: (this.register === 'again' || this.source === APPEAR && this.register === 'new') ? assetData.asset.stringId : void 0, // 再次登记时有资产ID
      categoryModel: values.categoryModel, //资产类型
      categoryModelName: (HARD_ASSET_TYPE.find(e => values.categoryModel === e.value) || {}).name,
      areaId: values.areaId, //区域
      describle: values.describle, //描述
      houseLocation: values.houseLocation, //机房位置
      importanceDegree: values.importanceDegree, //重要程度
      installType: values.installType || AUTO.value, // 安装方式
      manufacturer: values.manufacturer, // 厂商
      name: values.name, // 名称
      number: values.number, // 资产编号
      responsibleUserId: values.responsibleUserId, // 责任人、使用者
      serial: values.serial, // 序列号
      serviceLife: values.serviceLife ? values.serviceLife.valueOf() : serviceLife.valueOf(), // 到期时间
      version: baseInfo.version, // 版本
      warranty: values.warranty, // 保修期
      assetGroups: (values.assetGroups || []).map(e=>{
        const { id, value: name } = this.assetGroupList.find(group => group.id === e) || {}
        return { id, name }
      }), // 资产组
      businessId: baseInfo.businessId, // 版本的ID
      buyDate: values.buyDate ? values.buyDate.valueOf() : null // 购买时间
    }
  }
  baseChange = (baseInfo) => {
    const { baseInfo: oldBaseInfo } = this.state
    const newData = { ...oldBaseInfo, ...baseInfo }
    this.isShowNextStep[categoryModel] = false
    this.isShowNextStep[baseTemplate] = false
    // 计算设备时，需要走配置
    if(COMPUTING_DEVICE.value === newData.categoryModel){
      this.isShowNextStep[categoryModel] = true
    }
    // 计算设备操作系统变更了，要走配置流程
    if(oldBaseInfo.operationSystem !== newData.operationSystem && newData.categoryModel === COMPUTING_DEVICE.value){
      this.isShowNextStep[baseTemplate] = true
    }
    // 切换资产类型，恢复初始数据
    if(oldBaseInfo.categoryModel !== baseInfo.categoryModel){
      // 非新登记资产时，切换资产类型要恢复初始数据
      if(this.register !== 'new'){
        const { assetData } = this.state
        const { asset, assetNetworkEquipment, assetSafetyEquipment, assetStorageMedium, ...other } = assetData
        const data = { ...assetStorageMedium, ...assetSafetyEquipment, ...assetNetworkEquipment, ...asset, ...other }
        this.setState({ baseInfo: { ...data, stringId: data.stringId, categoryModel: baseInfo.categoryModel } })
        // 计算设备切换为非计算设备时，需要清空模板信息
        if(baseInfo.categoryModel !== COMPUTING_DEVICE.value){
          this.setState({ templates: [] })
        }
      }else {
        // 新登记时，清空已输入的数据
        this.subassemblyList = []
        this.setState({ baseInfo: { categoryModel: baseInfo.categoryModel }, templates: []  })
      }

    }else {
      // 没有切换类型，保存现有数据
      this.setState({ baseInfo: newData })
    }
    // 版本变更时，重新带出CPE的组件
    if(baseInfo.businessId && baseInfo.businessId !== oldBaseInfo.businessId){
      this.getCPEAssemblyList(baseInfo.businessId)
    }else if(!baseInfo.businessId) {
      this.setState({ defaultValueSubassemblyList: [] })
    }
  }
  /**
   * 模板变更时
   * @param templates{Array} [Object] 选择的模板对象列表
   * @param callback{Function} 验证模板必选的是否已经选择完成，返回Boolean
   */
  templateChange = (templates = [], callback) => {
    this.templateVerificationFuc = callback
    this.isShowNextStep[baseTemplate] = !!templates[0]
    this.setState({ templates })
  }
  renderTemplateHeader = () => {
    return (
      <div>
        模板信息
        <span className="asset-register-template-header">(请选择操作系统)</span>
      </div>
    )
  }
  /**
   * 渲染被上一步驳回的驳回信息
   */
  renderFrontStep = () => {
    const { preNodeInfo: { note, fileInfo, originStatus } } = this.state
    if(!note){
      return null
    }
    const arr = fileInfo ? JSON.parse(fileInfo) : []
    return (
      <div className="font-step-info">
        <div className="font-step-info-note-box">
          <div className="font-step-info-label">
            {(ASSET_STATUS.find(e=>e.value === originStatus) || {}).text + '备注:'}
          </div>
          <div className="font-step-info-note">{ note.length > 100 ? <Tooltip title={note}/> : note || '' }</div>
        </div>
        <div className="font-step-info-adjunct-box">
          <div className="font-step-info-label">
            附件：
          </div>
          <div className="font-step-info-adjunct">
            {
              arr.map((file, i)=>(<div key={i}  >
                <span className="picture" onClick={()=>{download('/api/v1/file/download', file)}}>{ file.fileName.length > 100 ? <Tooltip title={file.fileName}/> : file.fileName || '' }</span>
              </div>))
            }
          </div>
        </div>
      </div>
    )
  }
  /**
   * 生成模板是否被禁用
   * @return Boolean
   * */
  generatorDisabled = (type, operationSystem) => {
    if(type === SAFETY_DEVICE.value) { //安全设备时，模板可用
      return false
    } else if(!disabledTemplateAssetType.includes(type)) { // 非计算设备时，模板可用
      return false
    }
    return !(operationSystem && type) || !operationSystem && disabledTemplateAssetType.includes(type)
  }
  collapseOnChange = (key) => {
    const { activeKey } = this.state
    if(activeKey.includes(key)){
      this.setState({ activeKey: activeKey.filter(e=> e !== key) })
    }else {
      this.setState({ activeKey: [ ...activeKey, key ] })
    }
  }

  renderPanderHeader = (header, key) => {
    const { activeKey } = this.state
    const isActive = activeKey.includes(key)
    return (
      <div className="custom-panel-header">
        <div>
          { header }
        </div>
        {
          key && <div className="custom-panel-header-unfold" onClick={ ()=>this.collapseOnChange(key) }>
            { !isActive ? '展开' : '收起' }
          </div>
        }
      </div>
    )
  }
  /**
   * 组件内容发生变化
   * @param list
   * @param addList
   * @param removeList
   * @param changeList
   * @param originalList
   */
  subassemblyChange = (list, addList = [], removeList = [], changeList = [], originalList) => {
    this.subassemblyList =  list
    this.isShowNextStep[disk] = false
    const { baseInfo: { categoryModel } } = this.state
    // 新登记资产或者资产类型不是计算设备的，组件变更不再引发流程
    if(this.register === 'new' || categoryModel !== COMPUTING_DEVICE.value){
      return
    }
    // 删除了组件的情况
    for(let i = 0, len = removeList.length; i < len; ++i) {
      const it = removeList[ i ]
      // 新添加硬盘或者硬盘数量被修改时,则显示下一步操作
      if(it.type === DISK.value) {
        this.isShowNextStep[ disk ] = true
        break
      }

    }
    for(let i = 0, len = list.length; i < len; ++i){
      const it = list[i]
      const obj = originalList.find(e=>e.businessId === it.businessId)
      // 新添加硬盘或者硬盘数量被修改时,则显示下一步操作
      if(it.type === DISK.value){
        // 新添加组件为硬盘，但是原始数据没有该组件的时候
        // 新添加组件为硬盘，但是数量被修改了
        if(!obj || it.originalAmount !== it.amount){
          this.isShowNextStep[disk] = true
          break
        }
      }
    }
    this.setState({ count: Math.random() })
  }
  /**
   *通过CPE的版本查询出组件
   * @param businessId 版本的businessId
   *  */
  getCPEAssemblyList = (businessId) => {
    return api.getCPEAssemblyList({ businessId }).then((res)=>{
      this.setState({ defaultValueSubassemblyList: res.body })
    }).catch(()=>{
    })
  }
  /**
   * 资产组数据列表是维护组件内部的请求，需要重子组件获取改列表
   */
  getAssetGroup = (list = []) => {
    this.assetGroupList = list
  }
  render () {
    const { baseInfo, activeKey, assetData, defaultValueSubassemblyList, submitLoading } = this.state
    const { categoryModel, operationSystem, areaId } = baseInfo
    let  action = 'REGISTER'
    const data = baseInfo
    const { asset = {}, assetNetworkEquipment, assetSafetyEquipment, assetStorageMedium, ...other } = assetData || {}
    const backData = { ...assetStorageMedium, ...assetSafetyEquipment, ...assetNetworkEquipment, ...asset, ...other }
    const hasFields = Object.values(this.isShowNextStep).find(e=>e) ? ['nextExecutor', 'nextStep'] : [] // 为undefined 没有时，采用内部默认，为空数组时，这不显示下一步
    let source = this.source
    let defaultValue = void 0
    if(hasFields.length){
      // 上报来的资产，需要走流程时，只能走安全检查
      if((this.source === APPEAR || this.source === 'register' && this.register === 'again') && asset.assetSource !== MANUAL_REGISTER.value){
        defaultValue = 'safetyCheck'
        source = APPEAR
      }else {
        if(this.source === APPEAR && this.register === 'new'){
          defaultValue = 'safetyCheck'
        }
      }
    }
    return (
      <div className="main-table-content asset-register-container">
        <Loading loading={submitLoading}/>
        { this.renderFrontStep() }
        <Collapse activeKey={ activeKey } className="custom-collapse" bordered={false} expandIcon={()=>null}>
          <Panel header={ this.renderPanderHeader('基础信息', null) } key="1">
            <BaseInfo
              register={this.register}
              retirement={this.retirement}
              form={ this.props.form }
              source={source}
              Item={ Item }
              categoryModel={categoryModel}
              onChange={ this.baseChange }
              data={data}
              assetData={backData}
              action={ action }/>
          </Panel>
          {
            // 只有计算设备才有模板选择
            categoryModel === COMPUTING_DEVICE.value &&
            <Panel header={ this.renderPanderHeader(this.renderTemplateHeader(), '2') } key="2">
              {/*操作系统和资产型号都没有是，模板是禁止选择的*/ }
              <Template
                form={ this.props.form }
                operationSystem={ operationSystem }
                Item={ Item }
                action={action}
                data={data}
                type={ categoryModel }
                disabled={ this.generatorDisabled(categoryModel, operationSystem) }
                onChange={ this.templateChange }
              />
            </Panel>
          }
          <Panel header={this.renderPanderHeader('组件信息', '3')} key="3" forceRender>
            <Subassembly defaultList={defaultValueSubassemblyList} resetKey={this.resetKey} form={ this.props.form }  Item={ Item } data={{ stringId: this.primaryKey }} categoryModel={ categoryModel } action={action} onChange={this.subassemblyChange}/>
          </Panel>
          <Panel header={this.renderPanderHeader('维护信息', '4')} key="4" forceRender>
            <Maintenance getAssetGroup={this.getAssetGroup} form={ this.props.form } Item={ Item } data={data} categoryModel={categoryModel} action={this.register === 'new' ? 'REGISTER' : 'CHANGE'} isSelectedTenplate={this.isShowNextStep[baseTemplate]}/>
          </Panel>
        </Collapse>
        <Operation
          defaultValue={ defaultValue }
          hasFields={hasFields}
          source={ source }
          needAreaID
          isGetUser={!!hasFields.length}
          areaId={ areaId ? [areaId] : null}
          onSubmit={ this.onSubmit }
          form={ this.props.form }
          Item={ Item }
        />
      </div>
    )
  }
}

