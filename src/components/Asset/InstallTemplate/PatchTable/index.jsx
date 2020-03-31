
import React, { Component } from 'react'
import { connect } from 'dva'
import { Form, Button, Table, message } from 'antd'
import ModalConfirm from '@/components/common/ModalConfirm'
import PatchList from '@/components/Asset/InstallTemplate/PatchAlerts'
import { TooltipFn } from '@/utils/common'
import api from '@/services/api'
export class PatchTable extends Component {
  constructor (props) {
    super(props)
    this.state = {
      patchColumns: [
        {
          title: '补丁编号',
          dataIndex: 'patchNumber',
          key: 'patchNumber',
          render: text => TooltipFn(text)
        }, {
          title: '补丁名称',
          dataIndex: 'patchName',
          key: 'patchName',
          render: text => TooltipFn(text)
        }, {
          title: '补丁等级',
          dataIndex: 'patchLevel',
          key: 'patchLevel',
          render: text => TooltipFn(text)
        }, {
          title: '补丁来源',
          dataIndex: 'pathSource',
          key: 'pathSource',
          render: text => TooltipFn(text)
        }, {
          title: '补丁热支持',
          dataIndex: 'hotfix',
          key: 'hotfix',
          render: text => TooltipFn(text)
        }, {
          title: '用户交互',
          dataIndex: 'userInteraction',
          key: 'userInteraction',
          render: text => TooltipFn(text)
        }, {
          title: '独占方式安装',
          dataIndex: 'exclusiveInstall',
          key: 'exclusiveInstall',
          render: text => TooltipFn(text)
        }, {
          title: '联网状态',
          dataIndex: 'networkStatus',
          key: 'networkStatus',
          render: text => TooltipFn(text)
        }, {
          title: '操作',
          dataIndex: 'operate',
          key: 'operate',
          render: (text, record) => {
            return (
              <div className="operate-wrap">
                <a onClick={() => this.setState({ patchDeleteModal: true, record })}>删除</a>
              </div>
            )
          }
        }
      ],
      patchModal: false,
      patchDeleteModal: false,
      patchSelectedRowKeys: [],
      patchList: [], //补丁列表
      newPatchList: [], //新添加补丁列表
      isEdit: this.props.isEdit //判断是编辑还是创建
    }
  }
  componentDidMount () {
    this.props.children(this)
    const { isEdit } = this.state
    isEdit && this.getPatchData()//只有编辑才请求
  }

  render () {
    let { patchColumns, patchList, patchModal,  patchDeleteModal, patchSelectedRowKeys } = this.state
    // comfirm样的model参数
    const patchDelete = {
      visible: patchDeleteModal,
      children: (<p className='model-text'>是否删除包含补丁?</p>),
      onOk: this.clearPatch,
      onCancel: () => this.setState({ patchDeleteModal: false })
    }
    const patchRowSelection = {
      selectedRowKeys: patchSelectedRowKeys,
      onChange: (patchSelectedRowKeys, selectedRows) => {
        this.setState({
          patchSelectedRowKeys,
          patchRowsSelectedList: selectedRows
        })
      },
      getCheckboxProps: record => ({
        disabled: record.name === 'Disabled User',
        name: record.name
      })
    }
    return (
      <div>
        <div className="table-wrap">
          <div className="table-btn">
            <div className="left-btn">
              {<Button type="primary" style={{ width: 'auto' }} onClick={this.showAdd}>添加</Button>}
            </div>
            <div className="right-btn">
              {<Button type="primary" style={{ width: 'auto' }} onClick={this.isPatchAlertDel}>删除</Button>}
            </div>
          </div>
          <Table
            rowKey="stringId"
            columns={patchColumns}
            dataSource={patchList}
            rowSelection={patchRowSelection}
            pagination={{
              showQuickJumper: true,
              showSizeChanger: patchList.length > 10 && true,
              showTotal: () => `共 ${patchList.length} 条数据`
            }}></Table>
        </div>

        {/* 包含补丁弹框 */}
        <PatchList
          children={(now) => this.PatchAlerts = now}
          visible={patchModal}
          saveModal={ this.savePatch }
          closeModal={ this.closePatch }
          operationSystem={this.props.isSysem}
          patchs={patchList.map( item => { return item.stringId})}
        />
        <ModalConfirm props={patchDelete}/>
      </div>
    )
  }
  //编辑时获取
  getPatchData = () => {
    let init = this.props.init
    api.installTemplateEditPatchList({ stringId: init.stringId }).then( res => {
      this.setState({
        patchList: res.body || []
      })
    })
  }
  // 判断是否弹出添加补丁弹窗
  showAdd=()=>{
    if(this.props.isSysem){
      this.setState({
        patchModal: true
      })
      this.PatchAlerts.getList()
    }else{
      message.warn('请先选择操作系统')
    }

  }
  // 保存补丁弹窗
  savePatch = (patchRowsSelectedList) => {
    let patchList = JSON.parse(JSON.stringify(this.state.patchList))
    patchList.unshift(...patchRowsSelectedList)
    let result = []
    for (let i of patchList) {
      !result.includes(i) && result.push(i)
    }
    this.setState({
      patchModal: false,
      newPatchList: result
    }, this.getPatchList)
  }
  // 关闭（取消）补丁弹窗
  closePatch = () => {
    this.setState({
      patchModal: false
    })
  }
  //编辑页面（回显的补丁列表 + 添加列表）
  getPatchList = () => {
    let { patchList, newPatchList, isEdit } = this.state
    let concatPatchList = isEdit ? patchList.concat(newPatchList) : newPatchList
    const stringArr = concatPatchList.map(e=>JSON.stringify(e))//new Set数组去重（只能识别数组中的字符串）
    concatPatchList = [...new Set(stringArr)].map(e=>JSON.parse(e))//转回json格式
    this.setState({
      patchList: concatPatchList
    })
  }
  // 点击批量删除是否弹出补丁删除弹框
  isPatchAlertDel = () => {
    const { patchSelectedRowKeys } = this.state
    patchSelectedRowKeys && patchSelectedRowKeys.length ?
      this.setState({ patchDeleteModal: true }) :
      message.info('请勾选数据')
  }
  // 删除补丁
  clearPatch = () => {
    let { record, patchSelectedRowKeys, patchList } = this.state
    let newPatchList = record ?
      patchList.filter( e => !e.stringId.includes(record.stringId)) :
      //单项删除
      patchList.filter( e => e.stringId).filter(e=> !patchSelectedRowKeys.includes(e.stringId))
      //批量删除
    this.setState({
      patchList: newPatchList,
      patchDeleteModal: false
    })
    record ? this.setState({ record: undefined }) : this.setState({ patchSelectedRowKeys: [] })
  }
}

const mapStateToProps = ({ Alarms }) => {
  return {
  }
}
const PatchTables = Form.create()(PatchTable)

export default connect(mapStateToProps)(PatchTables)