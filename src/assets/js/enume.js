/**
 * 此文件为枚举性的配置，如有公用之处，可以写到该文件，进行统一管理
 * 所有枚举都应该是从1开始的，不应该有0.
 * @type {{name: string, label: string, value: string}}
 */

/**
 * 需要处置重新登录的错误码
 */
const LOGINOUT_CODES = {
  NOT_PERMISSION: '403', // 没有权限
  SYS_TOKEN_EXPIRE: '421', // 您的登录状态已经失效,请重新登录
  ACCOUNT_REPEAT_LOGIN: '422', // 当前账号已有其他人使用，您被退出，请检查账号信息或联系管理员
  ACCOUNT_NOT_LOGIN: '423', // 没有登录
  ACCOUNT_FORCED_RETURN: '426', // 您的账号权限被修改，请重新登录
  SYS_TOKEN_INVALID: '427' // 无效令牌
}

/**
   * 全部
   */
const ALL_STATUS = { name: '全部', value: '' }

/**
   * 服务类型
   * @type {{name: string, label: string, value: string}}
   */
const TYPE1 = { name: '系统服务', label: '系统服务', value: '1' }
const TYPE2 = { name: '软件服务', label: '软件服务', value: '2' }
// 服务类型
const SERVE_TYPE = [
  TYPE1,
  TYPE2
]

/**
   * 软件类型
   */
const SOFT_SEARCHTYPE = [
  {
    name: '操作系统',
    value: 'o'
  },
  {
    name: '应用软件',
    value: 'a'
  }
]

/**
   * 入库状态
   * @type {{name: string, value: Number}}
   */
const STORAGEED = { name: '已入库', value: 1 }
const WAIT_STORAGE = { name: '待入库', value: 2 }
const NOT_FOUND = { name: '', value: '' }
const STATUS = [
  WAIT_STORAGE,
  STORAGEED
]
/**
   * 升级状态
   * @type {{name: string, value: string}}
   */
const UPGRADE_STATUS = [
  {
    name: '升级成功',
    value: 1
  },
  {
    name: '升级失败',
    value: 0
  }
]
/**
   * 升级方式
   * @type {{name: string, value: string}}
   */
