import * as asset from './asset'
import * as installTemplate from './installTemplate'
import * as unknownAsset from './unknownAsset'
import * as business from './business'

export default { ...asset,  ...installTemplate, ...unknownAsset, ...business }
