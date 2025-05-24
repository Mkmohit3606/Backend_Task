import { Router } from 'express';
import { RegisterController } from '../controllers/RegisterController';

const router = Router();

router.post('/add/register/:course_id', RegisterController.registerCourse);
router.get('/allot/:course_id',RegisterController.allotCourse);
router.put('/CANCEL/:registration_id', RegisterController.cancelAllot);

export default router;
