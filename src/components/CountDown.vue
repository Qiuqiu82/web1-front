<template>
  <div>
    <p v-if="msTime.show" style="margin: 0;">
      <span v-if="tipShow">{{tipText}}:</span>
      <span v-if="!tipShow">{{tipTextEnd}}:</span>
      <span v-if="msTime.day>0"><span>{{msTime.day}}</span><i>{{dayTxt}}</i></span>
      <span>{{msTime.hour}}</span><i>{{hourTxt}}</i>
      <span>{{msTime.minutes}}</span><i>{{minutesTxt}}</i>
      <span>{{msTime.seconds}}</span><i>{{secondsTxt}}</i>
    </p>
    <p v-if="!msTime.show">{{endText}}</p>
  </div>
</template>
<script>
  export default {
    replace: true,
    data () {
      return {
        tipShow: true,
        msTime: {
          show: false,
          day: '',
          hour: '',
          minutes: '',
          seconds: ''
        },
        star: '',
        end: '',
        current: '',
      }
    },
    watch: {
      currentTime: function (val, oldval) {
        this.gogogo();
      }
    },
    props: {
      tipText: {
        type: String,
        default: '距离开始'
      },
      tipTextEnd: {
        type: String,
        default: '距离结束'
      },
      id: {
        type: String,
        default: '1'
      },
      currentTime: {
        type: Number
      },
      startTime: {
        type: Number
      },
      endTime: {
        type: Number
      },
      endText: {
        type: String,
        default: '已结束'
      },
      dayTxt: {
        type: String,
        default: ':'
      },
      hourTxt: {
        type: String,
        default: ':'
      },
      minutesTxt: {
        type: String,
        default: ':'
      },
      secondsTxt: {
        type: String,
        default: ':'
      },
      secondsFixed: {
        type: Boolean,
        default: false
      },
    },
    mounted () {
      this.gogogo();
    },
    methods: {
      gogogo: function () {
        this.startTime.toString().length == 10 ? this.star = this.startTime * 1000 : this.star = this.startTime;
        this.endTime.toString().length == 10 ? this.end = this.endTime * 1000 : this.end = this.endTime;
        if (this.currentTime) {
          this.currentTime.toString().length == 10 ? this.current = this.currentTime * 1000 : this.current = this.currentTime;
        } else {
          this.current = ( new Date() ).getTime();
        }

        if (this.end < this.current) {
          this.msTime.show = false;
          this.end_message();
        }
        else if (this.current < this.star) {
          this.$set(this, 'tipShow', true);
          setTimeout(() => {
            this.runTime(this.star, this.current, this.start_message);
          }, 1);
        }
        else if (this.end > this.current && this.star < this.current || this.star == this.current) {
          this.$set(this, 'tipShow', false);
          this.msTime.show = true;
          this.$emit('start_callback', this.msTime.show);
          setTimeout(() => {
            this.runTime(this.end, this.current, this.end_message, true)
          }, 1);
        }
      },
      runTime (startTime, endTime, callFun, type) {
        let msTime = this.msTime;
        let timeDistance = startTime - endTime;
        if (timeDistance > 0) {
          this.msTime.show = true;
          msTime.day = Math.floor(timeDistance / 86400000);
          timeDistance -= msTime.day * 86400000;
          msTime.hour = Math.floor(timeDistance / 3600000);
          timeDistance -= msTime.hour * 3600000;
          msTime.minutes = Math.floor(timeDistance / 60000);
          timeDistance -= msTime.minutes * 60000;
          msTime.seconds = Math.floor(timeDistance / 1000).toFixed(0);
          timeDistance -= msTime.seconds * 1000;

          if (msTime.hour < 10) {
            msTime.hour = "0" + msTime.hour;
          }
          if (msTime.minutes < 10) {
            msTime.minutes = "0" + msTime.minutes;
          }
          if (msTime.seconds < 10) {
            msTime.seconds = "0" + msTime.seconds;
          }
          let _s = Date.now();
          let _e = Date.now();
          let diffPerFunc = _e - _s;
          setTimeout(() => {
            if (type) {
              this.runTime(this.end, endTime += 1000, callFun, true);
            } else {
              this.runTime(this.star, endTime += 1000, callFun);
            }
          }, 1000 - diffPerFunc)
        }
        else {
          callFun();
        }
      },
      start_message () {
        this.$set(this, 'tipShow', false);
        this.$emit('start_callback', this.msTime.show);
        setTimeout(() => {
          this.runTime(this.end, this.star, this.end_message, true)
        }, 1);
      },
      end_message(){
        this.msTime.show = false;
        if (this.currentTime <= 0) {
          return;
        }
        this.$emit('end_callback', this.msTime.show);
      }
    }
  }
</script>

