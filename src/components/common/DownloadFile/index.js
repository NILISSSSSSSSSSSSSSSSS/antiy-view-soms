import { download } from '@/utils/common'
import { Tooltip } from 'antd'
import './index.less'

export default ({ filelist, asseturl = '' }) => {
  if(!filelist || !filelist.length || !Array.isArray(filelist)){
    return null
  }
  return (
    <div className="detail-attachment custom-download-file">
      {
        (filelist || []).map((item, index) => {
          const click = ()=>{
            download(asseturl ? asseturl : '/api/v1/file/download', { url: item.fileUrl, fileName: item.fileName })
          }
          return(
            <Tooltip title={item.fileName} key={index}>
              <div onClick={click} key={item.fileName} className="detail-attachment-item" title="">
                <img src={require('@/assets/download.svg')} className="download-icon" alt=""/>
                <p className="detail-attachment-item-title">{item.fileName}</p>
              </div>
            </Tooltip>
          )})
      }
    </div>
  )
}
