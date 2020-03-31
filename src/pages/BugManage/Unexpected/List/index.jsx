import React, { Component } from 'react'
import { Link } from 'dva/router'
import { debounce } from 'lodash'
import { Button, Table, Pagination, Modal, Icon, Message } from 'antd'
import api from '@/services/api'
import hasAuth from '@/utils/auth'
import { bugPermission } from '@a/permission'
import { cache, transliteration, TooltipFn, getAfterDeletePage } from '@u/common'
import { Scan } from '@c'
import BugSearch from '@c/BugManage/BugSearch'

const { confirm } = Modal

class Unexpected extends Component {
  constructor (props) {
    super(props)
    this.state = {
      //扫描成功后跳转处置需要的安天编号
      currentStringId: '',
      //扫描成功后跳转处置需要的漏洞id
      id: '',
      pagingParameter: {
        pageSize: 10,
        currentPage: 1
      },
      body: null,
      values: {},
      //未修复资产排序方式
      noHandleAssetsNum: '',
      scanVisible: false
    }
  }

  componentDidMount () {
    let { list } = cache.evalSearchParam(this, {}, false) || {}
    if (list) {
      const { parameter, page } = list[0]
      this.searchForm.setFieldsValue(parameter)
      this.setState({
        pagingParameter: page,
        values: parameter
      }, () => {
        this.getList({
          ...page,
          ...parameter
        })
      })
    } else {
      this.getList(this.state.pagingParameter, false)
    }
  }

  render () {
    let { pagingParameter, body, noHandleAssetsNum, scanVisible, currentStringId, id } = this.state
    const columns = [
      {
        title: '漏洞编号',
        key: 'vulNo',
        width: '16%',
        dataIndex: 'vulNo',
        render: text => TooltipFn (text)
      },
      {
        title: '漏洞名称',
        key: 'vulnName',
        dataIndex: 'vulnName',
        width: '16%',
        render: text => TooltipFn (text)
      },
      {
        title: '危害等级',
        key: 'warnLevelStr',
        dataIndex: 'warnLevelStr',
        width: '12%'
      },
      {
        title: '未处置资产数',
        key: 'noHandleAssetsNum',
        width: '14%',
        dataIndex: 'noHandleAssetsNum',
        sortOrder: noHandleAssetsNum,
        sorter: true,
        render: (text, record) => {
          return record.scannerStatus === 1 ? '--' : text
        }
      },
      {
        title: '扫描状态',
        key: 'scannerStatusStr',
        dataIndex: 'scannerStatusStr',
        width: '12%'
      },
      {
        title: '操作',
        key: 'operate',
        width: '14%',
        render: (record) => {
          const { antiyVulnId, id, noHandleAssetsNum } = record
          const status = record.scannerStatus
          return(
            <div className="operate-wrap">
              {
                hasAuth(bugPermission.burstHandle) && status === 3 && noHandleAssetsNum !== 0 && <Link to={`/bugpatch/bugmanage/unexpected/dispose?number=${antiyVulnId}&id=${transliteration(record.id)}&caches=1`}>处置</Link>
              }
              {
                hasAuth(bugPermission.burstScan) && status === 1 && <a onClick={() => this.setState({ scanVisible: true, currentStringId: antiyVulnId, id })}>扫描</a>
              }
              {
                hasAuth(bugPermission.burstEdit) && status === 1 && <Link to={`/bugpatch/bugmanage/unexpected/change?id=${transliteration(id)}&number=${antiyVulnId}&caches=1`}>编辑</Link>
              }
              {
                hasAuth(bugPermission.burstDelete) && status === 1 && <a onClick={() => this.delete(antiyVulnId)}>删除</a>
              }
              {
                hasAuth(bugPermission.burstView) && <Link to={{
                  pathname: '/bugpatch/bugmanage/unexpected/detail',
                  search: `id=${transliteration(id)}&number=${transliteration(antiyVulnId)}&caches=1`,
                  state: { rCaches: 1 }
                }}>查看</Link>
              }
            </div>
          )
        }
      }
    ]
    let list  = []
    let total =  0
    if (body){
      list = body.items
      total =  body.totalRecords
    }
    //漏洞扫描
    const scanConfig = {
      scanUrl: 'scannerBugprogress',
      params: {
        scanBusinessId: currentStringId
      },
      title: '突发漏洞扫描',
      visible: scanVisible,
      onClose: () => {
        this.setState({
          scanVisible: false
        })
      },
      //后台扫描
      onBackstage: () => {
        const { pagingParameter, values } = this.state
        this.setState({
          scanVisible: false
        })
        Message.success('操作成功')
        this.getList({
          ...pagingParameter,
          ...values
        })
      },
      goTo: () => {
        this.props.history.push(`/bugpatch/bugmanage/unexpected/dispose?number=${transliteration(currentStringId)}&id=${transliteration(id)}&caches=1`)
      }
    }
    // 组件的不同项
    const searchItems = {
      id: 'stringId',
      name: 'vulnName',
      number: 'antiyVulnId',
      level: 'warnLevel'
    }
    return (
      <div className="main-table-content">
        <BugSearch
          onSubmit={this.onSubmit}
          onReset={this.onReset}
          searchItems={searchItems}
          wrappedComponentRef={search => { search && (this.searchForm = search.searchForm) }}
        />
        {/* 列表+分页 */}
        <div className="table-wrap">
          <div className='table-btn'>
            <div className="left-btn">
              {
                hasAuth(bugPermission.burstCheckin) ?
                  <Button type='primary'
                    style={{ width: 'auto' }}
                    onClick={() => this.props.history.push('/bugpatch/bugmanage/unexpected/register') }>登记</Button>
                  : null
              }
            </div>
          </div>
          <Table
            onChange={this.handleTableSort}
            rowKey="antiyVulnId"
            columns={columns}
            dataSource={list}
            pagination={false} />
          {
            total > 0 && <Pagination
              className="table-pagination"
              total={total} showTotal={(total) => `共 ${total || 0} 条数据`}
              showSizeChanger={total > 10}
              showQuickJumper
              onChange={this.changePage}
              onShowSizeChange={this.changePage}
              pageSize={pagingParameter.pageSize}
              current={pagingParameter.currentPage} />
          }
        </div>
        {/* 扫描 */}
        {
          scanVisible && <Scan {...scanConfig} />
        }
      </div>
    )
  }

