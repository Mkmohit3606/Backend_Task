import { Request, response, Response } from "express";
import { Course } from "../models/courses.model";
import { date } from "zod";

const addCourse = async(req: Request, res: Response):Promise<void> => {
  const {course_name,instructor_name,start_date,min_employees,max_employees} = req.body;
    console.log(req.body);
    if(course_name =='' || instructor_name==null || start_date==null || min_employees==null || max_employees==null){
        const success = {
            failure:`${instructor_name==null?"instructor_name, ":""}${start_date==null?"start_date, ":""}${min_employees==null?"min_employees, ":""}${max_employees==null?"max_employees ":""}cannot be empty`
        }
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
            max_employees
        });
        res.status(200).json({ message: 'Course added successfully' , data:success});
        
    } catch (error) {
        console.error("DB Error:", error);
    res.status(500).json({ message: "SERVER_ERROR" });
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
