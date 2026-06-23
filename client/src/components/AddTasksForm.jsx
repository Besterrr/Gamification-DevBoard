import {useState} from "react";

const AddTasksForm = ({addTask}) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState('low');

    return (
        <form onSubmit={(e) => {
            e.preventDefault();
            addTask(title, description, priority);
        }}>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
            <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} />
            <select name="priority" id="prio" value={priority} onChange={(e) => setPriority(e.target.value)}>
                <option value="low">low</option>
                <option value="medium">medium</option>
                <option value="high">high</option>
            </select>
            <button type="submit">Создать</button>
        </form>
    );
};

export default AddTasksForm;