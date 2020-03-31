import { Component } from 'react'
import { Form, Row, Col } from 'antd'
import AddScan from '@c/common/AddScan'
import { withRouter } from 'dva/router'
import { connect } from 'dva'
import Template from '../../content'
import { analysisUrl } from '@/utils/common'
import api from '@/services/api'
import './style.less'
class ModelScanDetail extends Component {
  constructor (props) {
    super(props)
    const query = analysisUrl(this.props.location.search)
    this.state = {
      stringId: query.stringId,
      DetailModel: {},
      scanArr: [
        { name: '', key: 'scanType', type: 'select', multiple: null, search: true, data: [{ name: '基准项', value: 0 }, { name: '黑名单', value: 1 }, { name: '白名单', value: 2 }], required: 'scanVerifi', message: '请选择基准项/黑名单/白名单' },
        { name: '', key: 'scanVerifi', type: 'select', multiple: null, required: 'scanType', message: '请选择状态', search: false, data: [{ name: '等于', value: 0 }, { name: '不等于', value: 1 }] },
        { name: '', key: 'scanContent', type: 'input', required: 'scanType', message: '请选择基准项/黑名单/白名单' },
        { name: '', key: 'configId' },
        { name: '', key: 'defineValue' }]
    }
  }
  async componentDidMount () {
    await this.queryTemplateScanById(this.state.stringId)
  }
  UNSAFE_componentWillReceiveProps (nextProps) {
  }
  queryTemplateScanById=(stringId)=>{
    api.queryTemplateScanById({ stringId: stringId }).then(res=>{
      this.setState({
        DetailModel: res.body
      })
    })
  }
  render () {
    let { DetailModel, scanArr, stringId } = this.state
    return (
      <div className='main-detail-content model-scan-detail'>
        <p className='detail-title'>扫描信息</p>
        {DetailModel && <div className='detail-content detail-content-layout'>
          <Row>
            <Col span={24}><span className='detail-content-label'>扫描任务名称：</span>{DetailModel.scanName}</Col>
            <span className='detail-content-label'>扫描任务内容：</span><AddScan title=''
              config={scanArr} //基本配置项
              value = { DetailModel.scanConditionList }
              field={'baselineConfigInfoExt'}
              isScan={true}
              form={this.props.form} />
          </Row>
        </div>}
        <p className='detail-title'>扫描结果</p>
        <Template isScan={true} scanId={stringId} scanData={DetailModel && DetailModel.scanConditionList} history={this.props.history}/>
      </div>
    )
  }
}
const ModelScanDetails = Form.create()(ModelScanDetail)
export default withRouter(connect()(ModelScanDetails))