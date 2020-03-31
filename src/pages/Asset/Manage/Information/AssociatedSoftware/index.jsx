import React, { PureComponent } from 'react'
import { connect } from 'dva'
import { Search, CommonModal } from '@c'
import { Form, Table, message, Select, Input } from 'antd'
import PropTypes from 'prop-types'
import { debounce, throttle } from 'lodash'
import { TooltipFn } from '@u/common'
import api from '@/services/api'

const FormItem = Form.Item
const { Option } = Select
@Form.create()
@connect(({ asset }) => ({
  installableList: asset.installableList,
  usersByRoleCodeAndAreaIdList: asset.usersByRoleCodeAndAreaIdList
}))
class AssociatedSoftware extends PureComponent{
   state = {
     PrefixCls: 'AssociatedSoftware',
     //查询开始
     currentPage: 1,
     pageSize: 10,
     selectedRowKeys: [],
     supplier: null,
     productName: null
     //查询结束
   }

    static propTypes = {
      soVisible: PropTypes.bool,
      associds: PropTypes.array,
      associatedSoftware: PropTypes.func,
      installableList: PropTypes.object,
      usersByRoleCodeAndAreaIdList: PropTypes.array
    }

    onSelectChange = (selectedRowKeys, selectedRows) => {
      this.setState({ otherBusinessIds: selectedRowKeys, selectedRowKeys })
    };

    //提交
    onSubmit = (values) => {
      this.setState({
        supplier: values.supplier,
        productName: values.productName,
        currentPage: 1,
        pageSize: 10
      }, this.installableList)
    }

    //重置
    onReset = ()=>{
      this.setState({
        supplier: null,
        productName: null,
        currentPage: 1,
        pageSize: 10
      }, this.installableList)
    }

    //分页
    pageChange=(currentPage, pageSize)=>{
      this.setState({
        currentPage,
        pageSize
        // selectedRowKeys: []
      }, this.installableList)
    }

    getRecordsArrIds=(stringId)=>{
      let assetId = []
      this.props.associds.forEach(v=>assetId.push(v[stringId]))
      return assetId
    }

    //确定关联组件
    onConfirm = throttle(()=>{
      this.props.form.validateFields((err, values) => {
        if(err) return void(0)
        this.onConfirmCB(values)
      })
    }, 5000, { trailing: false })

    /***************副作用开始************** */

    onConfirmCB=values=>{
      const {
        associatedSoftware,
        usersByRoleCodeAndAreaIdList,
        compEffectCB
      } = this.props
      let params = {
        assetId: this.getRecordsArrIds('stringId'),
        softId: this.state.selectedRowKeys
      }
      if(params.softId.length === 0){
        message.info('请选择关联软件!')
        return void(0)
      }
      if(values.baselineConfigUserId === ' '){
        values.baselineConfigUserId = usersByRoleCodeAndAreaIdList.map(item=>item.stringId).join(',')
      }
      params.manualStartActivityRequest = {
        formData: {
          'baselineConfigUserId': values.baselineConfigUserId,
          'memo': values.memo
        }
      }
      api.batchRelation(params).then(res => {
        if(res && res.head && res.head.code === '200'){
          message.success('操作成功！')
          associatedSoftware(false)
          compEffectCB()
        }
      })
    }

    installableList=debounce(async ()=>{
      const state = this.state
      const payload = {
        baselineTemplateId: this.props.associds[0].baselineTemplateId,
        supplier: state.supplier,
        productName: state.productName,
        currentPage: state.currentPage,
        pageSize: state.pageSize
      }
      await this.props.dispatch({ type: 'asset/installableList', payload: payload })
    }, 300)

    //操作人员
    getUsersByRoleCodeAndAreaId=()=>{
      this.props.dispatch({ type: 'asset/getUsersByRoleCodeAndAreaId', payload: {
        flowNodeTag: 'config_base', flowId: 4, areaId: this.getRecordsArrIds('areaId') }
      })
    }

