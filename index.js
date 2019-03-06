require('dotenv-defaults').config(); //set up env
const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs'));
const csv = Promise.promisifyAll(require('csv'));
const os = require('os');

const async = require('async');
const axios = require('axios');
const _ = require('lodash');
const readlineSync = require('readline-sync');

const debug = process.env.DEBUG === 'true';
const outputDir = `./output`;
const apiUrl = process.env.API_URL;
const serviceInstanceId = process.env.SERVICE_INSTANCE_ID;
const serviceContainer = `/Compute-${serviceInstanceId}/`;
const parallelLimit = process.env.PARALLEL_LIMIT;
const csvName = process.env.CSV_FILE_NAME;
const csvPath = `${outputDir}/${csvName}`;

const csvOptions = {
    // header: true,
    // columns: columns,
    quoted: true,
    quotedEmpty: true
};

const csvStringifier = csv.stringify(csvOptions);

csvStringifier.on('readable', async () => {
    let row = '';
    while (row = csvStringifier.read()) {
        await fs.appendFile(csvPath, row, 'utf8', () => {});
    }
});

const session = axios.create({
    baseURL: apiUrl,
    withCredentials: true
});

const apiTargets = [{
        'url': `/network/v1/acl${serviceContainer}`,
        'file': 'network_acl.json'
    },
    {
        'url': `/account${serviceContainer}`,
        'file': 'account.json'
    },
    {
        'url': `/backupservice/v1/configuration`,
        'file': 'backup_configuration.json'
    },
    {
        'url': `/backupservice/v1/backup`,
        'file': 'backup.json'
    },
    {
        'url': `/network/v1/ipassociation${serviceContainer}`,
        'file': 'network_ipassociation.json'
    },
    {
        'url': `/network/v1/ipaddressprefixset${serviceContainer}`,
        'file': 'network_ipaddressprefixset.json'
    },
    {
        'url': `/network/v1/ipreservation${serviceContainer}`,
        'file': 'network_ipreservation.json'
    },
    {
        'url': `/ip/association${serviceContainer}`,
        'file': 'association.json'
    },
    {
        'url': `/network/v1/ipnetworkexchange${serviceContainer}`,
        'file': 'network_ipnetworkexchange.json'
    },
    {
        'url': `/network/v1/ipnetwork${serviceContainer}`,
        'file': 'network_ipnetwork.json'
    },
    {
        'url': `/ip/reservation${serviceContainer}`,
        'file': 'ipreservation.json'
    },
    {
        'url': `/imagelist${serviceContainer}`,
        'file': 'imagelist.json'
    },
    {
        'url': `/instance${serviceContainer}`,
        'file': 'instance.json'
    },
    {
        'url': `/machineimage${serviceContainer}`,
        'file': 'machineimage.json'
    },
    {
        'url': `/integrations/osscontainer${serviceContainer}`,
        'file': 'osscontainer.json'
    },
    {
        'url': `/orchestration${serviceContainer}`,
        'file': 'orchestration.json'
    },
    {
        'url': `/platform/v1/object${serviceContainer}`,
        'file': 'orchestration_object.json'
    },
    {
        'url': `/platform/v1/orchestration${serviceContainer}`,
        'file': 'orchestrationV2.json'
    },
    {
        'url': `/network/v1/privategateway${serviceContainer}`,
        'file': 'network_privategateway.json'
    },
    {
        'url': `/rebootinstancerequest${serviceContainer}`,
        'file': 'rebootinstancerequest.json'
    },
    {
        'url': `/network/v1/route${serviceContainer}`,
        'file': 'network_route.json'
    },
    {
        'url': `/secapplication${serviceContainer}`,
        'file': 'secapplication.json'
    },
    {
        'url': `/secassociation${serviceContainer}`,
        'file': 'secassociation.json'
    },
    {
        'url': `/seciplist${serviceContainer}`,
        'file': 'seciplist.json'
    },
    {
        'url': `/seclist${serviceContainer}`,
        'file': 'seclist.json'
    },
    {
        'url': `/secrule${serviceContainer}`,
        'file': 'secrule.json'
    },
    {
        'url': `/network/v1/secprotocol${serviceContainer}`,
        'file': 'network_secprotocol.json'
    },
    {
        'url': `/network/v1/secrule${serviceContainer}`,
        'file': 'network_secrule.json'
    },
    {
        'url': `/shape/`,
        'file': 'shape.json'
    },
    {
        'url': `/snapshot${serviceContainer}`,
        'file': 'snapshot.json'
    },
    {
        'url': `/storage/attachment${serviceContainer}`,
        'file': 'storage_attachment.json'
    },
    {
        'url': `/property/storage${serviceContainer}`,
        'file': 'storage_property.json'
    },
    {
        'url': `/storage/snapshot${serviceContainer}`,
        'file': 'storage_snapshot.json'
    },
    {
        'url': `/storage/volume${serviceContainer}`,
        'file': 'storage_volume.json'
    },
    {
        'url': `/vpnendpoint/v2${serviceContainer}`,
        'file': 'vpnendpointV2.json'
    },
    {
        'url': `/vpnendpoint${serviceContainer}`,
        'file': 'vpnendpoint.json'
    },
    {
        'url': `/network/v1/vnicset${serviceContainer}`,
        'file': 'network_vnicset.json'
    },
    {
        'url': `/network/v1/vnic${serviceContainer}`,
        'file': 'network_vnic.json'
    }
];

