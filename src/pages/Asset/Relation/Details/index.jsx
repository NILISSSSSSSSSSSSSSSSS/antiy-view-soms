import { PureComponent, Fragment } from 'react'
import { connect } from 'dva'
import { Row, Col, Table, message, Form, Input, Select } from 'antd'
import './style.less'
import PropTypes from 'prop-types'
import { debounce, throttle } from 'lodash'
import { analysisUrl, cacheSearchParameter, evalSearchParam, TooltipFn, transliteration } from '@/utils/common'

import AssetModal from '@/components/Asset/AssetModal'
import AddModel from './AddModel/index.jsx'

const FormItem = Form.Item
const { Option } = Select
@Form.create()
class relationDetails extends PureComponent {
  state = {
    PrefixCls: 'relationDetails',
    pageSize: 10, //每页数据条数
    currentPage: 1, //当前页码
    visible: false, //弹框
    isDel: false,
    record: {}, //移除或添加的信息
    nameDel: '', //移除所选资产名称
    onText: '下一步',
    isNext: true
  }

  static defaultProps = {
    assetRelationDetailsObj: {},
    assetRelationDetailsList: {},
    assetRelationDetailsListDelete: ''
  }

  static propTypes = {
    assetRelationDetailsObj: PropTypes.object,
    assetRelationDetailsList: PropTypes.object,
    assetRelationDetailsListDelete: PropTypes.string
  }

  goAssetDetails=number=>{

    window.open(`/#/asset/manage/detail?number=${transliteration(number)}`)
  }

  //返回上一页面
  goBack = () => {
    this.props.history.goBack()
  }

  //分页
  changePage = (currentPage, pageSize) => {
    const pagingParameter = {
      currentPage: currentPage,
      pageSize: pageSize
    }
    cacheSearchParameter([{
      page: pagingParameter
    }], this.props.history, 0)
    this.setState({ currentPage, pageSize }, this.assetRelationDetailsList)
  }

  //显示Model移除或者添加
  showModal = (type, record) => {
    if (type !== null) {
      this.setState({ isDel: true, record: record })
    } else {
      this.setState({ isDel: false, record: record })
    }
    this.handleDelCancel(true)
  }

  //移除
  handleDelOk = throttle(() => {
    const { isDel } = this.state
    if (isDel) {
      const { record: { stringId } } = this.state
      this.assetRelationDetailsListDelete(stringId)
    }else{
      const boo = this.AddModel.getIsNext()
      if(boo === 1) return void(0)
      if(boo === true){
        this.setState({
          onText: '确定',
          isNext: false
        })
        return void(0)
      }
      // this.ToViewModel.handleSubmit()  //得到小弹框数据
      console.log( this.AddModel.ToViewModel.handleSubmit())
      const isboo = this.AddModel.ToViewModel.handleSubmit()
      if(!isboo) return void(0)
      //调用添加接口
      this.AddModel.props.form.validateFields( (err, values) => {
        if(!err){
          console.log(values)
          // this.setState({
          //   search: values,
          //   pagingParameter: {
          //     currentPage: 1,
          //     pageSize: 10
          //   }
          // }, this.getList)
        }
      })
    }
    this.handleDelCancel()
  }, 1000, { trailing: false })

  //退出
  handleDelCancel = (isBoo = false) => {
    this.setState({
      visible: isBoo,
      onText: '下一步',
      isNext: true })
    this.assetRelationDetailsList()
  }

  //获取url传参
  getAssetParameter = () => {
    const { history: { location: { search } } } = this.props
    const Parameter = analysisUrl(search)
    return Parameter  //{ assetId, net }
  }

  //移除回调
  assetRelationDetailsListDeleteCallback = () => {
    if (this.props.assetRelationDetailsListDelete) {
      this.assetRelationDetailsList()
      message.success('移除成功')
    }
  }

  //**副作用开始 */
  //资产信息
  assetRelationDetailsObj = () => {
    const { assetId } = this.getAssetParameter()
    this.props.dispatch({
      type: 'asset/assetRelationDetailsObj', payload: {
        primaryKey: assetId
      }
    })
  }

  //通联关系
  assetRelationDetailsList = debounce(() => {
    const { currentPage, pageSize } = this.state
    const { assetId } = this.getAssetParameter()
    this.props.dispatch({
      type: 'asset/assetRelationDetailsList', payload: {
        primaryKey: assetId,
        pageSize: pageSize,
        currentPage: currentPage
      }
    })
  }, 300)

