import { Fragment } from 'react'
import { Row, Col } from 'antd'
import moment from 'moment'

import './style.less'

export default ({ detail = {} }) => {
  let init = [...'123456789']
  let Nu = 0, total
  let el = []
  let renderEl = (v, num, total, index)=>{
    let dom = []
    for(let i = 0; i < num; i++){
      let res =  (i + 1) % 2
      let children
      let cl = ''
      if(!res){
        children = (<li className={ v[i] ? cl : 'hide-block' }>
          <div className='info-up content-show border-block'>
            <i></i>
            <span>{v[i]}</span>
          </div>
          <div className=''>
          </div>
        </li>)
      }else{
        if(total > 1 ){
          if((index + 1) % 2 !== 0 && i === 4 && (index + 1) < total){
            cl = 'start-node'
          }else if((index + 1) % 2 === 0 && i === 0 && (index + 1) < total){
            cl = 'end-node'
          }
        }
        children = (<li className={ v[i] ? cl : 'hide-block' }>
          <div className='border-block'></div>
          <div className='info-down content-show'>
            <i></i>
            <span>{v[i]}</span>
          </div>
        </li>)
      }
      dom.push(children)
    }
    return dom
  }
  if(init.length){
    total = Math.ceil(init.length / 5)
    for(let i = 0; i < total; i ++){
      let iData = init.slice(i * 5, (i + 1) * 5 )
      el.push(<Fragment>
        <ul className={ (i + 1) % 2 === 0 ? 'even' : 'odd' }>
          {renderEl(iData, 5, total, i)}
        </ul>
      </Fragment>)
    }
  }
  return (
    <div className='record-course'>
      <div className="detail-title">补丁信息</div>
      <div className="detail-content detail-content-layout">
        <Row>
          {
            el.length ? el : null
          }
        </Row>
      </div>
    </div>
  )
}
