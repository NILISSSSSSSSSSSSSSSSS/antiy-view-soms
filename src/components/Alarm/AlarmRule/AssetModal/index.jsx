import React, { Component, Fragment } from 'react'
import { connect } from 'dva'
import {  Form, Input, Button, Table, Pagination, Modal, message, Divider, Select, Icon } from 'antd'
import api from '@/services/api'
import './style.less'
import { ASSETS_IMPORTANT } from '@a/js/enume'
const { Item } = Form
const { Option } = Select
export class PatchAlert extends Component {
  constructor (props){
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
      }],
      pagingParameter: {
        currentPage: 1,
        pageSize: 10
      },
      list: [],
      totalRecords: 0,
      groupList: [],
      search: {},
      supplierArr: [{ value: 1, name: 'dhdhd' }],
      selectedRowKeys: [],
      rowsSelectedList: []
    }
  }
  componentDidMount (){
    this.props.children(this)
    this.getSupplierData()
    this.getGroupList()
  }
    //列表数据
    getList = (params) => {
      let { areaId, originalAssetIdList } = this.props
      let { search, pagingParameter } = this.state
      api.allAssetMonitorRulerelationList({ areaList: [areaId], ...search, ...pagingParameter, removedAssetIds: originalAssetIdList }).then( res => {
        this.setState({ list: res.body.items, totalRecords: res.body.totalRecords })
      })
    }
    // 厂商下拉
    getSupplierData = () => {
      api.getManufacturerInfo({ supplier: null }).then( res => {
        this.setState({ supplierArr: res.body })
      }
      )
    }
  // 获取资产组
  getGroupList = () => {
    api.getGroupInfo().then((res)=>{
      this.setState({ groupList: res.body })
    })
  }
    //分页
    pageChange = (currentPage, pageSize) => {
      this.setState({
        pagingParameter: {
          currentPage,
          pageSize
        }
      }, this.getList)
    }
    closeModal = () => {
      this.props.form.resetFields()
      this.setState({
        pagingParameter: {
          currentPage: 1,
          pageSize: 10
        },
        search: {},
        selectedRowKeys: []
      }, this.props.closeModal)
    }
    saveModal = () => {
      this.props.form.resetFields()
      let { rowsSelectedList } = this.state
      if(rowsSelectedList.length > 0){
        this.setState({
          pagingParameter: {
            currentPage: 1,
            pageSize: 10
          },
          search: {},
          selectedRowKeys: [],
          rowsSelectedList: []
        }, () => this.props.saveModal(rowsSelectedList))
      } else {
        message.warn('没有选择要添加的资产')
      }

    }
    onSubmit = (e) => {
      e.preventDefault()
      this.props.form.validateFields( (err, values) => {
        if(!err){
          this.setState({
            search: values,
            pagingParameter: {
              currentPage: 1,
              pageSize: 10
            }
          }, this.getList)
        }
      })
    }

    //重置表单信息
    handleReset = ()=>{
      this.props.form.resetFields()
      this.setState({
        search: {},
        selectedRowKeys: [],
        rowsSelectedList: [],
        pagingParameter: {
          currentPage: 1,
          pageSize: 10
        }
      }, () => this.getList())
    }
    render (){
      let { columns, selectedRowKeys,  pagingParameter, list, totalRecords, rowsSelectedList, supplierArr, isOpen, groupList } = this.state
      let { getFieldDecorator } = this.props.form
      let { visible } = this.props
      const rowSelection = {
        selectedRowKeys,
        onChange: (selectedRowKeys, selectedRows) => {
          //分页批量操作
          let _rowsSelectedList = [...rowsSelectedList,  ...selectedRows]//把之前选中的和当前选中的列表放一起
          const tmpArr = _rowsSelectedList.map(e=>JSON.stringify(e))//把列表每项转成字符串
          _rowsSelectedList = [ ...new Set(tmpArr) ].map(e=>JSON.parse(e)).filter(e=>selectedRowKeys.includes(e.assetId))// new set()数组去重再转数组，再过滤掉selectedRowKeys=assetId的
          this.setState({
            selectedRowKeys,
            rowsSelectedList: _rowsSelectedList
          })
        }
      }
      return(
        <Modal
          className="table-modal over-scroll-modal"
          width={1200}
          visible={visible}
          onOk={ this.saveModal }
          onCancel={ this.closeModal }
        >
          <Form  className="filter-form new-flex-layout" layout="inline" onSubmit={this.onSubmit}>
            <Item label="综合查询">
              {getFieldDecorator('multipleQuery')(
                <Input autoComplete="off" className="filter-form-item" placeholder="请输入名称/编号/IP/MAC" maxLength={30}/>
              )}
            </Item>
            <Item className="search-item item-separation">
              <Button type="primary" htmlType="submit">查询</Button>
              <Button type="primary" ghost htmlType='reset' onClick={this.handleReset}>重置</Button>
              <span className="show-ondition" onClick={() => this.setState({ isOpen: !isOpen })}> <Icon type={isOpen ? 'up' : 'down'} /> {isOpen ? '收起' : '展开'} </span>
            </Item>
            <Divider className='br-hide-line'/>
            {isOpen &&
          <Fragment>
            <Item label="厂商">
              {
                getFieldDecorator('supplier'
                )(
                  <Select
                    className="filter-form-item"
                    getPopupContainer={triggerNode => triggerNode.parentNode}
                    placeholder="请选择" >
                    {
                      supplierArr.map((item, index)=>{
                        return (<Option value={item} key={index}>{item}</Option>)
                      })
                    }
                  </Select>
                )
              }
            </Item>
            <Item label='资产组'>
              {getFieldDecorator('assetGroup', {
                initialValue: ''
              })(
                <Select showSearch
                  getPopupContainer={triggerNode => triggerNode.parentNode}
                  optionFilterProp="children">
                  <Option value={''} key={''}>全部</Option>
                  {groupList && groupList.map((item) => (
                    <Option value={item.id} key={item.id}>{item.value}</Option>)
                  )}
                </Select>
              )}
            </Item>
            <Item label="重要程度">
              {
                getFieldDecorator('importance',  { initialValue: 1 }
                )(
                  <Select>
                    {
                      ASSETS_IMPORTANT.map(item => {
                        return <Option value={item.value} key={item.value}>{item.name}</Option>
                      })
                    }

                  </Select>
                )
              }
            </Item>
          </Fragment>
            }
          </Form>
          <div className="table-wrap">
            <Table rowKey="assetId" rowSelection={rowSelection} columns={columns} dataSource={ list }  pagination={false}></Table>
            {/* 分页 */}
            {
              totalRecords > 0 &&
            <Pagination
              current={pagingParameter.currentPage}
              pageSize={pagingParameter.pageSize}
              className="table-pagination"
              onChange={this.pageChange}
              onShowSizeChange={this.pageChange}
              total={totalRecords || 0}
              showTotal={(total) => `共 ${total || 0} 条数据`}
              showSizeChanger={false}
              showQuickJumper={true} />
            }

          </div>
        </Modal>
      )
    }
}

const mapStateToProps = ({ Alarms }) => {
  return {
  }
}
const PatchAlerts = Form.create()(PatchAlert)
export default connect(mapStateToProps)(PatchAlerts)
