import React, { PureComponent } from 'react'
import Information from '@/components/Asset/Information'
import Manufacturer from '@/components/Asset/Manufacturer'
import Status from '@/components/Asset/Status'
import Error from '@/components/Asset/Error'
import './style.less'

export default class AssetOverview extends PureComponent {
  state = {
    PrefixCls: 'AssetOverview'
  }

  render () {
    return (
      <div className={'asset-overview'}>
        {/* <div className="top-box"> */}
        <div className='asset-overview-flex'>
          {/* 资产品类统计 */}
          <Information />
          {/* 厂商统计 */}
          <Manufacturer />

        </div>
        <div className='asset-overview-flex'>
          {/* 资产状态统计 */}
          <Status />
          {/* 异常统计 */}
          <Error />
        </div>
      </div>
    )
  }
}
