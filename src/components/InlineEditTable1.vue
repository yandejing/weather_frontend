<template>
  <div>
    <div>
      <el-button :disabled="editFlag" icon="el-icon-plus" type="primary" size="small" @click="add">添加</el-button>
      <el-button :disabled="editFlag" size="small" type="danger" icon="el-icon-delete" @click="dbDel"
                 v-if="multipleSelection.length>0&&options.hasDbDel">批量删除
      </el-button>
      <el-button type="info" size="small" icon="el-icon-delete" disabled
                 v-if="multipleSelection.length<=0&&options.hasDbDel">批量删除
      </el-button>
      <slot name='options'></slot>
      <el-table
        v-loading="options.loading"
        element-loading-background="rgb(240,242,245,0.8)"
        :data="tableData"
        ref="inlineEditTable"
        :row-class-name="tableRowClassName"
        @selection-change="handleSelectionChange"
        style="width: 100%;margin-top: 20px">
        <el-table-column
          v-if="options.hasDbDel"
          type="selection"
          width="55">
        </el-table-column>
        <el-table-column
          v-for="(item,index) in column" :key="index" :label="item.label" :width="item.width" :min-width="item.minWidth"
          :align="item.align=='right'?'right':'left'">
          <template slot-scope="scope">
            <div v-show="scope.row.options.isEditing">
              <el-select ref="select" v-if="item.type=='select' && item.isBlurry"
                         v-model="scope.row.options.value[item.prop]"
                         placeholder="请选择" filterable :filter-method="selectBlurry"
                         size="small">
                <el-option v-for="i in item.selectOptions" :key="i.value" :value="i.value" :label="i.label">
                </el-option>
              </el-select>
              <el-select @change="test" v-if="item.type=='select' && !item.isBlurry"
                         v-model="scope.row.options.value[item.prop]"
                         placeholder="请选择" filterable
                         size="small">
                <el-option
                  v-for="i in item.selectOptions"
                  :key="i.value"
                  :label="i.label"
                  :value="i.value">
                </el-option>
              </el-select>
              <el-date-picker
                v-if="item.type=='date'"
                format="yyyy-MM-dd"
                value-format="yyyy-MM-dd"
                v-model="scope.row.options.value[item.prop]"
                type="date"
                size="small"
                placeholder="选择日期">
              </el-date-picker>
              <div v-if="item.type=='radio'">
                <el-radio v-for="(i,rIndex) in item.radioData" :key="rIndex"
                          v-model="scope.row.options.value[item.prop]" :label="i.value" size="small"></el-radio>
              </div>

              <el-checkbox-group v-if="item.type=='checkbox'"
                                 v-model="scope.row.options.value[item.prop]" size="small">
                <el-checkbox v-for="(i,cIndex) in item.checkboxData" :key="cIndex" :label="i.value"></el-checkbox>
              </el-checkbox-group>

              <el-input v-if="item.type=='input'" v-model="scope.row.options.value[item.prop]" size="small"></el-input>
              <el-input v-if="item.type=='textarea'" type="textarea" v-model="scope.row.options.value[item.prop]"
                        size="small" :autosize="{ minRows: 2, maxRows: 4}"></el-input>
              <div v-if="!item.type">
                <span>{{scope.row[item.prop]}}</span>
              </div>
            </div>
            <div v-show="!scope.row.options.isEditing">
              <span v-if="item.type=='checkbox'">
                <span v-for="i in scope.row[item.prop]">【{{i}}】</span>
              </span>
              <div v-else-if="item.isLink">
                <router-link :to="getRouteToPath(item,scope)">{{scope.row[item.prop]}}
                </router-link>
              </div>
              <el-tooltip v-else-if="item.tooltip " :content="scope.row[item.prop]" placement="top-start">
                <div style="overflow: hidden;text-overflow:ellipsis;white-space: nowrap;width:160px">
                  {{scope.row[item.prop]}}
                </div>
              </el-tooltip>
              <span
                v-else>{{scope.row[item.prop]=='' || scope.row[item.prop] == null ? '-' : scope.row[item.prop]}}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180">
          <template slot-scope="scope">
            <div v-show="!scope.row.options.isEditing">
              <el-button :disabled="editFlag" type='text' size="mini" @click="edit(scope)"
                         v-if="!scope.row.options.noEdit">编辑
              </el-button>
              <span v-if="!scope.row.options.noEdit" style="color:#e8e8e8 !important; ">|</span>
              <el-popover
                placement="top"
                ref="popoverDel"
                width="190"
                v-model="scope.row.delFlag">
                <p><i class="el-icon-warning" style="color:#e6a23c;margin-right: 7px"></i>是否删除此行信息？</p>
                <div style="text-align: right;margin-top: 10px;">
                  <el-button size="mini" type="text" @click="scope.row.delFlag = false">取消</el-button>
                  <el-button type="primary" size="mini" @click="del(scope)">确定</el-button>
                </div>
              </el-popover>
              <el-button :disabled="editFlag" v-popover:popoverDel type='text' size="mini" slot="reference"
                         @click="scope.row.delFlag=true">删除
              </el-button>
              <span v-if="scope.row.options.import" style="color:#e8e8e8 !important; ">|</span>
              <el-button :disabled="editFlag" type='text' size="mini" @click="importData(scope)"
                         v-if="scope.row.options.import">{{scope.row.options.importTitle}}
              </el-button>
            </div>
            <div v-show="scope.row.options.isEditing">
              <el-button type="text" size="mini" @click="save(scope)">保存</el-button>
              <span style="color:#e8e8e8 ">|</span>
              <el-button type="text" size="mini" @click="cancel(scope)">取消</el-button>
            </div>
          </template>
        </el-table-column>

      </el-table>
      <el-pagination
        ref="page"
        v-if="pageTotal>0"
        :total="pageTotal"
        :page-size="pageSize"
        @current-change='changePage'
        :current-page="currentPage"
        class="paging">
      </el-pagination>
    </div>
  </div>
