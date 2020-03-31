import React, { Component } from 'react'
import { withRouter } from 'react-router-dom'
import { bool, string, func, object } from 'prop-types'
import { Modal, Progress } from 'antd'
import api from '@/services/api'
import './index.less'
/**
 * 漏洞扫描与资产扫描
 */
@withRouter
class Scan extends Component {
  static propTypes = {
    //是否是资产探测,默认false
    isAssets: bool,
    //扫描接口地址
    scanUrl: string,
    //扫描接口需要的参数
    params: object,
    //弹框标题
    title: string,
    //弹框显示
    visible: bool,
    //关闭扫描
    onClose: func,
    //后台扫描
    onBackstage: func,
    //停止发现
    onStopFind: func,
    //跳转页面
    goTo: func,
    //数据变化的回调
    dataChangeCallback: func
  }
  static defaultProps = {
    interval: 500 //间隔探测时间，资产探测为固定时间，漏洞为每次递增,单位毫秒
  }
  constructor (props) {
    super(props)
    const { interval } = props
    this.state = {
      visible: false,
      isFinish: false,
      isCloseShow: false,
      progress: 0,
      equipments: 0,
      //突发漏洞调转页面的时间
      time: 3,
      //漏洞扫描的时间间隔
      interval,
      errorMessage: '' //错误异常信息
    }
  }

  componentDidMount () {
    this.setInterval()
  }

  componentWillUnmout () {
    this.clearInterval()
  }

  render () {
    const { visible, title, isAssets = true, goTo } = this.props
    const { progress, isFinish, time, isCloseShow, equipments, errorMessage } = this.state
    let msg = ''
    if(isCloseShow){ // 手动时
      msg =  '已停止扫描'
    }else if(!isCloseShow && errorMessage){ // 没有停止，但是后台扫描异常
      msg =  <span className="scan-error-message">{errorMessage}</span>
    }else{
      msg = '正在扫描中，请耐心等待…'
    }
    return (
      <Modal
        className="over-scroll-modal"
        title={title}
        width={680}
        visible={visible}
        footer={null}
        maskClosable={false}
        closable={false}>
        <div className="scan">
          {
            isAssets && <p className="equipment">已发现设备：<span>{equipments}</span></p>
          }
          {
            isFinish ? <div className="scan-finish">
              <div className="icon-box">
                <img src={require('@a/stepsgougou.svg')} alt="" />
                <span>扫描完成！</span>
              </div>
              {
                !isAssets && <p className="scan-time">{time}S</p>
              }
              {
                isAssets ?
                  <p className="assets-finish"><span className="scan-btn" onClick={goTo}>返回</span>资产列表查看扫描结果</p> :
                  <p>即将跳转到<span className="scan-btn" onClick={goTo}>突发漏洞处置页面</span></p>
              }
            </div> : <div className="scaning">
              <Progress percent={progress} status="active" />
              <p>{msg}</p>
              {
                !isCloseShow && !errorMessage && <span className="scan-btn" onClick={this.backstage}>后台扫描</span>
              }
              {
                isAssets && !isCloseShow && <span className="scan-btn" onClick={this.stopFind}>停止发现</span>
              }
              {
                isCloseShow && <span className="scan-btn" onClick={this.close}>关闭扫描</span>
              }
            </div>
          }

        </div>
      </Modal>
    )
  }

  //开启定时器
  setInterval = () => {
    const { interval } = this.state
    this.scanInterval = setInterval(() => this.scaning(), interval)
  }

  //定时器扫描
  scaning = () => {
    const { isAssets, scanUrl, params } = this.props
    let { interval } = this.state
    //漏洞扫描：定时器递增
    if (!isAssets) {
      interval += 500
      this.setState({
        interval
      }, () => {
        this.clearInterval()
        this.setInterval()
      })
    }
    api[scanUrl](params).then(response => {
      if(response && response.head && response.head.code === '200' ){
        const { body } = response
        let { onProgress, errorMessage, findAssetNums } = body || {}
        //漏洞进度返回为0.01小数，需转换
        if (!isAssets) {
          onProgress *= 100
        }
        /**测试代码，可有可无*/
        // if(true){
        //   if(!this.initOnProgress) this.initOnProgress = 5
        //   this.initOnProgress += 5
        //   onProgress = this.initOnProgress
        //   findAssetNums = this.initOnProgress
        // }

        // 资产时，body有可能为 null情况
        this.setState({
          progress: onProgress || 0,
          errorMessage
        })
        //资产设备数
        isAssets && this.setState({
          //equipments字段需修改
          equipments: findAssetNums || 0
        })
        // 资产探测异常时，给出提示，不再进行探测
        if(isAssets && errorMessage){
          this.setState({
            isFinish: true
          })
          this.clearInterval()
        }
        this.dataChange(onProgress, body)
        if (onProgress >= 100) {
          this.setState({
            isFinish: true
          })
          this.clearInterval()
          //突发漏洞：开启倒计时跳转页面
          if (!isAssets) {
            this.linkInterval = setInterval(() => this.jumpPage(), 1000)
          }
        }
      }
    })
  }
  /**
   * 数据探测进度发生变化时回调
   * @param newProgress 最新进度
   * @param data 探测数据
   */
  dataChange = (newProgress, data) => {
    const { dataChangeCallback, isAssets } = this.props
    if(dataChangeCallback && newProgress !== this.prevProgress){
      if(isAssets && data.findAssetNums){
        dataChangeCallback(newProgress, data)
      }
    }
    this.prevProgress = newProgress
  }

  //倒计时跳转页面
  jumpPage = () => {
    const { goTo } = this.props
    const { time } = this.state
    this.setState({
      time: time - 1
    })
    if (time === 1) {
      this.clearInterval()
      goTo()
    }
  }

  //后台扫描
  backstage = () => {
    const { onBackstage } = this.props
    this.clearInterval()
    onBackstage()
  }

  //停止发现
  stopFind = () => {
    const { onStopFind } = this.props
    this.clearInterval()
    this.setState({
      isCloseShow: true
    })
    onStopFind()
  }

  //关闭扫描
  close = () => {
    const { onClose } = this.props
    this.clearInterval()
    onClose()
  }

  //清除定时器
  clearInterval = () => {
    clearInterval(this.scanInterval)
    clearInterval(this.linkInterval)
  }
}

export default Scan
