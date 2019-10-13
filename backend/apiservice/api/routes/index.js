'use strict'

const express = require('express'),
    router = express.Router(),
    env = require(process.env.node_env),
    // env=require('../develConfig.js'),
    jsonfile = require('jsonfile'),
    fs = require('fs-extra'),
    controller = require('../controllers/faceDetector.js');

/* GET home page. */
router.get('/:imageName', function(req, res, next) {
    const cont = new controller();
    const labeledDescriptor = [];
    const absentList = ['U0000004J','U0000006J'];
    const data = jsonfile.readFileSync(env.recData);
    // only look for reference students in the absent list
    data.forEach(d => {
        const obj = {label: d.label};
        let array = [];
        var absent = false;
        for (let i = 0; i < absentList.length; i++){
          if (d.label.includes(absentList[i],0)){
            absent = true;
            break;
          }
        }
        if (absent) {
            d.descriptors.forEach(descriptor => {
                const dat = new Float32Array(descriptor);
                array.push(dat);
            });
            obj.descriptors = array;
            labeledDescriptor.push(obj);
        }
    });

    cont.detectFace(labeledDescriptor, [req.params.imageName]).then(function(data){
        const image = '/images/'+data.image;
        console.log(data.canvas);
        console.log(image);
        console.log(data.recognisedIds);

        res.render('index', { title: 'Express', box: data.canvas, image: image });
    }).catch(function(err){
        console.log(err);
        res.send(err);
    });
});

// generate recognition data
router.get('/recdata', function(req,res){
    const cont = new  controller();
    cont.recognizeFace().then(function(data){
        // descriptions.forEach(description => {
        //   array.push(Array.prototype.slice.call(description));
        // });
        const array = [];
        data.forEach(d => {
            const obj = { label: d.label }
            obj.descriptors = [];
            d.descriptors.forEach(descriptor => {
                const des = Array.prototype.slice.call(descriptor);
                obj.descriptors.push(des);
            });
            array.push(obj);
        });
        const json = JSON.stringify(array, null, 4);
        fs.writeFileSync(env.recData, json, 'utf8');
        res.send('Finished Loading recognition Data.');
    });
});

router.get('/test', function(req,res){
    const data = [{
        label: 'Shawn',
        descriptors: [[1,2,3,4,5],[10,12,17,13,14,15]]
    },{
        label: 'Shawn23',
        descriptors: [[5,12,53,85,75],[154,14,123,123,154,175]]
    }];
    const newDat = data.map(dat => {
        return dat.descriptors.map(d =>{
            return d.map(f => {
                return f+2;
            })
        });
    });
    console.log(newDat);
    res.send('ok');
})

module.exports = router;
