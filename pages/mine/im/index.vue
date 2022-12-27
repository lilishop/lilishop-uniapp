<template>
	<view>
		<u-navbar class="my-title" title-size="32" back-text="" :title="toUser.name"></u-navbar>
		<!-- 空盒子用来防止消息过少时 拉起键盘会遮盖消息 -->
		<view :animation="anData" style="height:0;">
		</view>
		<!-- 消息体 -->
		<!-- 用来获取消息体高度 -->
		<view id="msgList">
			<!-- 消息 -->
			<view class="flex-column-start" v-for="(item, index) in msgList" :key="index">
				<view class="flex-row-start column-time">
					<view v-show="compareTime(index, item.createTime)" class="flex-row-start date-text"
						v-text="beautifyTime(item.createTime)">
					</view>
				</view>
				<!-- 用户消息 头像可选加入-->
				<view v-if="item.my" class="flex justify-end padding-right one-show  align-start  padding-top">
					<!-- <image class="chat-img flex-row-center" :src="'https://ikeeppet.oss-cn-zhangjiakou.aliyuncs.com/028b7818b78c47ef8f87a7faa1098faf.jpg'" mode="aspectFill" ></image>	 -->

					<view class="flex justify-end" style="width: 400rpx;margin-top: 12px;">
						<view>
							<view class="user-name">{{ user.nickName }}</view>
							<view class="margin-left padding-chat bg-user-orang" style="border-radius: 35rpx;">
								<text style="word-break: break-all;">{{ item.text }}</text>
							</view>
						</view>
					</view>
					<view>
						<u-avatar :src="user.face" :text="user.face ? '' : user.name" bg-color="#DDDDDD"></u-avatar>
						<!-- <u-image class="chat-img margin-left" style="height: 100rpx;width: 100rpx;" shape="circle"
							:src="user.face || 'https://avatars.dicebear.com/api/initials/' + user.nickName + '.svg?fontSize=38'"
							mode="aspectFill"></u-image> -->
					</view>
					
				</view>
				<!-- 接收人消息 -->
				<view v-else class="flex-row-start margin-left margin-top one-show">
					<view class="chat-img flex-row-center">
						<u-avatar :src="toUser.face" :text="toUser.face ? '' : toUser.name"
							bg-color="#DDDDDD"></u-avatar>
						<!-- <u-image style="height: 100rpx;width: 100rpx;" shape="circle"
							:src="toUser.face || 'https://avatars.dicebear.com/api/initials/' + toUser.name + '.svg?fontSize=38'"
							mode="aspectFit"></u-image> -->
					</view>
					<view class="flex" style="width: 500rpx;">
						<view>
							<view class="other-name">{{ toUser.name }}</view>
							<view class="margin-left padding-chat flex-column-start bg-to-color"
								style="border-radius: 35rpx;">
								<text style="word-break: break-all;">{{ item.text }}</text>
							</view>
						</view>

					</view>
				</view>
			</view>
			<!-- loading是显示 -->
			<view v-show="msgLoad" class="flex-row-start margin-left margin-top">
				<view class="chat-img flex-row-center">
					<!-- <image style="height: 75rpx;width: 75rpx;" src="../../static/image/robt.png" mode="aspectFit"></image> -->
				</view>
				<view class="flex" style="width: 500rpx;">
					<view class="margin-left padding-chat flex-column-start"
						style="border-radius: 35rpx;background-color: #f9f9f9;">
						<view class="cuIcon-loading turn-load" style="font-size: 35rpx;color: #3e9982;">

						</view>
					</view>
				</view>
			</view>
			<!-- 防止消息底部被遮 -->
			<view style="height: 120rpx;">
			</view>
		</view>
		<!-- 底部导航栏 -->
		<view class="flex-column-center" style="position: fixed;bottom: -180px;" :animation="animationData">
			<view class="bottom-dh-char flex-row-around" style="font-size: 55rpx;">
				<!-- vue无法使用软键盘"发送" -->
				<input v-model="msg" class="dh-input" type="text" style="background-color: #f0f0f0;" @confirm="sendMsg"
					confirm-type="search" placeholder-class="my-neirong-sm" placeholder="用一句简短的话描述您的问题" />
				<view @click="sendMsg" class="cu-tag bg-cyan round">
					发送
				</view>
				<!-- <text @click="ckAdd" class="cuIcon-roundaddfill text-brown"></text> -->
			</view>
			<!-- 附加栏(自定义) -->
			<view class="box-normal flex-row-around flex-wrap">
				<view class="tb-text">
					<view class="cuIcon-form"></view>
					<text>问题反馈</text>
				</view>
				<view class="tb-text">
					<view class="cuIcon-form"></view>
					<text>人工客服</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
