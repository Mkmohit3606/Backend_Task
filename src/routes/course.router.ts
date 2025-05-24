import express,{Router} from 'express';
import { CourseController } from '../controllers/CourseController';

const router = Router();

// add course
router.post('/add/courseOffering',  CourseController.addCourse);

// get course based on name

//get all course
router.get('/all',CourseController.getAllCourse);




export default router;