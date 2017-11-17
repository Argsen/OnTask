/**
 * Created by Harry on 8/12/2016.
 */

module.exports = {
//  migrate: "safe",
  attributes: {
    workflow: {
      model: 'workflow'
    },
    name: {
      type: 'string',
      size: 255,
      maxLength: 255,
      required: true
    },
    description: {
      type: 'text'
    },
    schedule: {
      type: 'text'
    },
    condition: {
      type: 'text'
    },
    action: {
      type: 'text'
    },
    data: {
      type: 'text'
    }
  }
}
