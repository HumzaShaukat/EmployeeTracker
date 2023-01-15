USE employee_db;

INSERT INTO departments(name)
VALUES ("Finance"), ("Legal"), ("Sales"), ("Engineering");

INSERT INTO roles(title, salary, department_id)
VALUES ("Accountant", 80000, 1), ("Advisor", 130000, 2), ("Marketing Manager", 100000, 3), ("Software Engineer", 100000, 4);

INSERT INTO employees(first_name, last_name, role_id, manager_id)
Values("John", "Doe", 1, null), ("Jane", "Doe", 2, 1), ("Danny", "Phantom", 3, 1);