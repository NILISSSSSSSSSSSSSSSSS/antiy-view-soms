import React, { Component } from 'react'
import { analysisUrl } from '@u/common'
import PatchDetail from '@c/PatchManage/PatchDetail'
import DisposeTable from '@c/BugManage/DisposeTable'
import api from '@/services/api'
import { assetsPermission } from '@a/permission'
import { OPERATE_TYPE, INSTALL_STATUS, ASSETS_IMPORTANT } from '@a/js/enume'

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
      pageType: 'patch',
      //处置页面的类型:assets,bug,unexpected
      from: 'patch',
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
      internetUrl: 'patchInstallInternet',
      //列表接口
      listUrl: 'getInstallManagePatchtListInfo',
      //获取列表需要的ID
      paramsId: 'stringId',
      //自动安装接口
      repairByAutoUrl: 'patchInstallAutoRepair',
      //人工安装接口
      repairByMananulUrl: 'patchInstallBatchRepair',
      //提交退回接口
      backUrl: 'patchInstallRollback',
      //忽略接口
      neglectUrl: 'patchInstallBatchIgnore',
      //忽略接口需要的ID
      neglectId: 'assetId',
      //修复建议接口
      adviseUrl: 'adviseByBug',
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
        { type: 'select', label: '安装状态', placeholder: '全部', key: 'status', showSearch: true, data: INSTALL_STATUS },
        { type: 'select', label: '安装方式', placeholder: '全部', key: 'mode', showSearch: true, data: OPERATE_TYPE },
        { type: 'select', label: '重要程度', placeholder: '全部', key: 'importanceDegree', showSearch: true, data: ASSETS_IMPORTANT }
      ]
    }
    return (
      <div className="main-detail-content dispose-page">
        <PatchDetail detail={detailData} />
        <p className="detail-title">资产列表</p>
        <DisposeTable {...disposeTableConfig} />
      </div>
    )
  }

  //获取详情
  getDetail = () => {
    api.getPatchInfos({
      antiyPatchNumber: this.state.number
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

