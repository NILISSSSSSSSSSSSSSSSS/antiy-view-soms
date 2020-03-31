export default {
  deWeight: (item)=>{ //去除重复 级别的模块
    let obj = {}
    item = item.reduce((cur, next) => {
      if(!obj[next.levelType])
        obj[next.levelType] = true && cur.push(next)
      return cur
    }, [])
    return item
  },
  findPathByLeafId (leafId, nodes, next) { //遍历查找ID的父级
    let _t = this
    if(next === undefined) {
      next = []
    }
    for(let i = 0; i < nodes.length; i++) {
      let now = next.concat()  //浅拷贝
      now.push( nodes[i])
      if(leafId === nodes[i].stringId) {
        return now
      }
      if(nodes[i].childrenNode) {
        let findResult = _t.findPathByLeafId(leafId, nodes[i].childrenNode, now)
        if(findResult) {
          return findResult
        }
      }
    }
  }
}