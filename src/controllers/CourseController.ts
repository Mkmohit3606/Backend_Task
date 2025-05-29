import { Request, Response } from "express";
import { Course } from "../models/courses.model";

interface CourseInput {
  course_name: string;
  instructor_name: string;
  start_date: string; 
  min_employees: number;
  max_employees: number;
}

const addCourse = async(req: Request, res: Response):Promise<void> => {
  const {course_name,instructor_name,start_date,min_employees,max_employees}:CourseInput = req.body;
  // Check if any required field is missing or blank
  const isMissing:Boolean = 
    !course_name?.trim() ||
    !instructor_name?.trim() ||
    !start_date?.trim() ||
    !min_employees?.toString().trim() ||
    !max_employees?.toString().trim();

  if(isMissing){
    const missingFields:Array<String>=[];
    if (!course_name?.trim()) missingFields.push('course_name');
    if (!instructor_name?.trim()) missingFields.push('instructor_name');
    if (!start_date?.trim()) missingFields.push('start_date');
    if (!min_employees?.toString().trim()) missingFields.push('min_employees');
    if (!max_employees?.toString().trim()) missingFields.push('max_employees');
    const success = { failure:`${missingFields.join(', ')} cannot be empty` };
    
    res.status(400).json({
    status:'400',

    message:"INPUT_DATA_ERROR",data:{
        failure:{...success}
    } });
       return;
    }
    //add the course here
    try {
        const success = await Course.create({
            course_name,
            instructor_name,
            start_date,
            min_employees,
            max_employees,
        });
        res.status(200).json({
            status:200,
            message: 'Course added successfully' , data:{
            success:{
                course_id:success.course_id
            }
        }});
        
    } catch (error) {
        console.error("DB Error:", error);
    res.status(400).json({ 
        status:400,
        message: "ERROR MESSAGE",
        data:{
            failure:{
                message:"ERROR MESSAGE"
            }
        }
    });
    }
};

const getAllCourse = async(req:Request,res:Response):Promise<void>=>{
    try {
        const getAllCourse = await Course.findAll();
        res.status(200).json({message:"All course successfully fetched", data:getAllCourse});
    } catch (error) {
        console.error("DB Error:", error);
        res.status(500).json({ message: "SERVER_ERROR" });
    }
}

export const CourseController = {
  addCourse,
  getAllCourse
};
