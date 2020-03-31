import { Form, InputNumber } from 'antd'
import { Fragment } from 'react'
const { Item } =  Form
export default ({ getFieldDecorator })=>{

  return (
    <Fragment>
      <Item label='密码最小长度'>
        {
          getFieldDecorator('passwordShortest', {
            initialValue: 6,
            rules: [{ min: 6, max: 6, message: '密码长度为6~32个字符' }]
          })(
            <InputNumber className='ant-form-item-control-input' min={6} max={32} />
          )
        }
        <span className="ant-form-text">字符</span>
      </Item>
      <Item label='密码最长使用期限'>
        {
          getFieldDecorator('passwordMaxUsed', {
            initialValue: 180,
            rules: [{ min: 1, max: 180, message: '密码使用期限为1~180天' }]
          })(
            <InputNumber className='ant-form-item-control-input' min={1} max={180}/>
          )
        }
        <span className="ant-form-text">天</span>
      </Item>
      <Item label='密码最短使用期限'>
        {
          getFieldDecorator('passwordMinUsed', {
            initialValue: 30,
            rules: [{ min: 0, max: 1440, message: '密码最短期限时间为0~1440分钟' }]
          })(
            <InputNumber className='ant-form-item-control-input' min={0} max={1440}/>
          )
        }
        <span className="ant-form-text">分钟</span>
      </Item>
      <Item label='同一字符不能连续出现'>
        {
          getFieldDecorator('passwordLetterContinuous', {
            initialValue: 1,
            rules: [{ min: 1, max: 10, message: '同一字符允许出现的次数为 1~10 次' }]
          })(
            <InputNumber className='ant-form-item-control-input' min={1} max={10} />
          )
        }
        <span className="ant-form-text">次</span>
      </Item>
      <Item label='新密码不能与最近'>
        {
          getFieldDecorator('newpasswordHistoryCount', {
            initialValue: 3,
            rules: [{ min: 1, max: 10, message: '不能与最近密码 1~10 次相同' }]
          })(
            <InputNumber className='ant-form-item-control-input' min={1} max={10} type='number' />
          )
        }
        <span className="ant-form-text">次历史密码相同</span>
      </Item>
    </Fragment>
  )

}