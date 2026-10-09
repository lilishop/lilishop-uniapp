<template>
	<view class="container">
		<view class="page-body uni-content-info">
			<view class='cropper-content'>
				<view v-if="isShowImg" class="uni-corpper" :style="'width:'+cropperInitW+'px;height:'+cropperInitH+'px;'">
					<view class="cropper-modal" :style="'width:'+cropperInitW+'px;height:'+cropperInitH+'px;'"></view>
					<view class="uni-corpper-content" :style="'width:'+cropperW+'px;height:'+cropperH+'px;left:'+cropperL+'px;top:'+cropperT+'px'">
						<image :src="imageSrc" :style="'width:'+cropperW+'px;height:'+cropperH+'px'"></image>
						<view class="cropper-modal-box" :style="'left:'+cutL+'px;top:'+cutT+'px;right:'+cutR+'px;bottom:'+cutB+'px'">
							<img  :src="imageSrc" :style="'width:'+cropperW+'px;height:'+cropperH+'px;transform:translate3d('+cutL*-1+'px, '+cutT*-1+'px, 0px) '"  />
						</view>
						<view class="uni-corpper-crop-box" @touchstart.stop="contentStartMove" @touchmove.stop="contentMoveing" @touchend.stop="contentTouchEnd"
						    :style="'left:'+cutL+'px;top:'+cutT+'px;right:'+cutR+'px;bottom:'+cutB+'px'">
							<view class="uni-cropper-view-box">
								<view class="uni-cropper-dashed-h"></view>
								<view class="uni-cropper-dashed-v"></view>
								<view class="uni-cropper-line-t" data-drag="top" @touchstart.stop="dragStart" @touchmove.stop="dragMove"></view>
								<view class="uni-cropper-line-r" data-drag="right" @touchstart.stop="dragStart" @touchmove.stop="dragMove"></view>
								<view class="uni-cropper-line-b" data-drag="bottom" @touchstart.stop="dragStart" @touchmove.stop="dragMove"></view>
								<view class="uni-cropper-line-l" data-drag="left" @touchstart.stop="dragStart" @touchmove.stop="dragMove"></view>
								<view class="uni-cropper-point point-t" data-drag="top" @touchstart.stop="dragStart" @touchmove.stop="dragMove"></view>
								<view class="uni-cropper-point point-tr" data-drag="topTight"></view>
								<view class="uni-cropper-point point-r" data-drag="right" @touchstart.stop="dragStart" @touchmove.stop="dragMove"></view>
								<view class="uni-cropper-point point-rb" data-drag="rightBottom" @touchstart.stop="dragStart" @touchmove.stop="dragMove"></view>
								<view class="uni-cropper-point point-b" data-drag="bottom" @touchstart.stop="dragStart" @touchmove.stop="dragMove"></view>
								<view class="uni-cropper-point point-bl" data-drag="bottomLeft"></view>
								<view class="uni-cropper-point point-l" data-drag="left" @touchstart.stop="dragStart" @touchmove.stop="dragMove"></view>
								<view class="uni-cropper-point point-lt" data-drag="leftTop"></view>
							</view>
						</view>
					</view>
				</view>
				<view v-else style="text-align: center; margin: 20rpx 0;">暂未选择图片</view>
			</view>
			<view class='cropper-config'>
				<!-- <view class="cropper-choose" :style="'background-color: '+selectButtonBackgroundColor+';color: '+selectButtonColor+';'" @click="getImage">{{ selectButtonText }}</view>-->
				<view class="cropper-confirm btn"   @click="getImageInfo">{{ saveButtonText }}</view> 
			</view>
			<canvas canvas-id="myCanvas" v-if="originalW>0 && originalH>0" :style="'position:absolute;border: 1px solid red; width:'+(original?originalW:imageW)+'px;height:'+(original?originalH:imageH)+'px;top:-9999px;left:-9999px;'"></canvas>
		</view>
	</view>
</template>

