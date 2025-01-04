 const communityService = require("../../services/communityService");

class create {
    constructor() {
        console.log(' ----->  create community');
    }
    async process(data, authData) {
        try {
            if(data['command'][0]['function'] != "" && typeof(this[data['command'][0]['function']]) === 'function') {
                var function_name = data['command'][0]['function'];
                let result = await this[function_name](data, authData);
                return result;
            } else {
                let response = await communityService.create(data);
                return response;
            }
        } catch(e){
            console.log(e)
        }
    }

    async get_list(data, authData) {
      try {
        let response = await communityService.get_list(data, authData);
        return response;
      } catch(e) {
        console.log(e)
      }
    }
    
    async view_details(data, authData) {
      try {
        let response = await communityService.view_details(data, authData);
        return response;
      } catch(e) {
        console.log(e)
      }
    }

    async get_list_for_mobile(data, authData) {
      try {
        let response = await communityService.get_list_for_mobile(data, authData);
        return response;
      } catch(e) {
        console.log(e)
      }
    }

    async user_list_acc_community(data, authData) {
      try {
        let response = await communityService.user_list_acc_community(data, authData);
        return response;
      } catch(e) {
        console.log(e)
      }
    }

    async add_user_in_community_from_admin(data, authData) {
      try {
        let response = await communityService.add_user_in_community_from_admin(data, authData);
        return response;
      } catch(e) {
        console.log(e)
      }
    }

    async remove_user_from_community_admin(data, authData) {
      try {
        let response = await communityService.remove_user_from_community_admin(data, authData);
        return response;
      } catch(e) {
        console.log(e)
      }
    }

    async community_member_list(data, authData) {
      try {
        let response = await communityService.community_member_list(data, authData);
        return response;
      } catch(e) {
        console.log(e)
      }
    }

    async mobile_user_list(data, authData) {
      try {
        let response = await communityService.mobile_user_list(data, authData);
        return response;
      } catch(e) {
        console.log(e)
      }
    }
}
module.exports = create;