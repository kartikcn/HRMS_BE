const payment_gatewayService = require("../../services/payment_gatewayService");

class create {
  constructor() {
      console.log(' ----->  create payment_gateway');
  }
  async process(data, authData) {
    try {
      if(data['command'][0]['function'] != "" && typeof(this[data['command'][0]['function']]) === 'function') {
        var function_name = data['command'][0]['function'];
        let result = await this[function_name](data, authData);
        return result;
      } else {
        let response = await payment_gatewayService.create(data, authData);
        return response;
      }
    } catch(e){
        console.log(e)
    }
  }

  async update(data, authData) {
    try {
      let response = await payment_gatewayService.update(data, authData);
      return response;
    } catch(e){
        console.log(e)
    }
  }

  async transaction_list(data, authData) {
    try {
      let response = await payment_gatewayService.transaction_list(data, authData);
      return response;
    } catch(e){
        console.log(e)
    }
  }

  async event_payment_update(data, authData) {
    try {
      let response = await payment_gatewayService.event_payment_update(data, authData);
      return response;
    } catch(e){
        console.log(e)
    }
  }

  async community_payment_update(data, authData) {
    try {
      let response = await payment_gatewayService.community_payment_update(data, authData);
      return response;
    } catch(e){
        console.log(e)
    }
  }

}
module.exports = create;