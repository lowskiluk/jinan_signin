// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {

  const wxContext = cloud.getWXContext()
  signInflag = 0
  queryResult = ''

  console.log(event)
  console.log(context)

  const db = cloud.database()
  // 查询当前用户所有的 counters
  db.collection('jinan_user').where({
    _openid: event.openid
  }).count({
    success: res => {
      this.setData({
        queryResult:res.total
      })
      console.log('[数据库] [查询记录] 成功: ', res)
    },
    fail: err => {
      // wx.showToast({
      //   icon: 'none',
      //   title: '查询记录失败'
      // })
      console.error('[数据库] [查询记录] 失败：', err)
    }
  })

  if(queryResult>0){
    signInflag = true
  }else{
    signInflag = false
  }
  // return {
  //   event,
  //   openid: wxContext.OPENID,
  //   appid: wxContext.APPID,
  //   unionid: wxContext.UNIONID,
  // }
  return{
    isSignin:signInflag
  }
}