<script>
	let sysInfo = uni.getSystemInfoSync();
	let SCREEN_WIDTH = sysInfo.screenWidth
	let PAGE_X, // 手按下的x位置
		PAGE_Y, // 手按下y的位置 
		PR = sysInfo.pixelRatio, // dpi
		T_PAGE_X, // 手移动的时候x的位置
		T_PAGE_Y, // 手移动的时候Y的位置
		CUT_L, // 初始化拖拽元素的left值
		CUT_T, // 初始化拖拽元素的top值
		CUT_R, // 初始化拖拽元素的
		CUT_B, // 初始化拖拽元素的
		CUT_W, // 初始化拖拽元素的宽度
		CUT_H, //  初始化拖拽元素的高度
		IMG_RATIO, // 图片比例
		IMG_REAL_W, // 图片实际的宽度
		IMG_REAL_H, // 图片实际的高度
		DRAFG_MOVE_RATIO = 1, //移动时候的比例,
		INIT_DRAG_POSITION = 200, // 初始化屏幕宽度和裁剪区域的宽度之差，用于设置初始化裁剪的宽度
		ORIGINAL_W, //原始图片宽度
		ORIGINAL_H, //原始图片高度
		DRAW_IMAGE_W = sysInfo.screenWidth // 设置生成的图片宽度
		
	export default {
		name:'OkingtzCropper',
		props:{
			original:{
				// 是否按照原始大小返回
				type:Boolean,
				default:true
			},
			fixed:{
				// 优先级比较
				type:Boolean,
				default:true
			},
			fixedNumber:{
				type:Array,
				default:function(){
					return [1,1]
				}
			},
			cropWidth:{
				type:Number,
				default:200,
			},
			cropHeight:{
				type:Number,
				default:200,
			},
			minHeight:{
				type:Number,
				default:20,
			},
			minWidth:{
				type:Number,
				default:20,
			},
			saveLoading:{
				type:String,
				default:'图片生成中...'
			},
			selectButtonText:{
				type:String,
				default:'选择照片'
			},
			selectButtonColor:{
				type:String,
				default:'#FFFFFF'
			},
			selectButtonBackgroundColor:{
				type:String,
				default:'#FF2E80'
			},
			saveButtonText:{
				type:String,
				default:'上传'
			},
			saveButtonColor:{
				type:String,
				default:'#FFFFFF'
			},
			saveButtonBackgroundColor:{
				type:String,
				default:'#FF2E80'
			},
			image:{
				type:String,
				default:''
			},
			maxCropper:{
				type:Boolean,
				default:false
			},
			fileType:{
				type:String,
				default:'jpg'
			},
			quality:{
				type:Number,
				default:1
			},
			/**
			 * 是否可以移动
			 */
			canMove:{
				type:Boolean,
				default:true
			},
			/**
			 * 是否可以放缩
			 */
			canScale:{
				type:Boolean,
				default:true
			},
		},
		/**
		 * 页面的初始数据
		 */
		data() {
			return {
				imageSrc: '',
				isShowImg: false,
				// 初始化的宽高
				cropperInitW: SCREEN_WIDTH,
				cropperInitH: SCREEN_WIDTH,
				// 动态的宽高
				cropperW: SCREEN_WIDTH,
				cropperH: SCREEN_WIDTH,
				// 动态的left top值
				cropperL: 0,
				cropperT: 0,

				transL: 0,
				transT: 0,

				// 图片缩放值
				scaleP: 0,
				imageW: 200,
				imageH: 200,

				// 裁剪框 宽高
				cutL: 0,
				cutT: 0,
				cutB: SCREEN_WIDTH,
				cutR: '100%',
				qualityWidth: DRAW_IMAGE_W,
				innerAspectRadio: DRAFG_MOVE_RATIO,
				
				// 图片原始尺寸
				originalW: 0,
				originalH: 0,
			}
		},
		/**
		 * 生命周期函数--监听页面加载
		 */
		onLoad: function (options) {},
		/**
		 * 生命周期函数--监听页面初次渲染完成
		 */
		onReady: function () {
			
		},
		mounted:function(){
			const _this = this
			_this.imageSrc = _this.image
			_this.loadImage();
		},
		watch:{
			image:function (){
				var _this = this; 
				_this.imageSrc = _this.image; 
				_this.loadImage(); 
			}
		},
		methods: {
			setData: function (obj) {
				let that = this;
				Object.keys(obj).forEach(function (key) {
					that[key] = obj[key]
				});
			},
			getImage: function () {
				var _this = this
				uni.showActionSheet({
					itemList: ['拍照', '选择一张照片'],
					success: function(res) {
						_this.chooseImage(res.tapIndex)
					},
					fail: function(res) {
						console.log(res.errMsg);
					}
				});
			},
			chooseImage: function(index) {
				const _this = this
				// 从相册/相机选择
				// 如需直接开相机或直接选相册，请只使用一个选项
				const sourceType = index === 0 ? ['camera'] : ['album']
				uni.chooseImage({
					count: 1, //默认9
					sizeType: ['original', 'compressed'], //可以指定是原图还是压缩图，默认二者都有
					sourceType: sourceType,
					success: function(res) {
						// TODO 真是上传照片
						_this.setData({
							imageSrc: res.tempFilePaths[0],
						})
						_this.loadImage();
					}
				});
			},
			getImageInfoEx:function(imageUrl,callBack){
				// #ifdef APP-PLUS
				plus.io.getImageInfo({
					src: imageUrl,
					success: function success(res) {
						callBack && callBack(res)
					},
					fail:function(err){
						console.log('err-->',err)
						uni.hideLoading()
					}
				 });
				// #endif
				// #ifdef H5 || MP
				uni.getImageInfo({
					src: imageUrl,
					success: function success(res) {
						callBack && callBack(res)
					},
					fail:function(err){
						console.log('err-->',err)
						uni.hideLoading()
					}
				 });
				// #endif
			},
			loadImage: function (img) {
				img ? this.imageSrc = img : ''
				var _this = this
				if(!_this.imageSrc){
					return
				}
				uni.showLoading({
					title: '图片加载中...',
				})

				_this.getImageInfoEx(_this.imageSrc,function(res){
						IMG_RATIO = res.width / res.height
						
						ORIGINAL_W = res.width
						ORIGINAL_H = res.height
						
						if(ORIGINAL_W>1000){
							ORIGINAL_W = 999
							ORIGINAL_H = ORIGINAL_W/IMG_RATIO
						}
						if(ORIGINAL_H>1000){
							ORIGINAL_H = 999
							ORIGINAL_W = ORIGINAL_H*IMG_RATIO
						}
						
						if (IMG_RATIO >= 1) {
							IMG_REAL_W = SCREEN_WIDTH
							IMG_REAL_H = SCREEN_WIDTH / IMG_RATIO
						} else {
							IMG_REAL_W = SCREEN_WIDTH * IMG_RATIO
							IMG_REAL_H = SCREEN_WIDTH
						}
						let minRange = IMG_REAL_W > IMG_REAL_H ? IMG_REAL_W : IMG_REAL_H
						
						let cutWidth = 0, cutHeight=0
						if(_this.fixed){
							// 固定比例
							cutWidth = _this.cropWidth > IMG_REAL_W?IMG_REAL_W:_this.cropWidth
							cutHeight = cutWidth / _this.fixedNumber[0] * _this.fixedNumber[1]
							
							if(cutHeight > IMG_REAL_H){
								cutHeight = IMG_REAL_H
								cutWidth = cutHeight / _this.fixedNumber[1] * _this.fixedNumber[0]
							}
						}else{
							// 非固定比例，按照给定的尺寸来
							cutWidth = _this.cropWidth > IMG_REAL_W ? IMG_REAL_W : _this.cropWidth
							cutHeight = _this.cropHeight > IMG_REAL_H ? IMG_REAL_H : _this.cropHeight
						}
						
						// 最大尺度裁切
						if(_this.maxCropper){
							if(_this.fixed){
								cutWidth = IMG_REAL_H > IMG_REAL_W?IMG_REAL_W:IMG_REAL_H
								cutHeight = cutWidth
							}else{
								cutWidth = IMG_REAL_W
								cutHeight = IMG_REAL_H
							}
						}
						
						INIT_DRAG_POSITION = minRange > INIT_DRAG_POSITION ? INIT_DRAG_POSITION : minRange
						
						// 根据图片的宽高显示不同的效果   保证图片可以正常显示
						if (IMG_RATIO >= 1) {
							// let cutT = Math.ceil((SCREEN_WIDTH / IMG_RATIO - (SCREEN_WIDTH / IMG_RATIO - INIT_DRAG_POSITION)) / 2);
							let cutT = Math.ceil((SCREEN_WIDTH / IMG_RATIO - cutHeight) / 2);
							let cutB = cutT;
							let cutL = Math.ceil((SCREEN_WIDTH - cutWidth) / 2);
							let cutR = cutL;
							_this.setData({
								cropperW: SCREEN_WIDTH,
								cropperH: SCREEN_WIDTH / IMG_RATIO,
								// 初始化left right
								cropperL: Math.ceil((SCREEN_WIDTH - SCREEN_WIDTH) / 2),
								cropperT: Math.ceil((SCREEN_WIDTH - SCREEN_WIDTH / IMG_RATIO) / 2),
								cutL: cutL,
								cutT: cutT,
								cutR: cutR,
								cutB: cutB,
								// 图片缩放值
								imageW: IMG_REAL_W,
								imageH: IMG_REAL_H,
								// 图片原始尺寸
								originalW: ORIGINAL_W,
								originalH: ORIGINAL_H,
								
								scaleP: IMG_REAL_W / SCREEN_WIDTH,
								qualityWidth: DRAW_IMAGE_W,
								innerAspectRadio: IMG_RATIO
							})
						} else {
							let cutL = Math.ceil((SCREEN_WIDTH * IMG_RATIO - cutWidth) / 2);
							let cutR = cutL;
							let cutT = Math.ceil((SCREEN_WIDTH - cutHeight) / 2);
							let cutB = cutT;
							_this.setData({
								cropperW: SCREEN_WIDTH * IMG_RATIO,
								cropperH: SCREEN_WIDTH,
								// 初始化left right
								cropperL: Math.ceil((SCREEN_WIDTH - SCREEN_WIDTH * IMG_RATIO) / 2),
								cropperT: Math.ceil((SCREEN_WIDTH - SCREEN_WIDTH) / 2),
					
								cutL: cutL,
								cutT: cutT,
								cutR: cutR,
								cutB: cutB,
								// 图片缩放值
								imageW: IMG_REAL_W,
								imageH: IMG_REAL_H,
								// 图片原始尺寸
								originalW: ORIGINAL_W,
								originalH: ORIGINAL_H,
								scaleP: IMG_REAL_W / SCREEN_WIDTH,
								qualityWidth: DRAW_IMAGE_W,
								innerAspectRadio: IMG_RATIO
							})
						}
						_this.setData({
							isShowImg: true
						})
						uni.hideLoading()
				})
			},
			// 拖动时候触发的touchStart事件
			contentStartMove(e) {
				PAGE_X = e.touches[0].pageX
				PAGE_Y = e.touches[0].pageY
			},

			// 拖动时候触发的touchMove事件
			contentMoveing(e) {
				if(!this.canMove){
					return
				}
				var _this = this
				var dragLengthX = (PAGE_X - e.touches[0].pageX) * DRAFG_MOVE_RATIO
				var dragLengthY = (PAGE_Y - e.touches[0].pageY) * DRAFG_MOVE_RATIO
				// 左移
				if (dragLengthX > 0) {
					if (this.cutL - dragLengthX < 0) dragLengthX = this.cutL
				} else {
					if (this.cutR + dragLengthX < 0) dragLengthX = -this.cutR
				}

				if (dragLengthY > 0) {
					if (this.cutT - dragLengthY < 0) dragLengthY = this.cutT
				} else {
					if (this.cutB + dragLengthY < 0) dragLengthY = -this.cutB
				}
				this.setData({
					cutL: this.cutL - dragLengthX,
					cutT: this.cutT - dragLengthY,
					cutR: this.cutR + dragLengthX,
					cutB: this.cutB + dragLengthY
				})

				PAGE_X = e.touches[0].pageX
				PAGE_Y = e.touches[0].pageY
			},

			contentTouchEnd() {

			},
			getLocalFilePath(path) {
			    if (path.indexOf('_www') === 0 || path.indexOf('_doc') === 0 || path.indexOf('_documents') === 0 || path.indexOf('_downloads') === 0) {
			        return path
			    }
			    if (path.indexOf('file://') === 0) {
			        return path
			    }
			    if (path.indexOf('/storage/emulated/0/') === 0) {
			        return path
			    }
			    if (path.indexOf('/') === 0) {
			        var localFilePath = plus.io.convertAbsoluteFileSystem(path)
			        if (localFilePath !== path) {
			            return localFilePath
			        } else {
			            path = path.substr(1)
			        }
			    }
			    return '_www/' + path
			},
			pathToBase64(path) {
				const _this = this
				return new Promise(function(resolve, reject) {
					if (typeof window === 'object' && 'document' in window) {
						if (typeof FileReader === 'function') {
							var xhr = new XMLHttpRequest()
							xhr.open('GET', path, true)
							xhr.responseType = 'blob'
							xhr.onload = function() {
								if (this.status === 200) {
									let fileReader = new FileReader()
									fileReader.onload = function(e) {
										resolve(e.target.result)
									}
									fileReader.onerror = reject
									fileReader.readAsDataURL(this.response)
								}
							}
							xhr.onerror = reject
							xhr.send()
							return
						}
						var canvas = document.createElement('canvas')
						var c2x = canvas.getContext('2d')
						var img = new Image
						img.onload = function() {
							canvas.width = img.width
							canvas.height = img.height
							c2x.drawImage(img, 0, 0)
							resolve(canvas.toDataURL())
							canvas.height = canvas.width = 0
						}
						img.onerror = reject
						img.src = path
						return
					}
					if (typeof plus === 'object') {
						plus.io.resolveLocalFileSystemURL(_this.getLocalFilePath(path), function(entry) {
							entry.file(function(file) {
								var fileReader = new plus.io.FileReader()
								fileReader.onload = function(data) {
									resolve(data.target.result)
								}
								fileReader.onerror = function(error) {
									reject(error)
								}
								fileReader.readAsDataURL(file)
							}, function(error) {
								reject(error)
							})
						}, function(error) {
							reject(error)
						})
						return
					}
					if (typeof wx === 'object' && wx.canIUse('getFileSystemManager')) {
						wx.getFileSystemManager().readFile({
							filePath: path,
							encoding: 'base64',
							success: function(res) {
								resolve('data:image/jpeg;base64,' + res.data)
							},
							fail: function(error) {
								reject(error)
							}
						})
						return
					}
					reject(new Error('not support'))
				})
			},
			
			// 获取图片
			getImageInfo() {
				var _this = this;
				if(!_this.isShowImg){
					uni.showToast({
					    title: '请先选择照片',
					    duration: 1000,
						icon:'none'
					});
					return
				}
				uni.showLoading({
					title: _this.saveLoading,
				});
				// #ifdef APP-PLUS || H5
				_this.pathToBase64(_this.imageSrc).then(base64_avatar => {
					// 将图片写入画布
					_this.writeImage(base64_avatar)
				}).catch(err=>{
					console.log('转换64抱错',err)
				})
				// #endif
				// #ifdef MP
				_this.writeImage(_this.imageSrc)
				// #endif
			},
			writeImage(path){
				const _this = this 
				// 将图片写入画布
				const ctx = uni.createCanvasContext('myCanvas',_this);
				ctx.drawImage(path, 0, 0, _this.original?ORIGINAL_W:IMG_REAL_W, _this.original?ORIGINAL_H:IMG_REAL_H);
				ctx.draw(true, () => {
					// 获取画布要裁剪的位置和宽度   均为百分比 * 画布中图片的宽度    
					// 保证了在微信小程序中裁剪的图片模糊  位置不对的问题 canvasT = (_this.cutT / _this.cropperH) * (_this.imageH / pixelRatio)
					var canvasW = ((_this.cropperW - _this.cutL - _this.cutR) / _this.cropperW) * (_this.original?ORIGINAL_W:IMG_REAL_W);
					var canvasH = ((_this.cropperH - _this.cutT - _this.cutB) / _this.cropperH) * (_this.original?ORIGINAL_H:IMG_REAL_H);
					var canvasL = (_this.cutL / _this.cropperW) * (_this.original?ORIGINAL_W:IMG_REAL_W);
					var canvasT = (_this.cutT / _this.cropperH) * (_this.original?ORIGINAL_H:IMG_REAL_H);
					uni.canvasToTempFilePath({
						x: canvasL,
						y: canvasT,
						width: canvasW,
						height: canvasH,
						destWidth: canvasW,
						destHeight: canvasH,
						quality: _this.quality || 1,
						fileType: _this.fileType || 'jpg',
						canvasId: 'myCanvas',
						success: function (res) {
							uni.hideLoading()
							_this.$emit('uploadSuccess',res.tempFilePath)
						},
						fail:function(err){
							console.log('绘制图像抱错->',err)
						}
					},_this);
				});
			},
			// 设置大小的时候触发的touchStart事件
			dragStart(e) {
				T_PAGE_X = e.touches[0].pageX
				T_PAGE_Y = e.touches[0].pageY
				CUT_L = this.cutL
				CUT_R = this.cutR
				CUT_B = this.cutB
				CUT_T = this.cutT
			},

			// 设置大小的时候触发的touchMove事件
			dragMove(e) {
				if(!this.canScale){
					return
				}
				var _this = this
				var dragType = e.target.dataset.drag
				switch (dragType) {
					case 'right':
						_this.dragMoveBottomAndRight(e,'right')
						break;
					case 'left':
						_this.dragMoveLeftAndBottom(e)
						break;
					case 'top':
						_this.dragMoveTopAndRight(e)
						break;
					case 'bottom':
						_this.dragMoveBottomAndRight(e)
						break;
					case 'rightBottom':
						_this.dragMoveBottomAndRight(e)
						break;
					default:
						break;
				}
			},
			// 上移动
			dragMoveTopAndRight(e){
				const _this = this
				if(_this.fixed){
					
					var dragLengthY = (T_PAGE_Y - e.touches[0].pageY) * DRAFG_MOVE_RATIO
					if (CUT_T - dragLengthY < 0) dragLengthY = CUT_T
					if ((CUT_T - dragLengthY) > (_this.cropperH - _this.cutB)) dragLengthY = CUT_T - (_this.cropperH - _this.cutB)
					
					var dragLengthX = dragLengthY/_this.fixedNumber[1]*_this.fixedNumber[0]
					
					if (CUT_R - dragLengthX < 0) dragLengthX = CUT_R
					
					if(CUT_T - dragLengthY <= 0){
						return
					}
					if(CUT_R - dragLengthX <= 0){
						return
					}
					
					let cutR = CUT_R - dragLengthX
					let cutT = CUT_T - dragLengthY
					
					// calc min height and width
					if(_this.cropperH - cutT - _this.cutB < _this.minHeight){
						cutT = _this.cropperH - _this.cutB - _this.minHeight
						cutR = _this.cropperW - _this.cutL - _this.minHeight / _this.fixedNumber[1]*_this.fixedNumber[0]
					}
					if(_this.cropperW - _this.cutL - cutR < _this.minWidth){
						cutR = _this.cropperW - _this.cutL - _this.minWidth
						cutT = _this.cropperH - _this.cutB - _this.minWidth / _this.fixedNumber[0]*_this.fixedNumber[1]
					}
					this.setData({
						cutR: cutR,
						cutT: cutT,
					})
				}else{
					var dragLength = (T_PAGE_Y - e.touches[0].pageY) * DRAFG_MOVE_RATIO
					if (CUT_T - dragLength < 0) dragLength = CUT_T
					if ((CUT_T - dragLength) > (this.cropperH - this.cutB)) dragLength = CUT_T - (this.cropperH - this.cutB)
					
					let cutT = CUT_T - dragLength
					
					if(_this.cropperH- _this.cutB - cutT < _this.minHeight){
						cutT = _this.cropperH - _this.cutB - _this.minHeight
					}
					this.setData({
						cutT: cutT
					})
				}
			},
			// 左移动
			dragMoveLeftAndBottom(e){
				const _this = this
				if(_this.fixed){
					var dragLengthX = (T_PAGE_X - e.touches[0].pageX) * DRAFG_MOVE_RATIO
					if (CUT_L - dragLengthX < 0) dragLengthX = CUT_L
					
					if ((CUT_L - dragLengthX) > (_this.cropperW - _this.cutR)) dragLengthX = CUT_L - (_this.cropperW - _this.cutR)
					
					var dragLengthY = dragLengthX/_this.fixedNumber[0]*_this.fixedNumber[1]
					if (CUT_B - dragLengthY < 0) dragLengthY = CUT_B
					
					if(CUT_L - dragLengthX <= 0){
						return
					}
					if(CUT_B - dragLengthY <= 0){
						return
					}
					
					let cutL = CUT_L - dragLengthX
					let cutB = CUT_B - dragLengthY
					
					// calc min height and width
					if(_this.cropperH - cutB - _this.cutT < _this.minHeight){
						cutB = _this.cropperH - _this.cutT - _this.minHeight
						cutL = _this.cropperW - _this.cutR - _this.minHeight / _this.fixedNumber[1]*_this.fixedNumber[0]
					}
					if(_this.cropperW - _this.cutR - cutL < _this.minWidth){
						cutL = _this.cropperW - _this.cutR - _this.minWidth
						cutB = _this.cropperH - _this.cutT - _this.minWidth / _this.fixedNumber[0]*_this.fixedNumber[1]
					}
					this.setData({
						cutL: cutL,
						cutB: cutB,
					})
				}else{
					var dragLength = (T_PAGE_X - e.touches[0].pageX) * DRAFG_MOVE_RATIO
					if (CUT_L - dragLength < 0) dragLength = CUT_L
					if ((CUT_L - dragLength) > (this.cropperW - this.cutR)) dragLength = CUT_L - (this.cropperW - this.cutR)
					
					let cutL = CUT_L - dragLength
					
					if(_this.cropperW - _this.cutR - cutL < _this.minWidth){
						cutL = _this.cropperW - _this.cutR - _this.minWidth
					}
					this.setData({
						cutL: cutL
					})
				}
			},
			// 下移动 、下移动
			dragMoveBottomAndRight(e,x){
				const _this = this
				let cutB = 0,cutR=0,cutL=0,cutT=0
				if(_this.fixed){
					if(x && e.touches[0].pageX > 0){
						var dragLengthX = (T_PAGE_X - e.touches[0].pageX) * DRAFG_MOVE_RATIO
						var dragLengthY = dragLengthX/_this.fixedNumber[0]*_this.fixedNumber[1]
						
						if (CUT_B + dragLengthY < 0) dragLengthY = -CUT_B
						if (CUT_R + dragLengthX < 0) dragLengthX = -CUT_R
						
						if((CUT_R + dragLengthX===0)){
							return
						}
						if((CUT_B + dragLengthY===0)){
							return
						}
						cutB = CUT_B + dragLengthY;
						cutR = CUT_R + dragLengthX;
					}
					if(!x && e.touches[0].pageY > 0){
						var dragLengthY = (T_PAGE_Y - e.touches[0].pageY) * DRAFG_MOVE_RATIO
						var dragLengthX = dragLengthY/_this.fixedNumber[1]*_this.fixedNumber[0]
						
						if (CUT_B + dragLengthY < 0) dragLengthY = -CUT_B
						if (CUT_R + dragLengthX < 0) dragLengthX = -CUT_R
						// 固定比利时如果一边超出范围直接返回
						if((CUT_R + dragLengthX===0)){
							return
						}
						if((CUT_B + dragLengthY===0)){
							return
						}
						cutB = CUT_B + dragLengthY;
						cutR = CUT_R + dragLengthX;
					}
					// calc min height and width
					if(_this.cropperH - cutB - _this.cutT < _this.minHeight){
						cutB = _this.cropperH - _this.cutT - _this.minHeight
						cutR = _this.cropperW - _this.cutL - _this.minHeight / _this.fixedNumber[1]*_this.fixedNumber[0]
					}
					if(_this.cropperW - cutR - _this.cutL < _this.minWidth){
						cutR = _this.cropperW - _this.cutL - _this.minWidth
						cutB = _this.cropperH - _this.cutT - _this.minWidth / _this.fixedNumber[0]*_this.fixedNumber[1]
					}
				}else{
					var dragLengthX = (T_PAGE_X - e.touches[0].pageX) * DRAFG_MOVE_RATIO
					var dragLengthY = (T_PAGE_Y - e.touches[0].pageY) * DRAFG_MOVE_RATIO
					
					if (CUT_B + dragLengthY < 0) dragLengthY = -CUT_B
					if (CUT_R + dragLengthX < 0) dragLengthX = -CUT_R
					cutB = CUT_B + dragLengthY;
					cutR = CUT_R + dragLengthX;
					
					// calc min height and width
					if(_this.cropperH - cutB - _this.cutT < _this.minHeight){
						cutB = _this.cropperH - _this.cutT - _this.minHeight
						cutR = _this.cropperW - _this.cutL - _this.minWidth
					}
					if(_this.cropperW - cutR - _this.cutL < _this.minWidth){
						cutB = _this.cropperH - _this.cutT - _this.minHeight
						cutR = _this.cropperW - _this.cutL - _this.minWidth
					}
				}
				this.setData({
					cutB: cutB,
					cutR: cutR
				})
			}
		}
	}
