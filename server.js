const express = require('express');
const mysql = require('mysql2');
const inq = require('inquirer');

const PORT = process.env.PORT || 3001;
const app = express();

//middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

function viewDepartments() {
    db.query('SELECT * FROM departments;', function (err, results) {
        console.log(results);
    }) 
}

function viewRoles() {
    db.query('SELECT * FROM roles', function (err, results) {
        console.log(results);
    })
}

function viewEmployees() {
    db.query('SELECT * FROM employees', function (err, results) {
        console.log(results);
    })
}


function addDepartment() {
    inq.prompt([
        {
            type: "input",
            message: "What is the name of the department",
            name: "department"
        }
    ]).then((data) => {
        db.query(`INSERT INTO departments(\`name\`) VALUES("${data.department}");`, function (err, results) {
            if (err) throw err;
        });
    })
}
//connect to db
const db = mysql.createConnection(
    {
      host: 'localhost',
      user: 'root',
      password: 'password',
      database: 'employee_db'
    },
    console.log(`Connected to the database.`)
  );

  inq.prompt([
    {
        type: "checkbox",
        name: "process",
        choices: ["view all departments", "view all roles", "view all employees", "add a role", "add an employee", "update an employee role"],
        message: "Welcome to the employee management system.  What would you like to do today?"
    }
  ])
  .then((data) => {
    addDepartment();
  })