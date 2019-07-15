<template>
  <div class="project-wrapper">
    <div class="project-title">
      {{ projectTitle }}
    </div>
    <div class="project-items">
      <ul>
        <ProjectItem
          class="project-item"
          v-for="item in projectItems"
          :key="item.key"
          :item-description="item.description"
          @change="updateItem"
        />

        <li class="add-project-item" @click="addItem">
          Add Item
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import TextEditor from "./text-editor.vue";
import uuid from "@/functions/uuid";

const letters = `ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789`;

export default {
  name: "ProjectWrapper",
  components: { TextEditor },
  data() {
    return {
      projectTitle: "some title",
      projectItems: []
    };
  },
  methods: {
    addItem() {
      this.projectItems.push({
        description: "New Item",
        key: uuid()
      });
    },
    updateItem(...args) {
      console.log(args);
    }
  }
};
</script>

<style lang="scss" scoped>
</style>
