<template>
  <div>
    <div style="display: flex;flex-wrap: wrap" id="div">
      <div v-for="(item,index) in dataList" v-show="showDetail(index)"
           style="line-height: 50px;width: 300px;margin: 10px 20px 10px 0;height: 50px;display: flex">
        <div style="width: 90px;text-align: justify;font-size: 14px;">{{item.label}}
          <span style="display:inline-block;width: 100%;"></span></div>
        <div style="margin: 0 4px">：</div>
        <div>
          <el-input v-if="item.type=='input'" v-model="item.value" :placeholder="item.placeholder" size="small"
                    style="width: 200px"></el-input>
          <el-select v-if="item.type=='select'" v-model="item.value" :placeholder="item.placeholder" size="small"
                     style="width:200px">
            <el-option v-for="(selectItem,selectIndex) in item.selectList"
                       :key="selectItem.id"
                       :value="selectItem.id"
                       :label="selectItem.name"></el-option>
          </el-select>
          <el-date-picker v-if="item.type=='date'" v-model="item.value" type="date" value-format="yyyy-MM-dd"
                          :placeholder="item.placeholder" size="small" style="width:200px"></el-date-picker>
        </div>
      </div>
      <div style="line-height: 50px;margin:10px 20px 10px 0;">
        <el-button type="primary" size="small" @click="searchInformation('get')">查询</el-button>
        <el-button size="small" @click="searchInformation('reset')">重置</el-button>
        <el-button v-if="!isSpread" type="text" @click="isSpread=true">展开<i class="el-icon-arrow-down"></i></el-button>
        <el-button v-else type="text" @click="isSpread=false">收起<i class="el-icon-arrow-up"></i></el-button>
      </div>
    </div>
  </div>
</template>
<script>
  export default {
    name:'FieldSearch',
    props: {
      'selectData': {
        type: Array,
        default: []
      },
    },
    data() {
      return {
        dataList : this.selectData,
        isSpread:false,
        divWidth : 0,
      }
    },
    mounted () {
      this.divWidth = document.getElementById ( 'div' ).clientWidth
      window.test1 = this
    },
    methods:{
      showDetail ( index ) {
        return this.isSpread ? true : index < (Math.floor ( this.divWidth / 350 ) - 1)
      },
      searchInformation(value){
        let tempObj = {}
        if(value == 'reset'){
          for ( let i in this.dataList ) {
                this.dataList[ i ].value = ''
             }
        }
          for ( let i in this.dataList ) {
            tempObj[this.dataList[i].key] = this.dataList[i].value
          }
          this.$emit ( 'searchInformation', tempObj )
      }
    }
  }
</script>