    render (){
      const { selectedRowKeys, currentPage, pageSize } = this.state
      const { soVisible, associatedSoftware, installableList, form: { getFieldDecorator }, usersByRoleCodeAndAreaIdList } = this.props
      const defaultFields = [
        { type: 'input', label: '厂商', placeholder: '请输入厂商', key: 'supplier', allowClear: true, maxLength: 30 },
        { type: 'input', label: '名称', placeholder: '请输入名称', key: 'productName', allowClear: true, maxLength: 30 }
      ]

      const columns = [
        {
          title: '厂商',
          dataIndex: 'supplier',
          render: text => TooltipFn (text)
        },
        {
          title: '名称',
          dataIndex: 'productName',
          render: text => TooltipFn (text)
        },
        {
          title: '版本',
          dataIndex: 'version',
          render: text => TooltipFn (text)
        },
        {
          title: '软件平台',
          dataIndex: 'softPlatform',
          render: text => TooltipFn (text)
        }
      ]

      const rowSelection = {
        selectedRowKeys,
        onChange: this.onSelectChange
      }

      const formLayout = {
        labelCol: {
          span: 8
        },
        wrapperCol: {
          span: 16
        }
      }

      return(
        <CommonModal
          title="关联软件"
          type="search"
          visible={soVisible}
          width={1200}
          oktext='保存'
          onConfirm={this.onConfirm}
          onClose={()=>associatedSoftware(false)}>
          <div className="table-wrap">
            <Search defaultFields={defaultFields} onSubmit={this.onSubmit} onReset={this.onReset}/>
            <Table
              rowKey='softwareId'
              columns={columns}
              rowSelection={rowSelection}
              dataSource={installableList.items || []}
              pagination={{
                current: currentPage,
                pageSize: pageSize,
                onShowSizeChange: this.pageChange,
                onChange: this.pageChange,
                showQuickJumper: true,
                showSizeChanger: installableList.totalRecords > 10,
                pageSizeOptions: ['10', '20', '30', '40'],
                showTotal: () => `共 ${installableList.totalRecords || 0} 条数据`,
                total: installableList.totalRecords || 0
              }}
            />
            <Form className="filter-form new-flex-layout" layout="inline" onSubmit={this.handleSubmit}>
              <FormItem {...formLayout} label='下一步骤'>
                {getFieldDecorator('666')(
                  <span>基准配置</span>
                ) }
              </FormItem>
              <FormItem {...formLayout} label='下一步执行人'>
                {getFieldDecorator('baselineConfigUserId', {
                  initialValue: ' ',
                  rules: [{ required: true, message: '请指派人员！' }]
                })(
                  <Select showSearch
                    allowClear
                    getPopupContainer={triggerNode => triggerNode.parentNode}
                    optionFilterProp="children">
                    {usersByRoleCodeAndAreaIdList.length ? <Option value=' '>全部</Option> : ''}
                    {usersByRoleCodeAndAreaIdList.map(
                      (now, index)=>(<Option value = {now.stringId} key={index + 'baselineConfigUserId'}>{now.name}</Option>))
                    }
                  </Select>
                ) }
              </FormItem>
              <FormItem {...formLayout} label='备注'>
                {getFieldDecorator('memo', {
                  rules: [
                    { message: '最多300个字符！', max: 300 }
                  ]
                })(
                  <Input autoComplete='off' className="filter-form-item" placeholder="请输入" />
                ) }
              </FormItem>
            </Form>
          </div>
        </CommonModal>
      )
    }

    async componentDidMount (){
      await Promise.all([
        this.installableList(),
        this.getUsersByRoleCodeAndAreaId()
      ])
    }

    componentWillUnmount (){
      this.props.dispatch({ type: 'asset/save', payload: { installableList: {} } })
    }
}

export default AssociatedSoftware
