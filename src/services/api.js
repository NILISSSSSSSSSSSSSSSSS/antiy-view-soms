import asset from './assets'
import * as workOrderApi from './workOrder'
import * as systemApi from './system'
import * as safeApi from './safe'
import * as organizationApi from './organization'
import * as taskPlan from './taskPlan'
import * as taskPlanReport from './taskPlanReport'
import * as bug from './bug'
import log from  './log'
import * as knowledge from  './knowledge'
import * as inspection from  './inspection'
import alarm from './alarm'
import * as baseSetting from  './baseSetting'
import * as indexPage from  './indexPage'
import * as workBench from  './workBench'
import * as reportForm from  './reportForm'
import  personalCenter from  './personalCenter'
import patch from './patch'
import * as defend from  './defend'
import * as examine from  './examine'
export default {
  ...patch,
  ...workBench,
  ...indexPage,
  ...asset,
  ...workOrderApi,
  ...systemApi,
  ...taskPlan,
  ...taskPlanReport,
  ...organizationApi,
  ...bug,
  ...log,
  ...knowledge,
  ...alarm,
  ...baseSetting,
  ...safeApi,
  ...inspection,
  ...reportForm,
  ...personalCenter,
  ...defend,
  ...examine
}
