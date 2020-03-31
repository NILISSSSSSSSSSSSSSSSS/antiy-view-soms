import React, { Component } from 'react'
import BugChangeForm from '@c/BugManage/BugChangeForm'
import './index.less'
export class Register extends Component {
  constructor (props) {
    super(props)
    this.state = {

    }
  }
  componentDidMount () {

  }
  render () {
    return (
      <section>
        <div className="main-detail-content">
          <BugChangeForm />
        </div>
      </section>
    )
  }
}

export default Register