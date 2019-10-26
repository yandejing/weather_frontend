<template>
  <div id="common-table">
    <tree-table></tree-table>
  </div>
</template>
<script>
  import TreeTable from "../../../../components/TreeTable";

  export default {
    name:'common_table',
    components:{TreeTable},
    props:{
      key:{
        type:String,
        default:'id'
      }
    },
    data () {
      return {

      }
    },
    computed:{

    },
    created() {

    },
    mounted() {

    },
    methods:{

    },
    watch:{

    }
  }
</script>
<style scoped>

</style>
<style>

</style>