const UPGRADE_METHOD = [
  {
    name: '离线升级',
    value: 0
  },
  {
    name: '在线升级',
    value: 1
  }
]
//补丁等级
const PATCH_LEVEL = [
  {
    name: '重要',
    value: 1
  },
  {
    name: '中等',
    value: 2
  },
  {
    name: '严重',
    value: 3
  }
]
//补丁状态
const PATCH_STATUS = [
  {
    name: '通过审核',
    value: 1
  },
  {
    name: '未通过审核',
    value: 2
  }
]
//补丁来源
const PATCH_SOURCE = [
  {
    name: '软件厂商',
    value: 1
  },
  {
    name: '自主开发',
    value: 2
  }
]
//补丁热支持
const PATCH_HOT = [
  {
    name: '不支持热补丁',
    value: 0
  },
  {
    name: '支持热补丁',
    value: 1
  }
]
//补丁用户交互
const PATCH_INTERACTIVE = [
  {
    name: '不需要用户交互',
    value: 0
  },
  {
    name: '需要用户交互',
    value: 1
  }
]
//补丁联网状态
const PATCH_INTERNET = [
  {
    name: '不需要用户联网',
    value: 0
  },
  {
    name: '需要用户联网',
    value: 1
  }
]
//补丁独立安装
const PATCH_INSTALL = [
  {
    name: '不需要独占方式安装',
    value: 0
  },
  {
    name: '需要独占方式安装',
    value: 1
  }
]
//漏洞危害等级
const THREAT_GRADE = [
  {
    name: '超危',
    value: '4'
  },
  {
    name: '高危',
    value: '3'
  },
  {
    name: '中危',
    value: '2'
  },
  {
    name: '低危',
    value: '1'
  }
]
//突发漏洞状态
const UNEXPECTED_STATUS = [
  {
    name: '待处理',
    value: '3'
  },
  {
    name: '处理中',
    value: '2'
  },
  {
    name: '已完成',
    value: '1'
  }
]
//突发漏洞处置状态
const UNEXPECTED_DISPOSE_STATUS = [
  {
    name: '待处置',
    value: '1'
  },
  {
    name: '已退回',
    value: '2'
  }
]
//漏洞修复状态
const REPAIR_STATUS = [
  {
    name: '待修复',
    value: '3'
  },
  {
    name: '修复中',
    value: '4'
  },
  {
    name: '修复失败',
    value: '6'
  },
  {
    name: '已缓解',
    value: '7'
  },
  {
    name: '配置失败',
    value: '8'
  }
]
const INSTALL_STATUS = [
  {
    name: '待安装',
    value: 3
  }, {
    name: '安装中',
    value: 4
  }, {
    name: '安装失败',
    value: 6
  },
  {
    name: '配置失败',
    value: 7
  }
]
//资产重要程度
const ASSETS_IMPORTANT = [
  {
    name: '核心',
    value: 1
  },
  {
    name: '重要',
    value: 2
  },
  {
    name: '一般',
    value: 3
  }
]
//资产类型
const ASSETS_TYPE = [
  {
    name: '计算设备',
    value: '1'
  },
  {
    name: '网络设备',
    value: '2'
  },
  {
    name: '安全设备',
    value: '3'
  },
  {
    name: '存储设备',
    value: '4'
  },
  {
    name: '其他设备',
    value: '5'
  }
]
//漏洞是否有解决方案
const HAS_PLAN = [
  {
    name: '是',
    value: 1
  },
  {
    name: '否',
    value: 0
  }
]
//漏洞当前状态
const CURRENT_STATUS = [
  {
    name: '已入库',
    value: 1
  },
  {
    name: '待入库',
    value: 0
  }
]
//基准来源
const SOURCE_LIST = [
  {
    name: 'STIG',
    value: 1
  },
  {
    name: 'CIS',
    value: 2
  },
  {
    name: 'COMMON',
    value: 3
  }
]
//安全级别
const SOURCE_LEVEL = [
  {
    name: '高',
    value: 1
  },
  {
    name: '中',
    value: 2
  },
  {
    name: '低',
    value: 3
  }
]
//黑白名单
const BLANK_LIST = [
  {
    name: '无',
    value: 0
  },
  {
    name: '黑名单',
    value: 1
  },
  {
    name: '白名单',
    value: 2
  }
]
//配置来源
const BASE_SOURCE = [
  {
    name: '资产检查',
    value: 1
  },
  {
    name: '资产变更',
    value: 2
  },
  {
    name: '漏洞修复',
    value: 3
  },
  {
    name: '补丁安装',
    value: 4
  },
  {
    name: '模板变更',
    value: 5
  },
  {
    name: '配置变更',
    value: 6
  },
  {
    name: '配置扫描',
    value: 7
  }
]
const OPERATE_TYPE = [
  {
    name: '人工',
    value: 1
  },
  {
    name: '自动',
    value: 2
  }
]
//基准核查状态
const BASE_STATUS_CHECK = [
  {
    name: '待核查',
    value: 2
  },
  {
    name: '核查中',
    value: 3
  },
  {
    name: '核查失败',
    value: [5, 6]
  },
  {
    name: '核查待确认',
    value: 4
  }
]
//基准加固状态
const BASE_STATUS_REINFORCE = [
  {
    name: '待加固',
    value: 7
  },
  {
    name: '加固中',
    value: 8
  },
  {
    name: '加固失败',
    value: [10, 11]
  },
  {
    name: '加固待确认',
    value: 9
  }
]
const CONFIG_STATUS = {
  waitConfig: 1,            // 待配置
  waitCheck: 2,             // 待核查
  inCheck: 3,               // 核查中
  checkWaitConfirm: 4,      // 核查待确认
  checkFailed: 5,           // 核查失败
  checkFailedByManual: 6,   // 核查失败（人工核查）
  waitFasten: 7,            // 待加固
  inFasten: 8,              // 加固中
  fastenWaitConfirm: 9,     // 加固待确认
  fastenFailed: 10,         // 加固失败
  fastenFailedByManual: 11, // 加固失败（人工加固）
  fastenBack: 12,           // 待配置(加固失败)
  complete: 13              // 完成
}
/**
   * 语言类型
   * @type {{name: string, label: string, value: String}}
   */
export const ZH = { name: '中文', label: '中文', language: 'english', value: 'chinese' }
export const EN = { name: '英文', label: '英文', language: 'chinese', value: 'english' }
export const LANGUAGE = [ZH, EN]
/**
   * 资产类型
   * @type {{name: string, value: String}}
   * a：应用软件,h:硬件,o:操作系统
   *  ['a', 'h', 'o']
   */
export const HARD_TYPE = { name: '硬件', value: 'HARD' }
export const SOFT_TYPE = { name: '应用软件', value: 'a' }
export const OS_TYPE = { name: '操作系统', value: 'o' }
export const ASSET_TYPE = [SOFT_TYPE, OS_TYPE]

/**
 * 硬件资产类型
 */
