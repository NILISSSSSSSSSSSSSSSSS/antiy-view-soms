import React, { Component } from 'react'
import BugOrPatch from '../common/BugOrPatch'

export default class AssetDetailBug extends Component {
  constructor (props){
    super(props)
    this.state = {
      visible: false,
      selectedRowKeys: []
    }
  }
  render () {
    const { assetId, data } = this.props
    return <BugOrPatch componentType="bug" key={assetId} assetId={assetId} data={data}/>
  }
}
