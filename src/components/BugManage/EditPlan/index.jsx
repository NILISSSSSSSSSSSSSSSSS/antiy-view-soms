import React, { Component } from 'react'
import { withRouter } from 'react-router-dom'
import { Form, Button, Table, Pagination, Radio, Input, Col, message, Modal, Icon } from 'antd'
import { uniqBy } from 'lodash'
import api from '@/services/api'
import { object, func } from 'prop-types'
import { TooltipFn, analysisUrl, transliteration, getAfterDeletePage } from '@u/common'
import AddPlanPatchModal from '@c/BugManage/AddPlanPatchModal'
import './index.less'

const { confirm } = Modal
const TextArea = Input.TextArea
const { Item } = Form
const formLayout = {
  labelCol: {
    span: 6
  },
  wrapperCol: {
    span: 15
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

@withRouter
@Form.create()
class EditPlan extends Component {
  static propTypes = {
    data: object,
    cancel: func,
    onSubmit: func,
    savePatchs: func,
    setOldPatchs: func
  }
  constructor (props) {
    super(props)
    this.state = {
      number: analysisUrl(props.location.search).number,
      currentPage: 1,
      pageSize: 10,
      body: {},
      modalBody: {},
      addVisible: false,
      modalCurrentPage: 1,
      modalPageSize: 10,
      modalValues: {},
      //解决方案类型
      solutionType: props.data.solutionType,
      //新增时添加的补丁数据
      patchs: [],
      selectedRowKeys: [],
      //单个删除补丁的ID
      currentStringId: null
    }
  }
  componentDidMount () {
    const { data } = this.props
    data.stringId && this.getList()
  }

  render () {
    const { cancel, data } = this.props
    const { getFieldDecorator } = this.props.form
    const { selectedRowKeys, currentPage, pageSize, body, addVisible, solutionType, patchs } = this.state
    let list = [], total = 0
    if (body){
      list = body.items
      total =  body.totalRecords
    }
    const columns = [
      {
        title: '补丁编号',
        dataIndex: 'patchNumber',
        render: text => TooltipFn (text)
      },
      {
        title: '补丁名称',
        dataIndex: 'patchName',
        render: text => TooltipFn (text)
      },
      {
        title: '前置补丁',
        dataIndex: 'prePatchNumber',
        render: text => TooltipFn (text)
      },
      {
        title: '补丁等级',
        dataIndex: 'patchLevelStr',
        render: (text) => {
          return text || '--'
        }
      },
      {
        title: '操作',
        dataIndex: 'stringId',
        key: 'stringId',
        width: 180,
        render: (text, record) => {
          const id = record.antiyPatchNumber
          return (
            <div className="operate-wrap">
              <a onClick={() => this.checkAlive(id, `/bugpatch/patchmanage/information/detail?id=${transliteration(id)}`)}>查看</a>
              {
                // 编辑时，最后一个补丁不允许被删除
                (total > 1 && data.stringId || !data.stringId) && <a onClick={() => this.deleteSigle(id)}>删除</a>
              }
            </div>
          )
        }
      }
    ]
    const rowSelection = {
      selectedRowKeys,
      onChange: (selectedRowKeys, selectedRows) => {
        this.setState({
          selectedRowKeys
        })
      }
    }
    const text = data.stringId ? '编辑' : '新增'
    return (
      <div className="add-plan">
        <div className="bug-plan-title">
          <img src={require('@a/images/fangan.png')} className="plan-icon" alt="" />
          {text}方案
        </div>
        <Form>
          <div className="form-wrap clearfix">
            <Col span={8}>
              <Item {...formLayout} label="方案名称">
                {
                  getFieldDecorator('solutionName', {
                    rules: [
                      { required: true, message: '请输入方案名称！' },
                      { message: '最多128个字符！', max: 128 },
                      { whitespace: true, message: '不能为空字符！' }
                    ],
                    initialValue: data.solutionName
                  })(
                    <Input autoComplete="off" placeholder="请输入" allowClear />
                  )
                }
              </Item>
            </Col>
            <Col span={8}>
              <Item {...formLayout} label="解决方案类型">
                {
                  getFieldDecorator('solutionType', {
                    rules: [
                      { required: true, message: '请选择解决方案类型！' }
                    ],
                    initialValue: data.solutionType
                  })(
                    <Radio.Group
                      disabled={data.solutionType ? true : false}
                      onChange={ e => this.setState({
                        solutionType: e.target.value,
                        patchs: [],
                        body: {
                          items: [],
                          totalRecords: 0
                        }
                      })}>
                      <Radio value="1">缓解</Radio>
                      <Radio value="2">修复</Radio>
                    </Radio.Group>
                  )
                }
              </Item>
            </Col>
            <Col span={8}>
              <Item {...formLayout} label="是否重启系统">
                {
                  getFieldDecorator('restartSystem', {
                    rules: [
                      { required: true, message: '请选择是否重启系统！' }
                    ],
                    initialValue: data.restartSystem
                  })(
                    <Radio.Group>
                      <Radio value="1">是</Radio>
                      <Radio value="2">否</Radio>
                    </Radio.Group>
                  )
                }
              </Item>
            </Col>
            <Col span={8}>
              <Item {...formLayout} label="是否重启应用">
                {
                  getFieldDecorator('restartSoftware', {
                    rules: [{ required: true, message: '请选择是否重启应用！' }],
                    initialValue: data.restartSoftware
                  })(
                    <Radio.Group>
                      <Radio value="1">是</Radio>
                      <Radio value="2">否</Radio>
                    </Radio.Group>
                  )
                }
              </Item>
            </Col>
            <Col span={24}>
              <Item {...formLayoutBlock} label="紧急预案" className="block-form-item">
                {
                  getFieldDecorator('emerContent', {
                    rules: [
                      { required: true, message: '请输入紧急预案！' },
                      { message: '最多1024个字符！', max: 1024 },
                      { whitespace: true, message: '不能为空字符！' }
                    ],
                    initialValue: data.emerContent
                  })(
                    <TextArea rows={3} placeholder="请输入" />
                  )
                }
              </Item>
            </Col>
            <Col span={24}>
              <Item {...formLayoutBlock} label="解决方案描述" className="block-form-item">
                {
                  getFieldDecorator('description', {
                    rules: [
                      { required: true, message: '请输入解决方案描述！' },
                      { message: '最多1024个字符！', max: 1024 },
                      { whitespace: true, message: '不能为空字符！' }
                    ],
                    initialValue: data.description
                  })(
                    <TextArea rows={3} placeholder="请输入" />
                  )
                }
              </Item>
            </Col>
          </div>
        </Form>
        {
          solutionType === '2' && <div className="table-wrap" style={{ marginBottom: 20 }}>
            <div className="border-box">
              <div className="table-btn">
                <div className="left-btn">
                  <Button type="primary" className="btn-left" onClick={() => this.setState({ addVisible: true })}>新增</Button>
                </div>
                <div className="right-btn">
                  <Button type="primary" className="btn-left" onClick={ () => this.deleteBatch(data)}>删除</Button>
                </div>
              </div>
              <Table
                rowKey="antiyPatchNumber"
                onChange={this.handleTableSort}
                rowSelection={rowSelection}
                columns={columns}
                dataSource={list}
                pagination={false} />
            </div>
            {
              total > 0 && <Pagination
                className="table-pagination"
                total={total}
                showTotal={(total) => `共 ${total || 0} 条数据`}
                showQuickJumper
                onChange={this.changePage}
                onShowSizeChange={this.changePage}
                pageSize={pageSize}
                current={currentPage} />
            }
          </div>
        }
        <div className="button-center" style={{ padding: ' 0 0 30px 0' }}>
          <div>
            <Button type="primary" onClick={this.handleSubmit}>保存</Button>
            <Button type="primary" ghost onClick={cancel}>取消</Button>
          </div>
        </div>
        {
          addVisible && <AddPlanPatchModal
            existPatchNumber={patchs.map(item => item.antiyPatchNumber)}
            visible={addVisible}
            onClose={() => this.setState({ addVisible: false })}
            onConfirm={this.onConfirm} />
        }
      </div>
    )
  }

  //提交
  handleSubmit = () => {
    this.props.form.validateFields((err, values) => {
      if (!err) {
        const { onSubmit, data } = this.props
        const { patchs } = this.state
        if (!data.stringId && values.solutionType === '2' && patchs.length === 0) {
          message.info('请添加补丁！')
          return false
        }
        if (data.stringId) values.vulnSolutionInfoId = data.stringId
        onSubmit(values)
      } else {
        message.info('请完善必填项信息！')
      }
    })
  }

  //添加补丁
  onConfirm = (_patchs) => {
    const { patchs } = this.state
    const { savePatchs } = this.props
    let patchData = uniqBy([..._patchs, ...patchs], 'antiyPatchNumber')
    const body = {
      items: patchData.slice(0, 10),
      totalRecords: patchData.length
    }
    this.setState({
      body,
      currentPage: 1,
      pageSize: 10,
      patchs: patchData,
      selectedRowKeys: [],
      addVisible: false
    })
    savePatchs(patchData)
  }

  //删除补丁
  deleteState = () => {
    const { savePatchs } = this.props
    let { patchs, selectedRowKeys, currentStringId, currentPage, pageSize } = this.state
    const deleteIds = currentStringId ? [currentStringId] : selectedRowKeys
    let data = []
    patchs.forEach(item => {
      if (!deleteIds.includes(item.antiyPatchNumber)) {
        data.push(item)
      }
    })
    currentPage = getAfterDeletePage(data.length, currentPage, pageSize)
    this.setState({
      patchs: data,
      currentStringId: null,
      selectedRowKeys: [],
      currentPage
    })
    this.getCacheList(data, currentPage, pageSize)
    savePatchs(data)
  }

  //删除确认框
  deleteConfirm = () => {
    confirm({
      icon: <Icon type="close" onClick={() => { Modal.destroyAll() }} />,
      content: '确认删除补丁？',
      okText: '确认',
      onOk: () => {
        this.deleteState()
      },
      onCancel: () => {
        this.setState({
          currentStringId: null
        })
      }
    })
  }

  //批量删除
  deleteBatch = () => {
    const { data } = this.props
    const { selectedRowKeys, body } = this.state
    if (selectedRowKeys.length === 0) {
      message.info('请选择数据！')
      return false
    }
    if (data.stringId && selectedRowKeys.length === body.totalRecords) {
      message.info('不能将补丁全部删除！')
      return false
    }
    this.deleteConfirm()
  }

  //单个删除
  deleteSigle = (id) => {
    this.setState({
      currentStringId: id
    })
    this.deleteConfirm()
  }

  //获取补丁state列表
  getCacheList = (patchs, currentPage, pageSize) => {
    let items = patchs.filter((item, index) => index >= (currentPage * pageSize - pageSize) && index < (currentPage * pageSize))
    const body = {
      items,
      totalRecords: patchs.length
    }
    this.setState({
      body
    })
  }

  //编辑方案：获取全量补丁列表
  getList = async () => {
    const { data, savePatchs, setOldPatchs } = this.props
    await api.queryBugPatchPageAll({
      solutionId: data.stringId
    }).then(response => {
      if (response && response.body && response.head.code === '200' ) {
        const body = response.body || []
        this.setState({
          patchs: body
        })
        this.getCacheList(body, 1, 10)
        savePatchs(body)
        const oldPatchs = body.map(item => {
          return {
            antiyPatchNumber: item.antiyPatchNumber,
            patchNumber: item.patchNumber
          }
        })
        setOldPatchs(oldPatchs)
      }
    })
  }

  //分页
  changePage = (currentPage, pageSize) => {
    this.setState({
      pageSize,
      currentPage
    })
    const { patchs } = this.state
    this.getCacheList(patchs, currentPage, pageSize)
  }

  //查看是否被删除
  checkAlive = (id, url) => {
    window.open(`/#${url}`)
    // api.checkPatch({
    //   param: id
    // }).then(response => {
    //   if (!response.body) {
    //     window.open(`/#${url}`)
    //   } else {
    //     Message.error('该补丁已被删除！')
    //   }
    // })
  }
}

export default EditPlan