// rpx和px的比率
var l
// 可用窗口高度
var wh
// 顶部空盒子的高度
var mgUpHeight
import { getTalkMessage, getTalkByUser } from "@/api/im.js";
import SocketService from "@/utils/socket_service.js";
import storage from "@/utils/storage.js";
import { beautifyTime } from "@/utils/filters.js"
export default {
	onLoad(options) {
		// 如果需要缓存消息缓存msgList即可
		// 监听键盘拉起
		// 因为无法控制键盘拉起的速度,所以这里尽量以慢速处理
		uni.onKeyboardHeightChange(res => {
			const query = uni.createSelectorQuery()
			query.select('#msgList').boundingClientRect(data => {
				// 若消息体没有超过2倍的键盘则向下移动差值,防止遮住消息体
				var up = res.height * 2 - data.height - l * 110
				console.log(up)
				if (up > 0) {
					// 动态改变空盒子高度
					this.msgMove(up, 300)
					// 记录改变的值,若不收回键盘且发送了消息用来防止消息过多被遮盖
					mgUpHeight = up
				}
				// 收回
				if (res.height == 0) {
					this.msgMove(0, 0)
				}
			}).exec();
		})
		var query = uni.getSystemInfoSync()

		l = query.screenWidth / 750
		wh = query.windowHeight
		this.srcollHeight = (query.windowHeight - 44) + "px"
		this.user = storage.getUserInfo()
		this.toUser = storage.getTalkToUser()

		if (options.talkId) {
			this.params.talkId = options.talkId;
			this.getTalkMessage()
		} else {
			this.getTalk(options.userId)
			
		}

		this.ws.connect();
	},
	onPullDownRefresh() {
		this.params.pageNumber = this.params.pageNumber + 1
		this.getTalkMessage()
		console.log('下拉事件');
		setTimeout(function () {
			uni.stopPullDownRefresh();
		}, 1000);
	},
	components: {
		beautifyTime
	},
	data() {
		return {
			msgLoad: false,
			anData: {},
			animationData: {},
			msgList: [],
			oldHeight: 0,
			params: {	//搜索条件
				talkId: '',
				pageSize: 10,
				pageNumber: 1,
			},
			goToIndex: 0, // 前往位置
			msg: "",
			go: 0,
			newMessageNum: 0,
			user: {},
			toUser: {},
			srcollHeight: 0,
			ws: new SocketService(),
		}
	},
	watch: {
		'ws.callBackMapping': {
			handler: function (val) {
				val = JSON.parse(val)
				if (val.messageResultType == 'MESSAGE') {
					this.msgList.push(val.result)
				}
				this.newMessageNum++;
				console.log(this.msgList)
				//接收到消息后发送已读
				let msg = val
				msg.operation_type = 'READ'
				this.ws.send(JSON.stringify(msg))
			}
		}
	},
	methods: {
		beautifyTime,
		// 切换输入法时移动输入框(按照官方的上推页面的原理应该会自动适应不同的键盘高度-->官方bug)
		goPag(kh) {
			this.upTowmn(0, 250)
			if (this.keyHeight != 0) {
				if (kh - this.keyHeight > 0) {
					this.upTowmn(this.keyHeight - kh, 250)
				}

			}
		},
		// 移动顶部的空盒子
		msgMove(x, t) {
			var animation = uni.createAnimation({
				duration: t,
				timingFunction: 'linear',
			})

			this.animation = animation

			animation.height(x).step()

			this.anData = animation.export()
		},
		// 保持消息体可见
		msgGo(type) {
			const query = uni.createSelectorQuery()
			// 延时100ms保证是最新的高度
			setTimeout(() => {
				// 获取消息体高度
				query.select('#msgList').boundingClientRect(data => {

					// 如果超过scorll高度就滚动scorll
					if (type == 'up') {
						this.go = data.height - this.oldHeight
					} else if (type == 'down') {
						this.go = data.height - wh + 120
					}
					// if (this.oldHeight > 0) {
					// 	this.go = data.height - this.oldHeight
					// } else {
					// 	// if (data.height - (wh - 32) > 0) {
					// 	this.go = data.height - wh + 120
					// }
					// 保证键盘第一次拉起时消息体能保持可见
					var moveY = wh - data.height
					// 超出页面则缩回空盒子
					if (moveY - mgUpHeight < 0) {
						// 小于0则视为0
						if (moveY < 0) {
							this.msgMove(0, 200)
						} else {
							// 否则缩回盒子对应的高度
							this.msgMove(moveY, 200)
						}
					}
					uni.pageScrollTo({
						scrollTop: this.go,
						duration: 0
					})
					this.oldHeight = data.height
				}).exec();
			}, 100)
		},
		// 回答问题的业务逻辑
		answer(id) {
			// 这里应该传入问题的id,模拟就用index代替了
			console.log(id)

		},
		sendMsg() {
			console.log("发送")
			// 消息为空不做任何操作
			if (this.msg == "") {
				return 0;
			}
			// 显示消息 msg消息文本,my鉴别是谁发的消息(不能用俩个消息数组循环,否则消息不会穿插)
			let msg = {
				operation_type: "MESSAGE",
				to: this.toUser.userId,
				from: this.user.id,
				message_type: "MESSAGE",
				context: this.msg,
				talk_id: this.params.talkId,
			}
			this.ws.send(JSON.stringify(msg))
			this.msgList.push({ "text": this.msg, "my": true })
			// 保证消息可见
			let type = 'down';
			this.msgGo(type)
			// 回答问题
			// this.msgKf(this.msg)
			// 清除消息
			this.msg = ""
		},
		// msgKf(x) {
		// 	// loading
		// 	// this.msgLoad = true
		// 	// 这里连接服务器获取答案

		// 	// 下面模拟请求
		// 	// setTimeout(() => {
		// 	// 	// 取消loading
		// 	// 	this.msgLoad = false
		// 	// 	// this.msgGo()
		// 	// }, 2000)
		// },
		// 不建议输入框聚焦时操作此动画
		ckAdd() {
			if (!this.showTow) {
				this.upTowmn(-180, 350)
			} else {
				this.upTowmn(0, 200)
			}
			this.showTow = !this.showTow
		},
		hideKey() {
			uni.hideKeyboard()
		},
		// 拉起/收回附加栏
		upTowmn(x, t) {

			var animation = uni.createAnimation({
				duration: t,
				timingFunction: 'ease',
			})

			this.animation = animation

			animation.translateY(x).step()

			this.animationData = animation.export()
		},
		async getTalkMessage() {
			let type = '';
			await getTalkMessage(this.params).then(res => {
				if (res.data.success) {
					if (this.msgList.length >= 10) {
						this.msgList.unshift(...res.data.result)
						type = 'up'
					} else {
						this.msgList = res.data.result
						type = 'down'
					}
					this.msgList.forEach(item => {
						if (item.fromUser === this.user.id) {
							item.my = true
						}
					})
				}
			})
			this.msgGo(type)
		},
		touchmovemsg(e) {
			if (e.target.scrollTop == 0) {
				this.params.pageNumber = this.params.pageNumber + 1
				this.getTalkMessage()
			}

		},
		async getTalk(userId) {
			getTalkByUser(userId).then(res => {
				if (res.data.success) {
					this.toUser = res.data.result
					this.params.talkId = res.data.result.id
					this.getTalkMessage()
				}
			})
		},
		// 处理消息时间是否显示
		compareTime(index, datetime) {
			if (datetime == undefined) {
				return false;
			}
			if (typeof datetime == "number") {
				datetime = this.unixToDate(datetime, "yyyy-MM-dd hh:mm");
			}

			if (this.msgList[index].is_revoke == 1) {
				return false;
			}

			datetime = datetime.replace(/-/g, "/");
			let time = Math.floor(Date.parse(datetime) / 1000);
			let currTime = Math.floor(new Date().getTime() / 1000);

			// 当前时间5分钟内时间不显示
			if (currTime - time < 300) return false;
			// 判断是否是最后一条消息,最后一条消息默认显示时间
			if (index == this.msgList.length - 1) {
				return true;
			}
			let nextDate
			if (this.msgList[index + 1]) {
				nextDate = this.msgList[index + 1].createTime.replace(/-/g, "/");
				if (nextDate - datetime < 300) return false;
			}

			return !(
				this.unixToDate(new Date(datetime), "{y}-{m}-{d} {h}:{i}") ==
				this.unixToDate(new Date(nextDate), "{y}-{m}-{d} {h}:{i}")
			);
		},

		/**
		 * 将unix时间戳转换为指定格式
		 * @param unix   时间戳【秒】
		 * @param format 转换格式
		 * @returns {*|string}
		 */
		unixToDate(unix, format) {
			if (!unix) return unix;
			let _format = format || "yyyy-MM-dd hh:mm:ss";
			const d = new Date(unix);
			const o = {
				"M+": d.getMonth() + 1,
				"d+": d.getDate(),
				"h+": d.getHours(),
				"m+": d.getMinutes(),
				"s+": d.getSeconds(),
				"q+": Math.floor((d.getMonth() + 3) / 3),
				S: d.getMilliseconds(),
			};
			if (/(y+)/.test(_format))
				_format = _format.replace(
					RegExp.$1,
					(d.getFullYear() + "").substr(4 - RegExp.$1.length)
				);
			for (const k in o)
				if (new RegExp("(" + k + ")").test(_format))
					_format = _format.replace(
						RegExp.$1,
						RegExp.$1.length === 1
							? o[k]
							: ("00" + o[k]).substr(("" + o[k]).length)
					);
			return _format;
		},
	}
}
</script>

