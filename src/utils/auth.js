export default function (tag) {
  const menus = JSON.parse(sessionStorage.getItem('menus') || '[]')
  return menus.includes(tag)
  // return true
}