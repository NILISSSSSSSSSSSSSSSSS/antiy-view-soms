import React, { Component } from 'react'
import { Table, Pagination, Button, message, Tooltip, Input } from 'antd'
import RelationAlert from '@/components/BaseSetting/RelationAlert'
import { TooltipFn, getAfterDeletePage, transliteration } from '@/utils/common'
import { uniqBy, find, map, difference, compact } from 'lodash'
import { Link } from 'dva/router'
import api from '@/services/api'
import ModalConfirm from '@/components/common/ModalConfirm'
export class ModelEditTable extends Component {
  constructor (props) {
    super(props)
    this.state = {
      columns: [
        {
          title: '名称',
          dataIndex: 'name',
          key: 'name',
          render: (text, record) => TooltipFn(record.configName ? record.configName : text)
        }, {
          title: '检测规范',
          dataIndex: 'sourceName',
          key: 'sourceName',
          render: text => TooltipFn(text)
        }, {
          title: '编号',
          dataIndex: 'ruleId',
          key: 'ruleId',
          render: text => TooltipFn(text)
        }, {
          title: '安全级别',
          dataIndex: 'levelName',
          key: 'levelName',
          render: val => {
            return val
          }
        }, {
          title: ' 值',
          dataIndex: 'defineValue',
          key: 'defineValue',
          width: '18%',
          render: (text, scope, index) => {
            return (
              (scope.valueStatus || scope.defineValue) &&
              < span >
                <Tooltip title={text} placement="topLeft" getPopupContainer={triggerNode => triggerNode.parentNode}>
                  <span>
                    <Input autoComplete="off"
                      style={{ width: '100%' }}
                      maxLength={30}
                      value={text}
                      onChange={(value) => { this.repairValueChange(value, scope, index) }}
                    />
                  </span></Tooltip>
              </span >
            )
          }
        }, {
          title: '基准类型',
          dataIndex: 'typeName',
          key: 'typeName',
          isShow: true,
          render: (text, record) => TooltipFn(text ? text : record.systemName)
        }, {
          title: '适用系统',
          dataIndex: 'osName',
          key: 'osName',
          isShow: true,
          render: (text, record) => TooltipFn(text ? text : record.systemName)
        },
        {
          title: '操作',
          dataIndex: 'operate',
          key: 'operate',
          width: 180,
          isShow: true,
          render: (text, record, index) => (
            <div className="operate-wrap">
              <a onClick={() => this.removeIt(record.stringId)}>移除</a>
              <Link to={`/basesetting/storage/detail?stringId=${transliteration(record.stringId)}&caches=1`} target="_blank">查看</Link>
            </div>
          )
        }],
      modifyConfigList: [], //修改的基准项
      alertShow: false, //添加基准项
      removeModal: false, //移除二次确认
      elList: [], //基准项列表
      storeData: [], //前端分页数据缓存
      origData: [], //最原始的数据
      baseTotal: 0,
      removeBusinessIds: [], //清除已经选择的项
      basePagingParameter: {
        pageSize: 10,
        currentPage: 1
      },
      defaultList: [],
      removeItemId: '' //移除id
    }
  }

