
import React, { Component } from 'react'
import { connect } from 'dva'
import { Form, Button, Table, message } from 'antd'
import ModalConfirm from '@/components/common/ModalConfirm'
import AssetModal from '@/components/Alarm/AlarmRule/AssetModal'
import { Search } from '@c/index'
import api from '@/services/api'
export class PatchTable extends Component {
  constructor (props) {
    super(props)
    this.state = {
      columns: [{
        title: '名称',
        dataIndex: 'name',
        key: 'name'
      }, {
        title: '编号',
        dataIndex: 'number',
        key: 'number'
      }, {
        title: 'IP',
        dataIndex: 'ip',
        key: 'ip'
      }, {
        title: '厂商',
        dataIndex: 'supplier',
        key: 'supplier'
      }, {
        title: '资产组',
        dataIndex: 'assetGroup',
        key: 'assetGroup'
      }, {
        title: '重要程度',
        dataIndex: 'importance',
        key: 'importance',
        render: (text)=> {
          switch(text){
            case 1 : return '核心'
            case 2 : return '重要'
            case 3 : return '一般'
            default: break
          }
        }
      }, {
        title: 'MAC',
        dataIndex: 'mac',
        key: 'mac'
      }, {
        title: '操作',
        width: 150,
        render: (text, scope)=>{
          return (
            <div className="operate-wrap"> <a onClick={()=>this.setState({ isShowDel: true, scope })}>删除</a> </div>
          )
        }
      }
      ],
      patchModal: false,
      isShowDel: false,
      patchSelectedRowKeys: [],
      pagingParameter: {
        currentPage: 1,
        pageSize: 10
      },
      list: [], //补丁列表
      newAssetList: [], //新添加补丁列表
      isEdit: this.props.isEdit //判断是编辑还是创建
    }
  }
  componentDidMount () {
    this.props.children(this)
    const { isEdit } = this.state
    isEdit && this.getList()//只有编辑才请求
  }

  getList = (params) => {
    let { isEdit, init, areaId } = this.props
    if(isEdit){
      params = { ruleUniqueId: init.uniqueId, ...params, pageSize: -1, areaId }
      api.allAssetMonitorRulerelationList(params).then( res =>{
        this.setState({ list: res.body.items })
      })
    }

  }
    // 判断是否弹出添加补丁弹窗
    showAdd=()=>{
      if(this.props.areaId){
        this.setState({
          patchModal: true
        })
        this.PatchAlerts.getList()
      }else{
        message.warn('请先选区域')
      }

    }
    // 保存资产弹窗
    savePatch = (patchRowsSelectedList) => {
      let list = JSON.parse(JSON.stringify(this.state.list))
      list.unshift(...patchRowsSelectedList)
      let result = []
      for (let i of list) {
        !result.includes(i) && result.push(i)
      }
      this.setState({
        patchModal: false,
        newAssetList: result
      }, this.getAssetModal)
    }
    // 关闭（取消）弹窗
    closePatch = () => {
      this.setState({
        patchModal: false
      })
    }
    //编辑页面（回显的补丁列表 + 添加列表）
    getAssetModal = () => {
      let { list, newAssetList, isEdit } = this.state
      let concatAssetModal = isEdit ? list.concat(newAssetList) : newAssetList
      const stringArr = concatAssetModal.map(e=>JSON.stringify(e))//new Set数组去重（只能识别数组中的字符串）
      concatAssetModal = [...new Set(stringArr)].map(e=>JSON.parse(e))//转回json格式
      this.setState({
        list: concatAssetModal
      })
    }
    // 点击批量删除是否弹出补丁删除弹框
    isPatchAlertDel = () => {
      const { patchSelectedRowKeys } = this.state
      patchSelectedRowKeys && patchSelectedRowKeys.length ?
        this.setState({ isShowDel: true }) :
        message.info('请勾选数据')
    }
    // 删除补丁
    onDelete = () => {
      let { scope, patchSelectedRowKeys, list } = this.state
      let newAssetList = scope ?
        list.filter( e => !e.assetId.includes(scope.assetId)) :
        //单项删除
        list.filter( e => e.assetId).filter(e=> !patchSelectedRowKeys.includes(e.assetId))
        //批量删除
      this.setState({
        list: newAssetList,
        isShowDel: false
      })
      scope ? this.setState({ scope: undefined }) : this.setState({ patchSelectedRowKeys: [] })
    }
        //表单重置
        handleReset = () => {
          const pagingParameter = {
            pageSize: 10,
            currentPage: 1
          }
          this.setState({
            values: {},
            pagingParameter,
            selectedRowKeys: [],
            selectedRows: []
          }, () => {
            this.getList(pagingParameter)
          })
        }

        // 表单查询
        handleSubmit = (values) => {
          const { pagingParameter } = this.state
          this.setState({
            pagingParameter: {
              pageSize: pagingParameter.pageSize,
              currentPage: 1
            },
            values,
            selectedRowKeys: [],
            selectedRows: []
          }, () => {
            const { pagingParameter } = this.state
            this.getList({
              ...pagingParameter,
              ...values
            })
          })
        }
        render () {
          let { columns, list, patchModal,  isShowDel, patchSelectedRowKeys } = this.state
          const defaultFields = [
            { type: 'input', label: '综合查询', placeholder: '请输入名称/编号/IP/MAC', key: 'multipleQuery', allowClear: true, maxLength: 80 }
          ]
          // comfirm样的model参数
          const DelConfig = {
            visible: isShowDel,
            children: (<p className='model-text'>是否删除该资产?</p>),
            onOk: this.onDelete,
            onCancel: () => this.setState({ isShowDel: false })
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
                <Search defaultFields={defaultFields} onSubmit={values => this.handleSubmit(values)} onReset={this.handleReset}/>
                <div className="table-btn">
                  <div className="left-btn">
                    {<Button type="primary" style={{ width: 'auto' }} onClick={this.showAdd}>添加资产</Button>}
                  </div>
                  <div className="right-btn">
                    {<Button type="primary" style={{ width: 'auto' }} onClick={this.isPatchAlertDel}>删除</Button>}
                  </div>
                </div>
                <Table
                  rowKey="assetId"
                  columns={columns}
                  dataSource={list}
                  rowSelection={patchRowSelection}
                  pagination={{
                    showQuickJumper: true,
                    showSizeChanger: list.length > 10 && true,
                    showTotal: () => `共 ${list.length} 条数据`
                  }}></Table>
              </div>

              {/* 包含补丁弹框 */}
              <AssetModal
                children={(now) => this.PatchAlerts = now}
                visible={patchModal}
                saveModal={ this.savePatch }
                closeModal={ this.closePatch }
                areaId={this.props.areaId}
                originalAssetIdList={list.map( item => { return item.assetId})}
              />
              <ModalConfirm props={DelConfig}/>
            </div>
          )
        }
}

const mapStateToProps = ({ Alarms }) => {
  return {
  }
}
const PatchTables = Form.create()(PatchTable)

export default connect(mapStateToProps)(PatchTables)