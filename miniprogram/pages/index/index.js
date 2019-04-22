//index.js
const app = getApp()
const regeneratorRuntime = require('./runtime.js')

Page({
  data: {
    avatarUrl: './user-unlogin.png',
    userInfo: {},
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    logged: false,
    takeSession: false,
    requestResult: '',
    status: 0, //姓名输入框的状态，0表示没聚焦，1表示聚焦
    signinno: '',//数据库唯一id
    signtime:'',//签到时间
    signtimestamp:'',//签到时间戳
    isSigninflag: false, //数据库里有无该用户的记录
    showSuccessIcon:false,//显示成功签到页面
    showInitPage:false, //显示初始页面
    queryResult: '',
    cloudresult: '',
    counterId: '',
    count: null,
    qcount: null,
    realname: '', //输入框里录入的姓名
    realname_d:'', //数据库里读出来的姓名
    status_d:'',//数据库里读出来的身份信息的key
    status_d_value: '',//数据库里读出来的身份信息的value
    disabled: true,
    radioChanged: false,
    radiovalue: '',
    focusflag: false,
    uniid: '',
    animationData:'',
    isClicked:false,
    items: [{
        name: 'teacher',
        value: '老师'
      },
      {
        name: 'student',
        value: '学生'
      },
      {
        name: 'oldboy',
        value: '校友'
      },
      {
        name: 'sponsor',
        value: '赞助商'
      },
      {
        name: 'sponsor',
        value: '外校嘉宾'
      }
    ]
  },

  radioChange(e) {
    console.log('radio发生change事件，携带value值为：', e.detail.value)
    this.data.radioChanged = true
    this.data.radiovalue = e.detail.value
  },


  /* 文本框聚焦时更改状态*/
  focus: function(e) {
    this.setData({
      status: 1
    })
  },
  /* 文本框失焦时更改状态*/
  blur: function(e) {
    this.setData({
      status: 0
    })
  },

  onShow() {
    
  },
  async onLoad(options) {
    if (!wx.cloud) {
      wx.redirectTo({
        url: '../chooseLib/chooseLib',
      })
      return
    }
    try {
      //重要！！！这个doit函数里的function是同步执行的，一个做完再执行下一个
      await this.doIt().then(res => {
        console.log(' onLoad: ' + res);
      })
      //end
      //重新写一次focusflag，聚焦到文本框
      this.setData({
        focusflag: this.data.focusflag
      })
    }catch(err){
      console.log("err:" + err)
    }
  },

  async doIt(){
    try{
        wx.showLoading({
          title: '加载中',
          mask: true
        })

        console.log("do1 start...")
        const do1 = await this.onLoadDo1()
        console.log("do1 end.")
        const do2 = await this.onLoadDo2()
        console.log("do2 end.")
        const do3 = await this.onLoadDo3()
        console.log("do3 end.")

        var datetime = app.formatDate(this.data.signtimestamp)
        //var status_t = items.map(function (user) { return user.email; });

        // if (this.data.status_d == '' || this.data.status_d == undefined || this.data.status_d == null) {
        //   //none
        // }else{
        //   for (var i in this.data.items) {//通过定义一个局部变量i遍历获取items里面的所有key值
        //     //alert(maps[i]); //通过获取key对应的value值
        //     //console.log(this.data.items[i])
        //     if (this.data.status_d == this.data.items[i].name){
        //       var status_t = this.data.items[i].value
        //     }
        //   }
        //   this.setData({
        //     status_d_value: status_t
        //   })
        // }

        setTimeout(function () {
          wx.hideLoading()
        }, 5)
        //再处理完一切之后根据是否已经签到成功的标志isSigninflag来显示或隐藏相应的view
        this.setData({
          showInitPage: !this.data.isSigninflag,
          showSuccessIcon: this.data.isSigninflag,
          signtime: datetime
        })
    }catch(err){
      console.log("err:"+err)
    }
  },
  
  //第一步：判断用户是否已经授权，如果是则直接取得用户信息
  onLoadDo1:function(){
    return new Promise((resolve,reject) =>{
      // 获取用户信息
      wx.getSetting({
        success: res => {
          //console.log("auth:"+res.authSetting)
          // wx.showLoading({
          //   title: '加载中',
          //   mask: true
          // })
          // setTimeout(function () {
          //   wx.hideLoading()
          // }, 1500)
          if (res.authSetting['scope.userInfo'] && JSON.stringify(this.data.userInfo) == "{}") {
            // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
            wx.getUserInfo({
              success: res => {
                this.setData({
                  logged: true,
                  avatarUrl: res.userInfo.avatarUrl,
                  userInfo: res.userInfo
                })
                //console.log("se2")
              }
            })
          }
        }
      })
      resolve({ msg: "do1 done." })
    })
  },

  //第二步：获取用户openid
  onLoadDo2:function(){
    console.log("do2 start....")
    return new Promise((resolve, reject) => {
      console.log("print golobal openid:")
      console.log(app.globalData.openid)
      if (app.globalData.openid == '' || app.globalData.openid == undefined || app.globalData.openid == null){
        //调用云函数,获取openid
        wx.cloud.callFunction({
          name: 'login',
          data: {},
          success: res => {
            console.log('[云函数] [login] user openid: ', res.result.openid)
            app.globalData.openid = res.result.openid
            console.log("查询数据库有无当前用户的记录...")
            //this.onQueryByOpenid()
            resolve({ msg: "do2 done." })
            // this.onQueryCountByOpenid()//查询数据库里有无该用户的记录
            // if (this.data.qcount>0){
            //   console.log("该用户有记录，现查询唯一id...")
            //   this.onQueryByOpenid()
            // }
            //this.isSignin(res.result.openid)
            // wx.navigateTo({
            //   url: '../userConsole/userConsole',
            // })
          },
          fail: err => {
            console.error('[云函数] [login] 调用失败', err)
            reject({ msg: "do2 err." })
            // wx.navigateTo({
            //   url: '../deployFunctions/deployFunctions',
            // })
          }
        })
      }else{
        resolve({ msg:"do2 done with doing nothing"})
      }
    })
  },

  //第三部：查询用户在数据库集合里有无对应openid的记录，如果有，表示已经签到过，就不需要再次签到了
  onLoadDo3: function () {
    console.log("do3 start....")
    return new Promise((resolve, reject) => {
      const db = wx.cloud.database()
      // 查询当前用户所有的 counters
      db.collection('jinan_user').where({
        _openid: app.globalData.openid
      }).limit(1).get({
        success: res => {
          console.log(res.data.length)
          this.data.focusflag = (res.data.length == 0)
          if (res.data.length > 0) {
            this.setData({
              queryResult: JSON.stringify(res.data, null, 2),
              signinno: res.data[0]._id,
              signtimestamp: res.data[0].timestamp,
              realname_d:res.data[0].realname,
              status_d:res.data[0].status,
              qcount: res.data.length,
              isSigninflag: (res.data.length > 0),
            })
          }
          console.log('[数据库] [查询记录] 成功: ', res)
          console.log("focusflag:" + this.data.focusflag)
          resolve({msg:"do3 done."})

        },
        fail: err => {
          wx.showToast({
            icon: 'none',
            title: '查询记录失败'
          })
          console.error('[数据库] [查询记录] 失败：', err)
          reject({msg:"do3 err."})
        }
      })
    })
  },
  // onSignin: function() {

  // },

  //点击签到按钮执行的函数
  onGetUserInfo: function(e) {
    console.log("set isClicked=true.")
    this.setData({
      isClicked:true
    })
    wx.showLoading({
      title: '签到中',
      mask: true
    })
    console.log("signin button clicked...")
    console.log(e.detail.userInfo)
    console.log(app.globalData.openid)
    console.log(this.data.logged)
    console.log(this.data.realname)

    if (!this.data.logged && e.detail.userInfo) {
      this.setData({
        logged: true,
        avatarUrl: e.detail.userInfo.avatarUrl,
        userInfo: e.detail.userInfo
      })
    }

    if(this.doSignin()){
      console.log("签到过程执行成功！")
      console.log("set isClicked=true.")
      this.setData({
        isClicked: false
      })
    }else{
      console.log("签到过程似乎有点问题...")
      console.log("set isClicked=true.")
      this.setData({
        isClicked: false
      })
    }

  },

  doSignin:function(){
    var realname_re = this.data.realname.replace(/\s*/g, "")//去掉用户输入的姓名中的空格
    if (this.data.realname == '' || this.data.realname == undefined || this.data.realname == null) {
      console.log("签到失败，请填写姓名")
      wx.showToast({
        title: '签到失败，请填写姓名',
        icon: 'none'
      })
      return false
    } else if (realname_re.length < 2) {
      wx.showToast({
        title: '签到失败，请填写完整姓名',
        icon: 'none'
      })
      return false
    }

    if (!this.data.radioChanged) {
      console.log("请选择您的身份")
      wx.showToast({
        title: '请选择您的身份',
        icon: 'none'
      })
      return false
    }

    console.log("checking1...")
    this.onQueryCountByOpenid().then((result) => {
      if (result.total > 0) {
        console.log("checking2...")
        console.log(result)
        if (this.data.isSigninflag) {
          console.log("查询返回结果" + this.data.isSigninflag)
          wx.showToast({
            title: '您已成功签到',
          })
          return false
        }
      } else {
        console.log("checking3...")
        if (JSON.stringify(this.data.userInfo) == "{}") {
          console.log("授权信息获取失败")
          wx.showToast({
            title: '签到失败，需授权才能签到',
            icon: 'none'
          })
          return false
        }
        console.log("checking4...")
        this.onAdd().then((result) => {
          console.log("print onAdd result...")
          console.log(result)
          this.onLoad()
        })
        //wx.hideLoading()

      }
      
    })
    return true

    // if (JSON.stringify(this.data.userInfo) == "{}") {
    //   console.log("授权信息获取失败")
    //   wx.showToast({
    //     title: '签到失败，需授权才能签到',
    //     icon: 'none'
    //   })
    //   return
    // }

    // this.onAdd()
    // this.onLoad()
  },

  onAdd: function() {
    return new Promise((resolve, reject) => {
      const db = wx.cloud.database()
      db.collection('jinan_user').add({
        data: {
          openid: app.globalData.openid,
          userinfo: this.data.userInfo,
          timestamp: new Date().getTime(),
          realname: this.data.realname,
          status: this.data.radiovalue
        },
        success: res => {
          // 在返回结果中会包含新创建的记录的 _id
          this.setData({
            counterId: res._id,
            count: 1,
            isSigninflag: true
          })
          // wx.showToast({
          //   title: '新增记录成功',
          // })
          console.log('[数据库] [新增记录] 成功，记录 _id: ', res._id)
          resolve(res)
        },
        fail: err => {
          wx.showToast({
            icon: 'none',
            title: '新增记录失败'
          })
          console.error('[数据库] [新增记录] 失败：', err)
          resolve("err:"+err)
        }
      })
    })
  },

  onQueryByOpenid: function() {
    const db = wx.cloud.database()
    // 查询当前用户所有的 counters
    db.collection('jinan_user').where({
      _openid: app.globalData.openid
    }).limit(1).get({
      success: res => {
        console.log(res.data.length == 0)
        this.data.focusflag = (res.data.length == 0)
        if (res.data.length>0){
          this.setData({
            queryResult: JSON.stringify(res.data, null, 2),
            signinno: res.data[0]._id,
            qcount: res.data.length,
            isSigninflag: (res.data.length > 0),
          })
        }
        console.log('[数据库] [查询记录] 成功: ', res)
        console.log("focusflag:" + this.data.focusflag)
        
      },
      fail: err => {
        wx.showToast({
          icon: 'none',
          title: '查询记录失败'
        })
        console.error('[数据库] [查询记录] 失败：', err)
      }
    })
  },

  // onQueryCountByOpenid: function () {
  //   const db = wx.cloud.database()
  //   // 查询count
  //   db.collection('jinan_user').where({
  //     _openid: app.globalData.openid
  //   }).count().then( res => {
  //       console.log(res)
  //       this.setData({
  //         qcount: res.total,
  //         isSigninflag: (res.total > 0)
  //       })
  //       console.log('[数据库] [查询记录] 成功: ', res)
  //     },
  //   )
  // },

  onQueryCountByOpenid: function() {
    return new Promise((resolve, reject) =>{
      const db = wx.cloud.database()
      // 查询count
      db.collection('jinan_user').where({
        _openid: app.globalData.openid
      }).count({
        success: res => {
          console.log(res)
          this.setData({
            qcount: res.total,
            isSigninflag: (res.total > 0)
          })
          console.log('[数据库] [查询记录] 成功: ', res)
          resolve(res)
        },
        fail: err => {
          wx.showToast({
            icon: 'none',
            title: '查询记录失败'
          })
          console.error('[数据库] [查询记录] 失败：', err)
          reject("err:" + err)
        }
      })
    })
  },

  inputeidt: function(e) {
    this.data.realname = e.detail.value
    //console.log(e.detail.value)
  }
  // onGetOpenid: function() {
  //   // 调用云函数
  //   wx.cloud.callFunction({
  //     name: 'login',
  //     data: {},
  //     success: res => {
  //       console.log('[云函数] [login] user openid: ', res.result.openid)
  //       app.globalData.openid = res.result.openid
  //       wx.navigateTo({
  //         url: '../userConsole/userConsole',
  //       })
  //     },
  //     fail: err => {
  //       console.error('[云函数] [login] 调用失败', err)
  //       wx.navigateTo({
  //         url: '../deployFunctions/deployFunctions',
  //       })
  //     }
  //   })
  // },

  // 上传图片
  // doUpload: function () {
  //   // 选择图片
  //   wx.chooseImage({
  //     count: 1,
  //     sizeType: ['compressed'],
  //     sourceType: ['album', 'camera'],
  //     success: function (res) {

  //       wx.showLoading({
  //         title: '上传中',
  //       })

  //       const filePath = res.tempFilePaths[0]

  //       // 上传图片
  //       const cloudPath = 'my-image' + filePath.match(/\.[^.]+?$/)[0]
  //       wx.cloud.uploadFile({
  //         cloudPath,
  //         filePath,
  //         success: res => {
  //           console.log('[上传文件] 成功：', res)

  //           app.globalData.fileID = res.fileID
  //           app.globalData.cloudPath = cloudPath
  //           app.globalData.imagePath = filePath

  //           wx.navigateTo({
  //             url: '../storageConsole/storageConsole'
  //           })
  //         },
  //         fail: e => {
  //           console.error('[上传文件] 失败：', e)
  //           wx.showToast({
  //             icon: 'none',
  //             title: '上传失败',
  //           })
  //         },
  //         complete: () => {
  //           wx.hideLoading()
  //         }
  //       })

  //     },
  //     fail: e => {
  //       console.error(e)
  //     }
  //   })
  // },
  // isSignin: function(oid) {
  //   wx.cloud.callFunction({
  //     name: 'isSignin',
  //     data: {
  //       openid:oid
  //     },
  //     success: res => {
  //       // wx.showToast({
  //       //   title: '调用成功',
  //       // })
  //       console.log(res.result)
  //       this.setData({
  //         isSigninflag: res.result.isSignin
  //       })
  //     },
  //     fail: err => {
  //       wx.showToast({
  //         icon: 'none',
  //         title: '失败，请重试',
  //       })
  //       console.error('[云函数] [isSignin] 调用失败：', err)
  //     }
  //   })
  // },

})