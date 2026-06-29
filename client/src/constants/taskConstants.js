export const priorityLabels = {
    low: 'низкий',
    medium: 'средний',
    high: 'высокий',
};

export const statusLabels = {
    todo: 'к выполнению',
    inProgress: 'в работе',
    done: 'готово',
};

export const priorityOptions = [
    { value: 'low', label: 'Низкий' },
    { value: 'medium', label: 'Средний' },
    { value: 'high', label: 'Высокий' },
];

export const statusOptions = [
    { value: 'todo', label: statusLabels.todo },
    { value: 'inProgress', label: statusLabels.inProgress },
    { value: 'done', label: statusLabels.done },
];