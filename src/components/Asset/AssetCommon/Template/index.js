import { Component } from 'react'
import { Icon, Form, message, Table } from 'antd'
import SettingModal from '../../AssetRegister/SettingModal'
import { COMPUTING_DEVICE, SAFETY_DEVICE } from '@a/js/enume'
import { transliteration, TooltipFn } from '@/utils/common'
import api from '@/services/api'
import './index.less'
import moment from 'moment'
import { NavLink } from 'dva/router'
import { emptyFilter } from '../../../../utils/common'

// 显示装机模板的资产类型
const TYPES = [COMPUTING_DEVICE].map((e)=>e.value)
const baseSetting = 'baseSetting'
const softModal = 'softModal'
/**
 * @param disabledOperation {Boolean} 是否具有操作功能
 * @param disabled {Boolean} 是否可以被点击
 * @param type {Number} 设备的型号
 * @param operationSystem {*} 操作系统
 * @param onChange {Function} 模板变更回调
 */
@Form.create()
export default class AssetTemplate extends Component{
  static defaultProps ={
    disabledOperation: false // 是否可用操作
  }

  static propTypes={
  }
  constructor (props){
    super(props)
    this.isInit = true // 是否是初始化数据
    this.state = {
      errTemplate: [ false, false ], // 下标第一个表示是基准模板是否有错误，下标第二个表示装机模板是否有错误
      templateType: '',
      visible: false,
      softModalSelect: void 0,
      baseSettingSelect: void 0
    }
  }
  componentDidMount () {
    const { baseSettingSelect,  softModalSelect } = this.state
    const { onChange, data } = this.props
    this.initTemplateInfo(data)
    onChange && onChange([ baseSettingSelect, softModalSelect ], this.verification)
  }

  UNSAFE_componentWillReceiveProps (nextProps, nextContext) {
    this.initTemplateInfo(nextProps.data)
    // 选择不同的设备类型时或者不用的操作系统时，清除选择的模板
    if(nextProps.type !== this.props.type || nextProps.operationSystem !== this.props.operationSystem){
      this.setState({
        templateType: '',
        errTemplate: [ false, false ], // 下标第一个表示是基准模板是否有错误，下标第二个表示装机模板是否有错误
        softModalSelect: void 0,
        baseSettingSelect: void 0
      })
    }
  }

