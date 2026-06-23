const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const taskController = require('../controllers/taskController');

router.use(authMiddleware);

router.get("/projects/:projectId/tasks", taskController.getTasks);
router.post("/projects/:projectId/tasks", taskController.createTask);
router.put("/tasks/:id", taskController.updateTask);
router.delete("/tasks/:id", taskController.deleteTask);

module.exports = router;