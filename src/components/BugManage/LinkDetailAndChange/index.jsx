import React, { Component, Fragment } from 'react'
import { withRouter } from 'react-router-dom'
import { Form, message, Modal, Icon } from 'antd'
import PropTypes from 'prop-types'
import { debounce } from 'lodash'
import { CommonModal, TableBtns, DeleteTable } from '@c/index'
import { TooltipFn, analysisUrl, getAfterDeletePage } from '@u/common'
import api from '@/services/api'
import './index.less'

const { confirm } = Modal
const { Item } = Form

@withRouter
class LinkDetailAndChange extends Component {
  //type:change为是编辑，detail为详情
  static propTypes = {
    type: PropTypes.string
  }
  constructor (props) {
    super(props)
    this.state = {
      number: analysisUrl(this.props.location.search).number,
      formVisible: false,
      currentStringId: null,
      selectedRowKeys: [],
      body: {},
      total: 0,
      currentPage: 1,
      pageSize: 10
    }
  }

  componentDidMount () {
    this.getList()
  }

  render () {
    const { type } = this.props
    const isChange = type === 'change'
    const { body, currentPage, pageSize, formVisible, selectedRowKeys } = this.state
    // form字段定义
    const modalFormFields = [
      // { type: 'input', key: 'refTitle', name: '参考标题',  allowClear: true, placeholder: '请输入', rules: [{ required: true,  message: '请输入参考标题!' }, { whitespace: true, message: '不能为空字符！' }, { message: '最多512个字符！', max: 512 }] },
      { type: 'select', key: 'refType', name: '链接类型',
        rules: [{ required: true,  message: '请选择链接类型' }],
        placeholder: '请选择',
        showSearch: true,
        data: [ { label: '漏洞公告', value: '1' }, { label: '漏洞参考', value: '2' }]
      },
      { type: 'input',
        key: 'refUrl',
        name: '参考链接',
        placeholder: '请输入',
        allowClear: true,
        rules: [{ required: true,  message: '请输入参考链接!' }, { whitespace: true, message: '不能为空字符！' }, { message: '最多512个字符！', max: 512 }]
      },
      { type: 'input', key: 'refSource', name: '参考来源',  placeholder: '请输入', allowClear: true, rules: [ { required: true,  message: '请输入参考来源!' }, { whitespace: true, message: '不能为空字符！' }, { message: '最多512个字符！', max: 512 }] },
      { type: 'textArea', key: 'refDesc', rows: 4, name: '链接描述', placeholder: '请输入', rules: [{ whitespace: true, message: '不能为空字符！' }, { message: '最多1024个字符！', max: 1024 }] }
    ]
    const formLayout = {
      labelCol: {
        span: 8
      },
      wrapperCol: {
        span: 12
      }
    }
    const rowSelection = isChange ? {
      selectedRowKeys,
      onChange: (selectedRowKeys, selectedRows) => {
        this.setState({
          selectedRowKeys
        })
      }
    } : null
    const columns = [
      // {
      //   title: '参考标题',
      //   dataIndex: 'refTitle',
      //   render: text => TooltipFn (text)
      // },
      {
        title: '链接类型',
        dataIndex: 'refType',
        render: (text) => {
          return text === 1 ? '漏洞公告' : '漏洞参考'
        }
      },
      {
        title: '参考链接',
        dataIndex: 'refUrl',
        render: text => TooltipFn (text)
      },
      {
        title: '参考来源',
        dataIndex: 'refSource',
        render: text => TooltipFn (text)
      },
      {
        title: '链接描述',
        dataIndex: 'refDesc',
        render: text => TooltipFn (text)
      }
    ]
    return (
      <Fragment>
        <div className="table-wrap">
          {
            isChange && <TableBtns leftBtns={[
              { label: '新增', onClick: () => this.setState({ formVisible: true }) }
            ]}
            rightBtns={[
              { label: '删除', onClick: this.deleteBatch }
            ]} />
          }
          <DeleteTable
            body={body}
            rowSelection={rowSelection}
            columns={columns}
            pageSize={pageSize}
            current={currentPage}
            onChange={this.pageChange}
            onDelete={this.deleteSigle}
            showSizeChanger={false}
            isDelete={isChange}
            isShow={isChange} />
          {
            isChange && <Fragment>
              <CommonModal
                className="bug-link-modal"
                type="form"
                visible={formVisible}
                title="新增参考链接"
                width={650}
                oktext="提交"
                value={this.onSubmit}
                onClose={() => this.setState({ formVisible: false })}
                fields={modalFormFields}
                column={1}
                FormItem={Item}
                formLayout={formLayout}
              />
            </Fragment>
          }
        </div>
      </Fragment>
    )
  }

  //提交添加链接
  onSubmit = debounce((values) => {
    const { number } = this.state
    values.antiyVulnId = number
    api.AddBugLink(values).then(response => {
      if(response && response.body && response.head.code === '200' ){
        this.setState({
          formVisible: false,
          selectedRowKeys: [],
          currentPage: 1,
          pageSize: 10
        })
        message.success('新增成功！')
        this.getList()
      }
    })
  }, 1000, { leading: true, trailing: false })

  //提交删除
  deletePost = debounce(async () => {
    let { body, currentPage, pageSize, selectedRowKeys, currentStringId, number } = this.state
    const deleteIds = currentStringId ? [currentStringId] : selectedRowKeys
    await api.deleteBugLink({
      antiyVulnId: number,
      vulnReferenceIds: deleteIds
    }).then(response => {
      if(response && response.body && response.head.code === '200' ){
        message.success('删除成功')
        this.setState({
          selectedRowKeys: [],
          currentStringId: null
        })
        const total = body.totalRecords - deleteIds.length
        currentPage = getAfterDeletePage(total, currentPage, pageSize)
      }
    })
    await this.getList(currentPage, pageSize)
    //当获取到列表数据后再更新页码，不然会有显示问题
    this.setState({
      currentPage,
      pageSize
    })
  }, 1000, { leading: true, trailing: false })

  //确认操作
  confirm = (type) => {
    confirm({
      icon: <Icon type="close" onClick={() => { Modal.destroyAll() }} />,
      content: '确认删除参考链接？',
      okText: '确认',
      onOk: () => {
        this.deletePost()
      },
      onCancel: () => {
        this.setState({
          currentStringId: null
        })
      }
    })
  }

  //删除多选
  deleteBatch = () => {
    const { selectedRowKeys } = this.state
    if (selectedRowKeys.length === 0) {
      message.info('请选择数据！')
      return false
    }
    this.confirm()
  }

  //删除单选
  deleteSigle = (id) => {
    this.setState({ currentStringId: id })
    this.confirm()
  }

  pageChange = (currentPage, pageSize) => {
    this.setState({
      currentPage,
      pageSize
    })
    this.getList(currentPage, pageSize)
  }

  //获取列表
  getList = async (currentPage = 1, pageSize = 10) => {
    const { number } = this.state
    const param = {
      antiyVulnId: number,
      currentPage,
      pageSize
    }
    await api.getBugLinkList(param).then(response => {
      if(response && response.body && response.head.code === '200' ){
        const body = response.body || {}
        this.setState({
          body
        })
      }
    })
  }
}

export default LinkDetailAndChange
