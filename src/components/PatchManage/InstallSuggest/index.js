
import { Timeline } from 'antd'
import './style.less'
import moment from 'moment'

export default (props) => {
  const { iData } = props

  return (
    <div className="install-suggest">
      <p className="detail-title">安装建议</p>
      <section className='patch-install-suggest-main'>
        <Timeline >
          {
            iData.length && iData.map((item, i)=>(
              <Timeline.Item color='#6286f3' key={i}>
                <div className='suggest-main-header'>
                  <span>{item.name}</span>
                  <time>{moment(Number(item.time)).format('YYYY-MM-DD HH:mm:ss')}</time>
                </div>
                <div className='suggest-main-content'>
                  {item.suggestion}
                </div>
              </Timeline.Item>
            ))
          }
        </Timeline>
      </section>
    </div>
  )
}
