
import { Component } from 'react'
import { connect } from 'dva'
import { Link } from 'dva/router'
import { Table, Pagination, Form, Button, DatePicker, Modal, message, Input, Tooltip } from 'antd'
import moment from 'moment'
import { transliteration, emptyFilter, timeStampToTime } from '@/utils/common'
import api from '@/services/api'

const { Item } = Form

class TempletModal extends Component {
  constructor (props) {
    super(props)
    this.state = {
      templetList: [],              // 模板列表
      total: 0,                     // 模板总条数
      pageSize: 10,
      pageIndex: 1,
      startD: new Date(),
      beginTime: undefined,
      endTime: undefined,
      seekTerm: {
        name: '',                   // 模板名称
        number: '',                 // 模板编号
        beginTime: '',              // 更新时间的开始时间
        endTime: ''                 // 更新时间的开始时间
      }
    }
  }
  UNSAFE_componentWillReceiveProps (nextProps) {
    if (nextProps.visible && JSON.stringify(this.props.visible) !== JSON.stringify(nextProps.visible)) {
      this.setState({ visible: nextProps.visible }, ()=>{ this.getTempletList()})
    }
  }

  // 获取模板列表
  getTempletList = () => {
    const { seekTerm, pageIndex, pageSize } = this.state
    const { systemId, templateId } = this.props
    const postParms = {
      ...seekTerm,
      currentPage: pageIndex,
      pageSize,
      os: systemId ? [systemId] : [],
      isConfig: '1',
      isEnable: 1,
      removeId: templateId
    }
    postParms.status = 1
    api.getConfigTemplateList(postParms).then(response => {
      if(response && response.head && response.head.code === '200' ){
        this.setState({
          templetList: response.body,
          total: response.body.totalRecords
        })
      }
    })
  }
  // 查询模板
  handleTempletSearch = e => {
    this.setState({
      pageIndex: 1
    })
    e.preventDefault()
    this.props.form.validateFields((err, values) => {
      if (!err) {
        let { beginTime, endTime } = this.state
        values.beginTime = beginTime ? moment(beginTime).startOf('day').valueOf() : ''
        values.endTime = endTime ? moment(endTime).endOf('day').valueOf() : ''
        if(values.beginTime && values.endTime && values.beginTime > values.endTime){
          message.info('结束时间应大于等于开始时间!')
        }else{
          this.setState({
            seekTerm: values
          }, () => {
            this.getTempletList()
          })
        }
      }
    })
  }
  //重置
  handleReset = () => {
    this.props.form.resetFields()
    //重置查询条件后，重新查询页面数据
    this.setState({
      pageIndex: 1,
      pageSize: 10,
      beginTime: undefined,
      endTime: undefined,
      seekTerm: {
        name: '',
        number: '',
        beginTime: '',
        endTime: ''
      }
    }, () => {
      this.getTempletList()
    })
  }
  //返回
  cancel = ()=> {
    this.handleReset()
    this.props.onCancel()
  }
  // 确认选择模板
  confirmSelect = id => {
    this.setState({
      pageIndex: 1
    })
    this.cancel()
    this.props.selectTemplet(id)
  }
  //分页
  changePageNumber = (page, pageSize)=>{
    this.setState({
      pageIndex: page,
      pageSize: pageSize
    }, () => {
      this.getTempletList()
    })
  }
  render () {
    const {
      templetList,
      pageSize,
      total,
      pageIndex
    } = this.state
    const { getFieldDecorator } = this.props.form
    const { visible } = this.props
    const columnsTemplet = [{
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      render: (text) => {
        return (
          <Tooltip title={text} placement="topLeft">
            <span>{emptyFilter(text)}</span>
          </Tooltip>
        )
      }
    }, {
      title: '编号',
      dataIndex: 'number',
      key: 'number ',
      render: (text) => {
        return (
          <Tooltip title={text} placement="topLeft">
            <span>{emptyFilter(text)}</span>
          </Tooltip>
        )
      }
    }, {
      title: '更新时间',
      dataIndex: 'gmtModified',
      key: 'gmtModified',
      width: 160,
      render: (text, record) => {
        return (
          <span className="tabTimeCss">{timeStampToTime(record.gmtModified)}</span>
        )
      }
    }, {
      title: '适用系统',
      dataIndex: 'number',
      key: 'number ',
      render: (text) => {
        return (
          <Tooltip title={text} placement="topLeft">
            <span>{emptyFilter(text)}</span>
          </Tooltip>
        )
      }
    }, {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      render: (text) => {
        return (
          <Tooltip title={text} placement="topLeft">
            <span>{emptyFilter(text)}</span>
          </Tooltip>
        )
      }
    }, {
      title: '操作',
      dataIndex: 'operate',
      key: 'operate',
      width: 160,
      render: (text, record) => {
        return (
          <div className="operate-wrap">
            <Link to={`/basesetting/model/checkdetail?stringId=${transliteration(record.stringId)}`} target="_blank">查看</Link>
            <a onClick={() => {this.confirmSelect(record.stringId)}}>选择</a>
          </div>
        )
      }
    }]
    return (
      <Modal
        title="选择模板"
        className="table-modal over-scroll-modal"
        onCancel={this.cancel}
        visible = {visible}
        width={1100}
        footer={null} >
        <div className="bug-patch form-content" style={{ paddingBottom: '10px' }}>
          <Form layout="inline" onSubmit={this.handleTempletSearch} className="filter-form new-flex-layout">
            <Item label="名称">
              {getFieldDecorator('name', {
                initialValue: '',
                rules: [{ message: '最多30个字符！', max: 30 }]
              })(
                <Input autoComplete="off" className="filter-form-item" placeholder='请输入' allowClear></Input>
              )}
            </Item>
            <Item label="编号" className="item-separation">
              {getFieldDecorator('number', {
                initialValue: '',
                rules: [{ message: '最多30个字符！', max: 30 }]
              })(
                <Input autoComplete="off" className="filter-form-item" placeholder='请输入' allowClear></Input>
              )}
            </Item>
            <Item label="更新时间" className="item-date-container">
              {getFieldDecorator('beginTime')(
                <DatePicker
                  showToday={true}
                  placeholder="开始时间"
                  disabledDate={(date)=>date && date >= moment(new Date())}
                  getCalendarContainer={triggerNode => triggerNode.parentNode}
                  onChange={(v)=> this.setState({ beginTime: v, startD: v })}
                  allowClear />
              )}
              <span>-</span>
              {getFieldDecorator('endTime')(
                <DatePicker
                  showToday={true}
                  placeholder="结束时间"
                  disabledDate={(date)=>date && date >= moment(new Date())}
                  getCalendarContainer={triggerNode => triggerNode.parentNode}
                  onChange={(v)=> this.setState({ endTime: v })}
                  allowClear />
              )}
            </Item>
            <Item>
              <Button type="primary" htmlType="submit" style={{ marginRight: '20px', marginLeft: '50px' }}>查询</Button>
              <Button onClick={this.handleReset}>重置</Button>
            </Item>
          </Form>
          <div className="table-wrap">
            <Table
              rowKey="stringId"
              columns={columnsTemplet}
              dataSource={templetList.items}
              pagination={false}
            />
            {/* 分页 */}
            <Pagination
              current={pageIndex}
              pageSize={pageSize}
              className="table-pagination"
              total={total || 0} showTotal={(total) => `共 ${total || 0} 条数据`}
              showSizeChanger={false}
              showQuickJumper={true}
              onChange={this.changePageNumber}
              onShowSizeChange={this.changePageNumber} />
          </div>
        </div>
      </Modal>
    )
  }
}
const templetForm = Form.create()(TempletModal)
export default connect()(templetForm)
