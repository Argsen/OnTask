/**
 * Created by Harry on 13/12/2016.
 */

module.exports = {
  create: function (req, res) {
    let userId = req.session.sUserId || 0;
    let name = req.param('name');

    if (name && userId !== 0) {
      let workflowData = {
        name: name
      };
      let description = req.param('description');
      let data = req.param('data');
      if (description) workflowData.description = description;
      if (data) workflowData.data = data;

      Workflow.create(workflowData).exec(function (err, workflow) {
        if (err) return res.badRequest({
          status: 'error',
          msg: err
        });

        if (workflow) {
          User_Workflow.create({user: userId, workflow: workflow.id, access: "admin"}).exec(function (err, result) {
            if (err) return res.badRequest({
              status: 'error',
              msg: err
            });

            if (result) {
              return res.created({
                status: 'success',
                data: workflow
              });
            } else {
              return res.badRequest({
                status: 'error',
                msg: 'Error creating workflow.'
              });
            }
          });
        } else {
          return res.badRequest({
            status: 'error',
            msg: 'Error creating workflow.'
          });
        }
      });
    } else {
      return res.badRequest({
        status: 'error',
        msg: 'Invalid info.'
      });
    }
  },

  get: function (req, res) {
    let userId = req.session.sUserId || 0;
    let workflowId = req.param('workflowId') || req.session.sWorkflowId || 0;

    if (userId !== 0 && workflowId !== 0) {
      User_Workflow.findOne({user: userId, workflow: workflowId}).populate('workflow').exec(function (err, workflow) {
        if (err) return res.badRequest({
          status: 'error',
          msg: err
        });
        if (workflow) {
          req.session.sWorkflowId = workflow.workflow.id;
          return res.ok({
            status: 'success',
            data: workflow.workflow
          });
        } else {
          return res.badRequest({
            status: 'error',
            msg: 'Workflow not found.'
          });
        }
      });
    } else {
      return res.badRequest({
        status: 'error',
        msg: 'Invalid workflow ID.'
      });
    }
  },

  getAll: function (req, res) {
    let userId = req.param('userId') || req.session.sUserId || 0;

    if (userId) {
      User_Workflow.find({user: userId}).populate('workflow').exec(function (err, workflows) {
        if (err) return res.badRequest({
          status: 'error',
          msg: err
        });
        if (workflows.length > 0) {
          return res.ok({
            status: 'success',
            data: workflows
          });
        } else {
          return res.badRequest({
            status: 'error',
            msg: 'Workflow not found.'
          });
        }
      });
    } else {
      return res.badRequest({
        status: 'error',
        msg: 'Invalid user.'
      });
    }
  },

  getUserAll: function (req, res) {
    let userId = req.param('userId') || req.session.sUserId || 0;

    if (userId) {
      User_Workflow.find({user: userId}).populate('workflow').exec(function (err, workflows) {
        if (err) return res.badRequest({
          status: 'error',
          msg: err
        });
        for (let i=(workflows.length - 1); i>-1; i--) {
          if (workflows[i].access !== 'admin') {
            workflows.splice(i, 1);
          }
        }
        console.log(workflows);
        if (workflows.length > 0) {
          return res.ok({
            status: 'success',
            data: workflows
          });
        } else {
          return res.badRequest({
            status: 'error',
            msg: 'Workflow not found.'
          });
        }
      });
    } else {
      return res.badRequest({
        status: 'error',
        msg: 'Invalid user.'
      });
    }
  },

  update: function (req, res) {
    let userId = req.session.sUserId || 0;
    let workflowId = req.param('workflowId') || req.session.sWorkflowId || 0;

    if (userId !== 0 && workflowId !== 0) {
      let workflowData = {};
      let name = req.param('name');
      let description = req.param('description');
      let constraints = req.param('constraints');
      let data = req.param('data');
      if (name) workflowData.name = name;
      if (description) workflowData.description = description;
      if (constraints) workflowData.constraints = constraints;
      if (data) workflowData.data = data;

      User_Workflow.findOne({user: userId, workflow: workflowId}).exec(function (err, result) {
        if (err) return res.badRequest({
          status: 'error',
          msg: err
        });

        if (result && (result.access == "write" || result.access == "admin")) {
          Workflow.update(workflowId, workflowData).exec(function (err, workflows) {
            if (err) return res.badRequest({
              status: 'error',
              msg: err
            });
            if (workflows.length > 0) {
              return res.ok({
                status: 'success',
                data: workflows[0]
              });
            } else {
              return res.badRequest({
                status: 'error',
                msg: 'Error updating workflow.'
              });
            }
          });
        } else {
          return res.badRequest({
            status: 'error',
            msg: 'Error updating workflow.'
          });
        }
      });
    } else {
      return res.badRequest({
        status: 'error',
        msg: 'Invalid workflow ID.'
      });
    }
  },

  delete: function (req, res) {
    let userId = req.session.sUserId || 0;
    let workflowId = req.param('workflowId') || req.session.sWorkflowId || 0;

    if (userId !== 0 && workflowId !== 0) {
      User_Workflow.findOne({user: userId, workflow: workflowId}).exec(function (err, result) {
        if (err) return res.badRequest({
          status: 'error',
          msg: err
        });

        if (result) {
          if (result.access == 'admin') {
            User_Workflow.destroy({workflow: workflowId}).exec(function (err) {
              if (err) return res.badRequest({
                status: 'error',
                msg: err
              });
              Workflow.destroy(workflowId).exec(function (err) {
                if (err) return res.badRequest({
                  status: 'error',
                  msg: err
                });
                return res.ok({
                  status: 'success'
                });
              });
            });
          }
        } else {
          return res.badRequest({
            status: 'error',
            msg: 'No Record.'
          });
        }
      });
    } else {
      return res.badRequest({
        status: 'error',
        msg: 'Invalid workflow ID.'
      });
    }
  },

  getShareUser: async (req, res) => {
    try {
      const userId = req.session.sUserId || 0,
            workflowId = req.param('workflowId') || 0;

      if (userId !== 0 && workflowId !== 0) {
        let workflow = await User_Workflow.findOne({user: userId, workflow: workflowId}).populate('workflow');
        if (workflow.access == 'admin') {
          let workflows = await User_Workflow.find({workflow: workflowId}).populate('workflow');
          console.log(workflows);
          console.log(userId);
          let arr = [];
          for (let i=0; i<workflows.length; i++) {
            if (workflows[i].user !== userId) {
              let user = await User.findOne(workflows[i].user);
              arr.push({
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email
              })
            }
          }
          return res.json({
            status: 'success',
            data: arr
          });
        } else {
          return res.badRequest({
            status: 'error',
            msg: 'Need admin access'
          });
        }
      } else {
        return res.badRequest({
          status: 'error',
          msg: 'Invalid user or workflow ID.'
        });
      }
    } catch (err) {
      return res.badRequest({
        status: 'error',
        msg: err
      });
    }
  },

  share: async (req, res) => {
    try {
      const userId = req.session.sUserId || 0,
            workflowId = req.param('workflowId') || 0,
            sharedUsers = req.param('sharedUsers');

      if (userId !== 0 && workflowId !== 0) {
        let workflow = await User_Workflow.findOne({user: userId, workflow: workflowId}).populate('workflow');
        if (workflow.access == 'admin') {
          if (sharedUsers.length > 0) {
            for (let i=0; i<sharedUsers.length; i++) {
              let email = sharedUsers[i].split(', ')[1];
              let user = await User.findOne({email: email});
              let obj = {
                user: user.id,
                workflow: workflowId,
                access: 'write'
              }
              let checkExists = await User_Workflow.findOne({user: user.id, workflow: workflowId});
              if (!checkExists) {
                let result = await User_Workflow.create(obj);
              }
            }
  
            return res.json({
              status: 'success',
              data: 'success'
            });
          } else {
            return res.badRequest({
              status: 'error',
              msg: 'Invalid share target.'
            });
          }
        } else {
          return res.badRequest({
            status: 'error',
            msg: 'Need admin access'
          });
        }
      } else {
        return res.badRequest({
          status: 'error',
          msg: 'Invalid user ID.'
        });
      }
    } catch (err) {
      return res.badRequest({
        status: 'error',
        msg: err
      });
    }
  },

  deleteShare: async (req, res) => {
    try {
      const sharedUser = req.param('sharedUser') || 0;
      const workflowId = req.param('workflowId') || 0;

      if (sharedUser && workflowId !== 0) {
        let user = await User.findOne({email: sharedUser.split(', ')[1]}); 

        let result = await User_Workflow.destroy({user: user.id, workflow: workflowId});

        return res.json({
          status: "success",
          msg: 'success'
        });
      } else {
        return res.badRequest({
          status: 'error',
          msg: 'Invalid'
        });
      }
    } catch (err) {
      console.log(err);
      return res.badRequest({
        status: 'error',
        msg: err
      });
    }
  }
}