  componentDidMount () {
    this.props.children(this)
    const { props } = this.props
    if (props.stringId)
      this.getConfigList(props.stringId)
  }
  render () {
    const { props } = this.props
    let {
      alertShow,
      removeModal,
      elList,
      basePagingParameter,
      columns,
      baseTotal,
      removeBusinessIds
    } = this.state
    const AlertInfo = {
      visible: removeModal,
      onOk: this.deleteState,
      onCancel: this.onCancel,
      children: (<p className="model-text">确认要从当前列表移除这一项?</p>)
    }
    return (
      <div className="config-model-table">
        <div className="table-wrap">
          <div className="table-btn">
            <div className="left-btn">
              <Button type="primary" onClick={() => this.checkOs('适用系统')}>添加基准项</Button>
            </div>
          </div>
          <Table rowKey='stringId' columns={columns} dataSource={elList} pagination={false}></Table>
          {baseTotal > 0 && <Pagination
            className="table-pagination"
            total={baseTotal}
            showTotal={(total) => `共 ${total || 0} 条数据`}
            showSizeChanger={false}
            showQuickJumper
            onChange={this.changePage}
            onShowSizeChange={this.changePage}
            current={basePagingParameter.currentPage} />
          }
        </div>
        {/* 基准项信息 */}
        <RelationAlert
          visible={alertShow}
          removeBusinessIds={removeBusinessIds}
          os={props.os ? props.os : this.props.form.getFieldValue('os')}
          saveAlerts={this.saveAlerts}
          closeAlerts={this.closeAlerts} />
        {/* 黑白名单 */}
        {/* 二次确认移除 */}
        <ModalConfirm props={AlertInfo} />
      </div>
    )
  }
  //关闭弹框
  onCancel = () => {
    this.setState({
      removeModal: false, sureAlertShow: false
    })
  }
  //获取不分页的配置列表
  getConfigList = (stringId) => {
    const { onChange } = this.props
    api.listConfigForTemplate({ stringId: stringId }).then(res => {
      if (res.body && res.body.length) {
        this.showConfigList(res.body)
        this.setState({
          origData: res.body,
          removeBusinessIds: map(res.body, 'stringId')
        }, () => onChange && onChange(this.state.origData, this.state.origData, false))
      }
    })
  }
  //关闭弹窗
  closeAlerts = () => {
    this.setState({ alertShow: false })
  }
  //配置页面列表展示
  showConfigList = (checkData) => {
    const { onChange } = this.props
    this.setState({
      elList: checkData.slice(0, 10),
      baseTotal: checkData.length,
      basePagingParameter: {
        currentPage: 1,
        pageSize: 10
      },
      alertShow: false,
      storeData: checkData
    }, () => onChange && onChange(this.state.origData, this.state.storeData))
  }
  //获取基准项/黑名单弹窗中传的值
  saveAlerts = (origData) => {
    let { storeData } = this.state
    const { props } = this.props
    // blankLists 表格数据
    let checkData = []
    //编辑时保存弹框值
    // 新增时添加基准项
    checkData = uniqBy([...storeData, ...origData], 'stringId')
    this.setState({
      removeBusinessIds: map(checkData, 'stringId'),
      defaultList: compact(map(checkData, 'defineValue'))
    }, () => {
      if (props.stringId) {
        this.checkShow()
      }
    })
    this.showConfigList(checkData)
  }
  //基准项值的改变
  repairValueChange = (value, record, index) => {
    const { onChange, showResult, NextshowChange } = this.props
    let { storeData, origData, modifyConfigList } = this.state
    const val = value.target.value
    let { elList } = this.state
    elList = JSON.parse(JSON.stringify(elList))
    elList[index]['defineValue'] = val
    let ob = elList[index]
    let obj = find(storeData, { stringId: ob.stringId })
    let oriObj = find(origData, { stringId: ob.stringId })
    if (obj && ob.defineValue) {
      obj.defineValue = ob.defineValue
      showResult(0)
    } else if (obj) {
      message.warn('值不能为空!')
      showResult(1) //禁用保存按钮
    }
    this.setState({
      elList
    }, () => {
      if (origData.length && oriObj) {
        if (oriObj.defaultValue === val) { //修改值不变的时候
          let index = modifyConfigList.indexOf(oriObj.stringId)
          if (modifyConfigList.length && index !== -1) {
            modifyConfigList.splice(index, 1) //多个修改的时候modifyConfigList相应改变 且保存相应的值defineValue
            this.setState({
              modifyConfigList: modifyConfigList,
              defaultList: compact(map(elList, 'defineValue'))
            }, this.checkShow)
          } else {
            NextshowChange(false) //modifyConfigList为空的时候
          }
        } else {
          modifyConfigList.push(oriObj.stringId) //修改值改变的时候modifyConfigList相应改变 且保存相应的值defineValue
          this.setState({
            defaultList: compact(map(elList, 'defineValue')),
            modifyConfigList: Array.from(new Set(modifyConfigList))
          }, this.checkShow)
        }
      }
      onChange && onChange(this.state.origData, this.state.storeData)
    })
  }
  //基准项、黑名单的显示
  checkOs = (text) => {
    const { form } = this.props
    if (form.getFieldValue('os'))
      this.setState({ alertShow: true })
    else message.warn(`请先选择${text}！`)
  }
  //基准项分页
  changePage = (currentPage, pageSize) => {
    this.setState({
      basePagingParameter: {
        pageSize,
        currentPage
      }
    }, () => {
      this.getCacheList(this.state.storeData, currentPage, pageSize)
    })
  }
  //获取缓存的基准项列表
  getCacheList = (data, currentPage, pageSize) => {
    let items = data.filter((item, index) => index >= (currentPage * pageSize - pageSize) && index < (currentPage * pageSize))
    //基准项缓存
    this.setState({
      elList: items,
      baseTotal: data.length
    })
  }
  // 移除基准项、黑名单
  removeIt = (id) => {
    this.setState({
      removeItemId: id,
      removeModal: true
    })
  }
  checkShow = (type) => {
    const { NextshowChange } = this.props
    let { origData, removeBusinessIds, modifyConfigList, defaultList } = this.state
    let data, value = []
    if (type === 'delete' && origData.length > removeBusinessIds.length) {
      data = difference(map(origData, 'stringId'), removeBusinessIds) //删除的时候源数据和当前的比较
    } else {
      data = difference(removeBusinessIds, map(origData, 'stringId')) //新增的时候现在的和源数据比较
      value = difference(defaultList, compact(map(origData, 'defaultValue')))
    }
    if (data.length || modifyConfigList.length) { //数据不同或者修改数据
      NextshowChange(true)
    } else if (!modifyConfigList.length && value.length) { //数据没有修改 但是值不一样
      NextshowChange(true)
    }
    else {
      NextshowChange(false)
    }
  }
  //移除信息
  deleteState = () => {
    let { removeItemId, basePagingParameter, storeData, origData } = this.state
    const deleteIds = [removeItemId]
    const { onChange, props } = this.props
    let data = []
    let { currentPage, pageSize } = basePagingParameter
    storeData.forEach(item => {
      if (!deleteIds.includes(item.stringId)) {
        data.push(item)
      }
    })
    currentPage = getAfterDeletePage(data.length, currentPage, pageSize)
    this.setState({
      storeData: data,
      currentPage,
      removeBusinessIds: map(data, 'stringId'),
      defaultList: compact(map(data, 'defineValue')),
      removeModal: false
    }, () => {
      if (props.stringId) {
        this.checkShow('delete')
      }
      onChange && onChange(origData, data)
    })
    this.getCacheList(data, currentPage, pageSize)
  }
}

export default ModelEditTable