</template>

<script>

  import findIndex from 'lodash/findIndex'

  export default {
    name : 'InlineEditTable',
    props : {
      'tableData' : {
        type : Array,
        default : []
      },
      'column' : {
        type : Array,
        default : []
      },
      'pageTotal' : {
        type : Number,
        default : 0
      },
      'pageSize' : {
        type : Number,
        default : 10
      },
      'options' : {
        type : Object,
        default () {
          return {}
        }
      },
      onView : {
        type : Function,
        default : function () {
        }
      },
      onDelete : {
        type : Function,
        default : function () {
        }
      },
      onDbDel : {
        type : Function,
        default : async function () {
        }
      },
      onEdit : {
        type : Function,
        default : async function () {
        }
      },
      onAdd : {
        type : Function,
        default : async function () {
        }
      },
      onImport : {
        type : Function,
        default : async function () {

        }
      }
    },
    data () {
      return {
        multipleSelection : [],
        currentPage : 1,
        editFlag : false
      }
    },
    mounted () {
      let _this = this
      bus.$on ( 'changeEditFlag', function ( flag ) {
        _this.editFlag = flag
      } )
    },
    methods : {
      test () {
        this.$nextTick ( function () {
          console.log ( 'nextTick' )
          this.$forceUpdate ();
        } )
        console.log ( '111' )
      },
      getRouteToPath ( item, scope ) {
        let tempObj = {}
        tempObj[ item[ 'linkField' ] ] = scope.row[ item.linkField ]
        return {
          'path' : item.route,
          'query' : tempObj
        }
      },
      tableRowClassName ( { row, rowIndex } ) {
        if ( row.highlight ) {
          return 'highlight'
        }
      },
      async del ( scope ) {
        let res = await this.onDelete ( scope )
        if ( res ) {
          this.tableData.splice ( scope.$index, 1 )
          if ( this.tableData.length == 0 ) {
            this.currentPage = parseInt ( this.$refs[ 'page' ].total / this.$refs[ 'page' ].pageSize )
            await this.onView ( this.currentPage )
          }
        }

      },
      dbDel () {
        this.$confirm ( '确定删除吗？', '提示', {
          confirmButtonText : '确定',
          cancelButtonText : '取消',
          type : 'warning'
        } ).then ( async () => {
          let res = await this.onDbDel ( this.multipleSelection )
          if ( res ) {
            for ( let i in this.multipleSelection ) {
              this.tableData.splice ( findIndex ( this.tableData, this.multipleSelection[ i ] ), 1 )
            }
            if ( this.tableData.length == 0 ) {
              this.currentPage = parseInt ( this.$refs[ 'page' ].total / this.$refs[ 'page' ].pageSize )
              await this.onView ( this.currentPage )
            }
          }
        } ).catch ( () => {

        } );
      },
      edit ( scope ) {
        for ( let i in this.column ) {
          if ( this.column[ i ].disabledFlag ) {
            this.column[ i ].type = ''
          }
        }
        for ( let i in scope.row ) {
          if ( scope.row[ i ] && i !== 'options' ) {
            scope.row.options.value[ i ] = scope.row[ i ]
          }
        }
        this.$refs[ 'inlineEditTable' ].doLayout ();
        scope.row.options.isEditing = ! scope.row.options.isEditing
        this.editFlag = true
      },
      async save ( scope ) {
        if ( scope.row.options.isNew ) {
          let res = await this.onAdd ( scope )
          if ( res.flag ) {

            this.tableData.shift ()
            this.tableData.unshift ( res.data )
            if ( this.$refs[ 'page' ] ) {
              if ( this.$refs[ 'page' ].pageSize <= this.tableData.length ) {
                this.tableData.pop ()
              }
            }
            scope.row[ 'highlight' ] = true;
            let _this = this;
            setTimeout ( function () {
              scope.row[ 'highlight' ] = false;
              _this.$refs[ 'inlineEditTable' ].doLayout ();
            }, 2000 )
            this.editFlag = false
          }
        } else {
          let res = await this.onEdit ( scope )
          if ( res.flag ) {
            this.$emit ( 'refreshData' );
            scope.row[ 'highlight' ] = true;
            let _this = this;
            setTimeout ( function () {
              scope.row[ 'highlight' ] = false;
              _this.$refs[ 'inlineEditTable' ].doLayout ();
            }, 2000 )
            this.editFlag = false
          }
        }
      },
      cancel ( scope ) {
        if ( scope.row.options.isNew ) {
          this.tableData.shift ();
        }
        scope.row.options.isEditing = ! scope.row.options.isEditing
        this.editFlag = false
      },
      async add () {
        let tempObj = {}
        for ( let i in this.column ) {
          if ( this.column[ i ].type == 'checkbox' ) {
            tempObj[ this.column[ i ].prop ] = []
          } else {
            tempObj[ this.column[ i ].prop ] = ''
          }
          if ( this.column[ i ].disabledFlag ) {
            this.column[ i ].type = 'select'
          }
        }
        this.tableData.unshift ( {
          options : {
            isEditing : true,
            noEdit : false,
            isNew : true,
            value : tempObj,
          }
        } )
        this.editFlag = true
      },
      handleSelectionChange ( val ) {
        this.multipleSelection = val
      },
      //跳转页面
      changePage ( currentPage ) {
        this.$emit ( 'changePage', currentPage )
      },
      //模糊查询
      async selectBlurry ( value ) {
        this.$emit ( 'selectBlurry', value )
      },
      async importData ( scope ) {
        await this.onImport ( scope )
      }
    },
  }
</script>

<style scoped>
  .highlight {
    background-color: red !important;
  }

  .paging {
    float: right;
    margin: 20px 0 20px auto;
  }
</style>
