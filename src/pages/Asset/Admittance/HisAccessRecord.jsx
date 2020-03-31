import { PureComponent } from 'react'
import { Row, Col } from 'antd'
import { analysisUrl } from '@/utils/common'
import api from '@/services/api'
import hasAuth from '@/utils/auth'
import { debounce } from 'lodash'
import AssetDynamic from '@c/Asset/AssetCommon/AssetDynamic'
class HisAccessRecord extends PureComponent{
  state = {
    PrefixCls: 'HisAccessRecord',
    stringId: analysisUrl(this.props.location.search).stringId,
    assetInfo: {}
  }

  //**接口开始 */

  render (){
    const {
      PrefixCls,
      stringId,
      assetInfo
    } = this.state

    const infoList = [
      {
        name: '名称',
        cont: assetInfo.name
      },
      {
        name: '资产编号',
        cont: assetInfo.number
      },
      {
        name: '资产组',
        cont: assetInfo.assetGroup
      },
      {
        name: 'IP',
        cont: assetInfo.ips
      },
      {
        name: 'MAC',
        cont: assetInfo.macs
      }
    ]

    return(
      <div className={`main-detail-content ${PrefixCls}`}>
        <p className="detail-title">资产信息</p>
        <div className="detail-content detail-content-layout">
          <Row>
            {infoList.map((item, i) => (
              <Col xxl={6} xl={8} key={i}><span className="detail-content-label">{item.name}： </span> {item.cont}</Col>
            ))}
          </Row>
        </div>

        <p className="detail-title">历史准入记录</p>
        {/* //需要变更具体细节 */}
        <AssetDynamic assetId={stringId} type='record' Dyinterface='getAdmittanceListRecord'/>
      </div>
    )
  }

  componentDidMount () {
    api.getAssetHardWareById({
      primaryKey: this.state.stringId
    }).then(res=>{
      if(res && res.head && res.head.code === '200'){
        this.setState({ assetInfo: res.body.asset })
      }
    })
  }
}

export default HisAccessRecord

