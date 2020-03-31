import React, { Fragment } from 'react'
import { Row, Col } from 'antd'
import { SOURCE_LIST, SOURCE_LEVEL } from '@a/js/enume'

const span = { xxl: 6, xl: 8 }
const blockSpan = { xxl: 24, xl: 24 }
const detailList = [
  { name: '名称', key: 'name' },
  { name: '检测规范', key: 'source', check: 1 },
  { name: '基准类型', key: 'typeName' },
  { name: '编号', key: 'ruleId' },
  { name: '安全级别', key: 'level', check: 2 },
  { name: '加固编号', key: 'fixId' },
  { name: '描述', key: 'description', blockSpan: blockSpan },
  { name: '核查脚本', key: 'checkScript', blockSpan: blockSpan },
  { name: '判断依据', key: 'basis', blockSpan: blockSpan },
  { name: '加固方案', key: 'fixContent', blockSpan: blockSpan },
  { name: '加固脚本', key: 'fixScript', blockSpan: blockSpan },
  { name: '建议', key: 'suggest', blockSpan: blockSpan },
  { name: '影响', key: 'effect', blockSpan: blockSpan },
  { name: '备注', key: 'remark', blockSpan: blockSpan }
]
const serverList = [
  { name: '关联服务', key: 'serviceName' },
  { name: '服务状态', key: 'serviceStatus' }
]
const portList = [
  { name: '关联端口', key: 'port' },
  { name: '端口状态', key: 'portStatus' }
]
const status = ['关闭', '开启']
export default ({ body = {}, history }) => {
  return (
    <Fragment>
      <p className="detail-title">基础信息</p>
      <div className="detail-content detail-content-layout">
        <Row>
          {detailList.map((item, index) => {
            let value = ''
            if (item.check === 1) {
              value = body[item.key] ? SOURCE_LIST[body[item.key] - 1].name : ''
            } else if (item.check === 2) {
              value = body[item.key] ? SOURCE_LEVEL[body[item.key] - 1].name : ''
            } else {
              value = body[item.key]
            }
            return <Fragment key={index}><Col  {...item.blockSpan || span}><span className="detail-content-label">{item.name}：</span>{value || '--'}</Col></Fragment>
          })
          }
        </Row>
      </div>
      <p className="detail-title">配置服务</p>
      <div className="detail-content detail-content-layout">
        {body.serviceList && body.serviceList.length ?
          body.serviceList.map((ob, index) => {
            return <Row key={index}>
              {serverList.map((item, index) => {
                let value = ''
                if (item.key === 'serviceStatus') {
                  value = status[ob[item.key]]
                } else {
                  value = ob[item.key]
                }
                return <Fragment><Col {...span}><span className="detail-content-label" key={index + 'serves'}>{item.name}：</span>{value}</Col></Fragment>
              })
              }
            </Row>
          }) : <div className='no-text'>无</div>}
      </div>
      <p className="detail-title">配置端口</p>
      <div className="detail-content detail-content-layout">
        {body.portList && body.portList.length ?
          body.portList.map((ob, index) => {
            return <Row key={index}>
              {portList.map((item, idx) => {
                let value = ''
                if (item.key === 'portStatus') {
                  value = status[ob[item.key]]
                } else {
                  value = ob[item.key]
                }
                return <Fragment><Col {...span} key={idx + 'ports'}><span className="detail-content-label">{item.name}：</span>{value}</Col></Fragment>
              })
              }
            </Row>
          }) : <div className='no-text'>无</div>}
      </div>
    </Fragment>
  )
}
