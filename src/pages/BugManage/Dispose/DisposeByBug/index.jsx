import React, { Component } from 'react'
import { analysisUrl } from '@u/common'
import BugDetail from '@c/BugManage/BugDetail'
import DisposeTable from '@c/BugManage/DisposeTable'
import api from '@/services/api'
import { assetsPermission } from '@a/permission'
import { OPERATE_TYPE, REPAIR_STATUS, ASSETS_IMPORTANT } from '@a/js/enume'

export class DisposeByBug extends Component {
  constructor (props) {
    super(props)
    this.state = {
      number: analysisUrl(this.props.location.search).number,
      detailData: {}
    }
  }

  componentDidMount () {
    this.getDetail()
  }

  render () {
    const { detailData } = this.state
    const disposeTableConfig = {
      pageType: 'bug',
      //处置页面的类型:assets,bug,unexpected
      from: 'bug',
      //不同项
      diffItems: {
        name: {
          text: '资产名称',
          key: 'assetName'
        },
        number: {
          text: '资产编号',
          key: 'assetNo'
        },
        type: {
          text: '资产类型',
          key: 'assetType'
        },
        area: {
          text: '资产区域',
          key: 'areaStr'
        },
        level: {
          text: '重要程度',
          key: 'importanceGrade'
        }
      },
      //入网接口
      internetUrl: 'bugInnerInternet',
      //列表接口
      listUrl: 'getAssetAndVulList',
      //获取列表需要的ID
      paramsId: 'stringId',
      //提交自动修复接口
      repairByAutoUrl: 'bugAutoRepair',
      //提交自动修复接口
      repairByMananulUrl: 'bugMananulRepair',
      //提交退回接口
      backUrl: 'vulAndPatchRollback',
      //忽略接口
      neglectUrl: 'bugNeglect',
      //忽略接口需要的ID
      neglectId: 'stringId',
      //查看跳转的页面
      linkUrl: '/asset/manage/detail?id=',
      //查看资产详情需要的ID
      linkId: 'assetIdEncode',
      //获取人员需要的参数
      userParam: {
        flowId: 4,
        flowNodeTag: 'config_base'
      },
      //二级处置页面查看详情权限
      checkTag: assetsPermission.ASSET_INFO_VIEW,
      defaultFields: [
        { type: 'input', label: '综合查询', placeholder: '请输入资产编号/资产名称', key: 'comprehensiveQuery', allowClear: true, maxLength: 300 },
        { type: 'select', label: '修复状态', placeholder: '全部', key: 'status', showSearch: true, data: REPAIR_STATUS },
        { type: 'select', label: '修复方式', placeholder: '全部', key: 'mode', showSearch: true, data: OPERATE_TYPE },
        { type: 'select', label: '重要程度', placeholder: '全部', key: 'importanceDegree', showSearch: true, data: ASSETS_IMPORTANT }
      ]
    }
    return (
      <div className="main-detail-content dispose-page">
        <BugDetail detailData={detailData} isShowTitle />
        <p className="detail-title">资产列表</p>
        <DisposeTable {...disposeTableConfig} />
      </div>
    )
  }

  //获取详情
  getDetail = () => {
    api.vulnDetail({
      antiyVulnId: this.state.number
    }).then(response => {
      if (response && response.head && response.head.code === '200') {
        this.setState({
          detailData: response.body || {}
        })
      }
    })
  }
}

export default DisposeByBug

