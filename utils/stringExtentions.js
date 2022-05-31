function isBlank(value){      
    return !value || !value.toString().trim() || /^[\s\b\0]+$/.test(value.toString());
  }

exports.isBlank = isBlank