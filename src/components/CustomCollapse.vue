<template>
  <div>
    <div style="width: 100%;display: flex">
      <slot name="top"></slot>
      <div @click="test=!test" class="mark">
        <span v-if="test">
          收起
          <i class="el-icon-caret-top"></i>
        </span>
        <span v-else="test">
          展开
          <i class="el-icon-caret-bottom"></i>
        </span>
      </div>
    </div>
    <transition
      name="custom-classes-transition"
      enter-active-class="customCollapseIn animated fadeIn"
      leave-active-class="customCollapseOut animated fadeOut"
      id="customCollapse"
    >
      <div v-if="test" style="width: 100%;">
        <slot></slot>
      </div>

    </transition>
  </div>
</template>

<script>
  require('/src/assets/animate.css')
  export default {
    name: "custom-collapse",
    data() {
      return {
        test: false
      }
    },
    methods: {}
  }
</script>

<style>

</style>
