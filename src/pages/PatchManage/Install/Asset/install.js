import React, { Component } from 'react'
import { Row, Col } from 'antd'
import { analysisUrl } from '@u/common'
import AssetDetail from '@c/BugManage/AssetDetail'
import DisposeTable from '@c/BugManage/DisposeTable'
import api from '@/services/api'
import { patchPermission } from '@a/permission'
import { INSTALL_STATUS, PATCH_LEVEL } from '@a/js/enume'
const span = { xxl: 6, xl: 18 }

export class DisposeByAssets extends Component {
  constructor (props) {
    super(props)
    this.state = {
      id: analysisUrl(this.props.location.search).id,
      detailData: {}
    }
  }
  componentDidMount () {
    this.getDetail()
  }

  render () {
    const { detailData } = this.state
    const disposeTableConfig = {
      pageType: 'patch',
      //处置页面的类型:assets,bug,unexpected
      from: 'assets',
      //不同项
      diffItems: {
        name: {
          text: '补丁名称',
          key: 'patchName'
        },
        number: {
          text: '补丁编号',
          key: 'patchNo'
        },
        level: {
          text: '补丁等级',
          key: 'patchLevelStr'
        }
      },
      //列表接口
      listUrl: 'getInstallManageAssetListInfo',
      //获取列表需要的ID
      paramsId: 'stringId',
      //入网接口
      internetUrl: 'patchInstallInternet',
      //自动安装接口
      repairByAutoUrl: 'patchInstallAutoRepair',
      //人工安装接口
      repairByMananulUrl: 'patchInstallBatchRepair',
      //提交退回接口
      backUrl: 'patchInstallRollback',
      //忽略接口
      neglectUrl: 'patchInstallBatchIgnore',
      //忽略接口需要的ID
      neglectId: 'patchId',
      //查看跳转的页面
      linkUrl: '/bugpatch/patchmanage/install/detail?id=',
      //查看补丁详情需要的补丁编号
      linkId: 'antiyPatchNumber',
      //获取人员需要的参数
      userParam: {
        flowId: 4,
        flowNodeTag: 'config_base'
      },
      defaultFields: [
        { type: 'input', label: '综合查询', placeholder: '请输入补丁编号/补丁名称', key: 'comprehensiveQuery', allowClear: true, maxLength: 300 },
        { type: 'select', label: '补丁等级', placeholder: '全部', key: 'patchLevel', showSearch: true, data: PATCH_LEVEL },
        { type: 'select', label: '安装状态', placeholder: '全部', key: 'installStatus', showSearch: true, data: INSTALL_STATUS }
      ],
      //二级处置页面查看详情权限
      checkTag: patchPermission.PatchInstallManageDetail
    }
    return (
      <div className="main-detail-content dispose-page">
        <AssetDetail detailData={detailData} />
        <p className="detail-title">从属业务</p>
        <div className="detail-content detail-content-layout">
          <Row>
            {
              detailData.businessName && detailData.businessName.map((item, index) => {
                return <Col key={index} {...span}><span className="detail-content-label">{item.name}：</span>{item.level}</Col>
              })
            }
          </Row>
        </div>
        <p className="detail-title">补丁列表</p>
        <DisposeTable {...disposeTableConfig} />
      </div>
    )
  }

  //获取详情和修复建议
  getDetail = () => {
    api.assetAndSuggestions({
      stringId: this.state.id,
      suggestionEnum: 0
    }).then(response => {
      if (response && response.head && response.head.code === '200') {
        this.setState({
          detailData: response.body || {}
        })
      }
    })
  }
}

export default DisposeByAssets