  //删除
  delete = debounce((id) => {
    const { values, pagingParameter, body } = this.state
    confirm({
      icon: <Icon type="close" onClick={() => { Modal.destroyAll() }} />,
      content: '是否确认删除此漏洞信息？',
      okText: '确认',
      onOk: () => {
        api.deleteVul({
          antiyVulIds: [id]
        }).then(response => {
          if(response && response.head && response.head.code === '200' ){
            Message.success('删除成功！')
            let { pageSize, currentPage } = pagingParameter
            const total = body.totalRecords - 1
            //获取删除后的当前页
            currentPage = getAfterDeletePage(total, currentPage, pageSize)
            this.setState({
              pagingParameter: {
                currentPage,
                pageSize
              }
            })
            this.getList({
              currentPage,
              pageSize,
              ...values
            })
          }
        })
      }
    })
  }, 1000, { leading: true, trailing: false })

  //排序
  handleTableSort = (pagination, filters, sorter) => {
    const { columnKey, order } = sorter
    this.setState({
      noHandleAssetsNum: columnKey === 'noHandleAssetsNum' ? order : ''
    }, () => {
      const { values, pagingParameter } = this.state
      this.getList({
        ...values,
        ...pagingParameter
      })
    })
  }

  //表单重置
  onReset = () => {
    cache.removeCriteria()
    const pagingParameter = {
      pageSize: 10,
      currentPage: 1
    }
    this.setState({
      values: {},
      pagingParameter,
      noHandleAssetsNum: ''
    }, () => {
      this.getList(pagingParameter, false)
    })
  }

  //表单查询
  onSubmit = (values) => {
    const { pagingParameter } = this.state
    this.setState({
      pagingParameter: {
        pageSize: pagingParameter.pageSize,
        currentPage: 1
      },
      values
    }, () => {
      const { pagingParameter } = this.state
      this.getList({
        ...pagingParameter,
        ...values
      })
    })
  }

  //获取列表
  getList = (param, isCach = true) => {
    const { history } = this.props
    let { values, pagingParameter, noHandleAssetsNum } = this.state
    if (isCach) {
      cache.cacheSearchParameter([{
        page: pagingParameter,
        parameter: values
      }], history)
    }
    if (this.getSort(noHandleAssetsNum)) {
      param.sortName = 'noHandleAssetsNum'
      param.sortOrder = this.getSort(noHandleAssetsNum)
    }
    api.querySuddenList(param).then(response => {
      if(response && response.head && response.head.code === '200' ){
        this.setState({
          body: response.body
        })
      }
    })
  }

  //改变当前页显示数量
  changePage = (currentPage, pageSize) => {
    this.setState({
      pagingParameter: {
        pageSize,
        currentPage
      }
    }, () => {
      const { values } = this.state
      const param = {
        currentPage,
        pageSize,
        ...values
      }
      this.getList(param, 1)
    })
  }

  getSort = (sort) => {
    return sort === 'ascend' ? 'asc' : sort === 'descend' ? 'desc' : null
  }
}

export default Unexpected
