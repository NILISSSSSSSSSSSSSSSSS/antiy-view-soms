import routers from '@/router/routerMap'
export default {
  namespace: 'auth',
  state: {

  },
  //全局路由拦截
  subscriptions: {
    set ({ dispatch, history }) {
      history.listen(({ pathname }) => {
        const menus = JSON.parse(sessionStorage.getItem('menus') || '[]')
        const tag = routers.filter(item => item.path.toLowerCase() === pathname.toLowerCase())
        // 无须任何权限，可以直接进入该页面路由的集合
        const excludepaths = [ '/personalcenter', '/workbench' ]
        if (tag.length > 0 && !excludepaths.includes(pathname)) {
          // 若配置的router中tag包含多个，类型为数组，需要逐个遍历判断是否包含,如工单包含多个不同类型的工单列表权限
          if(Array.isArray(tag[0].tag)) {
            let hasRights = false
            const rightsArr = tag[0].tag
            for (let i = 0; i < rightsArr.length; ++i){
              if (menus.includes(rightsArr[i])) {
                hasRights = true
                break
              }
            }
            if(!hasRights) history.push('/401') // todo 调试时省略权限问题
          }
          // 若配置的router中tag只有一个，类型为字符串，直接判断是否包含
          else {
            if(!menus.includes(tag[0].tag)){
              history.push('/401') // todo 调试时省略权限问题
            }
          }
        }
      })
    }
  }
}
