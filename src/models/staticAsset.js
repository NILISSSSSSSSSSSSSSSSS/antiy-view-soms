import { TooltipFn } from '@u/common'

export default {

  namespace: 'staticAsset',

  state: {
    assetModelColumns: [{
      title: '资产名称',
      dataIndex: 'name',
      key: 'name',
      render: text=>TooltipFn(text)
    },
    {
      title: 'IP',
      dataIndex: 'ips',
      key: 'ips',
      render: text=>TooltipFn(text)
    }],
    isLandEquipment: false
  },
  effects: {

  },
  reducers: {
    save (state, action) {
      return { ...state, ...action.payload }
    }
  }

}
