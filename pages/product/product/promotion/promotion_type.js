const promotion = [
  {
    title: "积分活动",
    value: "POINTS_GOODS",
  },
  {
    title: "砍价活动",
    value: "KANJIA",
  },
  {
    title: "限时直降",
    value: "FLASH_DISCOUNT",
  },
  {
    title: "第N件优惠",
    value: "NTH_ITEM_DISCOUNT",
  },
  {
    title: "团购",
    value: "GROUPBUY",
  },
  {
    title: "满减优惠",
    value: "FULL_DISCOUNT",
  },
  {
    title: "限时抢购",
    value: "SECKILL",
  },
  {
    title: "拼团",
    value: "PINTUAN",
  },
  {
    title: "优惠券",
    value: "COUPON",
  },
];
export default promotion
/**格式化 */
export function formatType(val){
    if(val != undefined){
        promotion.forEach(item=>{
            if(val == item.value){
                return item.title
            }
        })
    }
}
