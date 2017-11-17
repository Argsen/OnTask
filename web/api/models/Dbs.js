/**
 * Created by Harry on 8/12/2016.
 */

module.exports = {
  attributes: {
    connection_string: {
      type: 'text'
    },
    db_name: {
      type: 'string',
      required: true
    },
    table_name: {
      type: 'string',
      required: true
    },
    data: {
      type: 'text'
    },


    user_dbs: {
      collection: 'User_DB',
      via: 'db'
    },
    workflow_dbs: {
      collection: 'Workflow_DB',
      via: 'db'
    }
  }
}
