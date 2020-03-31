import { PureComponent } from 'react'
import { connect } from 'dva'
import { Row, Input, Form,
  message, Select } from 'antd'
import api from '@/services/api'
import AssetModal from '@/components/Asset/AssetModal'

const { Item } = Form
const Option = Select.Option

//不要了
@Form.create()
class  AssetManageSoftwaresInstallDeploy extends PureComponent {
  state = {
    show: false,
    fileList: [],
    ids: '',
    assetId: '',
    noChooseTime: '',
    softwareId: ''
  }

  //提交
  Submit= (e)=>{
    e.preventDefault()
    let { fileList, softwareId, assetId } = this.state
    const {
      usersByRoleCodeAndAreaIdList,
      form: {
        validateFields
      }
    } = this.props
    validateFields((err, values) => {
      if (!err) {
        let init = {}
        init.files  = JSON.stringify(fileList.map(item=>{
          return{ url: item.fileUrl,
            fileName: item.originFileName }
        }))
        // 选中全部时，把所有操作员遍历出来
        if(values.configUserIds === 'all'){
          init.configUserIds = usersByRoleCodeAndAreaIdList.map((item)=>item.stringId)
        }else {
          init.configUserIds = [values.configUserIds]
        }
        init.relId  = softwareId
        init.assetId = assetId
        init.softwareId = softwareId
        init.source = '2'
        init.suggest = values.suggest
        api.assetSoftwareAllocation(init).then(data=>{
          if(data.head && data.head.code === '200'){
            message.success(data.head.result)
            this.handleCancel()
            this.props.callBack()
          }
        })
      }
    })
  }

  //取消
  handleCancel= ()=>{
    this.setState({
      show: false,
      ids: []
    })
  }

  //显示弹窗
  show = async (data, id, assetId, areaId)=>{
    await this.getUsersByRoleCodeAndAreaId(areaId)
    await this.setState({
      show: true,
      ids: data,
      softwareId: id,
      assetId
    })
  }

  //**接口开始 */
  //获取执行人员
  getUsersByRoleCodeAndAreaId=(areaId)=>{
    return this.props.dispatch({ type: 'asset/getUsersByRoleCodeAndAreaId', payload: {
      areaId,
      flowId: 3,
      flowNodeTag: 'baseline_base_config'
    } })
  }

  render (){
    const { show } = this.state
    const {
      form: {
        getFieldDecorator
      },
      usersByRoleCodeAndAreaIdList
    } = this.props

    const FormLayout = {
      labelCol: {
        span: 8
      },
      wrapperCol: {
        span: 14
      }
    }

    const formInfo = (
      <Form className="filter-form form-content" layout="horizontal" onSubmit={this.Submit} >
        <Row>
          <Item {...FormLayout} label="选择执行人员">
            {getFieldDecorator('configUserIds', {
              rules: [{ required: true, message: '请选择！' }]
            })(
              <Select showSearch
                allowClear
                optionFilterProp="children"
                getPopupContainer={triggerNode => triggerNode.parentNode}
                placeholder="请选择">
                {usersByRoleCodeAndAreaIdList && usersByRoleCodeAndAreaIdList.length ?
                  <Option value='all'>全部</Option> : ''
                }
                {usersByRoleCodeAndAreaIdList && usersByRoleCodeAndAreaIdList.map((now)=>(
                  <Option value = {now.stringId} key={now.stringId + '-operator'}>{now.name}</Option>
                ))}
              </Select>
            )}
          </Item>
        </Row>
        <Row>
          <Item {...FormLayout} label="配置建议">
            {getFieldDecorator('suggest', {
              rules: [{ required: true, message: '请输入配置建议！' }]
            })(
              <Input.TextArea rows={3} placeholder="请输入" maxLength={300} style={{ resize: 'none' }} />
            )}
          </Item>
        </Row>
      </Form>
    )

    const ModalInfo = {
      title: '配置',
      visible: show,
      width: 650,
      onOk: this.Submit,
      onCancel: this.handleCancel,
      children: formInfo
    }
    return(
      <AssetModal data={ModalInfo}/>
    )
  }

  componentDidMount (){
    this.props.deploy(this)
  }
}

export default connect(({ asset }) => ({
  usersByRoleCodeAndAreaIdList: asset.usersByRoleCodeAndAreaIdList
}))(AssetManageSoftwaresInstallDeploy)
