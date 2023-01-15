const mysql = require('mysql2');
const inq = require('inquirer');
const cTable = require('console.table');

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

  //initial function
async function init() {
   inq.prompt([
   {
       type: "list",
       name: "process",
       choices: ["view all departments", "view all roles", "view all employees", "add a department", "add a role", "add an employee", "update an employee role"],
       message: "Welcome to the employee management system.  What would you like to do today?"
   }
 ])
 .then(async (data) => {
    await cycleChoices(data.process);
 })
}

function cycleChoices(data) {
    selectFunction(data);
}
//helper functions to help resolve promises

async function getResults(query) {
    let resultArray =[];
    let array = []
    await db.promise().query(query).then((results)=> {
        resultArray = results[0].map(function(a) {
            array.push(a.name);
            return array;
        });
        resultArray = array.flat(1);
    })
    return resultArray;
}

async function getRoleResults(query) {
    let resultArray =[];
    let array = []
    await db.promise().query(query).then((results)=> {
        resultArray = results[0].map(function(a) {
            array.push(a.title);
            return array;
        });
        resultArray = array.flat(1);
    })
    return resultArray;
}

async function getManagerResults() {
    let resultArray =[];
    let managerArray = ["None"]
    await db.promise().query('SELECT first_name, last_name FROM employees;').then(await function(results){
        resultArray = results[0].map(function(a) {
            managerArray.push(a.first_name + " " + a.last_name);
            return managerArray;
        });
        resultArray = managerArray.flat(1);
    })
    return resultArray;
}

async function getEmployeeResults(query) {
    let resultArray =[];
    let array = []
    await db.promise().query(query).then((results)=> {
        resultArray = results[0].map(function(a) {
            array.push(a.name);
            return array;
        });
        resultArray = array.flat(1);
    })
    return resultArray;
}

//Following functions return the id of the result entered into inquirer

async function getDepartmentID(data) {
    let mapArray = [];
    let depID;
    await db.promise().query(`SELECT id FROM departments WHERE departments.\`name\` = ?;`,data)
    .then(await function(results) {
        mapArray = results[0].map(function(a) {
            let tempArray = [];
            tempArray.push(a.id);
            return tempArray;
        })        
    })
    depID = Number(mapArray);
    return depID;    
}

async function getRoleID(data) {
    let mapArray = [];
    let roleID;
    let tempArray = [];
    await db.promise().query(`SELECT id FROM roles WHERE roles.title = ?;`,data)
    .then(await function(results) {
        mapArray = results[0].map(function(a) {
            tempArray.push(a.id);
            return tempArray;
        })        
    })
    roleID = Number(tempArray);
    return roleID;    
}

async function getManagerID(data) {
    let mapArray = [];
    let managerID;
    let tempArray = [];
    await db.promise().query(`SELECT employees.id FROM employees WHERE concat(employees.first_name, ' ', employees.last_name) = ?;`,data)
    .then(await function(results) {
        mapArray = results[0].map(function(a) {
            tempArray.push(a.id);
            return tempArray;
        })        
    })
    managerID = Number(tempArray);
    return managerID;    
}

//This is a helper function to help with returning promises in order

async function setResults(query) {
    let array;
    if (query == "manager") {
        array = await getManagerResults();
    } else if (query == "role") {
        array = await getRoleResults("SELECT title FROM roles;");
    } else if (query == "employee") {
        array = await getEmployeeResults("SELECT concat(first_name,' ', last_name) AS name FROM employees")
    } else {
        array = await getResults(query);
    }
    return array;
}

//functions that allow the user to view the current version of the database

async function viewDepartments() {
    db.query('SELECT * FROM departments;', await function (err, results) {
        console.table('', results);
    })
    init();
}

async function viewRoles() {
    db.query('SELECT roles.id, roles.title, departments.`name`AS Department, roles.salary FROM roles INNER JOIN departments ON departments.id = roles.department_id;', await function (err, results) {
        console.table('',results);
    })
    init();
}

