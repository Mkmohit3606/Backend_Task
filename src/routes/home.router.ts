import express,{Router} from 'express';
import courseRouters from './course.router';

const router = Router();

router.use('/courses',courseRouters);

export default router;