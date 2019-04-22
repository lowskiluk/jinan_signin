//index.js
const app = getApp()

Page({
  data: {
    avatarUrl: './user-unlogin.png',
    userInfo: {},
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    logged: false,
    takeSession: false,
    requestResult: '',
    status:0,//姓名输入框的状态，0表示没聚焦，1表示聚焦
    signinno:0,
    isSigninflag:false, //数据库里有无该用户的记录
    queryResult: '',
    cloudresult: '',
    counterId:'',
    count:null,
    qcount: null,
    realname:'',
    disabled:true
  },

  onLoad: function() {
    if (!wx.cloud) {
      wx.redirectTo({
        url: '../chooseLib/chooseLib',
      })
      return
    }
  }

})
