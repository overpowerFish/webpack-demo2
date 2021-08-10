const resFormatter = (data, code = 'SUCCESS' , msg = '') => {
  return {
    code,
    msg,
    data
  }
}

module.exports = {resFormatter}