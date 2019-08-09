import Vue from 'vue';
import App from './App.vue';
import Vuex from 'vuex';
import store from '@/store/index';

Vue.config.productionTip = false;

Vue.use(Vuex);

const vm = new Vue({
  render: h => h(App),
  store,
}).$mount('#app');

window.vm = vm;

window.printTree = function() {
  const indent = '  ';
  const { tasksById, workspaceIds } = window.vm.$store.state;

  function printLine(id, indentCount) {
    const task = tasksById[id];
    const { subTaskIds } = task;
    let line = Array(indentCount)
      .fill(indent)
      .join('');
    line += `${id}\n`;
    if (subTaskIds) {
      line += subTaskIds.map(subTaskId => printLine(subTaskId, indentCount + 1)).join('\n');
    } else {
      console.log('wtf');
    }

    return line;
  }
  const output = workspaceIds.map(workspaceId => printLine(workspaceId, 0)).join('\n');

  console.log(output);
};
