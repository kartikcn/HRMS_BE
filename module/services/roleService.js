
const create = async (data, authData) => {
  try {

    const decoded = Auth.decodeToken(authData);

    if (decoded ?. usertype_in === false && decoded ?. is_active === false && decoded ?. deleted_date == null) {
        data.response = {
            status: 0,
            message: "You are not valid user!!"
        }
        return data;
    }
    delete data["flag"];
    delete data["action"];
    delete data["command"];
    let record = await Models.role.findOne({name: data ?. name}).exec();
    if(record && data.role_id == undefined) {
        data.response = {
            status: 201,
            result: STATUS.ERROR,
            message: "Role already exists!"
        }       

       // io.emit('notification', {message: 'Course approved'})

        //console.log('Course has been approved');
        return data;
    }
    if(data.role_id == undefined || data.role_id == "") {
      var saved_data = await new Models.role(data).save()
      data.response = {
          status: 200,
          result: STATUS.SUCCESS,
          data: saved_data,
          message: "Role created successfully.",
      }
      return data;
    } else {
        var saved_data = await Models.role.findOneAndUpdate({
          role_id: data.role_id
      }, {
          $set: {
              name: data ?. name,
              description: data ?. description,
              priviledge_data: data ?. priviledge_data,
              first_name: data ?. first_name,
              status: data ?. status
          }
      }, {new: true});
      data.response = {
        status: 200,
        result: STATUS.SUCCESS,
        data: saved_data,
        message: "Role updated successfully.",
      } 
      return data;
    }
    
  } catch (error) {
    console.log("error  invoice ------------>  ", error)
      data.response = {
          status: 0,
          result: STATUS.ERROR,
          message: "Something is wrong",
          error: error
      }
      return data;
  }
}

const list = async (data, authData) => {
  try {

    const decoded = Auth.decodeToken(authData);

    if (decoded ?. usertype_in === false && decoded ?. is_active === false && decoded ?. deleted_date == null) {
        data.response = {
            status: 0,
            message: "You are not valid user!!"
        }
        return data;
    }

    var filter = data.filter
    var limit = data.limit
    var skip = data.limit*(data.page_no-1)
    var filter_arr = []

    delete data["action"]
    delete data["command"]
    delete data["filter"]
    delete data["limit"]
    delete data["page_no"]
    if(data.flag == 'Active') {
      data['status'] = true;
    } else {

      data['status'] = false; //added  for consistency in all code by Ajay
    }
    if (data.flag == "All") {
      delete data["status"]
    }
    delete data["flag"];

    if (filter !== null) {

      console.log("filter_data     ------------->  ", filter)

      if (filter.name !== undefined) {
        filter.name = {
                        '$regex': new RegExp(filter.name),
                        '$options': 'i'
                      }
        filter_arr.push(filter);
      }

      if (filter.status !== undefined) {
        filter.status = {
                        '$regex': new RegExp(filter.status),
                        '$options': 'i'
                      }
        filter_arr.push(filter);
      }
      if (filter.all != undefined) {
        var regexCondition = {
            '$regex': new RegExp(filter.all),
            '$options': 'i'
        };
    
        // Define an array to store conditions for each field
        var regexConditions = [];
    
        // Add conditions for each field where you want to perform regex matching
        regexConditions.push({ "name": regexCondition });
        regexConditions.push({ "description": regexCondition });
        regexConditions.push({ "status": regexCondition }); // Assuming "name" is a field in the "roles" collection
    
        // Construct the final condition using $or operator
        var regexFilter = {
            '$or': regexConditions
        };
    
        filter_arr.push(regexFilter);
    }
    if(filter_arr.length > 0) {

        var filterData = {
            '$and': filter_arr
        } 
    } else {
        var filterData = {};
    }

      var record = await Models.role.aggregate([
        {
          '$match': data
        },
        {
          '$match': {
            'role_id': {
              '$ne': 1
            }
          }
        },
        {
          '$sort': {
            'createdAt': -1
          }
        },
        {
          '$match': filterData
        },
        {
          '$skip': skip
        }, 
        {
          '$limit': limit
        }
      ]);

      var total = await Models.role.aggregate([
        {
          '$match': data
        },
        {
          '$match': filterData
        }
      ]);
    }else{
      var record = await Models.role.aggregate([
        {
          '$match': data
        },
        {
          '$match': {
            'role_id': {
              '$ne': 1
            }
          }
        },
        {
          '$sort': {
            'createdAt': -1
          }
        }, 
        {
          '$skip': skip
        }, 
        {
          '$limit': limit
        }
      ]);

      var total = await Models.role.aggregate([
        {
          '$match': data
        }
      ]);
    }

    console.log("total    ----------->  ", total.length)

    let devident = total.length/limit
    let pages;

    if (devident > parseInt(devident)) {
      pages = parseInt(devident) + 1
    }else{
      pages = devident
    }




    if (record !== null) {
      data.response = {
        status: 200,
        result: STATUS.SUCCESS,
        total_data: total.length,
        total_pages: pages,
        data: record,
        message: "Data updated.",
      }
    }else{
      data.response = {
          status: 200,
          result: STATUS.ERROR,
          message: "Data not found.",
      } 
    }

    return data;
  } catch (error) {
    console.log(error, "error");
      data.response = {
          status: 0,
          result: STATUS.ERROR,
          message: "Something is wrong",
          error: error
      }
      return data;
  }
}

