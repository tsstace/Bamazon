var mysql = require("mysql");
var inquirer = require("inquirer");

// create the connection information for the sql database
var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "root",
    database: "bamazondb",
});

connection.connect(function (err) {
    if (err) throw err;
    console.log("connected as id " + connection.threadId + "\n");
    // run the start function after the connection is made to prompt the user
    start();
});

function start() {
    // display all items for sale (include the ids, names and prices)
    //    console.log("Selecting all items available...\n");
    connection.query("SELECT * FROM products", function (err, res) {
                if (err) throw err;
            
     //           console.log('*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*')
                console.log('                                                                                                ')
                console.log('                              Welcome to Bamazon - a boutique unique                            ')
                console.log('                              ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~                          ')
                console.log('                                                                                                ')
                for (var i = 0; i < res.length; i++) {
                console.log(" id: " + res[i].item_id + " | " + res[i].product_name + " | " + "Department: " + res[i].dept_name + 
                " | " + "Price: " + res[i].price + " | " + "Qty In Stock: " + res[i].stock_qty);
                console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~')
 //               connection.end();
                }

                console.log(' ');
                //prompt the user with 2 messages: (1)which item and (2)how many?
                inquirer.prompt([
                    {
                        type: "input",
                        name: "id",
                        message: "What is the id number of the product you would like to buy?",
                        validate: function (value) {
                            if (isNaN(value) == false && parseInt(value) <= res.length && parseInt(value) > 0) {
                                return true;
                            } else {
                                return false;
                            }
                        }
                    },
                    {
                        type: "input",
                        name: "qty",
                        message: "How many units would you like to buy?",
                        validate: function (value) {
                            if (isNaN(value)) {
                                return false;
                            } else {
                                return true;
                            }
                        }
                    }
                ]).then(function (ans) {
                    var whatTheyWant = (ans.id) - 1;
                    var howMany = parseInt(ans.qty);
                    var grandTotal = parseFloat(((res[whatTheyWant].price) * howMany).toFixed(2));

                    // Check to see if there are sufficient quantities to fulfill the order
                    if (res[whatTheyWant].stock_qty >= howMany) {
                        //after sale, update quantity in Products
                        connection.query("UPDATE products SET ? WHERE ?", [
                            {
                                stock_qty: (res[whatTheyWant].stock_qty - howMany)
                            },
                            {
                                item_id: ans.id
                            }
                        ], function (err, result) {
                            if (err) throw err;
                            console.log("Thank you for your purchase! Your total is $" + grandTotal.toFixed(2) + ". Your item(s) will be shipped to you in 3-5 business days.");
                            reprompt();
                        });

                    } else {
                        console.log("Sorry, this item is currently oversold; please check back again tomorrow.");
                        reprompt();
                    }
                })
            })
            }

            //ask if they would like to purchase another item
            function reprompt() {
                inquirer.prompt([{
                    type: "confirm",
                    name: "reply",
                    message: "Do you have more shopping to do?"
                }]).then(function (ans) {
                    if (ans.reply) {
                        start();
                    } else {
                        console.log("Grazie - ciao!");
                        connection.end();
                    }
                });
            }