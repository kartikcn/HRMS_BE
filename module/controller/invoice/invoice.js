 const invoiceService = require("../../services/invoiceService");

class create {
    constructor() {
        console.log(' ----->  create notes');
    }
    async process(data, authData) {
        try {
            if(data['command'][0]['function'] != "" && typeof(this[data['command'][0]['function']]) === 'function') {
                var function_name = data['command'][0]['function'];
                let result = await this[function_name](data, authData);
                return result;
            } else {
                let response = await invoiceService.create(data);
                return response;
            }
        } catch(e){
            console.log(e)
        }
    }

    async certificate(data, authData) {
      try {
        let response = await invoiceService.certificate(data, authData);
        return response;
      } catch(e) {
        console.log(e)
      }
    }

    async event_invoice_create(data, authData) {
      try {
        let response = await invoiceService.event_invoice_create(data, authData);
        return response;
      } catch(e) {
        console.log(e)
      }
    }
}
module.exports = create;