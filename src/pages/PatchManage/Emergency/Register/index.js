import { Component } from 'react'
import { withRouter } from 'dva/router'
import PatchChangeForm from '@/components/PatchManage/PatchChangeForm'
import PatchTabsDetailAndChange from '@/components/PatchManage/PatchTabsDetailAndChange'
import { analysisUrl } from '@u/common'

@withRouter
class EmergencyRegister extends Component{
  constructor (props){
    super(props)
    this.state = {
      tabShow: false,
      id: undefined
    }
  }
  componentDidMount (){
    const params = analysisUrl(this.props.location.search)
    if(params.id)
      this.setState({ tabShow: true, id: params.id })
  }

  tabShow = (tabShow, id)=>{
    this.setState({ tabShow, id })
  }
  render (){
    const { tabShow, id } = this.state
    return(
      <section className="information-register">
        <div className="main-detail-content">
          {/* 表单 */}
          <PatchChangeForm tabIs={(state, id = undefined)=>this.tabShow(state, id)} />
          {
            tabShow ? (
              <PatchTabsDetailAndChange
                props={{
                  type: 'change',
                  from: 'patch',
                  id
                }}/>
            ) : null
          }
        </div>
      </section>
    )
  }
}

export default EmergencyRegister