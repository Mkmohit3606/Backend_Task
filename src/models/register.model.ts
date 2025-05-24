import { DataTypes } from "sequelize";
import { sequelize } from "../db/db";

export const Register = sequelize.define('REGISTER', {
    registration_id: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true, // if this is the unique identifier
    },
    employee_name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false },
    course_id: { type: DataTypes.STRING, allowNull: false },
    status: { type: DataTypes.STRING, allowNull: false }
}, {
    hooks: {
        beforeValidate: (Register: any) => {
            if(!Register.registration_id && Register.employee_name && Register.course_id){
                Register.registration_id = `${Register.employee_name.toUpperCase()}-${Register.course_id.toUpperCase()}`;
            }
        }
    },
    indexes: [ //Ensures that (employee_name, email, course_id) is unique (as required)
  {
    unique: true,
    fields: ['employee_name', 'email', 'course_id']
  }
]
});
