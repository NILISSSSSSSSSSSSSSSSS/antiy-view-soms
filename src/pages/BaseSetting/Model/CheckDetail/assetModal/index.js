import { Component } from 'react'
import CommonModal from '@/components/common/Modal'
import { Form, Spin, Steps, Button } from 'antd'
import { connect } from 'dva'
import AssetTable from '../checkTable/index.js'
import moment from 'moment'
import { transliteration, analysisUrl, TooltipFn, emptyFilter } from '@/utils/common'
import CommonForm from '@c/common/Form'
import './style.less'
import { Link, withRouter } from 'dva/router'
import api from '@/services/api'
import { map } from 'lodash'

const { Step } = Steps
const FormItem = Form.Item
const formItemLayout = {
  labelCol: {
    span: 8
  },
  wrapperCol: {
    span: 12
  }
}
class assetModal extends Component {
  constructor (props) {
    super(props)
    this.state = {
      loading: true,
      assetColumns: [{
        title: '名称',
        dataIndex: 'name',
        key: 'name',
        render: text => TooltipFn(text)
      }, {
        title: '编号',
        dataIndex: 'number',
        key: 'number',
        render: text => TooltipFn(text)
      },
      {
        title: '型号',
        dataIndex: 'categoryModelName',
        key: 'categoryModelName',
        render: text => TooltipFn(text)
      },
      {
        title: 'IP',
        dataIndex: 'ip',
        key: 'ip',
        isShow: true,
        render: text => TooltipFn(text)
      }, {
        title: 'MAC',
        dataIndex: 'mac',
        key: 'mac',
        isShow: true,
        render: text => TooltipFn(text)
      }, {
        title: '状态',
        dataIndex: 'statusName',
        key: 'statusName'
      },
      {
        title: '重要程度',
        dataIndex: 'importanceName',
        key: 'importanceName',
        isShow: true
      }, {
        title: '入网时间',
        dataIndex: 'firstEnterNett',
        key: 'firstEnterNett',
        width: 160,
        render: (text) => {
          return (<span className="tabTimeCss">{text ? moment(text).format(this.state.dateFormat) : '--'}</span>)
        }
      }],
      checkState: 0,
      isFinished: false,
      NextOperatorList: [{ name: '全部', stringId: '-1' }]
    }
  }
  componentDidMount () {
    this.props.children(this)
  }
  UNSAFE_componentWillReceiveProps (nextProps) {
  }
  render () {
    let { propsInfo, onClose } = this.props
    let { loading, assetColumns, checkState, isFinished, NextOperatorList } = this.state
    let assetProps = {
      columns: assetColumns,
      currentPage: 1,
      title: 'asset',
      stringId: '99',
      isCheck: true,
      tabData: propsInfo.tabData
    }
    const fields = [
      {
        name: '下一步',
        key: 'nextKey',
        type: 'select',
        defaultValue: '基准核查',
        disabled: true
      },
      {
        name: '下一步执行人',
        key: 'operator',
        showSearch: true,
        type: 'select',
        optionFilterProp: 'children',
        data: NextOperatorList,
        config: { value: 'stringId' },
        rules: [{ required: true, message: '请选择下一步执行人' }]
      },
      {
        name: '备注',
        key: 'remark',
        type: 'input',
        rules: [{ whitespace: true, message: '备注不能为空！' }, { message: '最多300个字符！', max: 300 }]
      }
    ]
    return (
      <CommonModal
        type="normal"
        visible={propsInfo.visible}
        className="operate-modal-change"
        title={'资产变更'}
        width={750}
        onClose={onClose}
      >
        <Spin spinning={loading}>
          <div className="modal-content-warp">
            <div className="steps-wrap">
              <Steps current={checkState}>
                <Step title="确认数据" />
                <Step title="新建模板" />
                <Step title="配置核查" />
              </Steps>
            </div>
            {
              checkState === 0 && <AssetTable props={assetProps} form={this.props.form} changeStatus={this.changeStatus} />
            }
            {
              checkState === 1 && !isFinished && <div className="operate-info">
                <h3 className="title">请根据扫描内容新建模板</h3>
                <div className="operate-content">
                  <p className="tips">请先根据扫描内容为资产新建适合的配置模板</p>
                  <div className="operate-bar">
                    <Link to={{
                      pathname: '/basesetting/model/update',
                      search: `stringId=${transliteration(propsInfo.id)}&isScan=${true}`
                    }}>新建模板</Link>
                  </div>
                </div>
              </div>
            }
            {
              checkState === 1 && isFinished && <div className="content-progress">
                <div className='title'>
                  <img src={require('@a/images/success.svg')} alt=""/>
                  <span>新建模板成功！</span></div>
                <p className="successText">请点击下一步配置核查选人</p>
              </div>
            }
            {
              checkState === 2 && <CommonForm
                column={1}
                fields={fields}
                form={this.props.form}
                FormItem={FormItem}
                formLayout={formItemLayout}
              />
            }
            <div className="button-center">
              <div>
                <Button type='primary' ghost onClick={onClose}>取消</Button>
                {(checkState === 0 || isFinished) && <Button type='primary' onClick={this.changeState} style={{ marginLeft: '20px' }}>下一步</Button>}
              </div>
            </div>
          </div>
        </Spin>
      </CommonModal>
    )
  }
  changeStatus = () => {
    this.setState({
      loading: false
    })
  }
  //
  changeState=()=>{
    let { isFinished } = this.state
    this.setState({ checkState: isFinished ? 2 : 1 }, ()=>{
      if(this.state.checkState === 2 ){
        this.props.form.validateFields((err, values) => {
          if (!err) {
            let { propsInfo } = this.props
            this.props.history.push('/basesetting/list/enforcement?isAsset=true')
          }
        })
      }
    })
  }
  //获取区域id
  getAreaId = () => {
    api.listAssetForTemplateByPage({ templateId: this.state.stringId }).then(res => {
      this.setState({
        areaId: map(res.body.items, 'areaId')
      }, () => {
        this.getUsersByRoleCodeAndAreaId()
      })
    })
  }
  //获取执行人
  getUsersByRoleCodeAndAreaId = () => {
    api.getUsersByRoleCodeAndAreaId({ flowNodeTag: 'config_check', flowId: 4, areaId: this.state.areaId }).then(res => {
      let NextOperatorList = res.body || []
      NextOperatorList.unshift({ name: '全部', stringId: '-1' })
      this.setState({
        NextOperatorList: NextOperatorList
      })
    })
  }
}
const assetModals = Form.create()(assetModal)
export default withRouter(connect()(assetModals))