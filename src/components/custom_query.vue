<template>
  <div id="custom-query" style="font-size: 14px">
    <div style="padding: 16px 16px 10px 16px;background-color: #f9f9f9;height: 40px;font-weight: 700;line-height: 12px">
      快速查询
    </div>
    <div style="width: 800px;padding: 16px 16px 10px 16px;">
      <el-row :gutter="16" >
        <el-col :span="5">逻辑符</el-col>
        <el-col :span="5">字段名</el-col>
        <el-col :span="5">运算符</el-col>
        <el-col :span="5">比较值</el-col>
        <el-col :span="4">
          <el-button size="small" circle icon="el-icon-plus" class="circle-button" style="margin-top: -10px" @click="onClickAddQuery"/>
        </el-col>
      </el-row>
      <el-row v-for="(item,index) in value" :key="index" :gutter="16" style="margin-bottom: 10px">
        <el-col :span="5">
          <el-select v-if="index !== 0" v-model="item.logic" size="small">
            <el-option value="and">and</el-option>
            <el-option value="or">or</el-option>
          </el-select>
        </el-col>
        <el-col :span="5" :offset="index === 0 ? 5 : 0">
          <el-select v-model="item.field" size="small">
            <el-option v-for="fieldItem in fieldList" :key="fieldItem.value" :value="fieldItem.value" :label="fieldItem.label"></el-option>
          </el-select>
        </el-col>
        <el-col :span="5">
          <el-select v-model="item.arithmetic" size="small">
            <el-option v-for="arithmeticItem in arithmeticList" :key="arithmeticItem" :value="arithmeticItem" :label="arithmeticItem"></el-option>
          </el-select>
        </el-col>
        <el-col :span="5">
          <el-input v-model="item.compare" size="small"></el-input>
        </el-col>
        <el-col :span="4">
          <el-button size="small" circle icon="el-icon-minus" class="circle-button" style="margin-top: 4px" @click="onClickDeleteQuery(index)"/>
        </el-col>
      </el-row>
    </div>
  </div>
</template>
<script>
  export default {
    props:{
      value:{
        type:Array,
        required:true
      },
      fieldList:{
        type:Array,
        required:true
      }
    },
    data() {
      return {
        arithmeticList: ['=', '<>', '>', '>=', '<', '<=', 'LIKE', ' IS NULL', ' IS NOT NULL'],
      }
    },
    watch: {
      'value': {
        handler (newValue, oldValue) {
          this.$emit('input',newValue);
        },
        deep: true
      },
    },
    methods:{
      onClickAddQuery() {
        this.value.push({
          logic:'',
          field:'',
          arithmetic:'',
          compare:''
        })
      },
      onClickDeleteQuery(index) {
        this.value.splice(index,1)
      },
    }
  }
</script>
<style scoped>
  .circle-button {
    width: 25px;
    height: 25px;
  }
</style>
<style>
  #custom-query .el-button--small.is-circle {
    padding: 6px;
  }
</style>
