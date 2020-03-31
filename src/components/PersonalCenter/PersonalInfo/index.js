import { Component } from 'react'
import CustomForm from '../CustomForm'
import { connect } from 'dva'
import * as regExp from '@/utils/regExp'

class PersonalInfo extends Component {
  constructor (props) {
    super(props)
    this.columns = [
      { label: '姓名', name: 'name', type: 'text', style: { width: 300 }, items: { maxLength: 30 }, rules: [{ required: true,  message: '请输入姓名' }, { whitespace: true,  message: '请输入姓名' }] },
      { label: '部门', name: 'department', type: 'text', style: { width: 300 }, items: { maxLength: 60 }, rules: [
        { pattern: regExp.departmentPattern, message: '最多输入30非空字符' }] },
      { label: '职能', name: 'duty', type: 'text', items: { maxLength: 30 }, style: { width: 300 } },
      { label: '手机号', name: 'phone', type: 'text', style: { width: 300 }, items: { maxLength: 11 }, rules: [
        { pattern: regExp.newPhonePattern, message: '请输入正确的手机号' }
      ] },
      { label: '电子邮箱', name: 'email', type: 'text', style: { width: 300 }, items: { maxLength: 60 }, rules: [
        { pattern: regExp.emailPattern, message: '请输入正确的电子邮箱' }
      ] },
      { label: '', name: 'btn', type: 'btn' }
    ]
  }
  formItemLayout = {
    labelCol: {
      span: 5
    },
    wrapperCol: {
      span: 19
    }
  }

  onSubmit = (e) => {
    const { dispatch } = this.props
    dispatch({ type: 'personalCenter/saveInfo', payload: e  })
  }
  setValue (values = {}){
    return this.columns.map((el)=>{
      if(values[el.name] || values[el.name] === 0){
        return { ...el, value: values[el.name] }
      }else{
        return { ...el }
      }
    })
  }
  render (){
    const { currentUserInfo } = this.props
    const columns = this.setValue(currentUserInfo)
    return(
      <div>
        <CustomForm columns={columns} onSubmit={this.onSubmit}/>
      </div>
    )
  }
}
const mapStateToProps = ({ personalCenter }) => {
  return {
    currentUserInfo: personalCenter.currentUserInfo
  }
}

export default connect(mapStateToProps)(PersonalInfo)

