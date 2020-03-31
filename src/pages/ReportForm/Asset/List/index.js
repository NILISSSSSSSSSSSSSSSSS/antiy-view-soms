import { Component } from 'react'
import { connect } from 'dva'
import { Form, Tabs } from 'antd'
// import moment from 'moment'
// import Api from '@/services/api'
// import Category from '../Category'
import Area from '../Area'
import Group from '../Group'
import { analysisUrl, removeCriteria } from '@/utils/common'

const { TabPane } = Tabs

class ReportFormAsset extends Component{
  constructor (props){
    super(props)
    this.state = {
      list: {},
      tabActiveKey: '1'
    }
  }
  render (){
    let { tabActiveKey } = this.state
    let status = analysisUrl(this.props.location.search).status
    if(status === '1' ){
      tabActiveKey =  '1'
    }else if (status === '2' ){
      tabActiveKey =  '2'
    } else {
      tabActiveKey =  '1'
    }
    return(
      <div className="reportForm-asset main-table-content">
        <Tabs className='reportForm-tab' onChange={this.tabChange} activeKey={tabActiveKey}>
          <TabPane tab="资产区域" key="1">
            {
              tabActiveKey === '1' ? <Area history={this.props.history} /> : null
            }
          </TabPane>
          <TabPane tab="资产组" key="2">
            {
              tabActiveKey === '2' ? <Group history={this.props.history} /> : null
            }
          </TabPane>
        </Tabs>
      </div>
    )
  }
  //标签页切换
  tabChange=(key)=>{
    removeCriteria()
    if( key === '1' ){
      this.props.history.push('/reportForm/asset')
    } else if(  key === '2' ) {
      this.props.history.push('/reportForm/asset?status=2')
    } else{
      this.props.history.push('/reportForm/asset?status=1')
    }
    this.setState({
      tabActiveKey: key
    })
  }
}

const ReportFormAssets = Form.create()(ReportFormAsset)

export default connect()(ReportFormAssets)
