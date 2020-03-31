import { PureComponent } from 'react'
import ZhiJia from './ZhiJia/index.jsx'
import TanHai from './TanHai/index.jsx'
import './style.less'
import { analysisUrl } from '@/utils/common'

export default class MenaceDetail extends PureComponent {
  state = {
    categoryModel: analysisUrl(this.props.location.search).categoryModel
  }
  /**
   * 渲染组件
   * @return {*}
   */
  renderPage=()=>{
    const { categoryModel } = this.state
    switch(categoryModel){
      case '1':
        return (<ZhiJia/>)
      case '3':
        return (<TanHai/>)
      default:
        break
    }
  }

  render () {
    return this.renderPage()
  }
}
