import { Component, Fragment } from 'react'
import { connect } from 'dva'
import { Button } from 'antd'
import moment from 'moment'
import './index.less'

class Steps extends Component{
  constructor (props){
    super(props)
    this.state = {
      num: 10,
      show: false
    }}
  addMore = () => {
    let { num } = this.state
    let { data } = this.props
    if(num < (data.length - 10)){
      this.setState({
        num: num + 10
      })
    }else{
      this.setState({
        num: data.length
      })
    }
  }
  render (){
    let {  num, show } = this.state
    let { data } = this.props
    let showdata = []
    if(data && data.length > 10 ){
      showdata = data.slice(0, num)
      show = true
    }else{
      showdata = data
    }
    if(num === data.length){
      show = false
    }
    return (
      <Fragment>
        <div className="repair-advise">
          <ul>
            {
              showdata.map((item, index) => {
                return <li key={index}>
                  <div className="reparir-top">
                    <span className="reparir-icon"></span>
                    <span className="reparir-name">{item.name}</span>
                    <label>{moment(Number(item.gmtCreate) ).format('YYYY-MM-DD HH:mm:ss')}</label>
                  </div>
                  <div className="repair-text">
                    {item.resultStr === '拒绝' ?  (item.resultStr + '：' + item.advice) : item.resultStr}
                  </div>
                </li>
              })
            }
          </ul>
          {show &&
          <footer className="Button-center">
            <Button type="primary" ghost onClick={ this.addMore }>查看更多</Button>
          </footer>}
        </div>

      </Fragment>

    )
  }
}
export default connect()(Steps)