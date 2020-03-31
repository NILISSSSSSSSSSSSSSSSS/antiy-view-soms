import React, { Component } from 'react'
import { Table, Pagination, Button, message } from 'antd'
import BlankList from '@/components/common/SoftModal'
import { TooltipFn, getAfterDeletePage } from '@/utils/common'
import { uniqBy, map, difference } from 'lodash'
import api from '@/services/api'
import ModalConfirm from '@/components/common/ModalConfirm'

export class ModelEditTable extends Component {
  constructor (props) {
    super(props)
    this.state = {
      SoftColumns: [
        {
          title: '厂商',
          dataIndex: 'manufacturer',
          key: 'manufacturer',
          render: text => TooltipFn(text)
        },
        {
          title: '名称',
          dataIndex: 'softwareName',
          key: 'softwareName',
          render: text => TooltipFn(text)
        },
        {
          title: '版本',
          dataIndex: 'edition',
          key: 'edition',
          render: text => TooltipFn(text)
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
            </div>
          )
        }
      ],
      origData: [],
      removeModal: false, //移除二次确认
      blankAlertShow: false, //黑名单显示
      blankLists: [], //软件列表
      storeData: [], //前端分页数据缓存
      blankTotal: 0,
      blankPagingParameter: {
        pageSize: 10,
        currentPage: 1
      },
      removeBusinessIds: [], //已经添加的项
      removeItemId: '' //移除id
    }
  }

  componentDidMount () {
    this.props.children(this)
    const { props } = this.props
    if (props.stringId)
      this.getSoftList(props.stringId)
  }
  render () {
    const { props } = this.props
    let {
      blankAlertShow,
      removeModal,
      blankLists,
      blankPagingParameter,
      blankTotal,
      SoftColumns,
      removeBusinessIds
    } = this.state
    const AlertInfo = {
      visible: removeModal,
      onOk: this.deleteState,
      onCancel: this.onCancel,
      children: (<p className="model-text"> 确认移除该软件？</p>)
    }
    return (
      <div className="config-model-table">
        {props.blankType !== 0 &&
          <div className="table-wrap">
            <div className="table-btn">
              <div className="left-btn">
                <Button type="primary" onClick={() => this.checkOs('黑白名单')}>添加软件</Button>
              </div>
            </div>
            <Table rowKey='stringId' columns={SoftColumns} dataSource={blankLists} pagination={false}></Table>
            {blankTotal > 0 && <Pagination
              className="table-pagination"
              total={blankTotal}
              showTotal={(total) => `共 ${total || 0} 条数据`}
              showSizeChanger={false}
              showQuickJumper
              onChange={this.changePage}
              onShowSizeChange={this.changePage}
              current={blankPagingParameter.currentPage} />
            }
          </div>
        }
        {/* 黑白名单 */}
        <BlankList
          os={props.os ? props.os : this.props.form.getFieldValue('os')}
          removeBusinessIds={removeBusinessIds}
          visible={blankAlertShow}
          saveAlerts={this.saveAlerts}
          closeAlerts={this.closeAlerts} />
        {/* 二次确认移除 */}
        <ModalConfirm props={AlertInfo} />
      </div>
    )
  }
  //关闭弹框
  onCancel = () => {
    this.setState({
      removeModal: false
    })
  }
  //获取不分页的配置列表
  getSoftList = (stringId) => {
    const { onChange } = this.props
    api.listSoftwareForTemplate({ stringId: stringId }).then(res => {
      if (res.body && res.body.length) {
        this.showSoftList(res.body)
        this.setState({
          origData: res.body,
          removeBusinessIds: map(res.body, 'stringId')
        }, () => onChange && onChange(this.state.origData, this.state.origData, false))
      }
    })
  }
  //关闭弹窗
  closeAlerts = () => {
    this.setState({ blankAlertShow: false })
  }
  //黑白名单列表展示
  showSoftList = (checkData) => {
    const { onChange } = this.props
    this.setState({
      blankLists: checkData.slice(0, 10),
      blankTotal: checkData.length,
      blankPagingParameter: {
        currentPage: 1,
        pageSize: 10
      },
      values: {
        addSoftwareList: checkData
      },
      blankAlertShow: false,
      storeData: checkData
    }, () => onChange && onChange(this.state.origData, checkData))
  }
  //获取基准项/黑名单弹窗中传的值
  saveAlerts = (saveData) => {
    const { props } = this.props
    let { storeData } = this.state
    // blankLists 表格数据
    let checkData = []
    //保存弹框值
    checkData = uniqBy([...saveData, ...storeData], 'stringId')
    this.setState({
      removeBusinessIds: map(checkData, 'stringId')
    }, () => {
      if (props.stringId) {
        this.checkShow()
      }
    })
    this.showSoftList(checkData)
  }
  checkShow = (type) => {
    const { NextshowChange } = this.props
    let { origData, removeBusinessIds } = this.state
    let data = []
    if (type === 'delete' && origData.length > removeBusinessIds.length) {
      data = difference(map(origData, 'stringId'), removeBusinessIds) //删除的时候源数据和当前的比较
    } else {
      data = difference(removeBusinessIds, map(origData, 'stringId')) //新增的时候现在的和源数据比较
    }
    if (data.length) {
      NextshowChange(true, 1)
    } else {
      NextshowChange(false, 1)
    }
  }
  //基准项、黑名单的显示
  checkOs = (text) => {
    const { form } = this.props
    if (!form.getFieldValue('os')) {
      message.warn('请先选择适用系统！')
    }
    else if (form.getFieldValue('softwareType')) {
      this.setState({ blankAlertShow: true })
    }
    else message.warn(`请先选择${text}！`)
  }
  //基准项分页
  changePage = (currentPage, pageSize) => {
    this.setState({
      blankPagingParameter: {
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
    // 黑名单缓存
    this.setState({
      blankLists: items,
      blankTotal: data.length
    })
  }
  // 移除基准项、黑名单
  removeIt = (id) => {
    this.setState({
      removeItemId: id,
      removeModal: true
    })
  }
  //移除信息
  deleteState = () => {
    let { removeItemId, blankPagingParameter, storeData, origData } = this.state
    const { onChange, props } = this.props
    const deleteIds = [removeItemId]
    let data = []
    // 黑名单移除
    let { currentPage, pageSize } = blankPagingParameter
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
