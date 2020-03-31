import React, { Component, Fragment } from 'react'
import { connect } from 'dva'
import { Form, message, Button, Select, Input, Col, TreeSelect } from 'antd'
import api from '@/services/api'
import { analysisUrl } from '@/utils/common'
import ConfigTable from './ConfigTable/index'
import SoftTable from './SoftTable/index'
import './style.less'
import { find, map } from 'lodash'
import { BLANK_LIST } from '@a/js/enume'
import CommonForm from '@c/common/Form'
import ModalConfirm from '@/components/common/ModalConfirm'

const FormItem = Form.Item
const TextArea = Input.TextArea
const { Option } = Select
const { TreeNode, SHOW_PARENT } = TreeSelect

const formItemLayout = {
  labelCol: {
    span: 4
  },
  wrapperCol: {
    span: 6
  }
}
const formItemLayout2 = {
  labelCol: {
    span: 8
  },
  wrapperCol: {
    span: 12
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
export class DetailModelForm extends Component {
  constructor (props) {
    super(props)
    const query = analysisUrl(this.props.location.search)
    this.state = {
      blankType: '',
      areaId: [],
      osList: this.props.osList || [], //操作系统
      stringId: query.stringId,
      isScan: query.isScan,
      os: '', //暂存适用系统
      NextOperatorList: [],
      checkShow: false,
      modifyConfigList: [], //编辑基准项
      addConfigList: [], //新增基准项
      deleteConfigList: [], //删除基准项
      addSoftwareList: [], //新增软件
      deleteSoftwareList: [], //删除软件
      isApply: false, //模板是否已经应用
      values: {},
      baseValues: { //暂存基准项的原有/现在列表
        origList: [],
        dataList: [],
        isCheck: false
      },
      softValues: {//暂存软件的原有/现在列表
        origList: [],
        dataList: [],
        isCheck: false
      },
      softNextshow: false, //软件删除/添加 是否显示下一步
      configNextshow: false//基准项删除/添加/修改 是否显示下一步
      // 修复状态下拉框变化后，不能修改原有list，否则可能会导致修复方式的变化，所以需要另一个list来存储修改后的值
    }
  }
  componentDidMount () {
    // 编辑页面获取列表数据
    if (this.state.stringId) {
      // 模板信息
      this.getModelById()
      //获取模板的区域
      this.getAreaId()
    }
    //获取适用系统
    this.props.dispatch({ type: 'baseSetting/getConfigOsList', payload: { name: '操作系统' } })
  }
  UNSAFE_componentWillReceiveProps (nextProps) {
    // 操作系统
    if (nextProps.osList && JSON.stringify(this.props.osList) !== JSON.stringify(nextProps.osList)) {
      this.setState({
        osList: nextProps.osList
      })
    }
  }
  render () {
    const { getFieldDecorator } = this.props.form
    let {
      templateOb,
      stringId,
      osList,
      os,
      isApply,
      checkShow,
      NextOperatorList,
      configNextshow,
      softNextshow,
      blankType,
      isScan
    } = this.state
    const baseProps = {
      stringId: stringId,
      os: os
    }
    const softProps = {
      blankType: blankType || (templateOb && templateOb.softwareType) || 0,
      postData: this.postData,
      stringId: stringId,
      os: os
    }
    const fields = [
      {
        name: '下一步',
        key: 'nextKey',
        type: 'select',
        defaultValue: '基准核查',
        disabled: true
      },
      {
        name: '下一步执行人',
        key: 'operator',
        showSearch: true,
        type: 'select',
        optionFilterProp: 'children',
        data: NextOperatorList,
        config: { value: 'stringId' },
        rules: [{ required: true, message: '请选择下一步执行人' }]
      },
      {
        name: '备注',
        key: 'remark',
        type: 'input',
        rules: [{ whitespace: true, message: '备注不能为空！' }, { message: '最多300个字符！', max: 300 }]
      }
    ]
    let softwareTypeName = templateOb && templateOb.softwareType !== 0 ? templateOb.softwareTypeName : '黑/白名单'
    const AlertInfo = {
      visible: checkShow,
      onOk: this.postData,
      onCancel: this.onCancel,
      children: (<p className="model-text">模板保存后，将会对该模板关联的所有资产核查所变更的内容</p>)
    }
    // 模板扫描新建的时候 除名称、编号无数据需用户重新填写外，所有数据已填充完毕
    return (
      <div className="model-edit-form-content">
        <Form className="bug-edit-form">
          <p className="bug-title">模板信息</p>
          <div className="form-wrap">
            <Col span={8} className="form-layout">
              <FormItem label="名称" {...formItemLayout}>
                {
                  getFieldDecorator('name', {
                    rules: [{ required: true, message: '请输入模板名称！' }, { whitespace: true, message: '名称不能为空！' }, { message: '最多80个字符！', max: 80 }],
                    initialValue: (templateOb && !isScan) ? templateOb.name : null
                  })(
                    <Input autoComplete="off" placeholder="请输入" allowClear={this.state.stringId && !isScan ? false : true} disabled={this.state.stringId && !isScan ? true : false} />
                  )
                }
              </FormItem>
            </Col>
            <Col span={8} className="form-layout">
              <FormItem label="编号" {...formItemLayout}>
                {
                  getFieldDecorator('number', {
                    initialValue: (templateOb && !isScan) ? templateOb.number : null,
                    rules: [{ required: true, message: '请输入模板编号！' }, { whitespace: true, message: '编号不能为空！' }, { message: '最多30个字符！', max: 30 }]
                  })(
                    <Input autoComplete="off" placeholder="请输入" allowClear={this.state.stringId && !isScan ? false : true} disabled={this.state.stringId && !isScan ? true : false} />
                  )
                }
              </FormItem>
            </Col>
            <Col span={8} className="form-layout">
              <FormItem label="黑白名单" {...formItemLayout}>
                {
                  getFieldDecorator('softwareType', {
                    rules: [{ required: true, message: '请选择黑白名单！' }],
                    initialValue: templateOb && templateOb.softwareType
                  })(
                    <Select
                      className="base-form-item"
                      allowClear={true}
                      disabled={stringId ? true : false}
                      optionFilterProp="children"
                      onChange={this.onChangeBlank}
                      placeholder="请选择"
                      getPopupContainer={triggerNode => triggerNode.parentNode}
                    >
                      {
                        BLANK_LIST.map((item, index) => {
                          return (<Option key={item.value} value={item.value} >{item.name}</Option>)
                        })
                      }
                    </Select>
                  )
                }
              </FormItem>
            </Col>
            <Col span={8} className="form-layout">
              <FormItem label="适用系统" {...formItemLayout}>
                {
                  getFieldDecorator('os', {
                    rules: [{ required: true, message: '请选择适用系统！' }],
                    initialValue: templateOb && templateOb.os
                  })(
                    <TreeSelect
                      allowClear
                      treeDefaultExpandAll
                      disabled={stringId ? true : false}
                      className="form-item-warp"
                      getPopupContainer={triggerNode => triggerNode.parentNode}
                      placeholder={'请选择'}
                      treeNodeFilterProp='title'
                      showSearch={true}
                    >
                      {
                        this.renderCategoryModelNodeTree( osList.childrenNode || [], { name: 'name', value: 'node' })
                      }
                    </TreeSelect>
                  )
                }
              </FormItem>
            </Col>
            <Col span={24} className="form-block">
              <FormItem {...formLayoutBlock} label="描述">
                {
                  getFieldDecorator('description', {
                    initialValue: templateOb ? templateOb.description : null,
                    rules: [{ required: true, message: '请输入模板描述！' }, { whitespace: true, message: '描述不能为空！' }, { message: '最多300个字符！', max: 300 }]
                  })(
                    <TextArea rows={6} placeholder="请输入" disabled={ isScan ? true : false }/>
                  )
                }
              </FormItem>
            </Col>
          </div>
        </Form>
        {/* 基准项信息 */}
        <section style={{ backgroundColor: '#151B30' }} >
          <p className="bug-title required-label" id="PatchInformation-patch-info">基准项信息</p>
          <ConfigTable
            props={baseProps}
            form={this.props.form}
            children={(now) => this.ConfigTable = now}
            onChange={this.onChangeConfig}
            NextshowChange={this.NextshowChange}
            showResult={this.showResult}
          />
          {/* 黑名单信息 */}
          {blankType || (templateOb && templateOb.softwareType) ?
            <p className={`bug-title ${(blankType || (templateOb && templateOb.softwareType)) && 'required-label'}`} id="PatchInformation-patch-info">{blankType ? BLANK_LIST[blankType].name : softwareTypeName}</p>
            : ''}
          <SoftTable
            props={softProps}
            children={(now) => this.SoftTable = now}
            form={this.props.form}
            NextshowChange={this.NextshowChange}
            onChange={this.onChangeSoft}
          />
        </section>
        {/* //已经应用且有修改选择执行人 */}
        {stringId && isApply && (configNextshow || softNextshow) ?
          <div className="asset-register-operation">
            <div className="asset-register-operation-next">
              <CommonForm
                column={3}
                fields={fields}
                form={this.props.form}
                FormItem={FormItem}
                formLayout={formItemLayout2}
              />
            </div>
          </div> : ''
        }
        {/* 保存 */}
        <div className="Button-center">
          <div>
            {!isScan && <Button type='primary' onClick={this.onSubmit} disabled={this.state.showbtn}>保存</Button>}
            {isScan && <Fragment><Button className="back-btn" type='primary' ghost onClick={() => this.props.history.goBack()}>取消</Button>
              <Button type='primary' onClick={this.checkNext} style={{ marginLeft: '10px' }}>下一步</Button></Fragment>}
          </div>
        </div>
        <ModalConfirm props={AlertInfo} />
      </div>
    )
  }
  //渲染适用系统
  renderCategoryModelNodeTree = (data = [], config) => {
    const { name, value, selectable } = config || {}
    if(data && !!data.length){
      return data.map((el, i) => {
        // 所有节点可选
        if(el){
          el.disabled = false
          // 含有节点选择的配置
          if(selectable){
            /**
             * leafNode: 叶子节点可选，父节点，根节点不可选
             * parentNode: 叶子节点、父节点可选，根节点不可选
             * rootNode: 所有节点可选
             */
            if(selectable === 'rootNode'){
              // 所有节点可选
            } else if(selectable === 'parentNode' && el.levelType <= 1){ // 1 代表的是更节点
              // 根节点禁止选择
              el.disabled = true
            }else if(selectable === 'leafNode' && el.childrenNode && el.childrenNode.length){
              // 根节点、父节点禁止选择
              el.disabled = true
            }
          }else {
            if (el.childrenNode && el.childrenNode.length) {
              el.disabled = true
            }
          }
          return (
            <TreeNode value={el[value || 'node']} disabled={el.disabled} title={el[name || 'name']} key={`${el[value || 'node'] }`}>
              {
                this.renderCategoryModelNodeTree(el.childrenNode || [], config)
              }
            </TreeNode>
          )
        }
      })
    }
  }
  //获取区域id
  getAreaId = () => {
    api.listAssetForTemplateByPage({ templateIds: [this.state.stringId] }).then(res => {
      this.setState({
        areaId: map(res.body.items, 'areaId')
      }, () => {
        this.getUsersByRoleCodeAndAreaId()
      })
    })
  }
  NextshowChange = (show, index = 0) => {
    if (index === 1) {
      this.setState({
        softNextshow: show
      })
    } else {
      this.setState({
        configNextshow: show
      })
    }
  }
  //保存按钮设置
  showResult = (index) => {
    if (index)
      this.setState({
        showbtn: true
      })
    else this.setState({
      showbtn: false
    })
  }
  //清空适用系统
  onChangeOS = (value) => {
    this.SoftTable.setState({ blankLists: [], storeData: [], removeBusinessIds: [] })
    this.ConfigTable.setState({ elList: [], storeData: [], removeBusinessIds: [] })
    this.setState({
      addConfigList: [],
      addSoftwareList: []
    })
  }
  //取消弹框
  onCancel = () => {
    this.setState({
      checkShow: false
    })
  }
  //获取执行人
  getUsersByRoleCodeAndAreaId = () => {
    api.getUsersByRoleCodeAndAreaId({ flowNodeTag: 'config_check', flowId: 4, areaId: this.state.areaId }).then(res => {
      let NextOperatorList = res.body || []
      NextOperatorList.unshift({ name: '全部', stringId: '-1' })
      this.setState({
        NextOperatorList: NextOperatorList
      })
    })
  }
  //黑白名单选择
  onChangeBlank = (value) => {
    this.setState({
      blankType: value
    })
    //选择改变的时候清空之前选择的软件
    this.SoftTable.setState({ blankLists: [], storeData: [], removeBusinessIds: [], blankTotal: 0 })
    this.setState({
      addSoftwareList: []
    })
  }
  //获取模板详情
  getModelById = () => {
    api.getConfigTemplateById({
      primaryKey: this.state.stringId
    }).then(response => {
      this.setState({
        templateOb: response.body,
        os: response.body.os,
        isApply: response.body.isApply,
        blankType: response.body.softwareType
      })
    })
  }
  //基准项列表修改 新增直接放入新增列表中  编辑保存原有的现有的列表
  onChangeConfig = (origList, list, isCheck = true) => {
    let { stringId } = this.state
    const itemList = list.map(Item => {
      return {
        defineValue: Item.defineValue,
        infoId: Item.stringId,
        valueStatus: Item.valueStatus
      }
    })
    if (!stringId) {
      this.setState({
        addConfigList: itemList
      })
    } else {
      this.setState({
        baseValues: {
          isCheck: isCheck,
          origList: origList,
          dataList: list
        }
      })
    }
  }
  //软件列表修改  新增直接放入新增列表中  编辑保存原有的现有的列表
  onChangeSoft = (origList, list, isCheck = true) => {
    let { stringId } = this.state
    if (!stringId) {
      this.setState({
        addSoftwareList: list
      })
    } else {
      this.setState({
        softValues: {
          isCheck: isCheck,
          origList: origList,
          dataList: list
        }
      })
    }
  }
  //基准项/软件列表过滤删除/新增/修改
  filterList = () => {
    let { softValues, baseValues, configNextshow, softNextshow, isApply, addConfigList, addSoftwareList, deleteConfigList, modifyConfigList, deleteSoftwareList } = this.state
    //基准项整和删除/修改/新增
    if (baseValues.isCheck) {//是否参与过滤  根据原基准项列表比较现有的列表筛选出删除、修改的基准项
      baseValues.origList.length && baseValues.origList.forEach(item => {
        let ob = find(baseValues.dataList, { stringId: item.stringId })
        if (!ob) {
          deleteConfigList.push({ infoId: item.stringId })
        } else if (ob && (item.defaultValue !== ob.defineValue)) {
          modifyConfigList.push({
            defineValue: ob.defineValue,
            infoId: item.stringId,
            valueStatus: item.valueStatus
          })
        }
      })
      // 根据现有的列表比较原基准项列表筛选出新增的基准项
      baseValues.dataList.forEach(item => {
        let { defineValue, stringId, valueStatus } = item
        if (baseValues.origList.length) {
          let ob = find(baseValues.origList, { stringId: item.stringId })
          if (!ob) {
            addConfigList.push({
              defineValue,
              infoId: stringId,
              valueStatus
            })
          }
        } else {
          addConfigList.push({
            defineValue,
            infoId: stringId,
            valueStatus
          })
        }
      })
    }
    //软件整和删除/新增
    if (softValues.isCheck) {//是否参与过滤  根据原软件列表比较现有的列表筛选出删除的
      softValues.origList.length && softValues.origList.forEach(item => {
        let ob = find(softValues.dataList, { stringId: item.stringId })
        if (!ob) {
          deleteSoftwareList.push({ softwareId: item.stringId })
        }
      })
      // 根据现有的列表比较原列表筛选出新增的
      softValues.dataList.forEach(item => {
        if (softValues.origList.length) {
          let ob = find(softValues.origList, { stringId: item.stringId })
          if (!ob) {
            addSoftwareList.push(item)
          }
        } else {
          addSoftwareList.push(item)
        }
      })
    }
    //没有应用的模板或者已经应用但是没有任何修改 不需要执行基准核查
    if (!isApply || (isApply && !configNextshow && !softNextshow)) {
      this.postData()
    }
  }
  //保存
  onSubmit = () => {
    let { blankType, addSoftwareList, isApply, addConfigList, stringId, baseValues, softValues, softNextshow, configNextshow } = this.state
    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.setState({
          values: values
        }, () => {
          //新增基准项不能为空  编辑基准项不能为空
          if (!addConfigList.length && !stringId || (stringId && !baseValues.dataList.length)) {
            message.error('基准项不能为空')
            //新增黑/白名单不能为空  编辑黑/白名单不能为空
          } else if (blankType && !addSoftwareList.length && !stringId || (blankType && stringId && !softValues.dataList.length)) {
            message.error('黑/白名单不能为空')
          }//编辑已入网弹框提示
          else if (stringId) {
            //已经应用且有修改执行核查
            if (isApply && (softNextshow || configNextshow))
              this.setState({
                checkShow: true
              })
            this.filterList()
          } else {
            this.postData()
          }
        })
      }
    })
  }
  // 提交数据
  postData = () => {
    let { addConfigList, values, addSoftwareList, stringId, deleteConfigList, modifyConfigList, deleteSoftwareList, os, NextOperatorList } = this.state
    NextOperatorList.splice(0, 1)
    let editParam = {//编辑模板数据
      deleteSoftwareList,
      modifyConfigList,
      deleteConfigList,
      addConfigList,
      addSoftwareList,
      ...values,
      os: os,
      id: stringId
    }
    let param = {//新增模板数据
      addConfigList,
      addSoftwareList,
      ...values
    }
    let port = stringId ? 'editConfigTemplate' : 'addConfigTemplate'
    let params = stringId ? editParam : param
    if (params.operator === '-1') {
      params.operator = map(NextOperatorList, 'stringId').join(',')
    }
    let currentUser = sessionStorage.getItem('id')
    params.formData = params.operator && `{"baselineConfigUserId":\"${currentUser}\", "baselineCheckUser":\"${params.operator}\", "baselineConfigResult":\"baselineCheck\"}`//基准核查人选择
    delete params.nextKey
    this.onCancel()
    api[port](params).then(res => {
      this.props.history.goBack()
      message.success('操作成功!')
    })
  }
  checkNext = () => {
    let { stringId } = this.state
    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.props.history.push(`/basesetting/model/checkdetail?stringId=${stringId}&isScan=${true}&isFinished=${true}`)
      }
    })
  }
}
const mapStateToProps = ({ baseSetting }) => {
  return {
    osList: baseSetting.osList
  }
}
const ModelDetailsList = Form.create()(DetailModelForm)
export default connect(mapStateToProps)(ModelDetailsList)
