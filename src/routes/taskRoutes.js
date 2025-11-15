import { Router } from 'express';
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask
} from '../controllers/taskController.js';

const router = Router();

// GET /api/tasks - Get all tasks
// POST /api/tasks - Create new task
router.route('/')
  .get(getTasks)
  .post(createTask);

// PUT /api/tasks/:id - Update task
// DELETE /api/tasks/:id - Delete task
router.route('/:id')
  .put(updateTask)
  .delete(deleteTask);

export default router;
