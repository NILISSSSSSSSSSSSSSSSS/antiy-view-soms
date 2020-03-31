
import { Table, Tooltip  } from 'antd'
import moment from 'moment'
import { emptyFilter } from '@/utils/common'
import { Link } from 'dva/router'

export default ({ detail = false, iData, onRow }) => {
  let columns
  const columns1 = [
  //   {
  //   title: '序号',
  //   key: 'order',
  //   dataIndex: 'order',
  //   render: (scope, text, i) => (<span>{i + 1}</span>)
  // }, 
    {
      title: '流程类型',
      key: 'typeName',
      dataIndex: 'typeName'
    }, {
      title: '流程节点',
      key: 'name',
      dataIndex: 'name'
    }, {
      title: '流程时间',
      key: 'createTime',
      dataIndex: 'createTime',
      render: (text) => (<span>{moment(text).format('YYYY-MM-DD HH:mm:ss')}</span>)
    }]
  const columns2 = [
    // {
    //   title: '序号',
    //   key: 'order',
    //   dataIndex: 'order',
    //   render: (scope, text, i) => (<span>{i + 1}</span>)
    // }, 
    {
      title: '工单编号',
      key: 'workNumber',
      dataIndex: 'workNumber',
      render: (text) => {
        return (
          <Tooltip title={text} placement="topLeft" getPopupContainer={triggerNode => triggerNode.parentNode}>
            <span>{emptyFilter(text)}</span>
          </Tooltip>
        )
      }
    }, {
      title: '工单名称',
      key: 'name',
      dataIndex: 'name',
      render: (text) => {
        return (
          <Tooltip title={text} placement="topLeft" getPopupContainer={triggerNode => triggerNode.parentNode}>
            <span>{emptyFilter(text)}</span>
          </Tooltip>
        )
      }
    }, {
      title: '工单级别',
      key: 'workLevel',
      dataIndex: 'workLevel'
    }, {
      title: '工单类型',
      key: 'orderType',
      dataIndex: 'orderType'
    }]
  const columns3 = [
    {
      title: '',
      key: 'assetNumber',
      dataIndex: 'assetNumber',
      render: (text, scope) => {
        return (
          <Tooltip title={text} placement="topLeft" getPopupContainer={triggerNode => triggerNode.parentNode}>
            <Link to={`/asset/manage/detail?id=${scope.stringId}`}>{emptyFilter(text)}</Link>
          </Tooltip>
        )
      }
    }, {
      title: '',
      key: 'assetName',
      dataIndex: 'assetName',
      render: (text) => {
        return (
          <Tooltip title={text} placement="topLeft" getPopupContainer={triggerNode => triggerNode.parentNode}>
            <span>{emptyFilter(text)}</span>
          </Tooltip>
        )
      }
    }, {
      title: '',
      key: 'userName',
      dataIndex: 'userName',
      width: '20%'
    }]
  if (detail === '1') columns = columns1
  else columns = columns2

  return (
    <article>
      {
        detail ? (<Table rowKey={detail === '1' ? 'taskId' : 'order'}
          onRow={(record) => ({
            onClick: () => {
              if (onRow) onRow(record)
            }
          })}
          columns={columns}
          dataSource={iData}
          pagination={false} />) : (
          <Table rowKey='stringId'
            onRow={(record) => ({
              onClick: () => {
                if (onRow) onRow(record)
              }
            })}
            columns={columns3}
            dataSource={iData}
            pagination={false} />
        )
      }
    </article>
  )
}