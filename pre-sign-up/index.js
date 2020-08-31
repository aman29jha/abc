exports.handler = async (event, context, callback) => {
    event.response.autoConfirmUser =  true;
    event.response.autoVerifyPhone =  true;
    await callback( null, event);
    
    await context.done(null, event);
};
