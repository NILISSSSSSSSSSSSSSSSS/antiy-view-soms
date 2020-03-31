export default {
  /**日常安全管理**/
  routine: 'routine', //日常安全管理
  //巡检任务
  routineInspection: 'routine:inspection',	//巡检任务
  routineInspectCheckin: 'routine:inspection:checkin',	//登记巡检
  routineInspectView: 'routine:inspection:view',	//查看详情
  routineInspectStop: 'routine:inspection:stop',	//终止计划

  //工单管理
  routineWorkorder: 'routine:workorder', //工单管理
  routineWorkorderCheck: 'routine:workorder:checkin',	//登记工单
  workorderMyundo: 'routine:workorder:myundo',	//我的待办
  workorderMyundoReceive: 'routine:workorder:myundo:receive',	//接单
  workorderMyundoDisagree: 'routine:workorder:myundo:disagree',	//拒绝接单
  workorderMyundoComplete: 'routine:workorder:myundo:complete',	//完成
  workorderMyundoView: 'routine:workorder:myundo:view',	//查看详情
  workorderMydone: 'routine:workorder:mydone',	//我的已办
  workorderMydoneView: 'routine:workorder:mydone:view',	//查看详情
  workorderMycreate: 'routine:workorder:mycreate',	//我的发起
  workorderMycreateClose: 'routine:workorder:mycreate:close',	//关闭
  workorderMycreateView: 'routine:workorder:mycreate:view', //查看详情

  //知识库管理
  routineKnowledge: 'routine:knowledge',	//知识库管理
  routineKnowledgeChckin: 'routine:knowledge:checkin',	//登记
  routineKnowledgeDelete: 'routine:knowledge:delete',	//剔除
  routineKnowledgeUpdate: 'routine:knowledge:update',	//变更
  routineKnowledgeView: 'routine:knowledge:view'	//查看详情
}