<template>
  <div class="fold-toggle">
    <div :class="['triangle-container', { 'point-right': !show }]">
      <span class="triangle"></span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'FoldToggle',
  props: {
    show: {
      type: Boolean,
      required: true,
    },
  },
};
</script>

<style lang="scss" scoped>
$triangle-width: 10px;
$triangle-height: 8px;
$side-border: $triangle-width / 2 solid transparent;
$top-border: $triangle-height solid gray;

.triangle {
  border-left: $side-border;
  border-right: $side-border;
  border-top: $top-border;
  border-bottom: 0;
  width: 0;
  height: 0;
  display: block;
}

.triangle-container {
  width: $triangle-width;
  height: $triangle-height;
  transition: transform 0.25s ease-in;

  &.point-right {
    transform: rotate(-90deg);
  }
}
</style>
