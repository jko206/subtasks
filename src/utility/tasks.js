import uuid from '@/functions/uuid'
import Vue from 'vue'

export const getEmptyTask = () => {
  return {
    description: '',
    id: uuid(),
    isProject: false,
    nextTaskId: null,
    prevTaskId: null,
    progress: 0,
    showSubtasks: false,
    subTaskIds: [],
    superTaskId: null,
    title: '',
    type: 'task', // 'task' | 'project' | 'workspace'
  }
}

export const connectTasksVertically = (task, subTask) => {
  const taskId = task.id
  const subTaskId = subTask.id

  Vue.set(task.subTaskIds, task.subTaskIds.length - 1, subTaskId)
  Vue.set(subTask, 'superTaskId', taskId)
}
