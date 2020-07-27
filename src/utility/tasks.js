import uuid from '@/functions/uuid'

export function getEmptyTask(seed) {
  return {
    id: uuid(),
    isProject: false,
    superTaskId: null,
    subTaskIds: [],
    prevTaskId: null,
    nextTaskId: null,
    title: '',
    description: '',
    progress: 0,
    showSubtasks: false,
    ...seed,
  }
}
