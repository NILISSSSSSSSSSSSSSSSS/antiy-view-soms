import { download } from '@/utils/common'
import { Tooltip } from 'antd'
import './style.less'

export default ({ filelist }) => {
  if(!filelist || !filelist.length || !Array.isArray(filelist)){
    return null
  }
  return (
    <div className="detail-attachment custom-download-file">
      {
        (filelist || []).map((item, index) => {
          const click = ()=>{
            download('/api/v1/file/download', item)
          }
          return(
            <div onClick={click} key={index} className="detail-attachment-item" title="">
              <img src={require('@/assets/download.svg')} className="download-icon" alt=""/>
              <Tooltip getPopupContainer={triggerNode=>triggerNode.parentNode} title={item.fileName}>
                <p className="detail-attachment-item-title">{item.fileName}</p>
              </Tooltip>
            </div>
          )})
      }
    </div>
  )
}
