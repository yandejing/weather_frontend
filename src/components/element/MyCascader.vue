<script>
  import {Cascader} from 'element-ui'
  export default {
    mixins: [Cascader],
    methods:{
      handleClick() {
        if (this.disabled) return;
        this.$refs.input.focus();
        if (this.filterable) {
          this.menuVisible = true;
          return;
        }
        this.menuVisible = !this.menuVisible;
        this.$emit('click',this);
      }
    }
  }
</script>
