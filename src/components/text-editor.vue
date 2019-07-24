<template>
  <div @click="handleClick">
    <input
      type="text"
      :value="value"
      v-show="isFocused"
      ref="input"
      placeholder="Write a task"
      @blur="isFocused = false"
      @change="$emit('input', $event.target.value)"
    />
    <span v-show="!isFocused">
      {{ value }}
    </span>
  </div>
</template>

<script>
export default {
  name: 'TextEditor',
  props: {
    value: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      isFocused: false,
    };
  },
  computed: {},
  methods: {
    handleClick() {
      this.isFocused = true;
      this.$refs.input.focus();
    },
  },
};
</script>

<style lang="scss" scoped>
</style>
