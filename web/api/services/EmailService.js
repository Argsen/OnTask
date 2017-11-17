/**
 * Created by Harry on 1/02/2017.
 */

const queue = sails.config.globals.queue;

module.exports = {
    send: (data, callback) => {
      let job = queue.create('email', data).save( function(err){
        if( !err ) console.log( job.id );
      });

      job.on('complete', function (id, result) {
        callback(null, {id: id, result: result});
      }).on('failed attempt', function(errorMessage, doneAttempts){
        //  console.log('Job failed');
      }).on('failed', function(errorMessage){
        //  console.log('Job failed');
      }).on('progress', function(progress, data){
        //  console.log('\r  job #' + job.id + ' ' + progress + '% complete with data ', data );
      });
    }
};
