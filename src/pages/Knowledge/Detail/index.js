import { Component } from 'react'
import { connect } from 'dva'
import { Row, Col } from 'antd'
import api from '@/services/api'
import moment from 'moment'
import { analysisUrl, download } from '@/utils/common'
import './style.less'
const span = { xxl: 6, xl: 8 }

class KnowledgeDetail extends Component {
  constructor (props) {
    super(props)
    this.state = {
      detail: {}
    }
  }
  componentDidMount () {
    api.getKnowledgeDetail({ primaryKey: analysisUrl(this.props.location.search).id }).then(res => {
      this.setState({
        detail: res.body
      })
    })
  }

  render () {
    const { detail } = this.state
    return (
      <div className="main-detail-content">
        {/* <h2 className="page-title">知识库详情</h2> */}
        <p className="detail-title">知识库详情</p>
        <div className="detail-content">
          <Row>
            <Col {...span}><span className="detail-content-label">名称：</span>{detail.name}</Col>
            <Col {...span}><span className="detail-content-label">类型：</span>
              {
                (() => {
                  switch (detail.knowledgeType) {
                    case 'CASE':
                      return '案例库'
                    case 'PLAN':
                      return '方案库'
                    case 'EVENT':
                      return '事件库'
                    case 'BENCHMARK_STRATEGY':
                      return '基准策略库'
                    default:
                      break
                  }
                })()
              }
            </Col>
            <Col {...span}><span className="detail-content-label">关键字：</span>{detail.keyWords}</Col>
            <Col {...span}><span className="detail-content-label">创建时间：</span>{moment(detail.gmtCreate).format('YYYY-MM-DD HH:mm:ss')}</Col>
            <Col {...span}><span className="detail-content-label">创建人：</span>{detail.createUser}</Col>
          </Row>
          <Row>
            <Col><span className="detail-content-label">内容：</span>{detail.content}</Col>
          </Row>
        </div>

        <p className="detail-title">相关附件</p>
        <div className="detail-content">
          {(detail.filesInfo && detail.filesInfo.length) ?
            <div className="detail-attachment">
              {
                detail.filesInfo.map(item => {
                  return (
                    <a onClick={() => download('/api/v1/file/download', {
                      url: item.fileUrl, fileName: item.originFileName
                    })}>
                      <div className="detail-attachment-item" title="" key={item.id}>
                        <img src={require('@/assets/download.svg')} className="download-icon" alt="" />
                        <p className="detail-attachment-item-title">{item.originFileName}</p>
                      </div>
                    </a>
                  )
                })
              }
            </div>
            : <div className="empty-wrap"><div className="empty-placeholder"></div></div>
          }
        </div>
      </div>
    )
  }
  goBack = () => {
    this.props.history.goBack()
  }
}

export default connect()(KnowledgeDetail)