<style>
.bottom-dh-char {
	background-color: #f9f9f9;
	width: 750rpx;
	height: 110rpx;
}

.user-name {
	text-align: right;
	font-size: 24rpx;
	color: #737373;
	margin-bottom: 10rpx;
	margin-right: 10rpx;
}

.other-name {
	text-align: left;
	font-size: 24rpx;
	color: #737373;
	margin-bottom: 10rpx;
	margin-left: 10rpx;
}

.column-time {
	justify-content: center;
}

.center-box {
	width: 720rpx;
	padding-left: 25rpx;
}

.hui-box {
	width: 750rpx;
	height: 100%;

}

.date-text {
	font-size: 12px;
	color: grey;
}

.dh-input {
	width: 500rpx;
	height: 65rpx;
	border-radius: 30rpx;
	padding-left: 15rpx;
	font-size: 35rpx;
	background-color: #FFFFFF;
}

.box-normal {
	width: 750rpx;
	height: 180px;
	background-color: #FFFFFF;
}

.tb-text view {
	font-size: 65rpx;
}

.tb-text text {
	font-size: 25rpx;
	color: #737373;
}

.chat-img {
	border-radius: 50%;
	width: 100rpx;
	height: 100rpx;
	background-color: #f7f7f7;
}

.padding-chat {
	padding: 17rpx 20rpx;
}

.tb-nv {
	width: 50rpx;
	height: 50rpx;
}
</style>

<style lang="scss" scoped>
@import "./index-app.scss";
</style>
