import React from 'react'
import { Tabs  } from 'antd'
import { RelatePort, ServiceDetailAndChange } from '@c/index'
import LinkDetailAndChange from '@c/BugManage/LinkDetailAndChange'
import PlanDetailAndChange from '@c/BugManage/PlanDetailAndChange'
import api from '@/services/api'
import './index.less'

const TabPane = Tabs.TabPane
export default ({ props = {} }) => {
  const { type, from, number } = props
  // 关联端口组件内部的封装请求
  const portQueryConfig = {
    getList: (params) => {
      return api.queryVulnport({ ...params, antiyVulnId: number })
    },
    delFunc: (params) => {
      return api.deleteVulnport({ ...params, ids: [params.record.stringId], antiyVulnId: number })
    },
    addFunc: (params) => {
      const ports = params.keys.map(item => {
        return {
          port: item
        }
      })
      return api.saveVulnport({ ...params, ports, antiyVulnId: number })
    }
  }
  return (
    <div id="bug-tabs" className="bug-detail-change">
      <Tabs defaultActiveKey={'1'}>
        <TabPane tab="漏洞解决方案" key="1">
          <PlanDetailAndChange type={type} />
        </TabPane>
        <TabPane tab="漏洞影响服务" key="2">
          <ServiceDetailAndChange type={type} from={from} />
        </TabPane>
        <TabPane tab="漏洞影响端口" key="3">
          <RelatePort disabledOperation={type !== 'change'} queryConfig={ portQueryConfig }/>
        </TabPane>
        <TabPane tab="参考链接" key="4">
          <LinkDetailAndChange type={type} />
        </TabPane>
      </Tabs>
    </div>
  )
}
