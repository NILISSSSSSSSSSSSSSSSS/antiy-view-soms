import 'babel-polyfill'
import dva from 'dva'
import { Message } from 'antd'
import createLoading from 'dva-loading'
import './index.less'
import 'core-js'
// import 'core-js/features/array/flat'

// 1. Initialize
const app = dva(createLoading())
window.app = app

//拓扑调用antd方法
window.message = Message
// 2. Plugins
// app.use({})

// 3. Model
// 自动扫包models  ,不用每次手动添加
require('./models').default.map(item => app.model(item.default))

// 4. Router
app.router(require('./router').default)

// 5. Start
app.start('#root')