function axiosError(error) {
    if (!debug) {
        return;
    }
    if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.log(error.response.data);
        console.log(error.response.status);
        console.log(error.response.headers);
    } else if (error.request) {
        // The request was made but no response was received
        // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
        // http.ClientRequest in node.js
        console.log(error.request);
    } else {
        // Something happened in setting up the request that triggered an Error
        console.log('Error', error.message);
    }
    console.log(error.config);
}

const rmDir = function (dirPath) {
    try {
        var files = fs.readdirSync(dirPath);
    } catch (e) {
        return;
    }
    if (files.length > 0)
        for (var i = 0; i < files.length; i++) {
            var filePath = dirPath + '/' + files[i];
            if (fs.statSync(filePath).isFile())
                fs.unlinkSync(filePath);
            else
                rmDir(filePath);
        }
    fs.rmdirSync(dirPath);
};

function cleanOutputDir() {
    if (fs.existsSync(outputDir)) {
        rmDir(outputDir);
    }
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir);
    }
}

function logJsonData(fileName, data) {
    fs.writeFileSync(`${outputDir}/${fileName}`, JSON.stringify(data, null, 4), 'utf8', null);
};

function loginToApi(cb) {
    let username = readlineSync.question('Please enter your user name: ');
    let password = readlineSync.question('Please enter your password: ', {
        hideEchoBack: true // The typed text on screen is hidden by `*` (default).
    });

    const fullUserName = `${serviceContainer}${username}`;

    console.log(`Authenticating user: ${fullUserName}`);

    session.post('/authenticate/', {
            user: fullUserName,
            password: password
        })
        .then((res) => {
            console.log('Login success!');
            //give the nimbula cookie
            cb(null, {
                'Cookie': res.headers['set-cookie'][0]
            });
        })
        .catch((error) => {
            console.log('Login failed!');
            axiosError(error);
            cb(error);
        });
};

function sanitizeData(target, data) {
    //here we take out administrator_password for windows instances
    if (target.url.indexOf('/instance/') !== -1) {
        _.each(data.result, (instance) => {
            if (_.has(instance, 'attributes.userdata.administrator_password')) {
                delete instance.attributes.userdata.administrator_password;
            }
        });
    }
    return data;
};

function pullApiData(headers, cb) {
    cleanOutputDir();
    let operations = {};
    for (let i = 0; i < apiTargets.length; i++) {
        const target = apiTargets[i];
        operations[target.file.split('.')[0]] = (callback) => {
            session.get(target.url, {
                    headers //set the nimbula cookie
                })
                .then((res) => {
                    let item = sanitizeData(target, res.data);
                    logJsonData(target.file, item);
                    console.log(`Success: ${target.file}`);
                })
                .catch((error) => {
                    console.log(`Fail: ${target.file}`);
                    axiosError(error);
                })
                .finally(() => {
                    callback(null)
                });
        };
    }

    //console.log(operations)

    async.parallelLimit(operations, parallelLimit, (err, results) => {
        if (err) {
            cb(err);
            return;
        }
        cb(null);
    });
};

function formatBytes(bytes, decimals) {
    if (bytes == 0) return '0 Bytes';
    var k = 1024,
        dm = decimals <= 0 ? 0 : decimals || 2,
        sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
        i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

function prepCsv(cb) {
    const csvColumns = [
        '"Instance"',
        '"State"',
        '"Private IP"',
        '"Shape"',
        '"OCPU"',
        '"Memory"',
        '"Volume Count"',
        '"Volume Size"'
    ];
    if (!fs.existsSync(csvPath))
        fs.appendFileSync(csvPath, `${csvColumns.join(',')}${os.EOL}`, 'utf8');
    console.log('CSV Prepped');
    cb(null);
};

function writeCsvData(cb) {
    const instances = JSON.parse(fs.readFileSync(`${outputDir}/instance.json`));
    const volumes = JSON.parse(fs.readFileSync(`${outputDir}/storage_volume.json`));
    const shapes = JSON.parse(fs.readFileSync(`${outputDir}/shape.json`));
    _.each(instances.result, (instance) => {
        const instanceVolumes = _.map(instance.storage_attachments, (attachment) => {
            return attachment.storage_volume_name;
        });
        
        const vols = _.filter(volumes.result, (vol) => {
            return instanceVolumes.indexOf(vol.name) !== -1;
        });

        const shape = _.find(shapes.result, (shape) => shape.name === instance.shape);

        const data = [
            instance.name,
            instance.state,
            instance.ip,
            instance.shape,
            shape.cpus,
            formatBytes(shape.ram * 1024 * 1024),
            instance.storage_attachments.length,
            formatBytes(_.sumBy(vols, (v) => parseInt(v.size)))
        ];

        csvStringifier.write(data);
    });
    console.log(`Information in ${csvPath}`);
    cb(null);
};

async.waterfall([
    loginToApi,
    pullApiData,
    prepCsv,
    writeCsvData
]);