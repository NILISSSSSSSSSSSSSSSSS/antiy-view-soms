import { Component, Fragment } from 'react'
import { withRouter } from 'react-router-dom'
import { Message, Form } from 'antd'
import { string } from 'prop-types'
import moment from 'moment'
import { CommonModal } from '@c/index'
import DeleteTable from '@c/PatchManage/DeleteTable'
import { TooltipFn, analysisUrl } from '@u/common'
import api from '@/services/api'
import { THREAT_GRADE } from '@a/js/enume'
const { Item } = Form

@withRouter
class RelevanceBugDetailAndChange extends Component {
  //type:change为是编辑，detail为详情
  static propTypes = {
    type: string
  }
  constructor (props) {
    super(props)
    this.state = {
      id: analysisUrl(props.location.search).id || props.id,
      formVisible: false,
      deleteVisible: false,
      currentStringId: null,
      selectedRowKeys: [],
      body: {},
      currentPage: 1,
      pageSize: 10
    }
  }

  componentDidMount () {
    this.getList()
  }

  render () {
    const isChange = false
    const { body, currentPage, pageSize, deleteVisible, selectedRowKeys, formVisible } = this.state
    // form字段定义
    const modalFormFields = [
      { type: 'input', key: 'a', name: '漏洞编号', rules: [{ required: true,  message: '请输入漏洞编号!' }, { message: '最多300个字符！', max: 300 }] },
      { type: 'select', multiple: true, key: 'b', name: '危害等级', rules: [{ required: true,  message: '请选择危害等级!' }], placeholder: '请选择' },
      { type: 'input', key: 'c', name: '漏洞名称', rules: [{ required: true,  message: '请输入漏洞名称!' }, { message: '最多300个字符！', max: 300 }] },
      { type: 'date',  key: 'd', name: '发布时间', rules: [{ required: true,  message: '请选择日期!' }], placeholder: '请选择日期', disabledDate: (current) => current && current > moment().endOf('day') }
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
      {
        title: '漏洞编号',
        dataIndex: 'vulNo',
        render: text => TooltipFn (text)
      },
      {
        title: '漏洞名称',
        dataIndex: 'vulnName',
        render: text => TooltipFn (text)
      },
      {
        title: '危害级别',
        dataIndex: 'warnLevel',
        render: (text) => {
          return text && THREAT_GRADE.filter(item => item.value === text + '')[0].name
        }
      },
      {
        title: '方案名称',
        dataIndex: 'solutionName',
        render: text => TooltipFn (text)
      },
      {
        title: '发布时间',
        dataIndex: 'publishedDate',
        render: (text) => {
          return (<span className="tabTimeCss">{moment(text).format('YYYY-MM-DD')}</span>)
        }
      }
    ]
    return (
      <div className="table-wrap">
        <DeleteTable
          rowKey="symbol"
          body={body}
          rowSelection={rowSelection}
          columns={columns}
          pageSize={pageSize}
          current={currentPage}
          onChange={this.pageChange}
          onDelete={this.onDelete}
          onShowSizeChange={this.pageChange}
          isDelete={isChange}
          isShow={isChange}
        />
        {
          isChange &&
            <Fragment>
              <CommonModal
                type="form"
                visible={formVisible}
                title="补丁关联漏洞信息"
                width={650}
                oktext="提交"
                value={this.onSubmit}
                onClose={() => this.setState({ formVisible: false })}
                fields={modalFormFields}
                column={1}
                FormItem={Item}
                formLayout={formLayout}
              />
              <CommonModal
                type="confirm"
                visible={deleteVisible}
                onConfirm={this.deletePost}
                onClose={() => this.setState({ deleteVisible: false, currentStringId: null })} >
                <p className="confirm-text">确认删除该漏洞？</p>
              </CommonModal>
            </Fragment>
        }
      </div>
    )
  }

  //提交表单
  onSubmit = (value) => {
    console.log(value)
  }

  //提交删除
  deletePost = () => {
    const { selectedRowKeys, currentStringId } = this.state
    const deleteIds = currentStringId ? [currentStringId] : selectedRowKeys
    console.log(deleteIds)
  }

  //删除多选
  deleteBatch = (stringId) => {
    const { selectedRowKeys } = this.state
    if (selectedRowKeys.length === 0) {
      Message.info('请选择数据！')
      return false
    }
    this.setState({
      deleteVisible: true
    })
  }

  //删除弹框显示
  onDelete = (id) => {
    this.setState({ deleteVisible: true, currentStringId: id })
  }

  //分页
  pageChange = (currentPage, pageSize) => {
    this.setState({
      currentPage,
      pageSize
    })
    this.getList(currentPage, pageSize)
  }

  //获取列表
  getList = (currentPage = 1, pageSize = 10) => {
    const { id } = this.state
    api.getPatchBugList({
      antiyPatchNumber: id,
      currentPage,
      pageSize
    }).then(response => {
      const body = response.body || {}
      if (body.items) {
        body.items.forEach((item, index) => {
          item.symbol = index
        })
      }
      this.setState({
        body
      })
    })
  }
}

export default RelevanceBugDetailAndChange
