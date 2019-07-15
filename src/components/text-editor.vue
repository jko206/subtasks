<template>
  <li @click="isFocused = true">
    <input
      type="text"
      :value="itemDescription"
      v-if="isFocused"
      @blur="isFocused = false"
      @change="$emit('change', val)"
    />
    <span v-else>
      {{ itemDescription }}
    </span>
  </li>
</template>

<script>
export default {
  name: "ProjectItem",
  props: {
    itemDescription: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      isFocused: false
    };
  },
  computed: {}
};
</script>

<style lang="scss" scoped>
</style>
