import React, { Component, Fragment } from 'react'
import { TooltipFn, analysisUrl, cacheSearchParameter, evalSearchParam } from '@u/common'
import hasAuth from '@/utils/auth'
import { Table, Row, Col, Button, Modal } from 'antd'
import api from '@/services/api'
import Vul from './vul.js'
import Patch from './patch.js'

export class InfoReport extends Component {
  constructor (props){
    this.state = {
      body: {},
      visible: false
    }
  }
  componentDidMount (){
    if(this.props.children) this.props.children(this)
  }
  //弹窗是否关闭
  show=(v)=>{
    this.setState({ visible: v })
  }
  render (){
    let { visible } = this.state
    let { config } = this.props
    return (
      <Modal
        className="over-scroll-modal"
        title={config.title || ''}
        width='650px'
        footer={null}
        maskClosable={false}
        visible={visible}
        onOk={this.handleSubmit} onCancel={() =>this.show(false) }>
        {
          config.order && config.order === '1' ? (
            <Patch></Patch>
          ) : (
            <Vul></Vul>
          )
        }
      </Modal>
    )
  }
}