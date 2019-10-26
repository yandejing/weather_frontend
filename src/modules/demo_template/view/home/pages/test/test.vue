<template>

  <div>


    <el-form ref="form" v-model="formData" label-width="80px">
      <div>
        <!--<el-input v-model="location" placeholder="请输入城市名称"></el-input>-->
        <!--<el-button @click="bClick">点击</el-button>-->
        <el-input placeholder="请输入内容" v-model="location" class="input-with-select">
          <el-select v-model="select" slot="prepend" placeholder="请选择">
            <el-select v-model="location" clearable size="mini" style="width: 180px;">
              <el-option v-for="item in citys" :key="item.code"
                         :value="item.code"
                         :label="item.name"></el-option>
            </el-select>
          </el-select>
          <el-button slot="append" icon="el-icon-search" @click="bClick"></el-button>
        </el-input>
      </div>
      <el-form-item label="城市">{{city}}</el-form-item>
      <el-form-item label="更新时间">{{updateTime}}</el-form-item>
      <el-form-item label="天气">{{tianqi}}</el-form-item>
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
        location: "beijing",
        dataList: [],
        citys: [],
        data: null,
        city: null,
        updateTime: null,
        tianqi: null,
        temperature: null,
        wind: null,
        show: true,

      }
    },
    mounted() {
    },
    methods: {
      async bClick() {
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
            this.tianqi = this.data.now.cond_txt;
            this.updateTime = this.data.update.loc;
            this.temperature = this.data.now.tmp + '℃';
            this.wind = this.data.now.wind_spd + '公里/小时';
          } else if (this.data.status == "unknown location") {
            this.$message.error("未查询到相关城市！")
          } else {
            this.$message.error("获取信息失败！")
          }
        }
      },
    },
    computed: {}

  }
</script>

<style scoped>

</style>
