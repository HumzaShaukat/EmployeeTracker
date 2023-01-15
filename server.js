const mysql = require('mysql2');
const inq = require('inquirer');
const cTable = require('console.table');
const {selectFunction, init} = require('./assets/helper/helper');

async function test() {
    // selectFunction("add a role");
    await selectFunction("view all roles");
}

init();