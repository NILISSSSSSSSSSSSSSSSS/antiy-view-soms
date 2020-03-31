import React, { Component } from 'react'
import { Tabs } from 'antd'
import AssetBasicsInfo from '@c/Asset/AssetDetail/BasicsInfo'
import AssetConfigInfo from '@c/Asset/AssetDetail/AssetConfigInfo'
import AssetDetailBug from '@c/Asset/AssetDetail/AssetDetailBug'
import AssetDetailPatch from '@c/Asset/AssetDetail/AssetDetailPatch'
import AssetDetailAlarm from '@c/Asset/AssetDetail/AssetDetailAlarm'
import StatusMonitor from '@c/Asset/AssetDetail/StatusMonitor'
import { analysisUrl, transliteration } from '@/utils/common'
import { COMPUTING_DEVICE } from '@a/js/enume'
import api from '@/services/api'
import './index.less'
import { RETIRED } from '../../../../assets/js/enume'

// 显示基准配置tabs页面的资产类型集合
const SHOWS_CONFIG_INFO_ARRAY = [ COMPUTING_DEVICE.value ]
const TabPane = Tabs.TabPane
export default class AssetDetail extends Component {
  constructor (props) {
    super(props)
    this.urlParams = analysisUrl(props.location.search)
    this.state = {
      activeKey: this.urlParams.tab || '1',
      baseInfo: {},
      assetData: {}
    }
  }
  componentDidMount () {
    this.getAssetDetail()
  }
  getAssetDetail = () => {
    api.getAssetHardWareById({ primaryKey: this.urlParams.id }).then((res) => {
      if (res && res.head && res.head.code === '200') {
        const { asset, assetNetworkEquipment, assetSafetyEquipment, assetStorageMedium } = res.body
        this.setState({ assetData: res.body || {}, baseInfo: { ...asset, ...assetNetworkEquipment, ...assetSafetyEquipment, ...assetStorageMedium } })
      }
    })
  }
  tabsChange = (activeKey) => {
    const { replace } = this.props.history
    const { id } = this.urlParams
    // 替换路由参数
    replace( `/asset/manage/detail?id=${transliteration(id)}&tab=${activeKey}`)
    this.setState({ activeKey })
  }
  render () {
    const { activeKey, baseInfo } = this.state
    const showBaseConfig = SHOWS_CONFIG_INFO_ARRAY.includes(baseInfo.categoryModel) && baseInfo.assetStatus !== RETIRED.value
    const showOther = baseInfo.assetStatus !== RETIRED.value
    return (
      <div className="asset-detail-container">
        <Tabs onChange={this.tabsChange} activeKey={activeKey}>
          <TabPane tab="基本信息" key="1">
            <AssetBasicsInfo baseInfo={baseInfo} assetId={this.urlParams.id} />
          </TabPane>
          <TabPane tab="状态监控" key="2">
            <StatusMonitor assetId={this.urlParams.id} />
          </TabPane>
          {
            showBaseConfig && (
              <TabPane tab="配置信息" key="3">
                <AssetConfigInfo key={baseInfo.baselineTemplateId} templateId={baseInfo.baselineTemplateId} />
              </TabPane>
            )
          }
          {
            //已退役资产不显示一下信息
            showOther && <TabPane tab="漏洞信息" key="4">
              <AssetDetailBug assetId={baseInfo.decryptId} data={baseInfo} />
            </TabPane>
          }
          {
            showOther && <TabPane tab="补丁信息" key="5">
              <AssetDetailPatch assetId={baseInfo.decryptId} data={baseInfo}/>
            </TabPane>
          }
          {
            showOther && <TabPane tab="告警信息" key="6">
              <AssetDetailAlarm assetId={this.urlParams.id} />
            </TabPane>
          }
        </Tabs>
      </div>
    )
  }
}
