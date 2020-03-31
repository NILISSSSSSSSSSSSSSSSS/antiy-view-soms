import { Tabs  } from 'antd'
import { RelatePort, ServiceDetailAndChange } from '@c/index'
import PrevPatchDetailAndChange from '@/components/PatchManage/PrevPatchDetailAndChange'
import RelevanceBugDetailAndChange from '@/components/PatchManage/RelevanceBugDetailAndChange'
import api from '@/services/api'
import './index.less'

const TabPane = Tabs.TabPane
export default ({ props }) => {
  const { type, from, id } = props
  // 关联端口组件内部的封装请求
  const portQueryConfig = {
    getList: (params) => {
      return api.getPatchPortList({ ...params, antiyPatchNumber: id })
    },
    delFunc: (params) => {
      return api.deletePatchPort({ ...params, ports: [params.record.port], patchIds: id })
    },
    addFunc: (params) => {
      params.ports = JSON.parse(JSON.stringify(params.keys))
      delete params.keys
      return api.addPatchPort({ ...params, ports: params.ports, patchIds: id })
    }
  }
  return (
    <div className="patch-detail-change">
      <Tabs defaultActiveKey={'1'}>
        <TabPane tab="前置补丁" key="1">
          <PrevPatchDetailAndChange type={type} id={id} />
        </TabPane>
        {/* <TabPane tab="关联附件信息" key="2">
        <AppendixDetailAndChange type={type} />
      </TabPane> */}
        <TabPane tab="关联服务信息" key="2">
          <ServiceDetailAndChange type={type} from={from} id={id} />
        </TabPane>
        <TabPane tab="关联端口信息" key="3">
          <RelatePort disabledOperation={type !== 'change'} queryConfig={ portQueryConfig }/>
        </TabPane>
        <TabPane tab="关联漏洞信息" key="4">
          <RelevanceBugDetailAndChange type={type} id={id} />
        </TabPane>
      </Tabs>
    </div>

  )
}