const view = async (data, authData) => {
  try {

    const decoded = Auth.decodeToken(authData);

    if (decoded ?. usertype_in === false && decoded ?. is_active === false && decoded ?. deleted_date == null) {
        data.response = {
            status: 0,
            message: "You are not valid user!!"
        }
        return data;
    }

    delete data["action"]
    delete data["command"]

    var get_role = await Models.role.findOne(data).exec()
    
    data.response = {
      status: 200,
      result: STATUS.SUCCESS,
      data: get_role,
      message: "Data found.",
  }
    return data;
    delete data["role_id"]
    var record = await Models.menu.aggregate([
        {
          '$match': data
        },
        {
          '$lookup': {
            'from': 'sub_menus', 
            'localField': 'menu_id', 
            'foreignField': 'menu_id', 
            'as': 'sub_menu_data'
          }
        }
    ]);

    var sub_menu_data;
    var child_menu_data;
    var final_child_menu_data_arr = []

    for (var i = 0; i < record.length; i++) {
      if (record[i].sub_menu_data.length !== 0) {
         sub_menu_data = record[i].sub_menu_data

         for (var j = 0; j < sub_menu_data.length; j++) {            
            child_menu_data = await Models.child_menu.find({menu_id: sub_menu_data[j].menu_id, sub_menu_id: sub_menu_data[j].sub_menu_id}).exec()
            if (child_menu_data.length !== 0) {

              for (var k = 0; k < child_menu_data.length; k++) {

                var filter_data = await compare_data(get_role.priviledge_data, child_menu_data[k]);

                var new_object = {
                  _id: child_menu_data[k]._id,
                  title: child_menu_data[k].title,
                  status: child_menu_data[k].status,
                  menu_id: child_menu_data[k].menu_id,
                  sub_menu_id: child_menu_data[k].sub_menu_id,
                  createdAt: child_menu_data[k].createdAt,
                  updatedAt: child_menu_data[k].updatedAt,
                  child_menu_id: child_menu_data[k].child_menu_id,
                  __v: child_menu_data[k].__v,
                  id: child_menu_data[k].id,
                  add: filter_data.add,
                  edit: filter_data.edit,
                  view: filter_data.view,
                  delete: filter_data.delete
                }

                final_child_menu_data_arr.push(new_object)
              }

              sub_menu_data[j].child_menu_data = final_child_menu_data_arr
            }else{
              var filter_data = await compare_data(get_role.priviledge_data, sub_menu_data[j]);
              sub_menu_data[j].add = filter_data.add
              sub_menu_data[j].edit = filter_data.edit
              sub_menu_data[j].view = filter_data.view
              sub_menu_data[j].delete = filter_data.delete
            }
          }

      }else{
        var filter_data = await compare_data(get_role.priviledge_data, record[i]);
        record[i].add = filter_data.add
        record[i].edit = filter_data.edit
        record[i].view = filter_data.view
        record[i].delete = filter_data.delete
      }
    }

    if (get_role !== null) {  
      data.response = {
          status: 200,
          result: STATUS.SUCCESS,
          data: record,
          message: "Data found.",
      }
    }else{
      data.response = {
          status: 200,
          result: STATUS.ERROR,
          message: "Data not found.",
      } 
    }

    return data;
  } catch (error) {
    console.log("error  ------------>  ", error)
      data.response = {
          status: 0,
          result: STATUS.ERROR,
          message: "Something is wrong",
          error: error
      }
      return data;
  }
}

function compare_data(priviledge_data, msc_data){

  var object = {
    menu_id: msc_data.menu_id,
    sub_menu_id: null,
    child_menu_id: null
  }

  if (msc_data.sub_menu_id !== undefined) {
    object.sub_menu_id = msc_data.sub_menu_id
  }

  if (msc_data.child_menu_id !== undefined) {
    object.child_menu_id = msc_data.child_menu_id
  }

  var filter_data = priviledge_data.find(data => {
    return data.menu_id == object.menu_id && data.sub_menu_id == object.sub_menu_id && data.child_menu_id == object.child_menu_id
  });
  return filter_data;
}


module.exports = {
    create,
    list,
    view,
};
