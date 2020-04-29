const express = require('express');
const app = express();
const port = 3000;
const bodyParser = require('body-parser');
const cors = require('cors')
const db = require('./database')

// UPLOADER SETUP
const fs = require('fs')
const { uploader } = require('./helper/uploader')

app.use(express.static('public'))
app.use(bodyParser())
app.use(cors())

// MANAGE PRODUCT
app.post('/add-product', (req, res) => {
    const path = '/images'
    const upload = uploader(path, 'IMG').fields([{ name : 'image' }]);
    upload(req, res, (err) => {
        const { image } = req.files;
        const { nama, harga } = JSON.parse(req.body.data)
        const imagePath = image ? `${path}/${image[0].filename}` : null

        let sql = `insert into product (nama, harga, imagePath) values ('${nama}', ${harga}, '${imagePath}')`
        db.query(sql, req.body, (err, results) => {
            if(err){
                fs.unlinkSync(`./public${imagePath}`)
                res.status(500).send(err.message)
            }
            res.status(200).send({
                status : "successful added",
                message : "data has added"
            })
        })
    })
})

app.get('/get-product', (req, res) => {
    let sql = `select * from product`;
    db.query(sql, (err, results) => {
        if(err)res.status(500).send(err.message)
        res.status(200).send(results)
    })
})

app.patch('/edit-product/:id', (req, res) => {
    let { id } = req.params
    let sql = `select * from product where product_id = ${id}`;
    db.query(sql, (err, results) => {
        if(err)res.status(500).send(err.message)

        const oldImagePath = results[0].imagePath
        const path = '/images'
        const upload = uploader(path, 'IMG').fields([{ name : 'image' }])
        upload(req, res, (err) => {
            const { image } = req.files;
            const { nama, harga } = JSON.parse(req.body.data)
            const imagePath = image ? `${path}/${image[0].filename}` : null

            let sql = `update product set nama = '${nama}', harga = ${harga}, imagePath = '${imagePath}' where product_id = ${id}`;
            db.query(sql, req.body, (err, update) => {
                if(err){
                    fs.unlinkSync(`./public${imagePath}`)
                    res.status(500).send(err.message)
                }
                if(image){
                    fs.unlinkSync(`./public${oldImagePath}`)
                }
                res.status(200).send({
                    status : "successful edited",
                    message : "data has edited"
                })
            })
        })
    })
})

app.delete('/delete-product/:id', (req, res) => {
    let { id } = req.params
    let sql = `select * from product where product_id = ${id}`;
    db.query(sql, (err, results) => {
        if(err)res.status(500).send(err.message)

        const oldImagePath = results[0].imagePath
        let sql = `delete from product where product_id = ${id}`;
        db.query(sql, (err, response) => {
            if(err)res.status(500).send(err.message)
            fs.unlinkSync(`./public${oldImagePath}`)
            res.status(200).send({
                status : "successful deleted",
                message : "data has deleted"
            })
        })
    })
})

// MANAGE STORE
app.post('/add-store', (req, res) => {
    let sql = `insert into store set ?`;
    db.query(sql, req.body, (err, results) => {
        if(err)res.status(500).send(err.message)
        res.status(200).send({
            status : "successful added",
            message : "store has created"
        })
    })
})

app.get('/get-store', (req, res) => {
    let sql = `select * from store`;
    db.query(sql, (err, results) => {
        if(err)res.status(500).send(err.message)
        res.status(200).send(results)
    })
})

app.patch('/edit-store/:id', (req, res) => {
    let sql = `update store set ? where store_id = ${req.params.id}`;
    db.query(sql, req.body, (err, results) => {
        if(err)res.status(500).send(err.message)
        res.status(200).send({
            status : "successful edited",
            message : "store has edited"
        })
    })
})

app.delete('/delete-store/:id', (req, res) => {
    let sql = `delete from store where store_id = ${req.params.id}`;
    db.query(sql, (err, results) => {
        if(err)res.status(500).send(err.message)
        res.status(200).send({
            status : "successful deleted",
            message : "store has deleted"
        })
    })
})

// MANAGE INVENTORY
app.post('/add-inventory', (req, res) => {
    let sql = `insert into inventory set ?`;
    db.query(sql, req.body, (err, results) => {
        if(err)res.status(500).send(err.message)
        res.status(200).send({
            status : "successful added",
            message : "inventory has created"
        })
    })
})

app.get('/get-inventory', (req, res) => {
    let sql = `select nama as "Product", branch_name as "Branch Name", inventory as "Stock"
    from inventory i
    join product p on i.id_product = p.product_id
    join store s on i.id_store = s.store_id;`;
    db.query(sql, (err, results) => {
        if(err)res.status(500).send(err.message)
        res.status(200).send(results)
    })
})

app.patch('/edit-inventory/:id', (req, res) => {
    let sql = `update inventory set ? where idinventory = ${req.params.id}`;
    db.query(sql, req.body, (err, results) => {
        if(err)res.status(500).send(err.message)
        res.status(200).send({
            status : "successful edited",
            message : "inventory has edited"
        })
    })
})

app.delete('/delete-inventory/:id', (req, res) => {
    let sql = `delete from inventory where idinventory = ${req.params.id}`;
    db.query(sql, (err, results) => {
        if(err)res.status(500).send(err.message)
        res.status(200).send({
            status : "successful deleted",
            message : "inventory has deleted"
        })
    })
})

app.listen(port, () => console.log(`Server is running on port ${port}`))
