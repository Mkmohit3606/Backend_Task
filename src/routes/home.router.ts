import express,{Router} from 'express';
import courseRouters from './course.router';
import registerRouters from "./register.router";

const router = Router();

router.use('/courses',courseRouters);
router.use('/rg',registerRouters);

export default router;