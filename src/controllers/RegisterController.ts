import { Request, Response } from "express";
import { Register } from "../models/register.model";
import { Course } from "../models/courses.model";
import { Op } from "sequelize";

interface registerInput{
  employee_name:string,
  email:string,
  course_id:string
}

const STATUS = {
  ACCEPTED: 'ACCEPTED',
  CONFIRMED: 'CONFIRMED',
  CANCELED: 'CANCELED'
} as const;

//define the type for the update the status of register.
type StatusType = typeof STATUS[keyof typeof STATUS];

// create the function for update
async function updateStatus(course_id:string, status:StatusType) {
    await Register.update({status},{where:{course_id}});
}

//create the function for check is cancelled or confirmed
function isConfirmed(status: StatusType): boolean {
  return status === STATUS.CONFIRMED;
}

function isCanceled(status: StatusType): boolean {
  return status === STATUS.CANCELED;
}

const registerCourse = async (req: Request, res: Response): Promise<void> => {
  const { employee_name, email, course_id }: registerInput = req.body;
  let existRegister:boolean =false;
  try {
    const isMissing:Boolean =
      !employee_name?.trim() ||
      !email?.trim() ||
      !course_id?.trim();

    if (isMissing) {
      const missingFields:Array<String> = [];
      if (!employee_name?.trim()) missingFields.push("employee_name");
      if (!email?.trim()) missingFields.push("email");
      if (!course_id?.trim()) missingFields.push("course_id");

      res.status(400).json({
        status: 400,
        message: "INPUT_DATA_ERROR",
        data: {
          failure: {
            message: `${missingFields.join(", ")} missing`
          }
        }
      });
      return;
    }

    /**
     * need to check if min_Emp and current Data is exceed then course it will not registered  =>
     * need to check if max_Emp is full for that perticular course then it will not registered
     */

    const course = await Course.findOne({ where: { course_id } });

    //course not found
    if (!course) {
      res.status(404).json({
        status: 404,
        message: "COURSE_NOT_FOUND"
      });
      return;
    }

    //we need to check if current date not exceed the course starting date if yes the set can
  // assuming course.start_date is a Date object or valid date string
  const courseStartDate:Date = new Date(
  +course.start_date.slice(4),        // year
  +course.start_date.slice(2, 4) - 1, // month (0-indexed)
  +course.start_date.slice(0, 2) + 1   // day
);
  console.log(courseStartDate);
  if (courseStartDate < new Date()) {
    res.status(400).json({
      status: 400,
      message: "COURSE_ALREADY_STARTED",
      data: {
        failure: {
          message: "Cannot register, course has already started"
        }
      }
    });
    return;
  }

    const registrationCount = await Register.count({ where: { course_id } });

    if (registrationCount >= course.max_employees) {
      res.status(400).json({
        status: 400,
        message: "COURSE_FULL_ERROR",
        data: {
          failure: {
            message: "Cannot register for course, course is full"
          }
        }
      });
      return;
    }

    const registration_id = `${employee_name}-${course.course_name}`;

    const newRegistration = await Register.create({
      registration_id,
      employee_name,
      email,
      course_id,
      status:'ACCEPTED'
    });

    // if (registrationCount + 1 >= course.max_employees) {
    //   course.status = 'COURSE_FULL_ERROR';
    //   await course.save();
    // }

    res.status(200).json({
      status: 200,
      message: `Successfully registered for ${course_id}`,
      data: {
        success: {
          registration_id,
          status: "ACCEPTED",
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
    const course = await Course.findOne({ where: { course_id } });
    if (!course) {
      res.status(404).json({
        status: 404,
        message: "COURSE_NOT_FOUND",
      });
      return;
    }
    const now = new Date();
    // Convert DDMMYYYY string to Date
    const courseStartDate = new Date(
      +course.start_date.slice(4),        // year
      +course.start_date.slice(2, 4) - 1, // month (0-indexed)
      +course.start_date.slice(0, 2) + 1      // day
    );

    // Check if course has started or today is the date
    // if (courseStartDate > now) {
    //   res.status(400).json({
    //     status: 400,
    //     message: "COURSE_NOT_YET_STARTED",
    //   });
    //   return;
    // }
    
    const getRegisterUser = await Register.findAll({where:{course_id},
      attributes: { exclude: ['createdAt', 'updatedAt'] },
      order:[['id','ASC']]
    });

    // Check if minimum registration met
    //If sufficient registrations are not received then the course offering itself gets cancelled.
    if(getRegisterUser.length<course.min_employees && courseStartDate<now){
      course.status='COURSE_CANCELED';
      await course.save();
      await updateStatus(course_id,'CANCELED');
    }

    //This feature allots employees to course offering, before the course offering date.
    if(getRegisterUser.length>=course.min_employees && getRegisterUser.length<=course.max_employees){
      course.status = 'ACCEPTED';
      await course.save();
      // await Register.update({status:'CONFIRMED'},{where:{ course_id }});
      await updateStatus(course_id,'CONFIRMED');
    }
    const responseData = getRegisterUser.map((user)=>({
      registration_id:user.registration_id,
      email:user.email,
      course_name:course.course_name,
      course_id:user.course_id,
      status:user.status
    }))

      res.status(200).json({
        status:200,
        message: getRegisterUser.length>0?"successfully allotted course to registered employees":"There is no course allocate to registered employees",
        data:{
          success:responseData
        }
      });
  } catch (error) {
    console.error("DB Error:", error);
    res.status(500).json({
       "status": 500,
      message: "SERVER_ERROR" });
  }
}

const cancelRegister = async (req: Request, res: Response): Promise<void> => {
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

    if (isConfirmed(getAllotUser.status)) { 
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

    if(isCanceled(getAllotUser.status)){
      res.status(200).json({
        status: 200,
        message: `Course already canceled`,
        data: {
          success: {
            registration_id,
            course_id: getAllotUser.course_id,
            status: 'COURSE_CANCELED'
          }
        }
      });
      return;
    }


    await getAllotUser.update({ status: 'CANCELED' });

    res.status(200).json({
      status: 200,
      message: `Cancel registration unsuccessfull`,
      data: {
        success: {
          registration_id,
          course_id: getAllotUser.course_id,
          status: 'CANCEL_ACCEPTED',
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
  cancelRegister
};
