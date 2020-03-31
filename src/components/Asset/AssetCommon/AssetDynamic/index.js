import React, { Component } from 'react'
import { Button, Steps } from 'antd'
import moment from 'moment'
import { download } from '@/utils/common'
import api from '@/services/api'
import './index.less'
import PropTypes from 'prop-types'

const { Step } = Steps
/**
 * 资产动态组件
 */
export default class AssetDynamic extends Component {
  constructor (props) {
    super(props)
    this.state = {
      btnCont: false,
      assetId: props.assetId,
      pageSize: 10,
      currentPage: 1,
      list: [],
      hasMore: false,
      originalList: []
    }
  }

  static defaultProps = {
    type: 'assets'
  }

  static propTypes = {
    assetId: PropTypes.string,
    type: PropTypes.oneOf(['assets', 'record', 'borrow']),
    Dyinterface: PropTypes.string
  }

  getStart = (currentPage) => {
    const { pageSize } = this.state
    return (currentPage - 1) * pageSize
  }
  // 获取资产动态列表
  getAssetDynamicList = (assetId)=>{
    const { currentPage, pageSize } = this.state
    const { Dyinterface } = this.props
    const start = this.getStart(currentPage)
    const end = start + pageSize
    let hasMore = false
    api[Dyinterface]({ primaryKey: assetId }).then((res)=>{
      console.log(res.body)
      let list = res.body || []
      if(list.length > end){
        hasMore = true
      }
      // // list: list.slice(start, end)
      //怀疑list和originalList 有冲突
      this.setState({ originalList: list, hasMore, list: list.slice(start, end) })
    })
  }

  //资产动态加载更多
  assetMore = () => {
    const { pageSize, currentPage, originalList, list } = this.state
    const start = this.getStart(currentPage + 1)
    const end = start + pageSize
    let hasMore = false
    if(originalList.slice(end).length){
      hasMore = true
    }
    this.setState({ currentPage: currentPage + 1, hasMore, list: list.concat(originalList.slice(start, end)) })

  }
  //资产动态描述附件
  stepDescriptionAnnex= fileInfoStr =>{
    const fileInfos = JSON.parse(fileInfoStr)
    return fileInfos.map((file, fileIndex) =>{
      return <a key={fileIndex + '-' + fileIndex} onClick={()=>download('/api/v1/file/download', file)} style={{ marginLeft: '20px' }}>{file.fileName}</a>
    })
  }

  //资产动态描述
  stepDescription = list => {
    let renderCont = null
    const type = this.props.type
    switch(true){
      case type === 'assets' : renderCont = 'renderAssets'
        break
      case type === 'record' : renderCont = 'renderRecord'
        break
      case type === 'borrow' : renderCont = 'renderBorrow'
        break
      default: break
    }

    return (
      list.map((item, index) => (
        <Step title={ item.name } key={ index + 'step' } description={ <div key={ index + 'descr' } className='detail-step-vertical-desc'>
          {this[renderCont](index, item)}
        </div> }/>
      )))
  }

   //历史
   renderRecord=(index, item)=>{
     const style = {
       style: {  color: 'white'  }
     }
     const style2 = {
       style: {  color: '#98ACD9'  }
     }
     const assetSourre = ['资产入网', '资产退役', '漏洞扫描', '配置扫描', '补丁安装', '准入管理' ]
     return (
       <div key={ index }>
         <div key={ index + 'P' } {...style2}>
           { moment(item.gmtCreate).format('YYYY-MM-DD HH:mm:ss') }&nbsp;&nbsp;&nbsp;&nbsp;
           <span key={ index + 'describe' }>
             <span {...style}>{ item.createUserName }</span>
                  变更准入状态为：
             <span {...style}>{item.changeStatus === 1 ? '允许' : '禁止'}</span>
                  &nbsp;&nbsp;&nbsp;&nbsp;
                  来源：
             <span {...style}>
               {assetSourre[item.entrySource - 1] }
             </span>
                  &nbsp;&nbsp;&nbsp;&nbsp;
                  执行结果：
             <span {...style}>
               {item.entryResult === 1 ? '成功' : '失败'}
             </span>
           </span>
         </div>
       </div>
     )
   }

  //资产
  renderAssets=(index, item)=>{
    return (<div key={ index }>
      <div key={ index + 'P' }>
        { moment(item.gmtCreate).format('YYYY-MM-DD HH:mm:ss') }&nbsp;&nbsp;&nbsp;&nbsp;
        <span key={ index + 'describe' }><span style={ { color: '#333333' } }>{ item.describe || '' }</span></span>
      </div>
      { item.note ? <p key={ index + 'memo' }>备注： <span style={ { color: '#333333' } }>{ item.note }</span></p> : '' }
      { item.fileInfo && item.fileInfo !== '[]' ?
        <div key={ 'fujian' + index }><p>附件：</p>
          <div style={ { display: 'flex' } }>{ this.stepDescriptionAnnex(item.fileInfo) }</div>
        </div> : ''
      }
    </div>)
  }

  renderBorrow=(index, item)=>{
    return (<div key={ index }>
      <div key={ index + 'P' }>
        { moment(item.gmtCreate).format('YYYY-MM-DD HH:mm:ss') }&nbsp;&nbsp;&nbsp;&nbsp;
        <span key={ index + 'describe' }><span style={ { color: '#333333' } }>{ item.describe || '' }</span></span>
      </div>
      {/* { item.note ? <p key={ index + 'memo' }>备注： <span style={ { color: '#333333' } }>{ item.note }</span></p> : '' }
      { item.fileInfo && item.fileInfo !== '[]' ?
        <div key={ 'fujian' + index }><p>附件：</p>
          <div style={ { display: 'flex' } }>{ this.stepDescriptionAnnex(item.fileInfo) }</div>
        </div> : ''
      } */}
    </div>)
  }

  render () {
    const { hasMore, list = [] } = this.state
    return (
      <div className='asset-dynamic'>
        <div className="detail-content">
          <Steps
            className="detail-step-vertical"
            progressDot direction="vertical"
            initial={ 1 }
            current={ list ? list.length : 0 }>
            { this.stepDescription(list) }
          </Steps>
          <div className='Button-more'>
            { hasMore ? (
              <Button type="primary" ghost className="asset-dynamic-btn" onClick={ this.assetMore }>
                加载更多
              </Button>
            ) : '' }
          </div>
        </div>
      </div>
    )
  }

  componentDidMount () {
    const { assetId } = this.state
    this.getAssetDynamicList(assetId)
  }
}
