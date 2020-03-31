import React, { PureComponent } from 'react'
import { Tabs  } from 'antd'
// import Hardware from './Hardware'
import Information from './Information'
import Unknown from './Unknown'
import { analysisUrl, removeCriteria } from '@/utils/common'
import hasAuth from '@/utils/auth'
import { assetsPermission } from '@a/permission'
const { TabPane } = Tabs

class AssetManage extends PureComponent{
  state = {
    tabActiveKey: '1'
  }

  tabChange = (key) => {
    removeCriteria()
    this.setState({
      tabActiveKey: key
    })
    if( key === '1' ){
      // this.Hardware.handleReset()
      this.props.history.replace('/asset/manage')
    }else if( key === '2' ){
      // this.Software.handleReset()
      this.props.history.replace('/asset/manage?status=2')
    }
    // else if( key === '3' ){
    //   // this.Software.handleReset()
    //   this.props.history.push('/asset/manage?status=3')
    // }
  }

  render (){
    const { tabActiveKey } = this.state

    return(
      <div className="main-table-content">
        <Tabs activeKey={tabActiveKey} onChange={this.tabChange}>
          {hasAuth(assetsPermission.ASSET_INFO_LIST) ? <TabPane tab="资产信息列表" key="1" forceRender>
            <Information children={ref => this.Hardware = ref} />
          </TabPane> : null
          }
          {hasAuth(assetsPermission.ASSET_UNKNOWN_INFO) ? <TabPane tab="未知资产" key="2" forceRender>
            <Unknown children={ref => this.Software = ref} />
          </TabPane> : null
          }
          {/* {hasAuth('asset:hard') ? <TabPane tab="硬件" key="3" forceRender>
            <Hardware children={ref => this.Hardware = ref}></Hardware>
          </TabPane> : null
          } */}
        </Tabs>
      </div>
    )
  }

  componentDidMount () {
    const status = analysisUrl(this.props.location.search).status
    let tabActiveKey = '1'
    if(status === '2'){
      tabActiveKey = '2'
    }
    // else if(status === '3'){
    //   tabActiveKey = '3'
    // }
    this.setState({
      tabActiveKey: tabActiveKey
    })
  }

}

export default AssetManage
