//index.js
//获取应用实例
const app = getApp()
let ctx = null
Page({
  data: {
    userInfo: null, // 用户信息
    uploadImg: '', // 上传的头像
    borderImg: '', // 头像框图片
    canvasId: 'canvas',
    canvas: {
      width: null,
      height: null,
      background: 'rgb(255,255,255)'
    },
    preview: {
      left: 0,
      right: 0,
      height: 534
    },
    qualityImg: null,
    screenWidth: '',
    distributionCode: '',
    imageBill: '',
    isWeChatAvatarUrl:true // true微信头像   false自定义头像
  },
  // 生成头像
  async savePhoto() {
    let that = this
    wx.showLoading({
      title: '正在生成头像',
      mask: true
    })
    // 开始绘制头像
    that.init()


  },
  headimgHD(imageUrl)  {        
    console.log('原来的头像',  imageUrl);        
    imageUrl  =  imageUrl.split('/'); //把头像的路径切成数组

    //把大小数值为 46 || 64 || 96 || 132 的转换为0
    if  (imageUrl[imageUrl.length  -  1]  &&  (imageUrl[imageUrl.length  -  1]  ==  46  ||  imageUrl[imageUrl.length  -  1]  ==  64  ||  imageUrl[imageUrl.length  -  1]  ==  96  ||  imageUrl[imageUrl.length  -  1]  ==  132))  {            
      imageUrl[imageUrl.length  -  1]  =  0;        
    }

            
    imageUrl  =  imageUrl.join('/');    //重新拼接为字符串

            
    console.log('高清的头像',  imageUrl);        
    return  imageUrl;    
  },
  // 完成画图
  draw() {
    let that = this
    that.ctx.draw(false, () => {
      setTimeout(() => {
        that.canvasToTempFilePath()
      }, 130)
    })
  },
  // 生成图片
  canvasToTempFilePath() {
    let that = this
    wx.canvasToTempFilePath({
      canvasId: that.data.canvasId,
      success(res) {
        wx.hideLoading()
        that.ctx = null
        console.log(res)
        that.setData({
          imageBill: res.tempFilePath
        })

        // 生成以后直接预览图片
        wx.previewImage({
          current: res.tempFilePath,
          urls: [res.tempFilePath],
        })

      },
      fail() {
        wx.hideLoading()
        wx.showModal({
          title: '提示',
          content: '头像保存失败',
        })
      }
    })
  },
  init() {
    let that = this
    that.ctx = wx.createCanvasContext(that.data.canvasId)
    wx.getSystemInfo({
      success: (systemInfo) => {
        // 屏幕宽度
        let screenWidth = systemInfo.screenWidth

        // 预览图片宽度
        let previewWidth = that.getPreviewWidth()
        // 预览图片宽高比
        let aspectRatio = previewWidth / that.data.preview.height

        // 设置画布尺寸px
        let canvas = that.data.canvas
        canvas.width = screenWidth,
          canvas.height = screenWidth
        that.setData({
          screenWidth: screenWidth,
          aspectRatio: aspectRatio,
          canvas: canvas
        })
        that.ctx.setFillStyle(that.data.canvas.background)
        that.ctx.fillRect(0, 0, that.data.canvas.width, that.data.canvas.height)
        // 画用户头像
        that.drawAvatarUrlImage()
      }
    })
  },
  /**
   * 画头像框
   */
  drawAvatarBorderImage() {
    let that = this
    let borderImg = that.data.borderImg

    // 没有头像框
    if (!borderImg) {
      // 开始生成
      that.draw()
      return
    }

    // 有头像框则继续执行
    // wx.downloadFile({
    //   url: borderImg,
    //   success: function(result) {
    //     console.log('result', result)
    //     that.ctx.drawImage(that.data.borderImg, that.changeSize(0), that.changeSize(0), that.data.screenWidth, that.data.screenWidth)
    //     // 开始生成
    //     that.draw()
    //   },
    //   fail: function() {
    //     wx.hideLoading()
    //     wx.showModal({
    //       title: '提示',
    //       content: '无法下载头像框',
    //     })
    //   }
    // })
    that.ctx.drawImage(that.data.borderImg, that.changeSize(0), that.changeSize(0), that.data.screenWidth, that.data.screenWidth)
    that.draw()
  },
  /**
   * 画用户头像
   */
  drawAvatarUrlImage() {
    let that = this
    let avatarUrl = that.data.userInfo ? that.data.userInfo.avatarUrl : ''

    if (that.data.uploadImg && !that.data.isWeChatAvatarUrl) {
      that.ctx.drawImage(that.data.uploadImg, that.changeSize(0), that.changeSize(0), that.data.screenWidth, that.data.screenWidth)
      // 画头像框
      that.drawAvatarBorderImage()
    } else if (avatarUrl && that.data.isWeChatAvatarUrl) {
      wx.downloadFile({
        url: avatarUrl,
        success: function(result) {
          console.log('result', result)
          that.ctx.drawImage(result.tempFilePath, that.changeSize(0), that.changeSize(0), that.data.screenWidth, that.data.screenWidth)
          // 画头像框
          that.drawAvatarBorderImage()
        },
        fail: function() {
          wx.hideLoading()
          wx.showModal({
            title: '提示',
            content: '无法下载头像',
          })
        }
      })
    } else {
      wx.hideLoading()
      wx.showModal({
        title: '提示',
        content: '请先登录或者上传头像',
      })
    }
  },
  // rpx转为画布尺寸
  changeSize(size) {
    let canvasSize = (size / 750) * this.data.screenWidth
    canvasSize = parseFloat(canvasSize * 2)
    return canvasSize
  },
  // 获取预览栏的宽度rpx
  getPreviewWidth() {
    let previewWidth = (750 - this.data.preview.left - this.data.preview.right)
    return previewWidth
  },
  // 选择头像框
  selectBorderImg() {
    wx.navigateTo({
      url: '/pages/selectBorder/selectBorder',
    })
  },
  // 上传头像
  uploadPhoto() {
    let that = this
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success(res) {
        wx.showToast({
          title: '上传成功',
          icon: 'none',
          duration: 1000
        })
        that.setData({
          isWeChatAvatarUrl: false
        })
        that.setData({
          uploadImg: res.tempFilePaths[0]
        })
      }
    })
  },
  // 切换微信头像
  changeAvatarUrl(){
    this.setData({
      isWeChatAvatarUrl:true
    })
  },
  // 用户点击登录
  bindgetuserinfo(e) {
    console.log(e)
    if (e.detail.userInfo) {
      let tempUserInfo = e.detail.userInfo
      console.log('登陆后',tempUserInfo.avatarUrl = this.headimgHD(tempUserInfo.avatarUrl))
      this.setData({
        userInfo: e.detail.userInfo
      })
      // 缓存用户登录信息
      wx.setStorage({
        key: 'userInfo',
        data: JSON.stringify(e.detail.userInfo),
      })
      wx.showToast({
        title: '登录成功',
        icon: 'none',
        duration: 1000
      })
    } else {
      wx.showToast({
        title: '登录失败',
        icon: 'none',
        duration: 1000
      })
    }
  },
  onLoad() {
    // 进入页面查询用户是否登录过
    let userInfo = wx.getStorageSync('userInfo')
    if (userInfo) {
      let tempUserInfo = JSON.parse(userInfo)
      console.log('tempUserInfo.avatarUrl', tempUserInfo.avatarUrl = this.headimgHD(tempUserInfo.avatarUrl))
      this.setData({
        userInfo: tempUserInfo
      })
    }
  },
  onShow() {
    this.setData({
      borderImg: app.globalData.borderImgs
    })
  },
  onShareAppMessage() {
    return {
      title: "我发现了一个好玩的小程序,快来跟我一起生成头像框吧!",
      path: '/pages/index/index'
    }
  },
 
})