<template>
	<div class="dropdown-item">
		<!-- selected -->
		<view class="dropdown-item__selected" @click="changePopup">
			<slot name="title" v-if="$slots.title"></slot>
			<block v-else>
				<view class="selected__name">
					{{title ? title : selectItem.text}}
				</view>
				<!-- <view class="selected__icon"
					  :class="showClass === 'show'? 'up' : 'down'"
				>
					<span class="iconfont">&#xe851;</span>
				</view> -->
			</block>
		</view>
		<view class="dropdown-item__content" :style="{top: contentTop + 'px'}" v-if="showList">
			<!-- dropdown -->
			<view :class="['list', showClass]">
				<slot v-if="$slots.default"></slot>
				<block v-else>
					<view class="list__option" v-for="(item, index) in list" :key="index" @click="choose(item)">
						<view>{{item.text}}</view>
						<icon v-if="item.value === value" type="success_no_circle" size="26" />
					</view>
				</block>
			</view>
			<!-- dropdown-mask -->
			
			<!-- @touchmove 禁止滑动 -->
			<view @touchmove.stop.prevent="moveHandle" :class="['dropdown-mask', showClass]" v-if="showList" @click="closePopup"></view>
		</view>
	</div>
</template>

<script>
	export default {
		components: {},
		props: {
			value: [Number, String, Object],
			list: {
				type: Array,
				default: () => {
					return []
				}
			},
			title: [Number, String],
			contentTopReduse: {
				type: Number,
				default: 0
			}
		},
		data() {
			return {
				showList: "",
				showClass: '',
				selectItem: {},
				contentTop: 0
			}
		},
		watch: {},
		mounted() {
			this.showList = this.active;
			this.selectItem = this.list[this.value];
			// document.addEventListener('click', e => {
			// 	//this.$el 可以获取当前组件的容器节点
			// 	if (!this.$el.contains(e.target)) {
			// 		console.log('change');
			// 		this.close()
			// 	}
			// });
		},
		methods: {
			// 禁止滑动
			moveHandle() {},
			choose(item) {
				this.selectItem = item
				this.$emit('input', item.value)
				this.closePopup()
			},
			changePopup() {
				if (this.showList) {
					this.closePopup()
				} else {
					this.openPopup()
				}
			},
			openPopup() {
				// this.$parent  -> dropdown-menu
				this.$parent.$emit('close')
				this.showList = true
				this.$nextTick(() => {
					this.getElementData('.dropdown-item__selected', (data) => {
						this.contentTop = data[0].bottom - this.contentTopReduse;
						this.showClass = 'show'
					})
				})
			},
			closePopup() {
				this.showClass = ''
				setTimeout(() => {
					this.showList = false
				}, 300)
			},
			close() {
				this.showClass = ''
				this.showList = false
			},
			getElementData(el, callback) {
				uni.createSelectorQuery().in(this).selectAll(el).boundingClientRect().exec((data) => {
					callback(data[0]);
				});
			}
		}
	}
</script>

<style lang="scss">
	@font-face {
		font-family: 'iconfont';
		/* project id 1564327 */
		src: url('https://at.alicdn.com/t/font_1564327_fcszez4n5i.eot');
		src: url('https://at.alicdn.com/t/font_1564327_fcszez4n5i.eot?#iefix') format('embedded-opentype'),
			url('https://at.alicdn.com/t/font_1564327_fcszez4n5i.woff2') format('woff2'),
			url('https://at.alicdn.com/t/font_1564327_fcszez4n5i.woff') format('woff'),
			url('https://at.alicdn.com/t/font_1564327_fcszez4n5i.ttf') format('truetype'),
			url('https://at.alicdn.com/t/font_1564327_fcszez4n5i.svg#iconfont') format('svg');
	}

	.iconfont {
		font-family: "iconfont" !important;
		font-size: 28rpx;
		font-style: normal;
		-webkit-font-smoothing: antialiased;
		-webkit-text-stroke-width: 0.2px;
		-moz-osx-font-smoothing: grayscale;
	}

	.line {
		position: absolute;
		height: 3px;
		width: 100px;
		background: #1abc9c;
	}

	.dropdown-item {
		position: relative;

		&__selected {
			position: relative;
			display: flex;
			align-items: center;
			background: transparent;
			// padding: 10rpx;
			box-sizing: border-box;
			justify-content: center;

			.selected__name {
				font-size: 32rpx;
				white-space: nowrap;
				position: relative;

			}

			.selected__icon {
				margin-left: 8rpx;

				&.down {
					transition: transform .3s;
					transform: rotateZ(0);
				}

				&.up {
					transition: transform .3s;
					transform: rotateZ(-180deg);
				}
			}
		}

		&__content {
			position: fixed;
			left: 0;
			right: 0;
			overflow: hidden;
			top: 0;
			bottom: 0;
			z-index: 10;

			.list {
				max-height: 400px;
				overflow-y: auto;
				position: absolute;
				left: 0;
				right: 0;
				z-index: 3;
				background: #fff;
				transform: translateY(-100%);
				transition: all .3s;

				&.show {
					transform: translateY(0);
				}

				&__option {
					font-size: 32rpx;
					padding: 26rpx 28rpx;
					display: flex;
					justify-content: space-between;

					&:not(:last-child) {
						border-bottom: 1rpx solid #DDDDDD;
					}
				}
			}

			.dropdown-mask {
				position: absolute;
				left: 0;
				right: 0;
				top: 0;
				bottom: 0;
				transition: all .3s;
				z-index: 2;

				&.show {
					background: rgba(0, 0, 0, 0.5);
				}
			}
		}

		&:not(:last-child):after {
			content: ' ';
			position: absolute;
			width: 2rpx;
			top: 36rpx;
			bottom: 36rpx;
			right: 0;
			background: $uni-border-color;
		}
	}
</style>
