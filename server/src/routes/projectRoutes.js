const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const projectController = require('../controllers/projectController');

router.use(authMiddleware);

router.get('/', projectController.getProjects);
router.post('/', projectController.createProject);
router.put('/:id', projectController.updateProject);
router.delete('/:id', projectController.deleteProject);
router.get('/:id', projectController.getProjectById);
router.get('/:id/stats', projectController.getProjectStatistics)

module.exports = router;