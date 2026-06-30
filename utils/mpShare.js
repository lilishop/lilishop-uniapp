export default {
  onLoad() {
    if (!uni.$u) {
      uni.$u = {}
    }
    uni.$u.mpShare = {
      title: '',
      path: '',
      imageUrl: ''
    }
    this.$u.mpShare = uni.$u.mpShare
  },
  onShareAppMessage() {
    return this.$u.mpShare || uni.$u.mpShare
  }
}
