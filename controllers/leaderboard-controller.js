const { where } = require("sequelize");
const Expensive = require("../model/expense-model");
const SignUp = require("../model/singup-model");
const data_exporter=require('json2csv').Parser


exports.leaderboard = (req, res) => {
    SignUp.findAll({
        attributes:['username','totalexpense'],
        order: [       ['totalexpense', 'DESC'] ]
    }).then(expenses=>{
        const viewdata = {
            expenses,
            pageTitle: "LEADERBOARD"
        };
        res.render('../views/premium/leaderboard', viewdata);
    })
    .catch(error => {
        console.error('Error occurred while fetching data:', error);
        res.status(500).send('Error occurred while fetching data');
    });
}


const AWS = require('aws-sdk');


exports.getbasis = (req, res) => {
    console.log("into the basis");
    SignUp.findOne({ where: { id: req.user.id } })
        .then(result => {
            console.log("into the download Expenses");
            if (result.ispremium === true) {
                Expensive.findAll({ where: { signupId: req.user.id } })
                    .then(data => {
                        console.log(data);
                        const stringy = JSON.stringify(data);
                        const filename = `Expense${req.user.id}/${new Date()}.txt`;
                        //sending and downloading the file
                        const onfilename = `Expense${req.user.id}/${new Date()}.csv`
                        const dataconv=JSON.parse(JSON.stringify(data))
                        var file_header=['amount','description','category']
                        var json_data=new data_exporter({file_header})
                        var csv_data=json_data.parse(dataconv)
                        res.setHeader("Content-Type","text/csv")
                        res.setHeader("Content-Disposition",`attachment;filename=${onfilename}`)
                        res.status(200).end(csv_data)
                    }).catch(err => {
                        console.log("ERROR IN DOWNLOAD", err);
                    })
            } else {
                res.render('../views/premium/not_down')
            }
        }).catch(err => {
            console.log("error", err);
        })
}

  