/**
 * Created by Harry on 3/02/2017.
 */

module.exports = {
//  migrate: "safe",
  attributes: {
    workflow: {
      model: 'workflow'
    },
    rule: {
      model: 'rule'
    },
    email: {
      type: 'string',
      size: 255,
      minLength: 6,
      maxLength: 255,
      required: true,
      email: true
    },
    type: {
      type: 'string',
      size: 255
    },
    status: {
      type: 'string',
      size: 255
    },
    read: {
      type: 'string',
      size: 255
    },
    data: {
      type: 'text'
    }
  }
}
