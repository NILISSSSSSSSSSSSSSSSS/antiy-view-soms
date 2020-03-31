import { Row, Col } from 'antd'
import './style.less'

export default ({ initStatus }) => {
  const colStyle = {
    span: 4,
    offset: 2
  }
  return (
    <div className="oaDetail">
      {/* 订单详情 */}
      <h4>订单详情：</h4>
      <Row>
        <Col {...colStyle}><span className='detail-content-label'>流水号:</span></Col>
        <Col span={18}>{initStatus.name}</Col>
      </Row>
      <Row>
        <Col {...colStyle}><span className='detail-content-label'>订单类型:</span></Col>
        <Col span={18}>{initStatus.departmentName}</Col>
      </Row>
      <Row>
        <Col {...colStyle}><span className='detail-content-label'>订单状态:</span></Col>
        <Col span={18}>{initStatus.email}</Col>
      </Row>
      <h4>申请信息：</h4>
      <Row>
        <Col {...colStyle}><span className='detail-content-label'>申请人:</span></Col>
        <Col span={18}>{initStatus.qq}</Col>
      </Row>
      <Row>
        <Col {...colStyle}><span className='detail-content-label'>申请时间:</span></Col>
        <Col span={18}>{initStatus.weixin}</Col>
      </Row>
      <Row>
        <Col {...colStyle}><span className='detail-content-label'>申请内容:</span></Col>
        <Col span={18}>{initStatus.mobile}</Col>
      </Row>
      <h4>审批信息：</h4>
      <Row>
        <Col {...colStyle}><span className='detail-content-label'>审批意见:</span></Col>
        <Col span={18}>{initStatus.addressName}</Col>
      </Row>
      <Row>
        <Col {...colStyle}><span className='detail-content-label'>审批时间:</span></Col>
        <Col span={18}>{initStatus.detailAddress}</Col>
      </Row>
      <Row>
        <Col {...colStyle}><span className='detail-content-label'>审批人:</span></Col>
        <Col span={18}>{initStatus.position}</Col>
      </Row>
    </div>
  )
}
