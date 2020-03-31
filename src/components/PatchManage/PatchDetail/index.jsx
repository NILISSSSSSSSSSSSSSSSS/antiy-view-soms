import { Fragment } from 'react'
import { Row, Col } from 'antd'
import moment from 'moment'

import {
  PATCH_INSTALL,
  PATCH_INTERNET,
  PATCH_INTERACTIVE,
  PATCH_HOT,
  PATCH_SOURCE,
  PATCH_STATUS,
  PATCH_LEVEL
} from '@a/js/enume'

const span = { xxl: 6, xl: 8, lg: 8, md: 8 }
const blockSpan = { xxl: 24, xl: 24 }
// const patchLevel = ['核心', '重要', '一般']

export default ({ detail = {} }) => {
  return (
    <Fragment>
      <p className="detail-title">补丁信息</p>
      <div className="detail-content detail-content-layout">
        <Row>
          <Col {...span}><span className="detail-content-label">补丁编号：</span>{detail.patchNumber}</Col>
          <Col {...span}><span className="detail-content-label">补丁等级：</span>
            {detail.patchLevel && PATCH_LEVEL[Number(detail.patchLevel) - 1].name}</Col>
          <Col {...span}><span className="detail-content-label">补丁名称：</span>{detail.patchName}</Col>
          <Col {...span}><span className="detail-content-label">补丁状态：</span>
            {detail.patchStatus && PATCH_STATUS[Number(detail.patchStatus - 1)].name}</Col>
          <Col {...span}><span className="detail-content-label">发布时间：</span>
            {detail.publishTime && moment(detail.publishTime - 0).format('YYYY-MM-DD')}
          </Col>
          <Col {...span}><span className="detail-content-label">补丁来源：</span>
            {detail.pathSource && PATCH_SOURCE[Number(detail.pathSource) - 1].name}</Col>
          <Col {...span}><span className="detail-content-label">补丁信息来源：</span>{detail.patchInfoFrom}</Col>
          <Col {...span}><span className="detail-content-label">补丁热支持：</span>
            {detail.hotfix !== undefined && PATCH_HOT[Number(detail.hotfix)].name}
          </Col>
          <Col {...span}><span className="detail-content-label">用户交互：</span>
            {detail.userInteraction !== undefined && PATCH_INTERACTIVE[Number(detail.userInteraction)].name}
          </Col>

          <Col {...span}><span className="detail-content-label">独立安装：</span>
            {detail.exclusiveInstall !== undefined && PATCH_INSTALL[Number(detail.exclusiveInstall)].name}
          </Col>
          <Col {...span}><span className="detail-content-label">联网状态：</span>
            {detail.networkStatus !== undefined && PATCH_INTERNET[Number(detail.networkStatus)].name}
          </Col>
          <Col {...blockSpan}><span className="detail-content-label">补丁描述：</span>{detail.description}</Col>
          <Col {...blockSpan}><span className="detail-content-label">补丁审核意见：</span>{detail.patchAuditOpinions}</Col>
          <Col {...blockSpan}><span className="detail-content-label">卸载步骤：</span>{detail.uninstallStep}</Col>
        </Row>
      </div>
    </Fragment>
  )
}
