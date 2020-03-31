import React, { Component } from 'react'
import { Row, Col } from 'antd'
import { analysisUrl } from '@u/common'
import AssetDetail from '@c/BugManage/AssetDetail'
import DisposeTable from '@c/BugManage/DisposeTable'
import api from '@/services/api'
import { bugPermission } from '@a/permission'
import { THREAT_GRADE, REPAIR_STATUS } from '@a/js/enume'
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
      pageType: 'bug',
      //处置页面的类型:assets,bug,unexpected
      from: 'assets',
      //不同项
      diffItems: {
        name: {
          text: '漏洞名称',
          key: 'vulName'
        },
        number: {
          text: '漏洞编号',
          key: 'vulNo'
        },
        type: {
          text: '漏洞类型',
          key: 'vulTypeStr'
        },
        level: {
          text: '危害等级',
          key: 'warnLevelStr'
        }
      },
      //列表接口
      listUrl: 'getVulOnAsset',
      //入网接口
      internetUrl: 'bugInnerInternet',
      //获取列表需要的ID
      paramsId: 'stringId',
      //提交自动修复接口
      repairByAutoUrl: 'bugAutoRepair',
      //提交人工修复接口
      repairByMananulUrl: 'bugMananulRepair',
      //提交退回接口
      backUrl: 'vulAndPatchRollback',
      //忽略接口
      neglectUrl: 'bugNeglect',
      //忽略接口需要的ID
      neglectId: 'stringId',
      //查看跳转的页面
      linkUrl: '/bugpatch/bugmanage/dispose/detail?number=',
      //查看漏洞详情需要的漏洞编号
      linkId: 'antiyVulnId',
      //获取人员需要的参数
      userParam: {
        flowId: 4,
        flowNodeTag: 'config_base'
      },
      //二级处置页面查看详情权限
      checkTag: bugPermission.vulHandleView,
      defaultFields: [
        { type: 'input', label: '综合查询', placeholder: '请输入漏洞编号/漏洞名称', key: 'comprehensiveQuery', allowClear: true, maxLength: 300 },
        { type: 'select', label: '修复状态', placeholder: '全部', key: 'repairStatus', showSearch: true, data: REPAIR_STATUS },
        { type: 'select', label: '危害等级', placeholder: '全部', key: 'warnLevel', showSearch: true, data: THREAT_GRADE }
      ]
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
        <p className="detail-title">漏洞列表</p>
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

