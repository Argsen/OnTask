const rand = require('random-key');
const uuidv1 = require('uuid/v1');

module.exports = {
  // get all the workflows' id and name which the access key can access
  getMatrix: async (req, res) => {
    try {
      if (req.method.toLowerCase() == "get") {
        const tokenId = req.options.values.tokenId;
        const access = await Api_Token_Access.find({token: tokenId}).populate('workflow');

        let workflows = [];
        for (let i=0; i<access.length; i++) {
          if (access[i].workflow) {
            workflows.push({
              id: access[i].workflow.id,
              name: access[i].workflow.name,
              description: access[i].workflow.description
            });
          }
        }
        return res.json({
          status: 'success',
          data: workflows
        });
      } else {
        return res.badRequest({
          status: 'error',
          msg: 'Use GET Method.'
        });
      }
    } catch (err) {
      console.log(err);
      res.status(500).send({error: err.code});
    }
  },

  // get the target workflow's columns info and all data
  getData_Matrix: async (req, res) => {
    try {
      const tokenId = req.options.values.tokenId,
            workflowId = req.param('workflowId') || 0,
            serverInfo = sails.config.constant.serverInfo.config,
            adminDB = sails.config.constant.serverInfo.adminDB,
            workflowDB = sails.config.constant.serverInfo.workflowDB;
      const access = await Api_Token_Access.findOne({token: tokenId, workflow: workflowId});

      if (access) {
        const data = await MatrixAPI.getData(workflowId, serverInfo, adminDB, workflowDB);
        
        return res.json({
          status: 'success',
          data: data
        });
      } else {
        return res.badRequest({
          status: 'error',
          msg: "Do not have access to the workflow."
        });
      }
    } catch (err) {
      console.log(err);
      return res.badRequest({
        status: 'error',
        msg: err
      });
    }
  },

  // add column and data to matrix
  addColumn_Matrix: async (req, res) => {
    try {
      const tokenId = req.options.values.tokenId,
            workflowId = req.param('workflowId') || 0,
            serverInfo = sails.config.constant.serverInfo.config,
            adminDB = sails.config.constant.serverInfo.adminDB,
            workflowDB = sails.config.constant.serverInfo.workflowDB,
            columns = req.param('columns'),
            datas = req.param('datas');
      const access = await Api_Token_Access.findOne({token: tokenId, workflow: workflowId});

      if (access) {
        const workflow = await Workflow.findOne(workflowId);
        if (workflow.transfer) {
          const primaryKey = await MatrixAPI.updatePK(workflowId, serverInfo, adminDB, workflowDB, JSON.parse(workflow.transfer));
          const addColumn = await MatrixAPI.addColumn(workflowId, serverInfo, adminDB, workflowDB, columns, datas, primaryKey);
    
          return res.json({
            status: 'success',
            data: addColumn
          });
        } else {
          return res.badRequest({
            status: 'error',
            msg: "Matrix not exists."
          });
        }
      } else {
        return res.badRequest({
          status: 'error',
          msg: "Do not have access to the workflow."
        });
      }
    } catch (err) {
      console.log(err);
      return res.badRequest({
        status: 'error',
        msg: err
      });
    }
  },

  // update matrix data
  update_Matrix: async (req, res) => {
    try {
      const tokenId = req.options.values.tokenId,
            workflowId = req.param('workflowId') || 0,
            serverInfo = sails.config.constant.serverInfo.config,
            adminDB = sails.config.constant.serverInfo.adminDB,
            workflowDB = sails.config.constant.serverInfo.workflowDB,
            columns = req.param('columns'),
            datas = req.param('datas');
      const access = await Api_Token_Access.findOne({token: tokenId, workflow: workflowId});

      if (access) {
        const workflow = await Workflow.findOne(workflowId);
        if (workflow.transfer) {
          const primaryKey = await MatrixAPI.updatePK(workflowId, serverInfo, adminDB, workflowDB, JSON.parse(workflow.transfer));
          const updateColumn = await MatrixAPI.updateColumn(workflowId, serverInfo, adminDB, workflowDB, columns, datas, primaryKey);
    
          return res.json({
            status: 'success',
            data: updateColumn
          });
        } else {
          return res.badRequest({
            status: 'error',
            msg: "Matrix not exists."
          });
        }
      } else {
        return res.badRequest({
          status: 'error',
          msg: "Do not have access to the workflow."
        });
      }
    } catch (err) {
      return res.badRequest({
        status: 'error',
        msg: err
      });
    }
  },

  // delete column
  deleteColumn_Matrix: async (req, res) => {
    try {
      const tokenId = req.options.values.tokenId,
            workflowId = req.param('workflowId') || 0,
            serverInfo = sails.config.constant.serverInfo.config,
            adminDB = sails.config.constant.serverInfo.adminDB,
            workflowDB = sails.config.constant.serverInfo.workflowDB,
            columns = req.param('columns');
      const access = await Api_Token_Access.findOne({token: tokenId, workflow: workflowId});

      if (access) {
        const workflow = await Workflow.findOne(workflowId);
        if (workflow.transfer) {
          const primaryKey = await MatrixAPI.updatePK(workflowId, serverInfo, adminDB, workflowDB, JSON.parse(workflow.transfer));
          const deleteColumn = await MatrixAPI.deleteColumn(workflowId, serverInfo, adminDB, workflowDB, columns, primaryKey);

          return res.json({
            status: 'success',
            data: ''
          });
        } else {
          return res.badRequest({
            status: 'error',
            msg: "Matrix not exists."
          });
        }
      } else {
        return res.badRequest({
          status: 'error',
          msg: "Do not have access to the workflow."
        });
      }
    } catch (err) {
      return res.badRequest({
        status: 'error',
        msg: err
      });
    }
  },

  // generate access and secret key
  generateKey: async (req, res) => {
    try {
      const userId = req.session.sUserId;

      let accessKey = uuidv1();
      let secretKey = rand.generate();
      let refreshToken = rand.generate();

      // status 1 means active
      const key = await Api_Token.create({user: userId, status: 1, accessKey: accessKey, secretKey: secretKey, refreshToken: refreshToken});

      return res.json({
        status: 'success',
        data: key
      });
    } catch (err) {
      console.log(err);
      return res.badRequest({
        status: 'error',
        msg: err
      });
    }
  },

  getKey: async (req, res) => {
    try {
      const userId = req.session.sUserId;

      const key = await Api_Token.find({user: userId});

      for (let i=0; i<key.length; i++) {
        delete key[i].secretKey;
      }

      return res.json({
        status: 'success',
        data: key
      });
    } catch (err) {
      return res.badRequest({
        status: 'error',
        msg: err
      });
    }
  },

  getAccess: async (req, res) => {
    try {
      const tokenId = req.param('token');

      const access = await Api_Token_Access.find({token: tokenId});

      return res.json({
        status: 'success',
        data: access
      });
    } catch (err) {
      return res.badRequest({
        status: 'error',
        msg: err
      });
    }
  },

  saveKeyAccess: async (req, res) => {
    try {
      const tokenId = req.param('token');
      const access = req.param('access');

      for (let i=0; i<access.length; i++) {
        const result = await Api_Token_Access.findOne({token: tokenId, workflow: access[i].workflow});
        if (!result) {
          const newAccess = await Api_Token_Access.create(access[i]);
        }
      }

      return res.json({
        status: 'success',
        data: ''
      });
    } catch (err) {
      return res.badRequest({
        status: 'error',
        msg: err
      });
    }
  }
}
