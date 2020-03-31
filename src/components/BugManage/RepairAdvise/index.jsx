import React, { Fragment } from 'react'
import moment from 'moment'
import './index.less'

export default ({ data = [] }) => {
  return (
    <Fragment>
      <p className="detail-title">修复建议</p>
      <div className="repair-advise">
        {
          data.length ? <ul>
            {
              data.map((item, index) => {
                return <li key={index}>
                  <div className="reparir-top">
                    <span className="reparir-icon"></span>
                    <span className="reparir-name">{item.name}</span>
                    <label>{item.time && moment(item.time - 0).format('YYYY-MM-DD HH:mm:ss')}</label>
                  </div>
                  <div className="repair-text">{item.suggestion}</div>
                </li>
              })
            }
          </ul> :
            <div className="plan-no-data" style={{ textAlign: 'center' }}>
              <img src={require('@/assets/images/noData.png')} alt=""/>
              <p>暂无数据</p>
            </div>
        }
      </div>
    </Fragment>
  )
}
