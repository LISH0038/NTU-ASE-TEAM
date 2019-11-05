const express = require('express'),
    router = express.Router(),
    env = require(process.env.node_env),
    jsonfile = require('jsonfile'),
    fs = require('fs-extra'),
    controller = require(env.detector);

// generate RecData.json as a reference data
router.get('/', function(req,res){
    const var_controller = new controller();
    var_controller.recognizeFaceFromFaceDB().then(function(data){
        const array = [];
        data.forEach(d => {
            const obj = { label: d.label };
            obj.descriptors = [];
            d.descriptors.forEach(descriptor => {
                const des = Array.prototype.slice.call(descriptor);
                obj.descriptors.push(des);
            });
            array.push(obj);
        });
        const json = JSON.stringify(array, null, 4);
        fs.writeFileSync(env.recData, json, 'utf8');
        res.status(200).send('Finished Loading recognition Data.');
    });
});

module.exports = router;
