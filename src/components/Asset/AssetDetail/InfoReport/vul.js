import React, { Component, Fragment } from 'react'
import { TooltipFn, analysisUrl, cacheSearchParameter, evalSearchParam } from '@u/common'
import hasAuth from '@/utils/auth'
import { Table, Row, Col, Icon } from 'antd'
import api from '@/services/api'
import Courtse from './course.js'

export default (obj = {})=> {
  let show1 = false, show2 = false
  let columns = []
  return (
    <article>
      <section>
        <div></div>
        <div>
          <span>CVE编号:</span><span>{obj.title}</span>
        </div>
        <div>
          <span>CNNVD编号:</span><span>{obj.title}</span>
        </div>
        <div>
          <span>CVSS:</span><span>{obj.title}</span>
        </div>
        <div>
          <span>漏洞扫描出时间:</span><span>{obj.title}</span>
        </div>
        <div>
          <span>漏洞描述:</span><span>{obj.title}</span>
        </div>
      </section>
      <section>
        <div>
          <span>{obj.title}</span><span><Icon type={ !show1 ?  'down' : 'up' } onClick={()=>{
            show1 = !show1 } }/></span></div>
        <div><i></i><span>{obj.title}</span></div>
        <div>
          <Row>
            <Col>
              <span>解决方案类型:</span><span>{obj.title}</span>
            </Col>
            <Col>
              <span>是否重启应用:</span><span>{obj.title}</span>
            </Col>
            <Col>
              <span>是否重启系统:</span><span>{obj.title}</span>
            </Col>
            <Col>
              <span>紧急预案:</span><span>{obj.title}</span>
            </Col>
            <Col>
              <span>解决方案描述:</span><span>{obj.title}</span>
            </Col>
          </Row>
          <Table
            rowKey="stringId"
            columns={columns}
            dataSource={obj.list || []}
            pagination={false}
          />
        </div>
      </section>
      <section>
        <div>
          <span>{obj.title}</span><span><Icon type={ !show2 ?  'down' : 'up' } onClick={()=>{
            show2 = !show2 } }/></span></div>
        <div><i></i><span>{obj.title}</span></div>
        <Row>
          <Col>
            <span>解决方案类型:</span><span>{obj.title}</span>
          </Col>
          <Col>
            <span>是否重启应用:</span><span>{obj.title}</span>
          </Col>
          <Col>
            <span>是否重启系统:</span><span>{obj.title}</span>
          </Col>
          <Col>
            <span>紧急预案:</span><span>{obj.title}</span>
          </Col>
          <Col>
            <span>解决方案描述:</span><span>{obj.title}</span>
          </Col>
        </Row>
      </section>
      <section>
        {/* <Courtse></Courtse> */}
      </section>
    </article>
  )
}