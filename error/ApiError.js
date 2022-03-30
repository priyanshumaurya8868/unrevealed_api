class ApiError {
  constructor(code, message) {
    this.code = code;
    this.message = message;
  }
  
  static unprocessableEntity(msg){
    return new ApiError(422,msg)
  }

  static  unauthorizedResponse(msg){
    return new ApiError(401,msg)
  }
  static resourceConflict(msg){
    return new ApiError(409,msg)
  }
  
  static badRequest(msg) {
    return new ApiError(400, msg);
  }

  static resourceNotFound(msg) {
    return new ApiError(404, msg);
  }

  static internal(msg) {
    return new ApiError(500, msg);
  }
}
module.exports = ApiError
