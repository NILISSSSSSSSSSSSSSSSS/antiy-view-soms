import { Router, Switch, Route } from 'dva/router'
import Loadable from 'react-loadable'
import Loading from '@/components/common/Loading'
import routers from './routerMap'

const Login = Loadable({
  loader: () => import('@/pages/Login'),
  loading: Loading
})

const IndexPage = Loadable({
  loader: () => import('@/pages/IndexPage'),
  loading: Loading
})

const Page404 = Loadable({
  loader: () => import('@/pages/ErrorPage/404'),
  loading: Loading
})

const Page401 = Loadable({
  loader: () => import('@/pages/ErrorPage/401'),
  loading: Loading
})

const Main = Loadable({
  loader: () => import('@/pages/Main'),
  loading: Loading
})

/**
 * @nowRouter 记录的路由位置
 */
// if(!sessionStorage.nowRouter){
//   sessionStorage.nowRouter = ''
// }

/**
 * @param obs {object} 路由组件参数对象
 */
const Guard = (obs)=>{
  let { rCaches } = obs.location.state || {}
  //访问页中存在参数，清除匹配router名称的sessionStorage
  if(rCaches && sessionStorage.searchParameter ){
    let init = JSON.parse(sessionStorage.searchParameter)
    JSON.parse(sessionStorage.searchParameter).forEach((item, i)=>{
      if(item.pageIndex === obs.location.pathname){
        init.splice(i, 1)
        sessionStorage.searchParameter = JSON.stringify(init)
      }
    })
  }
  return (
    <Route  path={ obs.path } render={props =>(
      <obs.component {...props} />
    )}/>
  )
}

const RouterConfig = ({ history }) => {
  return (
    <Router history={history}>
      <Switch>
        <Guard path="/login" exact component={Login} />
        <Route path="/" render={() => (
          <Main>
            <Switch>
              <Route path="/" exact component={IndexPage} />
              {
                routers.map((item, index) => {
                  return  <Guard key={index} path={item.path} exact component={item.component} />
                })
              }
              <Guard path="/401" component={Page401} />
              <Guard component={Page404} />
            </Switch>
          </Main>
        )} />
      </Switch>
    </Router>
  )
}
export default RouterConfig
