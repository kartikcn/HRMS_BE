const feedService = require("../../services/feedService");

class create {
    constructor() {
        console.log(' ----->  create post');
    }
    async process(data, authData) {
        try {
            if(data['command'][0]['function'] != "" && typeof(this[data['command'][0]['function']]) === 'function') {
                var function_name = data['command'][0]['function'];
                let result = await this[function_name](data, authData);
                return result;
            } else {
                let response = await feedService.create(data, authData);
                return response;
            }
        } catch(e){
            console.log(e)
        }
    }

    async post_list(data, authData) {
      try {
        let response = await feedService.post_list(data, authData);
        return response;
      } catch(e) {
        console.log(e)
      }
    }

    async add_likes(data, authData) {
      try {
        let response = await feedService.add_likes(data, authData);
        return response;
      } catch(e) {
        console.log(e)
      }
    }

    async add_comment(data, authData) {
      try {
        let response = await feedService.add_comment(data, authData);
        return response;
      } catch(e) {
        console.log(e)
      }
    }

    async comment_list(data, authData) {
      try {
        let response = await feedService.comment_list(data, authData);
        return response;
      } catch(e) {
        console.log(e)
      }
    }

    async view_profile(data, authData) {
      try {
        let response = await feedService.view_profile(data, authData);
        return response;
      } catch(e) {
        console.log(e)
      }
    }

    async add_report_post(data, authData) {
      try {
        let response = await feedService.add_report_post(data, authData);
        return response;
      } catch(e) {
        console.log(e)
      }
    }

    async get_repost_details(data, authData) {
      try {
        let response = await feedService.get_repost_details(data, authData);
        return response;
      } catch(e) {
        console.log(e)
      }
    }

    async connect_user(data, authData) {
      try {
        let response = await feedService.connect_user(data, authData);
        return response;
      } catch(e) {
        console.log(e)
      }
    }

    async connect_user_list(data, authData) {
      try {
        let response = await feedService.connect_user_list(data, authData);
        return response;
      } catch(e) {
        console.log(e)
      }
    }

    async send_message_to_user(data, authData) {
      try {
        let response = await feedService.send_message_to_user(data, authData);
        return response;
      } catch(e) {
        console.log(e)
      }
    }

    async user_list_for_admin(data, authData) {
      try {
        let response = await feedService.user_list_for_admin(data, authData);
        return response;
      } catch(e) {
        console.log(e)
      }
    }

    async view_user_post_admin(data, authData) {
      try {
        let response = await feedService.view_user_post_admin(data, authData);
        return response;
      } catch(e) {
        console.log(e)
      }
    }

    async delete_user_post_admin(data, authData) {
      try {
        let response = await feedService.delete_user_post_admin(data, authData);
        return response;
      } catch(e) {
        console.log(e)
      }
    }

    async user_account_delete(data, authData) {
      try {
        let response = await feedService.user_account_delete(data, authData);
        return response;
      } catch(e) {
        console.log(e)
      }
    }

    async check_connect_user(data, authData) {
      try {
        let response = await feedService.check_connect_user(data, authData);
        return response;
      } catch(e) {
        console.log(e)
      }
    }
}
module.exports = create;