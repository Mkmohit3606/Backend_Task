import { DataTypes } from "sequelize";
import { sequelize } from "../db/db";

export const Course = sequelize.define(
  "Course",
  {
    course_name: { type: DataTypes.STRING, allowNull: false },
    instructor_name: { type: DataTypes.STRING, allowNull: false },
    start_date: { type: DataTypes.STRING, allowNull: false },
    min_employees: { type: DataTypes.INTEGER, allowNull: false },
    max_employees: { type: DataTypes.INTEGER, allowNull: false },
    course_id: {
      type: DataTypes.STRING,
      unique: true,
    },
  },
  {
    hooks: {
      beforeCreate: (course: any) => {
        course.course_id = `OFFERING-${course.course_name.toUpperCase()}-${course.instructor_name.toUpperCase()}`;
      },
    },
  }
);