  //移除
  assetRelationDetailsListDelete = async (stringId) => {
    await this.props.dispatch({
      type: 'asset/assetRelationDetailsListDelete', payload: {
        stringId: stringId
      }
    })
    this.assetRelationDetailsListDeleteCallback()
  }

  render () {
    const { PrefixCls, visible, isDel, record, currentPage, pageSize, onText, isNext } = this.state
    const { history, assetRelationDetailsObj: { asset }, assetRelationDetailsList, form: { getFieldDecorator } } = this.props
    const pathArr = history.location.pathname.split('/')
    const isSeting = pathArr[pathArr.length - 1] === 'details'
    const { net } = this.getAssetParameter()
    const isNet = (net && JSON.parse(net))  //隐试转换布尔值
    const {
      name,   //资产名称
      categoryModelName, //资产类型
      number, //资产编号
      contactTel, //联系电话
      manufacturer, //厂商
      assetGroup, //资产分组
      responsibleUserName, //使用者
      houseLocation, //机房位置
      email, //邮箱
      areaName, //区域
      installType  //维护方式
    } = asset
    const tonglianShipResult = assetRelationDetailsList.items || []
    const toltalCount = assetRelationDetailsList.totalRecords || 0

    const assetsInfoList = [
      {
        name: '资产名称',
        cont: name
      },
      {
        name: '资产类型',
        cont: categoryModelName
      },
      {
        name: '资产编号',
        cont: number
      },
      {
        name: '联系电话',
        cont: contactTel
      },
      {
        name: '厂商',
        cont: manufacturer
      },
      {
        name: '资产分组',
        cont: assetGroup
      },
      {
        name: '使用者',
        cont: responsibleUserName
      },
      {
        name: '机房位置',
        cont: houseLocation
      },
      {
        name: '邮箱',
        cont: email
      },
      // {
      //   name: '物理位置',
      //   cont: ''
      // },
      {
        name: '区域',
        cont: areaName
      },
      // {
      //   name: 'IP',
      //   cont: ''
      // },
      // {
      //   name: 'Mac',
      //   cont: ''
      // },
      {
        name: '组织机构',
        cont: ''
      },
      {
        name: '版本',
        cont: ''
      },
      {
        name: '备注',
        cont: ''
      },
      {
        name: '资产组',
        cont: ''
      },
      {
        name: '自定义字段',
        cont: ''
      }
    ]

    // isNetwork
    const assetsInfoListOperating = {
      name: '维护方式',
      cont: installType === '1' ? '人工' : '自动'
    }

    //非网络设备才有操作
    isNet && assetsInfoList.push(assetsInfoListOperating)

    const tonglianShipColumns = [
      {
        title: '资产网络信息',
        dataIndex: 'assetName',
        key: 'assetName',
        width: '20%',
        render: text=>
          isNet ? (
            <Fragment>
              <p>IP：<span>{TooltipFn(text)}</span></p>
              <p>MAC：<span>{TooltipFn(text)}</span></p>
            </Fragment>
          ) : (
            <Fragment>
              <p>MAC：<span>{TooltipFn(text)}</span></p>
              <p>网口与IP：<span>{TooltipFn(text)}</span></p>
            </Fragment>
          )
      },
      {
        title: '关联设备信息',
        dataIndex: 'categoryModelName',
        key: 'categoryModelName',
        width: '20%',
        render: text=>(
          <Fragment>
            <p>名称：<span>{TooltipFn(text)}</span></p>
            <p>编号：<span>{TooltipFn(text)}</span></p>
            <p>区域：<span>{TooltipFn(text)}</span></p>
            <p>类型：<span>{TooltipFn(text)}</span></p>
          </Fragment>
        )
      },
      {
        title: '关联设备信息用户信息',
        key: 'assetIp',
        dataIndex: 'assetIp',
        width: '20%',
        render: text=>(
          <Fragment>
            <p>姓名：<span>{TooltipFn(text)}</span></p>
            <p>所属组织：<span>{TooltipFn(text)}</span></p>
          </Fragment>
        )
      },
      {
        title: '通联信息',
        key: 'parentAssetName',
        dataIndex: 'parentAssetName',
        width: '20%',
        render: text=>
          isNet ? (
            <Fragment>
              <p>IP：<span>{TooltipFn(text)}</span></p>
              <p>MAC：<span>{TooltipFn(text)}</span></p>
            </Fragment>
          ) : (
            <Fragment>
              <p>MAC：<span>{TooltipFn(text)}</span></p>
              <p>网口与IP：<span>{TooltipFn(text)}</span></p>
            </Fragment>
          )
      },
      {
        title: '其他维护信息',
        dataIndex: 'parentCategoryModelName',
        key: 'parentCategoryModelName',
        width: '20%',
        render: text=>(
          <Fragment>
            <p>配件间房间号：<span>{TooltipFn(text)}</span></p>
            <p>办公室网口：<span>{TooltipFn(text)}</span></p>
            <p>办公室网口状态：<span>{TooltipFn(text)}</span></p>
            <p>交换机状态：<span>{TooltipFn(text)}</span></p>
            <p>Vlan号：<span>{TooltipFn(text)}</span></p>
            <p>备注：<span>{TooltipFn(text)}</span></p>
            <p>自定义字段：<span>{TooltipFn(text)}</span></p>
          </Fragment>
        )
      }
    ]

    const tonglianShipColumnsOperating = {
      title: '操作',
      dataIndex: 'stringId',
      key: 'stringId',
      width: '10%',
      render: (text, record) => (
        <a className={`${PrefixCls}-a`} onClick={() => this.showModal(text, record)}>
          {text !== null ? '移除' : '添加'}
        </a>
      )
    }

    // const tonglianShipColumnsFour = {
    //   title: '所选资产网口',
    //   dataIndex: 'assetPort',
    //   key: 'assetPort',
    //   width: '10%',
    //   render: text => TooltipFn(text)
    // }

    const addModal = {
      title: isDel ? '移除' : '添加',
      visible: visible,
      width: isDel ? 650 : 1100,
      onText: onText,
      onOk: this.handleDelOk,
      onCancel: () => this.handleDelCancel(),
      children: isDel ? (<p>是否需要移除{record.assetName}通联关系?</p>) :
        (<AddModel detailsRecoed={record} isNext={isNext} detailHandleCancel={this.handleDelCancel} child={(now)=>this.AddModel = now} />)
    }

    //通联设置才有操作
    // isNet && tonglianShipColumns.splice(3, 0, tonglianShipColumnsFour)
    isSeting || tonglianShipColumns.push(tonglianShipColumnsOperating)

    const renderList = list=>(
      <section className={`${PrefixCls}-assetsInfo`}>
        <div className="detail-content detail-content-layout">
          <Row>
            {list.map((item, index) => (
              <Col xxl={6} xl={8} key={index}><span className="detail-content-label">{item.name}： </span>
                {item.name === '资产编号' ?
                  <a onClick={()=>this.goAssetDetails(item.cont)}>{item.cont}</a> :
                  item.cont
                }
              </Col>
            ))}
          </Row>
        </div>
      </section>
    )

    return (
      <div className="main-detail-content">
        <div className={PrefixCls}>
          <p className="detail-title">资产信息</p>
          {renderList(assetsInfoList)}

          <p className="detail-title">通联关系</p>
          <section className={`${PrefixCls}-tonglianShip`}>
            <div className="table-wrap">
              <Table
                // rowKey='assetId'
                rowKey={(text, record) => record}
                columns={tonglianShipColumns}
                dataSource={tonglianShipResult}
                pagination={{
                  showQuickJumper: true,
                  showSizeChanger: toltalCount > 10,
                  pageSizeOptions: ['10', '20', '30', '40'],
                  onShowSizeChange: this.changePage,
                  showTotal: () => `共 ${toltalCount} 条数据`,
                  current: currentPage,
                  pageSize: pageSize,
                  total: toltalCount,
                  onChange: this.changePage
                }}
              />
            </div>
          </section>
          {/* <div className="Button-center back-btn">
            <Button type="primary" ghost onClick={this.goBack}>返回</Button>
          </div> */}
          <AssetModal data={addModal} />
        </div>
      </div>

    )
  }

  componentDidMount () {
    this.assetRelationDetailsObj()
    const data = evalSearchParam(this, null, false)

    //判断是否存有数据
    if (sessionStorage.searchParameter && data) {
      const list = data && data.list
      const { page = null } = list && list[0]
      this.setState({
        ...page
      }, this.assetRelationDetailsList)
    } else {
      this.assetRelationDetailsList()
    }
  }
}

export default connect(({ asset }) => ({
  assetRelationDetailsObj: asset.assetRelationDetailsObj,
  assetRelationDetailsList: asset.assetRelationDetailsList,
  assetRelationDetailsListDelete: asset.assetRelationDetailsListDelete
}))(relationDetails)
