import {  InputNumber, Tooltip, Icon } from 'antd'
import { Fragment } from 'react'
export default ({ getFieldDecorator, Item })=>{

  return (
    <Fragment>
      <section>
        <p>会话超时策略&nbsp;&nbsp;
          <Tooltip title="用户超过设置的时长未操作界面，会话将会失效，需要重新登录。">
            <Icon type="question-circle-o" />
          </Tooltip></p>
        <Item label='会话超时时长'>
          {
            getFieldDecorator('sessionTimeout', {
              initialValue: 30,
              rules: [{ min: 15, max: 1440, message: '最小15分钟，最大不超过1440分钟' }]
            })(
              <InputNumber className='ant-form-item-control-input' min={30} max={1440} />
            )
          }
          <span className="ant-form-text">分钟</span>
        </Item>
        <p>账户锁定策略&nbsp;&nbsp;
          <Tooltip title="如果在限定时间长度内达到锁定阈值后，用户将会被锁定一段时间。">
            <Icon type="question-circle-o" />
          </Tooltip>
        </p>
        <Item label='限定时间长度'>
          {
            getFieldDecorator('passwordLimitedMinute', {
              initialValue: 30,
              rules: [{ min: 15, max: 60, message: '限定时间为 15~60分钟' }]
            })(
              <InputNumber className='ant-form-item-control-input' min={1} max={1440} />
            )
          }
          <span className="ant-form-text">分钟</span>
        </Item>
        <Item label='账户锁定时长'>
          {
            getFieldDecorator('passwordLockDuration', {
              initialValue: 15,
              rules: [{ min: 15, max: 30, message: '最小15分钟，最大30分钟' }]
            })(
              <InputNumber className='ant-form-item-control-input' min={1} max={1440} />
            )
          }
          <span className="ant-form-text">分钟</span>
        </Item>
        <Item label='账户锁定阈值'>
          {
            getFieldDecorator('passwordAllowCount', {
              initialValue: 5,
              rules: [{ min: 0, max: 10, message: '可选范围为 0~10 次' }]
            })(
              <InputNumber className='ant-form-item-control-input' min={1} max={1440} />
            )
          }
          <span className="ant-form-text">次</span>
        </Item>
      </section>
    </Fragment>
  )

}