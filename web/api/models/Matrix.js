/**
 * Created by Harry on 8/12/2016.
 */

module.exports = {
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
    data: {
      type: 'text'
    }
  }
}
