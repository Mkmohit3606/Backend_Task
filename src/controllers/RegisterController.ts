import { Request, Response } from "express";
import { Register } from "../models/register.model";
import { Course } from "../models/courses.model";

const registerCourse = async (req: Request, res: Response): Promise<void> => {
  const { employee_name, email, course_id } = req.body;
    // console.log(req.body);
    // console.log(req.params);
  try {
    if(!employee_name || !email || !req.body.course_id){
      res.status(400).json({
         "status": 400,
        message:"INPUT_DATA_ERROR",
        data:{
          failure:{
            message:`${!employee_name?"employee_name, ":""}${!email?"email and ":""}${!req.body.course_id?"course-offering-id ":""}missing`
          }
        }
      });
      return;
    }
    const course = await Course.findOne({ where: { course_id } });
    //console.log(course);
    if (!course) {
      res.status(404).json({ 
         "status": 404,
        message: "COURSE_NOT_FOUND" });
      return;
    }

    const registrationCount = await Register.count({ where: { course_id } });
    const registrationSameEmail = await Register.count({where:{course_id,email}});
    console.log(registrationCount);
    if (registrationCount >= course.dataValues.max_employees || registrationSameEmail) {
      res.status(400).json({
         "status": 400,
        message: registrationSameEmail>0?"REGISTER_FOUND_SAME_EMAIL": "COURSE_FULL_ERROR",
        data: {
          failure: {
            message: `cannot register for course, ${registrationSameEmail>0?"register already added":"course is full"}`
          }
        }
      });
      return;
    }

    const newRegistration = await Register.create({
      employee_name,
      email,
      course_id,
      status: "ACCEPTED"
    });

    res.status(200).json({
      message: `successfully registered for ${course_id}`,
      data: {
        success: {
          registration_id: newRegistration.registration_id,
          status: newRegistration.status
        }
      }
    });

  } catch (error) {
    console.error("DB Error:", error);
    res.status(500).json({
       "status": 500,
      message: "SERVER_ERROR" });
  }
};

const allotCourse = async(req:Request,res:Response):Promise<void>=>{
  const {course_id} = req.params;
  try {
    const getRegisterUser = await Register.findAll({where:{course_id, status:"ACCEPTED"},
      attributes: { exclude: ['createdAt', 'updatedAt'] } // 👈 this hides them
    });
    
      res.status(200).json({
        status:200,
        message: getRegisterUser.length>0?"successfully allotted course to registered employees":"There is no course allocate to registered employees",
        data:{
          success:getRegisterUser
        }
      })
  } catch (error) {
    console.error("DB Error:", error);
    res.status(500).json({
       "status": 500,
      message: "SERVER_ERROR" });
  }
}

const cancelAllot = async (req: Request, res: Response): Promise<void> => {
  const { registration_id } = req.params;

  try {
    if (!registration_id) {
      res.status(400).json({
        status: 400,
        message: "Please provide the registration ID to cancel allotment",
      });
      return;
    }

    const getAllotUser = await Register.findOne({
      where: { registration_id }
    });

    if (!getAllotUser) {
      res.status(404).json({
        status: 404,
        message: `No user found with registration ID: ${registration_id}`,
      });
      return;
    }

    if (getAllotUser.status === 'CANCEL_REJECTED') {
      res.status(200).json({
        status: 200,
        message: `Cancellation rejected - already allotted`,
        data: {
          success: {
            registration_id,
            course_id: getAllotUser.course_id,
            status: 'CANCEL_REJECTED'
          }
        }
      });
      return;
    }

    await getAllotUser.update({ status: 'CANCEL_REJECTED' });

    res.status(200).json({
      status: 200,
      message: `Cancel registration unsuccessfull`,
      data: {
        success: {
          registration_id,
          course_id: getAllotUser.course_id,
          status: 'CANCEL_REJECTED',
        },
      },
    });
  } catch (error) {
    console.error("DB Error:", error);
    res.status(500).json({
      status: 500,
      message: "SERVER_ERROR",
    });
  }
};


export const RegisterController = {
  registerCourse,
  allotCourse,
  cancelAllot
};