async function viewEmployees() {
    db.query('SELECT employees.first_name AS `First Name`, employees.last_name AS `Last Name`, roles.title AS `Role Title`, dep.`name` AS Department, roles.salary AS Salary, concat(emp2.first_name," ", emp2.last_name) AS Manager FROM employees LEFT JOIN employees emp2 ON emp2.id = employees.manager_id INNER JOIN roles ON roles.id = employees.role_id INNER JOIN departments dep ON dep.id = roles.department_id;', function (err, results) {
        console.table('',results);
    })
    init();
}

//functions that add to the database

async function addDepartment() {
    await inq.prompt([
        {
            type: "input",
            message: "What is the name of the department",
            name: "department"
        }
    ]).then((data) => {
        db.query(`INSERT INTO departments(\`name\`) VALUES("${data.department}");`, function (err, results) {
            if (err) throw err;
            else {
                console.log("Department Successfully Added!");
                init();
            }
        });  
    });
}

async function addRole() {
    let choiceList = await setResults("SELECT \`name\` FROM departments");
    var depID;
    inq.prompt([
        {
            type: "input",
            message: "What role would you like to add?",
            name: "role"
        },
        {
            type: "input",
            message: "What is the salary for the role?",
            name: "salary"
        },
        {
            type: "list",
            message: "What department is the role in?",
            name: "department",
            choices: choiceList
        }
    ]).then(async (data) => {
        depID = await getDepartmentID(data.department);
        db.query(`INSERT INTO roles(title, salary, department_id) VALUES("${data.role}" , "${data.salary}", "${depID}");`, function (err, results) {
            if (!err) {
                console.log("Role Successfully added!")
                init();
            } else {
                console.log(err);
            }
        });  
    });
}

async function addEmployee() {
    let choiceList = await setResults("role");
    let managerChoices = await setResults("manager");
    inq.prompt([
        {
            type: "input",
            message: "What is the employee's first name?",
            name: "fname"
        },
        {
            type: "input",
            message: "What is the employee's last name?",
            name: "lname"
        },
        {
            type: "list",
            message: "What is the employee's role?",
            name: "role",
            choices: choiceList
        },
        {
            type: "list",
            message: "Who is the employee's manager?",
            name: "manager",
            choices: managerChoices
        }
    ]).then(async (data)=> {
        let managerID;
        if (data.manager == "None") {
            managerID = null;
        } else {
            managerID = await getManagerID(data.manager);
        }
        let roleID = await getRoleID(data.role);
        db.query(`INSERT INTO employees(first_name, last_name, role_id, manager_id) VALUES("${data.fname}","${data.lname}",${roleID},${managerID});`, function (err,results) {
            if (!err) {
                console.log("New Employee Successfully Added!");
            } else {
                console.log(err);
            }
        })
        init();
    })
}

async function updateRole() {
    let roleList = await setResults("role");
    let employeeList = await setResults("employee")
    inq.prompt([
        {
            type: "list",
            message: "Which Employee's role would you like to update?",
            name: "employee",
            choices: employeeList
        },
        {
            type: "list",
            message: "What role would you like to change to?",
            name: "newRole",
            choices: roleList
        }
    ]).then(async (data)=> {
        let employeeID = await getManagerID(data.employee);
        let roleID = await getRoleID(data.newRole);
        db.query(`UPDATE employees SET role_id = ${roleID} WHERE employees.id = ${employeeID}`, function(err,result) {
            if (!err) {
                console.log("Employee Role Successfully Updated!");
            } else {
                console.log(err);
            }
        })
    })
}

async function selectFunction(response){
    if (response == "view all departments") {
        await viewDepartments();
    } else if (response == "view all roles") {
        await viewRoles();
    } else if (response == "view all employees") {
        await viewEmployees();
    } else if (response == "add a department") {
        await addDepartment();
    } else if (response == "add a role") {
        await addRole();
    } else if (response == "add an employee") {
        await addEmployee();
    } else if (response == "update an employee role") {
        await updateRole();
    }
}
module.exports = { selectFunction, init };