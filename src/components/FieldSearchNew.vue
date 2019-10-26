<template>
  <div>
    <div style="display: flex;flex-wrap: wrap" id="div">
      <div v-for="(item,index) in fieldList" v-show="showControl(item,index)" :key="item.field_key"
           style="line-height: 50px;width: 340px;margin: 10px 20px 10px 0;height: 50px;display: flex; flex-shrink:0">
        <div style="width: 120px;text-align: justify;font-size: 14px; flex-shrink:0">{{item.field_label}}
          <span style="display:inline-block;width: 100%;"></span></div>
        <div style="margin: 0 4px">：</div>
        <div style="width: 200px; flex-shrink:0">
          <el-input v-model="formData[item.field_key]" v-if="item.field_type==='input'"
                    size="small"
                    :placeholder="item.field_placeholder"></el-input>
          <el-select size="small" v-model="formData[item.field_key]" v-if="item.field_type==='select'&&!item.field_api"
                     :placeholder="item.field_placeholder"
                     :multiple="item.field_select_limit>1||item.field_select_limit==0"
                     :multiple-limit="item.field_select_limit">
            <el-option v-for="(option , optionIndex) in item.field_data" :key="option[item.field_props.value_key]"
                       :value="option[item.field_props.value_key]"
                       :label="option[item.field_props.label_key]">
              <!--{{option[item.field_props.label_key]}}-->
            </el-option>
          </el-select>
          <el-select size="small" v-model="formData[item.field_key]" v-if="item.field_type==='select'&&item.field_api"
                     @focus="getSelectOptions(item)" :placeholder="item.field_placeholder"
                     :multiple="item.field_select_limit>1||item.field_select_limit==0"
                     :multiple-limit="item.field_select_limit">
            <el-option v-for="(option,optionIndex) in selectOptionList[item.field_key] " :key="option[item.field_props.value_key]"
                       :value="option[item.field_props.value_key]">{{option[item.field_props.label_key]}}
            </el-option>
          </el-select>
          <el-cascader size="small"
                       v-if="item.field_type==='cascader'&&item.field_api&&initFinished"
                       @focus="getCascaderList(item)"
                       :options="cascaderList[item.field_key]"
                       v-model="formData[item.field_key]"
                       @change="getCascaderData(item)"
                       :props="{value:item.field_props.value_key,label:item.field_props.label_key,children:item.field_props.children_key?item.field_props.children_key:'children'}"
                       :change-on-select="true">
          </el-cascader>
          <el-cascader size="small"
                       v-if="item.field_type==='cascader'&&!item.field_api&&initFinished"
                       :options="item.field_data"
                       v-model="formData[item.field_key]"
                       :props="{value:item.field_props.value_key,label:item.field_props.label_key,children:item.field_props.children_key?item.field_props.children_key:'children'}"
                       :change-on-select="item.field_change_on_select"
                       @change="cascaderChange(formData[item.field_key])"
                       filterable>
          </el-cascader>
          <el-date-picker v-if="item.field_type==='date'" v-model="formData[item.field_key]" type="date"
                          value-format="yyyy-MM-dd" format="yyyy-MM-dd"
                          :placeholder="item.field_placeholder" size="small" style="width:200px"></el-date-picker>

          <el-date-picker :clearable = "false" v-if="item.field_type==='datetime'" v-model="formData[item.field_key]" :type="item.styleType"
                          :value-format="item.format?item.format:'yyyy-MM-dd'" :format="item.format?item.format:'yyyy-MM-dd'"
                          :placeholder="item.field_placeholder" size="small" style="width:200px"></el-date-picker>


          <el-date-picker v-if="item.field_type==='daterange'" size="small" style="width: 220px;" v-model="formData[item.field_key]" type="daterange"
                          :value-format="item.format?item.format:'yyyy-MM-dd'" :format="item.format?item.format:'yyyy-MM-dd'" range-separator="至" :start-placeholder="item.startPlaceholder" :end-placeholder="item.endPlaceholder">
          </el-date-picker>
        </div>
      </div>
      <div style="line-height: 50px;margin:10px 20px 10px 20px;">
        <el-button type="primary" size="small" @click="searchInformation">查询</el-button>
        <el-button size="small" @click="searchInformation('reset')">重置</el-button>
        <div v-if="isShowSpread" style="display: inline-block">
          <el-button v-if="!isSpread" type="text" @click="isSpread=true">展开<i class="el-icon-arrow-down"></i>
          </el-button>
          <el-button v-else type="text" @click="isSpread=false">收起<i class="el-icon-arrow-up"></i></el-button>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
  import _trim from 'lodash/trim'
  import _find from 'lodash/find'
  import { request } from '/src/utils/request/request'

  export default {
    name : 'FieldSearch',
    props : [ 'fieldList'],
    data () {
      return {
        isSpread : true,
        divWidth : 0,
        initFinished : false,
        formData : {},
        selectOptionList : {},
        cascaderList : {},
        /*受控组件对象*/
      }
    },
    created(){
    },
    computed : {
      controlField(){
        let controlData = {};
        for(let i in this.fieldList){
          if(this.fieldList[i].field_data){
            if(Array.isArray(this.fieldList[i].field_data)){
              for(let j in this.fieldList[i].field_data){
                if(this.fieldList[i].field_data[j]['control_field']){
                  if(!controlData[this.fieldList[i].field_data[j]['control_field']]){
                    controlData[this.fieldList[i].field_data[j]['control_field']] = {
                      master_control:this.fieldList[i]['field_key'],
                      value:this.fieldList[i].field_data[j][this.fieldList[i]['field_props']['value_key']]
                    }
                  }
                }
              }
            }
          }
        }
        return controlData;
      },

      isShowSpread () {
        return this.fieldList.length > Math.floor ( this.divWidth / 380 )
      }
    },
    mounted () {
      window.test = this;
      this.genFieldList ();
      this.divWidth = document.getElementById ( 'div' ).clientWidth;
      this.$emit('formData', this.formData)
    },
    methods : {
      cascaderChange(item){
        this.$emit('onCascaderChange',item)
      },
      showControl(item,index){
        if(this.controlField[item['field_key']]){
          if(this.formData[this.controlField[item['field_key']]['master_control']] == this.controlField[item['field_key']]['value']){
            return true
          }else{
            return false
          }
        }else{
          return this.isSpread ? true : index < (Math.floor ( this.divWidth / 380 ) - 0)
        }
      },
      refreshData () {
        this.$nextTick ( function () {
          this.$forceUpdate ()
        } )
      },
      genFieldList () {
        for ( let i in this.fieldList ) {

          if ( this.fieldList[ i ].field_type == 'select' ) {
            this.$set ( this.selectOptionList, this.fieldList[ i ].field_key, {} )
          }
          if ( this.fieldList[ i ].field_type == 'cascader' ) {
            this.$set ( this.cascaderList, this.fieldList[ i ].field_key, [] )
          }
          if ( this.fieldList[ i ].field_init_data ) {
            this.$set ( this.formData, this.fieldList[ i ].field_key, this.fieldList[ i ].field_init_data )
          } else {
            this.$set ( this.formData, this.fieldList[ i ].field_key, null )
          }

        }
        this.initFinished = true;
      },

      async getSelectOptions ( item ) {
        let res = await request ( {
          url : item.field_api.url,
          method : 'get',
          data : {}
        } )
        if ( res && res.result ) {
          this.selectOptionList[ item.field_key ] = res.result
        }
      },
      async getCascaderList ( item ) {
        if ( ! this.cascaderList[ item.field_key ] || this.cascaderList[ item.field_key ].length === 0 ) {
          let res = await request ( {
            url : item.field_api[ 0 ].url,
            method : 'get',
          } )
          if ( res && res.result ) {
            this.cascaderList[ item.field_key ] = res.result
          }
        }

      },
      async getCascaderData ( item ) {
        let data = {}
        let cascaderValue = this.formData[ item.field_key ]
        data[ item.field_props.param_key ] = cascaderValue[ cascaderValue.length - 1 ]
        if ( ! item.field_api[ cascaderValue.length ] ) {
          return
        }
        let res = await request ( {
          url : item.field_api[ cascaderValue.length ].url,
          method : 'post',
          data : data
        } )
        if ( res && res.result ) {

          let level_1_data = null;
          let level_2_data = null;
          let level_3_data = null;
          let level_4_data = null;
          if ( ! cascaderValue || cascaderValue.length === 0 ) {
            this.cascaderList[ item.field_key ] = res.result;
          }
          if ( cascaderValue.length > 0 ) {
            level_1_data = _find ( this.cascaderList[ item.field_key ], { value : cascaderValue[ 0 ] } )
            if (cascaderValue.length === 1 && level_1_data && !level_1_data['children'].length && res.result.length > 0) {
              level_1_data[ 'children' ] = res.result
            }
          }
          if ( cascaderValue.length > 1 ) {
            level_2_data = _find ( level_1_data[ 'children' ], { value : cascaderValue[ 1 ] } )
            if (cascaderValue.length === 2 && level_2_data && !level_2_data['children'].length && res.result.length > 0) {
              level_2_data[ 'children' ] = res.result
            }
              }
          if ( cascaderValue.length > 2 ) {
            level_3_data = _find ( level_2_data[ 'children' ], { value : cascaderValue[ 2 ] } )
            if (cascaderValue.length === 3 && cascaderValue.length === 2 && level_3_data && !level_3_data['children'] && res.result.length > 0) {
              level_3_data[ 'children' ] = res.result;
            }
              }
          if ( cascaderValue.length > 3 ) {
            level_4_data = _find ( level_3_data[ 'children' ], { value : cascaderValue[ 3 ] } )
            if (cascaderValue.length === 4 && level_4_data && !level_4_data['children'] && res.result.length > 0) {
              level_4_data[ 'children' ] = res.result;
            }
              }

        }
      },
      searchInformation ( value ) {
        if ( value == 'reset' ) {
          /* for ( let i in this.formData ) {
             for(let j in this.fieldList){
               if (this.fieldList[j].field_key!="batchId") {
                 if(this.fieldList[j].field_type=="cascader" || this.fieldList[j].field_type=="select"){
                   if(i==this.fieldList[j].field_key){
                     this.formData[i]=null
                   }
                 }else if(this.fieldList[j].field_type=="input"){
                   if(i==this.fieldList[j].field_key){
                     this.formData[i]=""
                   }
                 }
               }
             }
           }
           console.log("------")
           console.log(this.formData)*/
          this.formData = {}
          this.$emit('resetSearch')
        } else {
          for ( let i in this.formData ) {
            if ( typeof this.formData[ i ] === 'string' ) {
              this.formData[ i ] = this.formData[ i ].trim ()
            }
          }
          this.$emit ( 'searchInformation', this.formData )
        }
      },
    },
    watch:{
      'formData': {
      handler (newValue, oldValue) {
        this.$emit('newformData',newValue);
      },
      deep: true
      },
      // 'fieldList':{
      //   handler(nv,ov){
      //     this.genFieldList();
      //   },
      //   deep:true
      // }


      // 'formData':function(nv,ov){
      //   console.log(nv);
      // }
    }
  }
</script>
<style>
  .el-date-editor .el-range-separator{
    padding: 0 !important;
    width: 10%;
  }
</style>