export const COMPUTING_DEVICE = { name: '计算设备', value: 1 }
export const NETWORK_DEVICE = { name: '网络设备', value: 2 }
export const SAFETY_DEVICE = { name: '安全设备', value: 3 }
export const STORAGE_DEVICE = { name: '存储设备', value: 4 }
export const OTHER_DEVICE = { name: '其它设备', value: 5 }
export const HARD_ASSET_TYPE = [COMPUTING_DEVICE, NETWORK_DEVICE, SAFETY_DEVICE, STORAGE_DEVICE, OTHER_DEVICE]
export const HARD_ASSET_TL_TYPE = [COMPUTING_DEVICE, NETWORK_DEVICE]

/**
 * 漏洞状态
 */
export const WAIT_DISPOSE = { name: '待处理', value: '1' }
export const BEGIN_PROCESSED = { name: '处理中', value: '2' }
export const PROCESSED = { name: '已处理', value: '3' }
export const BEEN_RETURNED = { name: '已退回', value: '5' }
export const IGNORE = { name: '已忽略', value: '4' }
export const VAL_DISPOSE_STATUS = [WAIT_DISPOSE, BEGIN_PROCESSED, BEEN_RETURNED, IGNORE, PROCESSED]

/**
 * 资产状态
 */
export const WAIT_REGISTER = { name: '待登记', text: '不予登记', value: 1 }
export const NOT_REGISTER = { name: '不予登记', text: '登记', value: 2 }

export const RECTIFICATION = { name: '整改中', text: '整改详情', value: 3 }
export const NETWORK_ACCESS_PENDING_APPROVAL = { name: '入网待审批', text: '入网待审批', value: 4 }
export const NETWORK_ACCESS_APPROVA_FAILED = { name: '入网审批未通过', text: '入网审批未通过处理', value: 5 }
export const PENDING_ADMISSION = { name: '待准入', text: '准入实施', value: 6 }
export const CONNECTTED = { name: '已入网', text: '退回申请', value: 7 }
export const CHANGING = { name: '变更中', text: '变更中', value: 8 }
export const TO_BE_RETIRED = { name: '待退回', text: '退回执行', value: 9 }
export const DECOMMISSION_PENDING_APPROVAL = { name: '退回待审批', text: '退回待审批', value: 10 }
export const RETIREMENT_APPROVA_FAILED = { name: '退回审批未通过', text: '退回审批未通过处理', value: 11 }
export const RETIRED = { name: '已退回', text: '报废申请', value: 12 }
export const TO_BE_SRAPPED = { name: '待报废', text: '报废执行', value: 13 }
export const SCRAP_PENDING_APPROVA = { name: '报废待审批', text: '报废待审批', value: 14 }
export const SCRAP_APPROVA_FAILED = { name: '报废审批未通过', text: '报废审批未通过处理', value: 15 }
export const SCRAPPED = { name: '已报废', text: '已报废', value: 16 }

export const ASSET_STATUS = [
  WAIT_REGISTER,
  NOT_REGISTER,
  RECTIFICATION,
  NETWORK_ACCESS_PENDING_APPROVAL,
  NETWORK_ACCESS_APPROVA_FAILED,
  PENDING_ADMISSION,
  CONNECTTED,
  CHANGING,
  TO_BE_RETIRED,
  DECOMMISSION_PENDING_APPROVAL,
  RETIREMENT_APPROVA_FAILED,
  RETIRED,
  TO_BE_SRAPPED,
  SCRAP_PENDING_APPROVA,
  SCRAP_APPROVA_FAILED,
  SCRAPPED
]
export const ASSET_STATUS_USEABLE = [
  RECTIFICATION,
  NETWORK_ACCESS_PENDING_APPROVAL,
  NETWORK_ACCESS_APPROVA_FAILED,
  PENDING_ADMISSION,
  CONNECTTED,
  CHANGING,
  TO_BE_RETIRED,
  DECOMMISSION_PENDING_APPROVAL,
  RETIREMENT_APPROVA_FAILED,
  RETIRED,
  TO_BE_SRAPPED,
  SCRAP_PENDING_APPROVA,
  SCRAP_APPROVA_FAILED,
  SCRAPPED
]
export const ASSET_PROCESS = [
  WAIT_REGISTER,
  PENDING_ADMISSION,
  CONNECTTED,
  TO_BE_RETIRED,
  RETIRED,
  TO_BE_SRAPPED,
  { name: '关联软件', text: '关联软件', value: 33 },
  RETIREMENT_APPROVA_FAILED,
  SCRAP_APPROVA_FAILED
]
/**
 * 资产来源
 */
export const ASSET_DETECT = { name: '资产探测', value: 1 }
export const MANUAL_REGISTER = { name: '人工登记', value: 2 }
export const AGENCY_REPORTED = { name: '代理上报', value: 3 }
export const ASSET_SOURCE = [MANUAL_REGISTER, AGENCY_REPORTED]

/**
 *组件类型
 */