</script>

<style>
	.cropper-config {
		padding: 50rpx 40rpx;
		display: flex;
		justify-content: space-between;
	}

	.cropper-choose,.cropper-confirm{
		
		height: 80rpx;
		line-height: 80rpx;
		border-radius: 8rpx;
		text-align: center;
		width: 100%;
		font-size: 30rpx;
		font-weight: 600;
	}
	
	.page-body{
		width: calc(100vw);
	}

	.cropper-content {
		width: 100%;
		touch-action: none;
	}

	.uni-corpper {
		position: relative;
		overflow: hidden;
		-webkit-user-select: none;
		-moz-user-select: none;
		-ms-user-select: none;
		user-select: none;
		-webkit-tap-highlight-color: transparent;
		-webkit-touch-callout: none;
		box-sizing: border-box;
		background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQAQMAAAAlPW0iAAAAA3NCSVQICAjb4U/gAAAABlBMVEXMzMz////TjRV2AAAACXBIWXMAAArrAAAK6wGCiw1aAAAAHHRFWHRTb2Z0d2FyZQBBZG9iZSBGaXJld29ya3MgQ1M26LyyjAAAABFJREFUCJlj+M/AgBVhF/0PAH6/D/HkDxOGAAAAAElFTkSuQmCC);
	}

	.uni-corpper-content {
		position: relative;
	}

	.uni-corpper-content image {
		display: block;
		width: 100%;
		min-width: 0 !important;
		max-width: none !important;
		height: 100%;
		min-height: 0 !important;
		max-height: none !important;
		image-orientation: 0deg !important;
		margin: 0 auto;
	}
	/* 移动图片效果 */

	.uni-cropper-drag-box {
		position: absolute;
		top: 0;
		right: 0;
		bottom: 0;
		left: 0;
		cursor: move;
		background: rgba(0, 0, 0, 0.6);
		z-index: 1;
	}
	/* 内部的信息 */
	
	.cropper-modal{
		background: rgba(0, 0, 0, 0.5);
		position: absolute;
		top: 0;
		right: 0;
		bottom: 0;
		left: 0;
		user-select: none;
		z-index: 1;
	}
	.cropper-modal-box{
		position: absolute;
		overflow:hidden;
		z-index:99;
	}

	.uni-corpper-crop-box {
		position: absolute;
		background: rgba(255, 255, 255, 0);
		z-index: 99;
	}

	.uni-corpper-crop-box .uni-cropper-view-box {
		position: relative;
		display: block;
		width: 100%;
		height: 100%;
		overflow: visible;
		outline: 1rpx solid #69f;
		outline-color: rgba(102, 153, 255, .75)
	}
	/* 横向虚线 */

	.uni-cropper-dashed-h {
		position: absolute;
		top: 33.33333333%;
		left: 0;
		width: 100%;
		height: 33.33333333%;
		border-top: 1rpx dashed rgba(255, 255, 255, 0.5);
		border-bottom: 1rpx dashed rgba(255, 255, 255, 0.5);
	}
	/* 纵向虚线 */

	.uni-cropper-dashed-v {
		position: absolute;
		left: 33.33333333%;
		top: 0;
		width: 33.33333333%;
		height: 100%;
		border-left: 1rpx dashed rgba(255, 255, 255, 0.5);
		border-right: 1rpx dashed rgba(255, 255, 255, 0.5);
	}
	/* 四个方向的线  为了之后的拖动事件*/
	.uni-cropper-line-t {
		position: absolute;
		display: block;
		width: 100%;
		background-color: #69f;
		top: 0;
		left: 0;
		height: 1rpx;
		opacity: 0.1;
		cursor: n-resize;
	}

	.uni-cropper-line-t::before {
		content: '';
		position: absolute;
		top: 50%;
		right: 0rpx;
		width: 100%;
		-webkit-transform: translate3d(0, -50%, 0);
		transform: translate3d(0, -50%, 0);
		bottom: 0;
		height: 41rpx;
		background: transparent;
		z-index: 11;
	}

	.uni-cropper-line-r {
		position: absolute;
		display: block;
		background-color: #69f;
		top: 0;
		right: 0rpx;
		width: 1rpx;
		opacity: 0.1;
		height: 100%;
		cursor: e-resize;
	}

	.uni-cropper-line-r::before {
		content: '';
		position: absolute;
		top: 0;
		left: 50%;
		width: 41rpx;
		-webkit-transform: translate3d(-50%, 0, 0);
		transform: translate3d(-50%, 0, 0);
		bottom: 0;
		height: 100%;
		background: transparent;
		z-index: 11;
	}

	.uni-cropper-line-b {
		position: absolute;
		display: block;
		width: 100%;
		background-color: #69f;
		bottom: 0;
		left: 0;
		height: 1rpx;
		opacity: 0.1;
		cursor: s-resize;
	}

	.uni-cropper-line-b::before {
		content: '';
		position: absolute;
		top: 50%;
		right: 0rpx;
		width: 100%;
		-webkit-transform: translate3d(0, -50%, 0);
		transform: translate3d(0, -50%, 0);
		bottom: 0;
		height: 41rpx;
		background: transparent;
		z-index: 11;
	}

	.uni-cropper-line-l {
		position: absolute;
		display: block;
		background-color: #69f;
		top: 0;
		left: 0;
		width: 1rpx;
		opacity: 0.1;
		height: 100%;
		cursor: w-resize;
	}

	.uni-cropper-line-l::before {
		content: '';
		position: absolute;
		top: 0;
		left: 50%;
		width: 41rpx;
		-webkit-transform: translate3d(-50%, 0, 0);
		transform: translate3d(-50%, 0, 0);
		bottom: 0;
		height: 100%;
		background: transparent;
		z-index: 11;
	}

	.uni-cropper-point {
		width: 5rpx;
		height: 5rpx;
		background-color: #69f;
		opacity: .75;
		position: absolute;
		z-index: 3;
	}

	.point-t {
		top: -3rpx;
		left: 50%;
		margin-left: -3rpx;
		cursor: n-resize;
	}

	.point-tr {
		top: -3rpx;
		left: 100%;
		margin-left: -3rpx;
		cursor: n-resize;
	}

	.point-r {
		top: 50%;
		left: 100%;
		margin-left: -3rpx;
		margin-top: -3rpx;
		cursor: n-resize;
	}

	.point-rb {
		left: 100%;
		top: 100%;
		-webkit-transform: translate3d(-50%, -50%, 0);
		transform: translate3d(-50%, -50%, 0);
		cursor: n-resize;
		width: 36rpx;
		height: 36rpx;
		background-color: #69f;
		position: absolute;
		z-index: 1112;
		opacity: 1;
	}

	.point-b {
		left: 50%;
		top: 100%;
		margin-left: -3rpx;
		margin-top: -3rpx;
		cursor: n-resize;
	}

	.point-bl {
		left: 0%;
		top: 100%;
		margin-left: -3rpx;
		margin-top: -3rpx;
		cursor: n-resize;
	}

	.point-l {
		left: 0%;
		top: 50%;
		margin-left: -3rpx;
		margin-top: -3rpx;
		cursor: n-resize;
	}

	.point-lt {
		left: 0%;
		top: 0%;
		margin-left: -3rpx;
		margin-top: -3rpx;
		cursor: n-resize;
	}
	/* 裁剪框预览内容 */

	.uni-cropper-viewer {
		position: relative;
		width: 100%;
		height: 100%;
		overflow: hidden;
	}

	.uni-cropper-viewer image {
		position: absolute;
		z-index: 2;
	}
	
	.show-crop-img{
		position: absolute;
		top: -100rpx;
		left: 0;
		right: 0;
	}
</style>
