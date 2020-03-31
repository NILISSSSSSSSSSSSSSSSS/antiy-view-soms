import { PureComponent, Fragment } from 'react'
import DetailFiedls from '@c/common/DetailFiedls'
import { transliteration, analysisUrl } from '@/utils/common'
import { debounce } from 'lodash'
import AssetDynamic from '@c/Asset/AssetCommon/AssetDynamic'

class AssetOaHandle extends PureComponent{
  state = {
    PrefixCls: 'AssetOaHandle',
    stringId: analysisUrl(this.props.location.search).stringId
  }

  goAsset=(e)=>{
    window.open(`/#/asset/manage/detail?number=${transliteration(e)}`)

  }

  //**接口开始 副作用 */
  getBusinessList=debounce(iscache=>{

  }, 300)

  render (){
    const { PrefixCls, stringId } = this.state

    const fields = [
      { key: 'name', name: '名称' },
      { key: 'number', name: '编号', render: e=><a onClick={()=>this.goAsset(e)}>e</a> },
      { key: 'key', name: 'key' },
      { key: 'operationSystemName', name: '类型' },
      { key: 'number2', name: '分组' },
      { key: 'responsibleUserName', name: '使用者' }
    ]

    const data = {}

    return(
      <Fragment>
        <p className="detail-title">设备信息：</p>
        <div className="detail-content asset-group-detail-content">
          <DetailFiedls fields={fields} data={data} />
        </div>

        <p className="detail-title">出借历史：</p>
        <AssetDynamic assetId={stringId} type='borrow' Dyinterface='getAssetLog'/>
      </Fragment>
    )
  }

  componentDidMount (){
  }

}

export default AssetOaHandle

