import uuid from '@/functions/uuid';

export function getEmptyTask(seed) {
  return {
    id: uuid(),
    isProject: false,
    hasOwnBoard: false,
    superTaskId: null,
    subTaskIds: [],
    prevTaskId: null,
    nextTaskId: null,
    description: '',
    progress: 0,
    showSubtasks: false,
    ...seed,
  };
}
