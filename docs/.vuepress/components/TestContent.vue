<template>
  <div>

  </div>
</template>
<script>
  export default {
    mounted(){
      let md = require('markdown-it')()
      md.renderer.rules.api_open = function () {
        return '<api>';
      }
      md.renderer.rules.api_close = function () {
        return '</api>';
      }
      md.use(iterator,'api_replace','text',function (tokens,idx) {
        console.log(tokens);
        console.log(idx);
      })
    }
  }
</script>