export const MEMORY = { name: '内存', value: 'MEMORY' }
export const DISK = { name: '硬盘', value: 'DISK' }
export const CPU = { name: 'CPU', value: 'CPU' }
export const MAINBOARD = { name: '主板', value: 'MAINBOARD' }
export const NETWORK_CARD = { name: '网卡', value: 'NETWORK_CARD' }
export const SUBASSEMBLY_TYPE = [MEMORY, DISK, CPU, MAINBOARD, NETWORK_CARD]
/**
 * 维护方式
 */
export const AUTO =  { name: '自动', value: 2 }
export const MANUAL =  { name: '人工', value: 1 }
export const MAINTENANCE_TYPE = [AUTO, MANUAL]

export const SOURCE_REGISTER = 'register' // 正常登记来源
export const SOURCE_APPEAR = 'appear' // 上报来源
/**
 * 基准操作类型
 */
export const BASELINE_OPERATE_TYPE = {
  CONFIG: 0,   // 基准配置
  CHECK: 1,    // 基准核查
  REINFORCE: 2 // 基准加固
}
/**
 * 审批管理
 */
export const EXAMINE_TYPE =  [
  // { name: '漏洞审批', value: 1 }, { name: '补丁审批', value: 2 }, { name: '配置加固审批', value: 3 },
  { name: '资产退役审批', value: '资产退役审批' }, { name: '资产报废审批', value: '资产报废审批' }, { name: '资产入网审批', value: '资产入网审批' }
  // { name: '突发漏洞审批', value: 7 }
]
export const EXAMINE_STATUS =  [{ name: '待审批', value: false }, { name: '已审批', value: true }]
/**
 * 安全运维门户 协议类型
 */
export const PROTOCOL_LIST = [{
  value: 'ssh',
  name: 'ssh'
}, {
  value: 'rdp',
  name: 'rdp'
}, {
  value: 'vnc',
  name: 'vnc'
}, {
  value: 'sftp',
  name: 'sftp'
}]
export const PROTOCOL_PORT = {
  ssh: '22',
  rdp: '3389',
  vnc: '5901',
  sftp: '22'
}

/**
 * key状态
 */
export const KEY_STATUS = [
  {
    value: '1',
    name: '未领用'
  }, {
    value: '2',
    name: '领用'
  }, {
    value: '3',
    name: '冻结'
  }]

/**
 * 订单状态
 */
export const OA_STATUS = [
  {
    value: 1,
    name: '待处理'
  }, {
    value: 2,
    name: '处理中'
  }, {
    value: 3,
    name: '已结束'
  }, {
    value: 4,
    name: '已借出'
  }]
/**
 * 订单类型
 */
export const OA_TYPE = [
  {
    value: 1,
    name: '入网审批'
  }, {
    value: 2,
    name: '出借审批'
  }, {
    value: 3,
    name: '退回审批'
  }, {
    value: 4,
    name: '报废审批'
  }]

/**
 * 借出状态
 */
export const BORROW_STATUS = [
  {
    value: 1,
    name: '已借出'
  }, {
    value: 2,
    name: '保管中'
  }]

/**
 * 准入状态
 */
export const ACCESS_STATE = [
  {
    value: 1,
    name: '允许'
  },
  {
    value: 2,
    name: '禁止'
  }]

/**
 * 是否可借用
 */
export const IS_BORROW = [
  {
    value: 1,
    name: '是'
  },
  {
    value: 2,
    name: '否'
  }]
/**
   * 网络连接
   */
export const NET_CONNECTIONS = [
  {
    value: 1,
    name: '在线'
  },
  {
    value: 2,
    name: '离线'
  }]

export {
  ASSETS_TYPE,
  UNEXPECTED_DISPOSE_STATUS,
  REPAIR_STATUS,
  ASSETS_IMPORTANT,
  UNEXPECTED_STATUS,
  LOGINOUT_CODES,
  PATCH_INSTALL,
  PATCH_INTERNET,
  PATCH_INTERACTIVE,
  PATCH_HOT,
  PATCH_SOURCE,
  PATCH_STATUS,
  PATCH_LEVEL,
  HAS_PLAN,
  SOURCE_LIST,
  SOURCE_LEVEL,
  CURRENT_STATUS,
  THREAT_GRADE,
  SERVE_TYPE,
  STATUS,
  NOT_FOUND,
  UPGRADE_STATUS,
  UPGRADE_METHOD,
  ALL_STATUS,
  WAIT_STORAGE,
  STORAGEED,
  SOFT_SEARCHTYPE,
  BLANK_LIST,
  BASE_SOURCE,
  OPERATE_TYPE,
  BASE_STATUS_CHECK,
  BASE_STATUS_REINFORCE,
  CONFIG_STATUS,
  INSTALL_STATUS
}