  /**
   * 获取基准模板和装机模板信息，在再次登记时使用到
   * @param assetData
   */
  initTemplateInfo = (assetData = {}) => {
    const { baselineTemplateId, installTemplateId } = assetData
    const { onChange } = this.props
    // 非初始化时，尽在请求数据
    if(!this.isInit){
      return
    }
    // 已经配置了基准把模板
    if(assetData.baselineTemplateId){
      api.getConfigTemplateById({ primaryKey: baselineTemplateId }).then(res=>{
        this.setState({ baseSettingSelect: res.body || {} })

        const { softModalSelect } = this.state
        onChange && onChange([ res.body, softModalSelect ], this.verification)
      })
      this.isInit = false
    }
    // 已经配置了装机模板
    if(assetData.installTemplateId){
      api.getAssetInstallTemplateInfo({ primaryKey: installTemplateId }).then(res=>{
        this.setState({ softModalSelect: res.body || {} })
        const { baseSettingSelect } = this.state
        onChange && onChange([ baseSettingSelect, res.body ], this.verification)
      })
      this.isInit = false
    }
  }
  /**
   * 是否必填
   * @param type
   * @return {boolean}
   */
  getRequired = (type) => {
    const { operationSystem } = this.props
    return  TYPES.includes(type) || type === SAFETY_DEVICE.value && operationSystem
  }
  /**
   * 模板是否必须填写, 计算设备必填，安全设备下已经选择了操作系统必填，其他情况都非必填
   * @param type
   * @returns {null}
   */
  generateRequired =(type) =>{
    const { disabledOperation } = this.props
    return  <span className="must" style={{ visibility: this.getRequired(type) && !disabledOperation ? 'visible' : 'hidden' }}>*</span>
  }
  /**
   * 是否有装机模板
   * @param type
   * @returns {null|*}
   */
  hasTemplate = (type ) => {
    const { disabled } = this.props
    const { softModalSelect, baseSettingSelect, errTemplate } = this.state
    if(!TYPES.includes(type)){
      return null
    }
    return (
      <div>
        <h4>
          {this.generateRequired(type)}
          配置装机模板
        </h4>
        {
          softModalSelect ?
            this.renderCard(softModal, softModalSelect) :
            <div className={`asset-template-box ${disabled || !baseSettingSelect ? 'disabled-template' : ''} ${errTemplate[1] ? 'err-template' : ''}`} onClick={()=>{ baseSettingSelect && this.openModal(softModal)}}>
              <Icon type="plus" />
              选择装机模板
            </div>
        }
      </div>
    )
  }
  /**
   * 渲染装机模板内容
   * @param selectObj
   * @returns {*}
   */
  renderCardContent = (selectObj) => {
    const { type } = this.props
    return (
      <div className="asset-template-card-content mult_line_ellipsis_container">
        { !this.getRequired(type) && <Icon type="close" className="asset-template-card-close" onClick={()=>this.removeTemplate('softModalSelect')}/> }
        <div className="one-line mult_line_ellipsis">名称：<span>{selectObj.name}</span></div>
        <div className="one-line mult_line_ellipsis">编号：<span>{selectObj.numberCode}</span> </div>
        <div>补丁数量：<span>{selectObj.patchNum || 0}</span></div>
        <div>软件数量：<span>{selectObj.softNum || 0}</span></div>
        {/*详情页面才可有关联时间*/}
        {this.renderRelateTime(softModal)}
        <div className="one-line mult_line_ellipsis">描述：<span >{selectObj.description}</span></div>
      </div>
    )
  }
  /**
   * 渲染基准设置模板内容
   * @param selectObj
   * @returns {*}
   */
  renderBaseSettingCardContent = (selectObj) => {
    const { type, disabledOperation } = this.props
    return (
      <div className="asset-template-card-content mult_line_ellipsis_container">
        {(!this.getRequired(type) && !disabledOperation) &&  <Icon type="close" className="asset-template-card-close" onClick={()=>this.removeTemplate('baseSettingSelect')}/>}
        <div className="one-line mult_line_ellipsis">名称：<span>{selectObj.name || ''}</span></div>
        <div className="one-line mult_line_ellipsis">编号：<span>{selectObj.number || ''}</span> </div>
        <div>基准数量：<span>{selectObj.configNum || 0}</span></div>
        {/*详情页面才可有关联时间*/}
        {this.renderRelateTime(baseSetting)}
        <div className="one-line mult_line_ellipsis">描述：<span>{selectObj.description}</span></div>
      </div>
    )
  }
  /**
   * 移除模板
   * @param key
   */
  removeTemplate = (key) => {
    const { onChange } = this.props
    this.setState({ [key]: void 0 })
    const { baseSettingSelect, softModalSelect } = this.state
    let arr = [baseSettingSelect, softModalSelect]
    if(key === 'baseSettingSelect'){
      arr[0] = void 0
    }else if(key === 'softModalSelect'){
      arr[1] = void 0
    }
    onChange && onChange(arr, this.verification)
  }
  /**
   * 渲染关联时间
   */
  renderRelateTime = (type) => {
    const { disabledOperation, data = {} } = this.props
    // 只有详情时，才显示关联时间
    if(!disabledOperation){
      return null
    }
    let time = ''
    const format = 'YYYY-MM-DD HH:mm:ss'
    if(type === baseSetting){
      time = data.baselineTemplateCorrelationGmt ? moment(data.baselineTemplateCorrelationGmt).format(format) : null
    }else if(type === softModal){
      time = data.installTemplateCorrelationGmt ? moment(data.installTemplateCorrelationGmt).format(format) : null
    }
    return <div>关联时间 ：<span>{emptyFilter(time)}</span></div>
  }
  /**
   * 查询装机模板是否存在
   */
  getInstallTemplateIsExist = (stringId) => {
    return api.getInstallTemplateIsExist({ stringId })
  }
  openDetail = (type, data) => {
    if(type === baseSetting){
      window.open('/#/basesetting/model/checkdetail?stringId=' + transliteration(data.stringId))
    }else if(type === softModal){
      // 模板被逻辑删除了，则不进行跳转
      if(typeof data.status !== 'undefined' && !data.status){
        message.info('模板已被删除，无法查看信息')
        return
      }
      // 查询装机模板是否存在，存在才进行跳转
      this.getInstallTemplateIsExist(data.stringId).then((res)=>{
        if(!res.body){
          message.error('当前模板不存在，请刷新界面后重新尝试')
          return
        }
        window.open('/#/asset/installtemplate/detail?stringId=' + transliteration(data.stringId))
      })
    }
  }
  /**
   * 渲染卡片内容
   * @param templetModal
   * @param selectObj
   * @returns {*}
   */
  renderCard = (templetModal, selectObj) => {
    const  { disabledOperation } = this.props
    return (
      <div className="asset-template-card">
        {templetModal === baseSetting ? this.renderBaseSettingCardContent(selectObj) : this.renderCardContent(selectObj)}
        <div className='asset-template-card-btns'>
          <div className={disabledOperation ? 'only-read' : ''} onClick={()=>this.openDetail(templetModal, selectObj)}>查看详情</div>
          { !disabledOperation && <div onClick={()=>{this.openModal(templetModal)}}>重新选择</div> }
        </div>
      </div>
    )
  }
  /**
   * 模板的弹窗确认事件
   * @param selectRows
   */
  onConfirm = (selectRows) => {
    const { templateType, baseSettingSelect,  softModalSelect } = this.state
    const { onChange, type } = this.props
    const tem = { baseSettingSelect,  softModalSelect }
    if(templateType === baseSetting){
      tem.baseSettingSelect = selectRows[0]
      // 选择了基准模板时，清空装机模板，并给出提示
      if(tem.softModalSelect && TYPES.includes(type)){
        message.info('基准模板已经改变，请重新选择装机模板')
        // 选择基准模板之后，装机模板情况
        tem.softModalSelect = void 0
      }
      // this.setState({ baseSettingSelect: selectRows[0],  visible: false })
    }else {
      tem.softModalSelect = selectRows[0]
      this.setState({ softModalSelect: selectRows[0], visible: false })
    }
    this.setState({ ...tem, visible: false })
    onChange && onChange([ tem.baseSettingSelect, tem.softModalSelect ], this.verification)
  }
  /**
   * 打卡模板弹窗
   * @param templateType
   */
  openModal = (templateType) => {
    const { disabled } = this.props
    if(disabled){
      return
    }
    this.setState({ templateType, visible: true })
  }
  hasBaseSettingTemplate = (type, baseSettingSelect) => {
    const { disabled } = this.props
    const { errTemplate } = this.state
    return (
      <div>
        <h4>
          {this.generateRequired(type) }
          配置基准模板
        </h4>
        { baseSettingSelect ?
          this.renderCard(baseSetting, baseSettingSelect) :
          <div className={`asset-template-box ${disabled ? 'disabled-template' : ''} ${errTemplate[0] ? 'err-template' : ''}`} onClick={()=>this.openModal(baseSetting) }>
            <Icon type="plus" />
            选择配置基准模板
          </div>
        }
      </div>
    )
  }
  /**
   * 验证模板是否没有已经选择完成
   * @return {boolean}
   */
  verification = () => {
    const { type } = this.props
    const flag = this.getRequired(type)
    if(flag){
      const { softModalSelect, baseSettingSelect } = this.state
      this.setState({ errTemplate: [ !!!baseSettingSelect, !!!softModalSelect ] })
      // 计算设备时
      if(type === COMPUTING_DEVICE.value){ // 基准模板、装机模板都都要选择完成
        return !!!baseSettingSelect || !!!softModalSelect
      }else if(type === SAFETY_DEVICE.value) { // 安全设备时，基准模板必选选择完成
        return !!!baseSettingSelect
      }
      return false
    }
    return false
  }
  /**
   * 获取基准模板列表信息
   * @param params
   */
  getConfigTemplateList = (params) => {
    const { type, operationSystem } = this.props
    let isConfig = void 0
    // 计算设备时或则非计算设备选择了操作系统，如果没有配到基准模板，这个自动返回默认的通用模板
    if(type === COMPUTING_DEVICE.value || (type !== COMPUTING_DEVICE.value && operationSystem)) {
      isConfig = 1
    }
    return api.getConfigTemplateList({ isEnable: 1, isConfig, ...params })
  }
  /**
   * 获取装机模板列表信息
   * @param params
   */
  getQueryInstallTempList = (params) => {
    return api.queryInstallTempList({ ...params, currentStatus: '3' })
  }
  queryConfig = {
    getList: (params) => {
      const { templateType } = this.state
      const { operationSystem: os } = this.props
      if(templateType === baseSetting){
        return this.getConfigTemplateList({ ...params, os: os ? [os] : null })
      }else if(templateType === softModal){
        const { baseSettingSelect } = this.state
        return this.getQueryInstallTempList({ ...params, operationSystem: os, baselineId: baseSettingSelect.stringId })
      }
    }
  }
  render () {
    const { type } = this.props
    const { templateType, visible, baseSettingSelect } = this.state
    const { totalRecords: total, list, currentPage: current, pageSize } = this.state
    const assetColumns = [
      {
        title: '名称',
        dataIndex: 'manufacture1r',
        key: 'manufacturer1',
        render: text => TooltipFn(text)
      },
      {
        title: '编号',
        dataIndex: 'manufacture2',
        key: 'manufacturer2',
        render: text => TooltipFn(text)
      }, {
        title: '补丁数量',
        dataIndex: 'manufacture1r',
        key: 'manufacturer1',
        render: text => TooltipFn(text)
      },
      {
        title: '软件数量',
        dataIndex: 'manufacture2',
        key: 'manufacturer2',
        render: text => TooltipFn(text)
      }, {
        title: '关联时间',
        dataIndex: 'manufacture1r',
        key: 'manufacturer1',
        render: text => TooltipFn(text)
      },
      {
        title: '描述',
        dataIndex: 'manufacture2',
        key: 'manufacturer2',
        render: text => TooltipFn(text)
      },  {
        title: '操作',
        key: 'operate',
        width: '14%',
        render: (record) => {
          return (
            <div className="operate-wrap">
              <NavLink to={`/asset/manage/detail?id=${transliteration(record.stringId)}`}>
                查看
              </NavLink>
            </div>
          )
        }
      }
    ]

    const configColumns = [
      {
        title: '名称',
        dataIndex: 'manufacture1r',
        key: 'manufacturer1',
        render: text => TooltipFn(text)
      },
      {
        title: '编号',
        dataIndex: 'manufacture2',
        key: 'manufacturer2',
        render: text => TooltipFn(text)
      }, {
        title: '基准数量',
        dataIndex: 'manufacture1r',
        key: 'manufacturer1',
        render: text => TooltipFn(text)
      },
      {
        title: '关联时间',
        dataIndex: 'manufacture2',
        key: 'manufacturer2',
        render: text => TooltipFn(text)
      }, {
        title: '描述',
        dataIndex: 'manufacture1r',
        key: 'manufacturer1',
        render: text => TooltipFn(text)
      },
      {
        title: '操作',
        key: 'operate',
        width: '14%',
        render: (record) => {
          return (
            <div className="operate-wrap">
              <NavLink to={`/asset/manage/detail?id=${transliteration(record.stringId)}`}>
                查看
              </NavLink>
            </div>
          )
        }
      }
    ]
    return(
      <div className="asset-template">
        { visible && <SettingModal
          onConfirm={this.onConfirm}
          queryConfig={this.queryConfig}
          visible={visible}
          type={templateType}
          onCancel={()=>{this.setState({ visible: false })}}
        />}
        {this.hasBaseSettingTemplate(type, baseSettingSelect)}
        {this.hasTemplate(type)}
        {/* <p className="detail-title">资产配置模板</p>
        <Table
          pagination={ {
            total,
            current,
            pageSize,
            onChange: this.pageChange,
            showTotal: () => `共 ${total ? total : 0} 条数据`
          } }
          columns={ assetColumns }
          dataSource={ list }/>
        <br />
        <p className="detail-title">配置基准模板</p>
        <Table
          pagination={ {
            total,
            current,
            pageSize,
            onChange: this.pageChange,
            showTotal: () => `共 ${total ? total : 0} 条数据`
          } }
          columns={ configColumns }
          dataSource={ list }/> */}
      </div>
    )
  }
}
