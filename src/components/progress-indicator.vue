<template>
  <div class="progress-indicator">
    <div class="checkmark" :style="borderColor" />
  </div>
</template>

<script>
export default {
  name: 'ProgressIndicator',
  props: {
    value: {
      type: Number,
      required: true,
      validator: n => n >= 0 && n <= 1,
    },
  },
  computed: {
    borderColor() {
      const borderColor = this.value === 1 ? 'green' : 
        this.value === 0 ? 'gray' : 'orange';
      return { borderColor };
    },
  },
};
</script>
<style lang="scss" scoped>
.progress-indicator {
  display: flex;
  width: 20px;
  height: 20px;
  border: 1px solid gray;
  vertical-align: bottom;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.checkmark {
  border: 2px solid gray;
  width: 10px;
  height: 7px;
  transform: rotate(-45deg);
  border-top: 0;
  border-right: 0;
  position: relative;
  bottom: 2px;
}
</style>
