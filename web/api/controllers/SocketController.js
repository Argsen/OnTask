


module.exports = {
    get: async (req, res) => {
        try {
            const userId = req.session.sUserId || 0;
            const workflowId = req.param('workflowId') || 0;
            const socket = req.socket;

            if (!req.isSocket) {
                return res.badRequest({
                    status: 'error',
                    msg: 'Please use socket post.'
                });
            }

            if (userId !== 0 && workflowId !== 0) {
                let user = await User_Workflow.findOne({user: userId, workflow: workflowId}).populate('user');
                if (user && (user.access == 'admin' || user.access == 'write')) {
                    let room = 'workflow' + workflowId;
                    let socketId = sails.sockets.getId(req);
                    sails.io.sockets.in(room).clients(function (err, list) {
                        if (err) {
                            return res.badRequest({
                                status: 'error',
                                msg: err
                            });
                        }
                        if (list.length == 0 || (list.length == 1 && list[0] == socketId)) {
                            return res.json({
                                status: 'success',
                                data: ""
                            });
                        } else {
                            return res.json({
                                status: 'success',
                                data: "editing"
                            });
                        }
                    });
                } else {
                    return res.badRequest({
                        status: 'error',
                        msg: 'Does not have access to this workflow.'
                    });
                }
            } else {
                return res.badRequest({
                    status: 'error',
                    msg: 'Invalid userId or workflowId.'
                });
            }
        } catch (err) {
            return res.badRequest({
                status: 'error',
                msg: err
            });
        }
    },

    join: async (req, res) => {
        try {
            const userId = req.session.sUserId || 0;
            const workflowId = req.session.sWorkflowId || 0;
            const socket = req.socket;

            if (!req.isSocket) {
                return res.badRequest({
                    status: 'error',
                    msg: 'Please use socket post.'
                });
            }

            if (userId !== 0 && workflowId !== 0) {
                let user = await User_Workflow.findOne({user: userId, workflow: workflowId}).populate('user');
                if (user && (user.access == 'admin' || user.access == 'write')) {
                    let room = 'workflow' + workflowId;
                    sails.sockets.broadcast(room, 'message', {data: user.user.firstName + ' ' + user.user.lastName + ' : ' + user.user.email + ' enters the session, you will be redirect back to home page in 5 secs.'}, req);
                    sails.sockets.leaveAll(room, function (err) {
                        if (err) {
                            return res.serverError(err);
                        }
                        sails.sockets.join(socket, room, function (err) {
                            if (err) {
                                return res.serverError(err);
                            }
                            return res.json({
                                status: 'success',
                                msg: 'test'
                            });
                        });
                    });
                } else {
                    return res.badRequest({
                        status: 'error',
                        msg: 'Does not have access to this workflow.'
                    });
                }
            } else {
                return res.badRequest({
                    status: 'error',
                    msg: 'Invalid User or Workflow ID.'
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

    rejoin: async (req, res) => {
        try {
            const userId = req.session.sUserId || 0;
            const workflowId = req.session.sWorkflowId || 0;
            const socket = req.socket;


            if (!req.isSocket) {
                return res.badRequest({
                    status: 'error',
                    msg: 'Please use socket post.'
                });
            }

            if (userId !== 0 && workflowId !== 0) {
                let user = await User_Workflow.findOne({user: userId, workflow: workflowId}).populate('user');
                if (user && (user.access == 'admin' || user.access == 'write')) {
                    let room = 'workflow' + workflowId;
                    let socketId = sails.sockets.getId(req);
                    sails.io.sockets.in(room).clients(function (err, list) {
                        if (err) {
                            return res.badRequest({
                                status: 'error',
                                msg: err
                            });
                        }
                        if (list.length == 1 && list[0] !== socketId) {
                            return res.json({
                                status: 'success',
                                data: "redirect"
                            });
                        } else {
                            sails.sockets.leaveAll(room, function (err) {
                                if (err) {
                                    return res.serverError(err);
                                }
                                sails.sockets.join(socket, room, function (err) {
                                    if (err) {
                                        return res.serverError(err);
                                    }
                                    return res.json({
                                        status: 'success',
                                        msg: 'test'
                                    });
                                });
                            });
                        }
                    });
                } else {
                    return res.badRequest({
                        status: 'error',
                        msg: 'Does not have access to this workflow.'
                    });
                }
            } else {
                return res.badRequest({
                    status: 'error',
                    msg: 'Invalid User or Workflow ID.'
                });
            }
        } catch (err) {

        }
    }
}