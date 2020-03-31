
import  React, { Component } from 'react'
import { connect } from 'dva'
import { Form, Pagination, Row, Col, Divider, Table } from 'antd'
import { analysisUrl } from '@/utils/common'
import { Search } from '@c/index'
import api from '@/services/api'
import './style.less'
export class Create extends Component {
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
      }],
      list: [],
      basicsData: {},
      totalRecords: 0,
      pagingParameter: {
        currentPage: 1,
        pageSize: 10
      },
      isAlertErr: false,
      init: analysisUrl(this.props.location.search)
    }
  }
  componentDidMount () {
    this.getDetail()
    this.getList()
  }
  getList = () => {
    const { init, pagingParameter } = this.state
    const { currentPage, pageSize } = pagingParameter
    api.allAssetMonitorRulerelationList({ currentPage, pageSize,   ruleUniqueId: init.uniqueId }).then( res =>{
      this.setState({ list: res.body.items, totalRecords: res.body.totalRecords })
    })
  }
  getDetail =() => {
    const { init } = this.state
    api.queryruleinfo({ uniqueId: init.uniqueId }).then( (res) => {
      this.setState({
        basicsData: res.body,
        areaId: res.body.areaId
      })
    })
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
   //翻页
   pageChange = (page, pageSize)=>{
     this.setState({
       pagingParameter: {
         pageSize,
         currentPage: page
       }
     }, this.getList )

   }

   render () {
     let { basicsData, columns, totalRecords, pagingParameter, list } = this.state
     const span = { xxl: 6, xl: 8 }
     const defaultFields = [
       { type: 'input', label: '综合查询', placeholder: '请输入名称/编号/IP/MAC', key: 'multipleQuery', allowClear: true, maxLength: 80 }
     ]
     const auditRankArray = ['紧急', '重要', '次要', '提示']
     return (
       <div>
         <div className="search-bar main-detail-content">
           <p className="detail-title">规则信息</p>
           <div>
           </div>
           <div className="detail-content">
             <Row>
               <Col {...span}><span className="detail-content-label">规则名称：</span>{basicsData.name}</Col>
               <Col {...span}><span className="detail-content-label">区域：</span>{basicsData.areaName}</Col>
               <Divider dashed className='dashed-line'/>
               <Col {...span}><span className="detail-content-label">告警等级：</span>{ auditRankArray[basicsData.alarmLevel - 1]}</Col>
               <Col {...span}><span className="detail-content-label">状态：</span>{basicsData.ruleStatus === '1' ? '启用' : '禁用'}</Col>
               <Divider dashed className='dashed-line'/>
             </Row>
             <Row>
               <Col {...span}><span>监控类型</span></Col>
               <Divider className='dashed-line'/>
               <Col {...span}><span>CPU监控</span></Col>
               <Col {...span}><span className="detail-content-label">阈值：</span>{basicsData.cpuThreshold}</Col>
             </Row>
             <Row>
               <Col {...span}><span>内存监控</span></Col>
               <Col {...span}><span className="detail-content-label">阈值：</span>{basicsData.memoryThreshold}</Col>
             </Row>
             <Row>
               <Col {...span}><span>总磁盘监控</span></Col>
               <Col {...span}><span className="detail-content-label">阈值：</span>{basicsData.diskThreshold}</Col>
             </Row>
             <Row>
               <Col {...span}><span>运行异常监控</span></Col>
               <Col {...span}><span className="detail-content-label">阈值：</span>{basicsData.runtimeExceptionThreshold}</Col>
               <Col {...span}><span className="detail-content-label">时间单位：</span>{basicsData.unit}</Col>
             </Row>
           </div>
           <p className="detail-title">已选中资产</p>
           <div className="table-wrap">
             <Search defaultFields={defaultFields} onSubmit={values => this.handleSubmit(values)} onReset={this.handleReset}/>
             <div className="alarm-table-box">
               <Table rowKey="assetId" columns={columns} dataSource={list} pagination={false}></Table>
             </div>
             {
               totalRecords > 0 &&
          <Pagination
            current={pagingParameter.currentPage}
            className="table-pagination"
            defaultPageSize={10}
            pageSize={pagingParameter.pageSize}
            onChange={this.pageChange}
            showSizeChanger={ totalRecords > 10 && true}
            onShowSizeChange={ this.pageChange}
            total={ totalRecords ? totalRecords : 0}
            showTotal={(total) => `共 ${total} 条数据`}
            showQuickJumper={true} />
             }
           </div>
         </div>
       </div>
     )
   }
}

const mapStateToProps = ({ information }) => {
  return {  }
}
const Creates = Form.create()(Create)

export default connect(mapStateToProps)(Creates)
