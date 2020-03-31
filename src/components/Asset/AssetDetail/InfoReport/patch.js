import React, { Component, Fragment } from 'react'
import { TooltipFn, analysisUrl, cacheSearchParameter, evalSearchParam } from '@u/common'
import hasAuth from '@/utils/auth'
import { Table, Row, Col, Icon } from 'antd'
import api from '@/services/api'
import Courtse from './course.js'

export default (obj = {})=> {
  let show1 = false, show2 = false
  let columns = [{
    title: '前置补丁',
    columns: []
  }, {
    title: '关联漏洞信息',
    columns: []
  }]
  return (
    <article>
      <section>
        <div>
          
        </div>
        <div>
          <span>补丁编号:</span><span>{obj.title}</span>
        </div>
        <div>
          <span>补丁热支持:</span><span>{obj.title}</span>
        </div>
        <div>
          <span>用户交互:</span><span>{obj.title}</span>
        </div>
        <div>
          <span>独占方式安装:</span><span>{obj.title}</span>
        </div>
        <div>
          <span>补丁扫描出时间:</span><span>{obj.title}</span>
        </div>
        <div>
          <span>联网状态:</span><span>{obj.title}</span>
        </div>
        <div>
          <span>补丁描述:</span><span>{obj.title}</span>
        </div>
      </section>
      <section>
        <div>
          <span>{columns[0].title}</span><span><Icon type={ !show1 ?  'down' : 'up' } onClick={()=>{
            show1 = !show1 } }/></span></div>
        <div>
          <Table
            rowKey="stringId"
            columns={columns[0].list}
            dataSource={obj.list || []}
            pagination={false}
          />
        </div>
      </section>
      <section>
        <div>
          <span>{columns[1].title}</span><span><Icon type={ !show1 ?  'down' : 'up' } onClick={()=>{
            show1 = !show1 } }/></span></div>
        <div>
          <Table
            rowKey="stringId"
            columns={columns[1].list}
            dataSource={obj.list || []}
            pagination={false}
          />
        </div>
      </section>
      <section>
        {/* <Courtse></Courtse> */}
      </section>
    </article>
  )
}