import { DataTypes } from "sequelize";
import { sequelize } from "../db/db";

export const Register = sequelize.define('REGISTER',{
    employee_name:{type:DataTypes.STRING, allowNull:false},
    email:{type:DataTypes.STRING,allowNull:false},
    course_id:{type:DataTypes.STRING,allowNull:false}
})