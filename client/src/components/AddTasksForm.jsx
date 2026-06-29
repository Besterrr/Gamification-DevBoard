import {useState} from "react";
import Dropdown from "./Dropdown.jsx";
import {priorityOptions} from "../constants/taskConstants.js";

const AddTasksForm = ({addTask}) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState('low');
    const [deadline, setDeadline] = useState('');

    return (
        <form className="task-form" onSubmit={(e) => {
            e.preventDefault();
            addTask(title, description, priority, deadline);
        }}>
            <label className="task-form__field">
                <span className="task-form__label">Название</span>
                <input
                    type="text"
                    placeholder="Например, сверстать лендинг"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                />
            </label>

            <label className="task-form__field">
                <span className="task-form__label">Описание</span>
                <input
                    type="text"
                    placeholder="Необязательно"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />
            </label>

            <label className="task-form__field">
                <span className="task-form__label">Дедлайн</span>
                <input
                    type="datetime-local"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                />
            </label>

            <div className="task-form__field">
                <span className="task-form__label">Приоритет</span>
                <Dropdown
                    value={priority}
                    options={priorityOptions}
                    onChange={setPriority}
                />
            </div>

            <button type="submit">Создать</button>
        </form>
    );
};

export default AddTasksForm;