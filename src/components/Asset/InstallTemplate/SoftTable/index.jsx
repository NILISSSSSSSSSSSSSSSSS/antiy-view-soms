
import React, { Component } from 'react'
import { connect } from 'dva'
import { Form, Button, Table, message } from 'antd'
import ModalConfirm from '@/components/common/ModalConfirm'
import SoftList from '@/components/common/SoftModal'
import { TooltipFn } from '@/utils/common'
import api from '@/services/api'
export class SoftTable extends Component {
  constructor (props) {
    super(props)
    this.state = {
      softColumns: [
        {
          title: '厂商',
          dataIndex: 'supplier',
          key: 'supplier',
          render: text => TooltipFn(text)
        }, {
          title: '名称',
          dataIndex: 'productName',
          key: 'productName',
          render: text => TooltipFn(text)
        }, {
          title: '版本',
          dataIndex: 'version',
          key: 'version',
          render: text => TooltipFn(text)
        }, {
          title: '系统版本',
          dataIndex: 'sysVersion',
          key: 'sysVersion',
          render: text => TooltipFn(text)
        }, {
          title: '语言',
          dataIndex: 'language',
          key: 'language',
          render: text => TooltipFn(text)
        }, {
          title: '软件版本',
          dataIndex: 'softVersion',
          key: 'softVersion',
          render: text => TooltipFn(text)
        }, {
          title: '版本平台',
          dataIndex: 'softPlatform',
          key: 'softPlatform',
          render: text => TooltipFn(text)
        }, {
          title: '操作',
          dataIndex: 'operate',
          key: 'operate',
          render: (text, record) => {
            return (
              <div className="operate-wrap">
                <a onClick={() => this.setState({ softDeleteModal: true, record })}>删除</a>
              </div>
            )
          }
        }
      ],
      softModal: false,
      softDeleteModal: false,
      softSelectedRowKeys: [],
      softRowsSelectedList: [],
      softList: [], //软件列表
      newSoftList: [], //新添加软件列表
      isEdit: this.props.isEdit //判断是编辑还是创建
    }
  }
  componentDidMount () {
    this.props.children(this)
    const { isEdit } = this.state
    isEdit && this.getSoftData()//只有编辑才请求
  }
  UNSAFE_componentWillReceiveProps (nextProps) {

  }
  render () {
    let { softColumns, softList, softModal, softDeleteModal, softSelectedRowKeys } = this.state
    // comfirm样的model参数
    const softDelete = {
      visible: softDeleteModal,
      children: (<p className='model-text'>是否删除包含软件?</p>),
      onOk: this.clearSoft,
      onCancel: () => this.setState({ softDeleteModal: false })
    }
    //复选框
    const softRowSelection = {
      selectedRowKeys: softSelectedRowKeys,
      onChange: (softSelectedRowKeys, selectedRows) => {
        this.setState({
          softSelectedRowKeys,
          softRowsSelectedList: selectedRows
        })
      }
    }
    return (
      <div>
        <div className="table-wrap">
          <div className="table-btn">
            <div className="left-btn">
              {<Button type="primary" style={{ width: 'auto' }} onClick={this.showAdd}>添加</Button>}
            </div>
            <div className="right-btn">
              {<Button type="primary" style={{ width: 'auto' }} onClick={this.isSoftAlertDel}>删除</Button>}
            </div>
          </div>
          <Table
            rowKey="stringId"
            columns={softColumns}
            dataSource={softList}
            rowSelection={softRowSelection}
            pagination={{
              showQuickJumper: true,
              showSizeChanger: softList.length > 10 && true,
              showTotal: () => `共 ${softList.length} 条数据`
            }}></Table>
        </div>
        {/* 包含软件弹框 */}
        <SoftList
          clearTable={(now) => this.child = now}
          visible={softModal}
          isTemplate={'assetTemplate'}
          removeBusinessIds= { softList.map( item => { return item.stringId }) }
          os={this.props.isSysem}
          saveAlerts={this.saveSoft}
          closeAlerts={this.closeSoft}
        />
        <ModalConfirm props={softDelete}/>
      </div>
    )
  }
  //编辑时获取
  getSoftData = () => {
    let init = this.props.init
    api.installTemplateEditSoftList({ stringId: init.stringId }).then( res => {
      this.setState({
        softList: res.body || []
      })
    })
  }
  // 判断是否弹出添加补丁弹窗
  showAdd=()=>{
    if(this.props.isSysem){
      this.setState({
        softModal: true
      })
    }else{
      message.warn('请先选择操作系统')
    }

  }
  // 保存软件弹窗
  saveSoft = (softRowsSelectedList) => {
    let softList = JSON.parse(JSON.stringify(this.state.softList))
    softList.unshift(...softRowsSelectedList)
    let result = []
    for (let i of softList) {
      !result.includes(i) && result.push(i)
    }
    this.setState({
      softModal: false,
      newSoftList: result
    }, this.getSoftList)
  }
  // 关闭（取消）软件弹窗
  closeSoft = () => {
    this.setState({
      softModal: false
    })
  }
  //编辑页面（回显的软件列表 + 添加列表）
  getSoftList = () => {
    let { softList, newSoftList, isEdit } = this.state
    // 再对新增和原数据去重
    let concatSoftList = isEdit ? softList.concat(newSoftList) : newSoftList
    const stringArr = concatSoftList.map(e=>JSON.stringify(e))//new Set数组去重（只能识别数组中的字符串）
    concatSoftList = [...new Set(stringArr)].map(e=>JSON.parse(e))//转回json格式
    this.setState({
      softList: concatSoftList
    })
  }
  //点击批量删除是否弹出软件删除弹框
  isSoftAlertDel = () => {
    const { softSelectedRowKeys } = this.state
    softSelectedRowKeys && softSelectedRowKeys.length ?
      this.setState({ softDeleteModal: true }) :
      message.info('请勾选数据')
  }
  // 删除软件
  clearSoft = () => {
    let { record, softSelectedRowKeys, softList } = this.state
    //单项删除
    let newSoftList = record ?  softList.filter( e => !e.stringId.includes(record.stringId)) :
    //批量删除
      softList.filter( e => e.stringId).filter(e=> !softSelectedRowKeys.includes(e.stringId))
    this.setState({
      softList: newSoftList,
      softDeleteModal: false
    })
    record ? this.setState({ record: undefined }) : this.setState({ softSelectedRowKeys: [], softRowsSelectedList: [] })
  }
}
const mapStateToProps = ({ Alarms }) => {
  return {
  }
}
const SoftTables = Form.create()(SoftTable)

export default connect(mapStateToProps)(SoftTables)