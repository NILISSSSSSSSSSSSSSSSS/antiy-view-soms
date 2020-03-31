const context = require.context('./', false, /\.js$/)
export default context.keys().filter(i=>i !== './index.js').map(v=>context(v))