import { Component, default as React, Fragment } from 'react'
import { Tabs } from 'antd'
import { COMPUTING_DEVICE } from '@a/js/enume'
import AssetStep from '../AssetStep'
import BasicsField from '../BasicsField'
import Maintenance from '../Maintenance'
import AssetDynamic from '../../AssetCommon/AssetDynamic'
import RelateSubassembly from '@c/common/RelateSubassembly'
import RelateSoftware from '@c/common/RelateSoftware'
import Template from '@c/Asset/AssetCommon/Template'
import './index.less'
import api from '@/services/api'
const { TabPane } = Tabs
export default class AssetBasicsInfo extends Component{
  constructor (props){
    super(props)
    this.assetId = props.assetId
    this.state = {}
  }
  UNSAFE_componentWillReceiveProps (nextProps, nextContext) {
    this.queryConfig.params.assetId = nextProps.assetId
    this.assetId = nextProps.assetId
  }

  queryConfig = {
    params: { assetId: this.assetId },
    getList: (param)=>{
      const primaryKey = this.assetId
      return api.getAssetAssemblyInfo({ primaryKey })
    }
  }
  softwareQueryConfig = {
    getList: (params)=> {
      const primaryKey = this.assetId
      return api.getSoftPageList({ ...params, primaryKey, isBatch: false }).then((res)=>{
        return res
      })
    }
  }
  render () {
    const { baseInfo } = this.props
    return (
      <div className="asset-detail-baseInfo">
        <AssetStep baseInfo={baseInfo}/>
        <div className="asset-detail-baseInfo-basics">
          <div className="detail-title">
            基础信息
          </div>
          <BasicsField data={baseInfo} categoryModel={baseInfo.categoryModel}/>
        </div>
        <Tabs>
          <TabPane tab="组件信息" key="1">
            <RelateSubassembly disabledOperation queryConfig={this.queryConfig}/>
          </TabPane>
          {
            baseInfo.categoryModel === COMPUTING_DEVICE.value &&
            <TabPane tab="软件信息" key="2">
              <RelateSoftware needPage disabledOperation queryConfig={this.softwareQueryConfig}/>
            </TabPane>
          }
          {
            baseInfo.categoryModel === COMPUTING_DEVICE.value &&
            <TabPane tab="模板信息" key="3">
              <div className="asset-detail-template-container">
                <Template type={baseInfo.categoryModel} data={baseInfo} disabled disabledOperation/>
              </div>
            </TabPane>
          }
          <TabPane tab="维护信息" key="4">
            <div className="asset-detail-template-container">
              <Maintenance data={baseInfo}/>
            </div>
          </TabPane>
        </Tabs>
        <p className="detail-title">资产动态</p>
        <AssetDynamic assetId={this.assetId} Dyinterface='getAssetLog' />
      </div>
    )
  }
}
