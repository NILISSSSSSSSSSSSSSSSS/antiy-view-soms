import { Component, default as React } from 'react'
import BaseInfo from '@c/Asset/AssetRegister/BaseInfo'
import Subassembly from '@c/Asset/AssetRegister/Subassembly'
import RelateSoftware from '@c/common/RelateSoftware'
import Maintenance from '@c/Asset/AssetRegister/Maintenance'
import Operation from '@c/common/Operation'
import { DISK, COMPUTING_DEVICE, STORAGE_DEVICE, NETWORK_DEVICE, SAFETY_DEVICE, OTHER_DEVICE } from '@a/js/enume'
import { Form, message, Tabs } from 'antd'
import { debounce } from 'lodash'
import { analysisUrl } from '@/utils/common'
import api from '@/services/api'
import './index.less'
import moment from 'moment'
import Loading from '@/components/common/Loading'

const TabPane = Tabs.TabPane
const Item = Form.Item
const baseTemplate = 'baseTemplate'
const categoryModel = 'categoryModel'
const operationSystem = 'operationSystem'
const disk = 'disk'
const software = 'software'
// 默认到期时间
const serviceLife = moment('2049-12-31')
@Form.create()
export default class AssetChange extends Component{
  constructor (props){
    super(props)
    const param = analysisUrl(props.location.search)
    this.subassemblyList = []
    this.relateSoftList = []
    this.assetGroupList = [] // 维护组件内部的资产组列表
    // 是否触发漏洞扫描
    this.needScan = {
      [disk]: false,
      [software]: false,
      [operationSystem]: false
    }
    this.source = param.source
    // 是否需要触发流程，选择下一步执行人
    this.isShowNextStep = {
      [categoryModel]: false,
      [operationSystem]: false,
      [baseTemplate]: false,
      [software]: false,
      [disk]: false
    } // 是否显示下一步操作
    this.state = {
      assetId: param.id,
      submitLoading: false,
      categoryModel: parseInt(param.categoryModel, 10) || 1,
      assetData: {},
      baseInfo: {}
    }
  }
  componentDidMount () {
    const { assetId } = this.state
    this.getAssetData(assetId)
    this.softwareQueryConfig.params.assetId = assetId
  }
  // 关联软件组件内部的封装请求
  softwareQueryConfig = {
    params: {},
    getList: (params)=> {
      const { assetId } = this.state
      return api.getSoftList({ ...params, primaryKey: assetId, isBatch: false }).then((res)=>{
        this.relateSoftList = res.body || []
        return res
      })
    }
  }
  getAssetData = (primaryKey) => {
    api.getAssetHardWareById({ primaryKey }).then((res)=>{
      if(res && res.head && res.head.code === '200'){
        const { asset, assetNetworkEquipment, assetSafetyEquipment, assetStorageMedium, ...other } = res.body
        const data = { ...assetStorageMedium, ...assetSafetyEquipment, ...assetNetworkEquipment, ...other, ...asset }
        this.softwareQueryConfig.params.baselineTemplateId = asset.baselineTemplateId
        this.setState({ assetData: res.body, baseInfo: { ...data } })
      }
    })
  }
  /**
   * 提交登记事件
   * @param nextStep
   */
  onSubmit = debounce((nextStep) => {
    this.props.form.validateFields((err, values) => {
      // todo 该行代码在开发完成之后要放置该函数顶部
      if(err) {
        message.error('请填写必填信息')
        return
      }
      const { baseInfo, assetId } = this.state
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
      data.asset.stepNode = null
      if(Object.values(this.isShowNextStep).find(e=>e)){
        // 设置工作流
        // data.asset.stepNode = 'safetyCheck'
        data.manualStartActivityRequest = {
          formData: {
            baselineConfigUserId: nextStep.nextExecutor.join(','),
            memo: nextStep.memo
          }
        }
        // 没有选择下一步执行人时，给出提示
        if(!nextStep.nextExecutor.length){
          message.info('没有选择执行人，请选择执行人！')
          return
        }
      }
      // 关联的组件
      data.assemblyRequestList = this.subassemblyList || []
      if(baseInfo.categoryModel === COMPUTING_DEVICE.value){
        // 关联的软件
        data.softwareReportRequest = {
          assetId: [ assetId ],
          softId: this.relateSoftList.map(({ softwareId })=>softwareId)
        }
      }
      // 非存储设备时，包含IP和MAC
      if(baseInfo.categoryModel !== STORAGE_DEVICE.value){
        data.ipRelationRequests =  (baseInfo.ip || []).filter(e=>(e.ip)).map(({ ip, net })=>({ ip, net })) // ip\网口列表
        data.macRelationRequests =  (baseInfo.mac || []).filter(e=>e.mac).map(({ mac })=>({ mac })) // mac列表
      }
      // 是否需要漏洞扫描
      if(Object.values(this.needScan).find(e=>e)){
        data.needScan = true
      }
      /**
       * 到期时间不能早于购买时间
       */
      if(data.asset.buyDate && data.asset.serviceLife < data.asset.buyDate){
        message.info('到期时间不能早于购买时间！')
        return
      }
      this.assetChangeSubmit(data)
    })
  })
  /**
   * 资产变更提交
   * @param params
   */
  assetChangeSubmit = (params) => {
    this.setState({ submitLoading: true })
    api.changAsset(params).then((res)=>{
      if(res.body){
        message.success(res.body)
      }else {
        message.success('资产变更成功')
      }
      const { push } = this.props.history
      this.setState({ submitLoading: false }, ()=>{
        push('/asset/manage')
      })
    }).catch(()=>{
      this.setState({ submitLoading: false })
    })
  }
  /**
   * 生成计算设备提交数据
   */
  generateComputingDeviceData = (values) => {
    const { assetData } = this.state
    return {
      asset: {
        ...this.generateAllDeviceCommonData(values),
        id: assetData.asset.stringId,
        operationSystem: values.operationSystem, // 操作系统
        operationSystemName: values.operationSystemName // 操作名称
      }
    }
  }
  /**
   * 生成网络设备提交数据
   */
  generateNetWorkData = (values) => {
    const { assetData } = this.state
    return {
      asset: {
        ...this.generateAllDeviceCommonData(values)
      },
      networkEquipment: {
        assetId: assetData.asset.stringId,
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
    const { assetData } = this.state
    return {
      asset: {
        ...this.generateAllDeviceCommonData(values),
        operationSystem: values.operationSystem, // 操作系统
        operationSystemName: values.operationSystemName // 操作名称
      },
      safetyEquipment: {
        assetId: assetData.asset.stringId,
        newVersion: values.newVersion // 软件版本
      }
    }
  }
  /**
   * 生成存储设备提交数据
   */
  generateStorageData = (values) => {
    const { assetData } = this.state
    return {
      asset: {
        ...this.generateAllDeviceCommonData(values)
      },
      assetStorageMedium: {
        assetId: assetData.asset.stringId,
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
      ...assetData.asset,
      id: assetData.asset.stringId,
      assetSource: 2,
      assetSourceName: '人工登记',
      // categoryModel: values.categoryModel, //资产类型
      areaId: values.areaId, //区域
      describle: values.describle, //描述
      houseLocation: values.houseLocation, //机房位置
      importanceDegree: values.importanceDegree, //重要程度
      installType: values.installType, // 安装方式
      // manufacturer: values.manufacturer, // 厂商
      // name: values.name, // 名称
      // number: values.number, // 资产编号
      responsibleUserId: values.responsibleUserId, // 责任人、使用者
      serial: values.serial, // 序列号
      serviceLife: values.serviceLife ? values.serviceLife.valueOf() : serviceLife.valueOf(), // 到期时间
      // version: baseInfo.version, // 版本
      warranty: values.warranty, // 保修期
      assetGroups: (values.assetGroups || []).map(e=>{
        const { id, value: name } = this.assetGroupList.find(group => group.id === e) || {}
        return { id, name }
      }), // 资产组
      businessId: baseInfo.businessId, // 版本的ID
      buyDate: values.buyDate ? values.buyDate.valueOf() : null // 购买时间
    }
  }
  /**
   * 组件内容发生变化
   */
  subassemblyChange = (list = [], addList = [], removeList = [], changeList = [], originalList) => {
    this.subassemblyList = list
    this.isShowNextStep[disk] = false
    this.needScan[disk] = false
    const { baseInfo } = this.state
    // 只要增加组件，就需要扫描漏洞
    this.needScan[disk] = !!addList.length
    // 非计算设备，变更了硬盘，不走配置流程
    if(baseInfo.categoryModel !== COMPUTING_DEVICE.value){
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
   * 关联软件变更
   * @param list{Array}
   * @param originalList{Array}
   */
  softChange = (list, originalList) => {
    this.isShowNextStep[software] = false
    this.needScan[software] = false
    this.relateSoftList = list
    // 关联软件数量不一致时，直接触发配置流程
    if(list.length !== originalList.length){
      this.isShowNextStep[software] = true
      this.needScan[software] = true
    }else {
      /**
       * 关联软件数量一致时，则进行比对，查看是否进行了变更，变更了则走而配置流程
       */
      for(let i = 0, len = originalList.length; i < len; ++i){
        const cur = originalList[i]
        const has = list.find(e=>cur.softwareId === e.softwareId)
        if(!has){
          this.isShowNextStep[software] = true
          this.needScan[software] = true
          // 一旦确认变更，则退出循环
          break
        }
      }
    }
    this.setState({ count: Math.random() })
  }
  baseChange = (baseInfo) => {
    const { baseInfo: oldBaseInfo, assetData } = this.state
    const newData = { ...oldBaseInfo, ...baseInfo }
    this.setState({ baseInfo: newData })
    this.isShowNextStep[baseTemplate] = false
    this.needScan[operationSystem] = false
    // 计算设备操作系统变更了，要走配置流程
    if(assetData.asset.operationSystem !== newData.operationSystem && assetData.asset.categoryModel === COMPUTING_DEVICE.value){
      this.isShowNextStep[baseTemplate] = true
      this.needScan[operationSystem] = true
    }
    // 安全设备变更了操作系统，须触发漏洞扫描
    if(assetData.asset.operationSystem !== newData.operationSystem && assetData.asset.categoryModel === SAFETY_DEVICE.value){
      this.needScan[operationSystem] = true
    }
  }
  /**
   * 资产组数据列表是维护组件内部的请求，需要重子组件获取改列表
   */
  getAssetGroup = (list) => {
    this.assetGroupList = list
  }
  render () {
    const { baseInfo, categoryModel, submitLoading } = this.state
    const hasFields = Object.values(this.isShowNextStep).find(e=>e) ? ['nextExecutor', 'nextStep', 'memo'] : []
    return(
      <div className="main-table-content asset-change">
        <Loading loading={submitLoading}/>
        <div className="asset-change-title">
         基础信息
        </div>
        <BaseInfo form={this.props.form} Item={Item} categoryModel={categoryModel} onChange={this.baseChange} action="CHANGE" data={baseInfo}/>
        <Tabs>
          <TabPane key='1' tab="组件信息" forceRender>
            <Subassembly form={this.props.form} Item={Item} data={{ stringId: baseInfo.stringId }} onChange={this.subassemblyChange}/>
          </TabPane>
          {
            baseInfo.categoryModel === COMPUTING_DEVICE.value && <TabPane key='2' tab="软件信息" forceRender>
              <RelateSoftware form={this.props.form} Item={Item} queryConfig={this.softwareQueryConfig} onChange={this.softChange}/>
            </TabPane>
          }
          <TabPane key='3' tab="维护信息" forceRender>
            <Maintenance getAssetGroup={this.getAssetGroup} form={this.props.form} Item={Item} data={baseInfo} categoryModel={categoryModel} action="CHANGE"/>
          </TabPane>
        </Tabs>
        <Operation
          defaultValue={ hasFields.length ? 'configBase' : ''}
          nextStep={[{ name: '基准配置', value: 'configBase', flowNodeTag: 'config_base', flowId: 4 }]}
          hasFields={hasFields}
          isGetUser={!!hasFields.length}
          source={ 'appear' }
          areaId={ baseInfo.areaId ? [baseInfo.areaId] : null}
          needAreaID
          onSubmit={ this.onSubmit }
          form={ this.props.form }
          Item={ Item }
        />
      </div>
    )
  }
}
