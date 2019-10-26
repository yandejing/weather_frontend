<template>
  <div>
    <el-form ref="form" v-model="formData" label-width="80px">
      <div>
        <el-select v-model="location" clearable filterable size="mini" placeholder="请选择城市" style="width: 500px;"
                   @change="cityChange">
          <el-option v-for="item in cities" :key="item.code"
                     :value="item.code"
                     :label="item.name"></el-option>
        </el-select>
        <!--<el-input placeholder="请输入查询的城市" v-model="location"><el-button slot="append" icon="el-icon-search" @click="getWeather"></el-button>-->
      </div>
      <el-form-item label="城市">{{city}}</el-form-item>
      <el-form-item label="更新时间">{{updateTime}}</el-form-item>
      <el-form-item label="天气">{{weather}}</el-form-item>
      <el-form-item label="温度">{{temperature}}</el-form-item>
      <el-form-item label="风速">{{wind}}</el-form-item>

    </el-form>


  </div>
</template>

<script>
  import api from '../../../../api/api'
  import {request} from '../../../../api/request'

  export default {
    name: "test",
    data() {
      return {
        formData: null,
        location: null,
        dataList: [],
        cities: [],
        data: null,
        city: null,
        updateTime: null,
        utcTime: null,
        weather: null,
        temperature: null,
        wind: null,
        show: true,

      }
    },
    mounted() {
      this.getCities();
    },
    methods: {
      async getCities() {
        let res = await request({
          url: api.getCities,
          method: 'get',
          data: {}
        });
        if (res) {
          console.log(res);
          this.cities = res;
          if (this.cities.length > 0) {
            this.location = this.cities[0].code;
            this.getWeather();
          }
        }
      },
      async getWeather() {
        let res = await request({
          url: api.getWeather,
          method: 'get',
          data: {
            'location': this.location,
          }
        });
        if (res && res.HeWeather6) {
          this.dataList = res.HeWeather6;
          this.data = this.dataList[0];
          if (this.data.status == "ok") {
            this.city = this.data.basic.cnty + "-" + this.data.basic.admin_area + "-" + this.data.basic.location;
            this.weather = this.data.now.cond_txt;
            this.utcTime = this.data.update.utc;
            this.updateTime = this.UTCformat(this.utcTime);
            this.temperature = this.data.now.tmp + '℃';
            this.wind = this.data.now.wind_spd + '公里/小时';
          } else if (this.data.status == "unknown location") {
            this.$message.error("未查询到相关城市！")
          } else {
            this.$message.error("获取信息失败！")
          }
        }
      },
      async cityChange() {
        if (this.location) {
          this.getWeather();
        }
      },

      UTCformat(utc) {
        return (new Date(`${utc}Z`)).toLocaleString()
      }

    },
    computed: {}

  }
</script>
<style scoped>
</style>
