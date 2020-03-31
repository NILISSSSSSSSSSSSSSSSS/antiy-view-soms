import React, { Component } from 'react'
import BugDetailPage from '@c/BugManage/BugDetailPage'

class Detail extends Component {
  constructor (props) {
    super(props)
    this.state = {

    }
  }

  componentDidMount () {

  }

  render () {
    return (
      <BugDetailPage className="bug-test" />
    )
  }
}

export default Detail
