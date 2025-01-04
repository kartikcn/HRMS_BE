const get_list = async (data, authData) => {
    try {

        const decoded = Auth.decodeToken(authData);

        if (decoded ?. is_active == false || decoded ?. deleted_date !== null) {
            data.response = {
                status: 0,
                message: "You are not valid user!"
            }
            return data;
        }

        var skip = data.limit * (data.page_no - 1)
        var limit = data.limit
        var filter = data.filter

        delete data["action"]
        delete data["command"]
        delete data["page_no"]
        delete data["limit"]
        delete data["filter"]

        if (data.flag !== undefined && data.flag == null) {
            delete data["flag"]
        } else {
            data.flag == "Active" ? data.is_active = true : (data.flag == "Inactive" ? data.is_active = false : delete data["flag"]);
            delete data["flag"];
        }
        var condition_arr = []
        if (filter != null) {

            if (filter.community_title != undefined) {
                filter.community_title = {
                    '$regex': new RegExp(filter.community_title),
                    '$options': 'i'
                }
                condition_arr.push({"community_title": filter.community_title})
            }

            if (filter.flag != undefined) {
                filter.flag = {
                    '$regex': new RegExp(filter.flag),
                    '$options': 'i'
                }
                condition_arr.push({"is_active": filter.is_active})
            }
            if (filter.all != undefined) {
              var regexCondition = {
                  '$regex': new RegExp(filter.all),
                  '$options': 'i'
              };
          
              // Define an array to store conditions for each field
              var regexConditions = [];
          
              // Add conditions for each field where you want to perform regex matching
              regexConditions.push({ "community_title": regexCondition });
              regexConditions.push({ "is_active": regexCondition });
          
              // Construct the final condition using $or operator
              var regexFilter = {
                  '$or': regexConditions
              };
          
              condition_arr.push(regexFilter);
          }
          if(condition_arr.length > 0) {

              var filterData = {
                  '$and': condition_arr
              } 
          } else {
              var filterData = {};
          }

            var record = await Models.community.aggregate([
                {
                    '$match': data
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
                }, {
                    '$limit': limit
                }
            ]);

            var total = await Models.community.aggregate([
                {
                    '$match': data
                }, {
                    '$sort': {
                        'createdAt': -1
                    }
                }, {
                    '$match': filterData
                }
            ]);

        } else {

            var record = await Models.community.aggregate([
                {
                    '$match': data
                }, {
                    '$sort': {
                        'createdAt': -1
                    }
                }, {
                    '$skip': skip
                }, {
                    '$limit': limit
                }
            ]);

            var total = await Models.community.aggregate([
                {
                    '$match': data
                }, {
                    '$sort': {
                        'createdAt': -1
                    }
                }
            ]);
        }

        var devident = total.length / limit
        var pages;

        if (devident > parseInt(devident)) {
            pages = parseInt(devident) + 1
        } else {
            pages = devident
        }

        if (record.length !== 0) {
            data.response = {
                status: 200,
                total_data: total.length,
                total_pages: pages,
                data: record,
                message: "List fetched successfully"
            }
        } else {
            data.response = {
                status: 200,
                result: STATUS.ERROR,
                message: "Data not found."
            }
        }

        return data;
    } catch (error) {

        data.response = {
            status: 0,
            result: STATUS.ERROR,
            message: "Something is wrong",
            error: error
        }
        return data;
    }
}

const view_details = async (data, authData) => {
    try {
        const decoded = Auth.decodeToken(authData);

        if (decoded ?. is_active == false || decoded ?. deleted_date !== null) {
            data.response = {
                status: 0,
                message: "You are not valid user!"
            }
            return data;
        }
        delete data['action']
        delete data['command']
        const details = await Models.community.aggregate(
          [
            {
              $match:
                {
                  community_id: data.community_id,
                },
            },
            {
              $lookup: {
                from: "courses",
                localField: "course_id",
                foreignField: "courseedition_id",
                as: "activity_courses",
              },
            },
            {
              $lookup: {
                from: "courseeditions",
                localField: "course_id",
                foreignField: "courseedition_id",
                as: "activity_courses_before_approve",
              },
            },
            {
              $unwind: {
                'path': '$activity_courses_before_approve', 
                'preserveNullAndEmptyArrays': true
              }
            },
            {
              $lookup: {
                from: "activity_challenges",
                localField: "community_id",
                foreignField: "community_id",
                as: "activity_challenges",
              },
            },
            {
              $lookup: {
                from: "activity_polls",
                localField: "community_id",
                foreignField: "community_id",
                as: "activity_polls",
              },
            },
            {
              $lookup: {
                from: "activity_quest",
                localField: "community_id",
                foreignField: "community_id",
                as: "activity_quest",
              },
            },
            {
              $lookup: {
                from: 'user_purchase_communities', 
                localField: 'community_id', 
                foreignField: 'community_id', 
                as: 'purchase_community_data'
              }
            },
            {
              $addFields: {
                total_challenges: { $size: "$activity_challenges" },
                total_polls: { $size: "$activity_polls" },
                total_quests: { $size: "$activity_quest" },
              }
            },
          ]
        )
          console.log(details[0], "deailss")
        if((details[0].activity_courses).length > 0) {
          details[0].activity_courses = details[0].activity_courses[0];
        }
        var total_paid_community_amount = 0
        var purchase_community_data = details[0].purchase_community_data
        var final_arr =[]

        if (purchase_community_data.length > 0) {
          for (var i = 0; i < purchase_community_data.length; i++) {
             let user_data = await Models.user.findOne({user_id: purchase_community_data[i].user_id}).exec()
              total_paid_community_amount = total_paid_community_amount + purchase_community_data[i].paid_amount
              purchase_community_data[i].user_data = user_data

              if (details[0].declined_user.includes(purchase_community_data[i].user_id) == false) {
                final_arr.push(purchase_community_data[i])
              }
          }
          details[0].purchase_community_data = final_arr
        }

        details[0].total_paid_community_amount = total_paid_community_amount
 
        data.response = {
          status: 200,
          result: STATUS.SUCCESS,
          message: "Fetched successfully",
          data: details
        }
        return data;

    } catch (error) {
      console.log(error, "error")
        data.response = {
            status: 0,
            result: STATUS.ERROR,
            message: "Something is wrong",
            error: error
        }
        return data;
    }
}

const get_list_for_mobile = async (data, authData) => {
    try {

        const decoded = Auth.decodeToken(authData);

        if (decoded ?. is_active == false || decoded ?. deleted_date !== null) {
            data.response = {
                status: 0,
                message: "You are not valid user!"
            }
            return data;
        }

        var skip = data.limit * (data.page_no - 1)
        var limit = data.limit
        var user_id = data.user_id
        var course_filter = {}

        if (data.is_active !== undefined) {
            course_filter = {
                course_status: data.is_active
            }
            delete data["is_active"]
        }

        delete data["action"]
        delete data["command"]
        delete data["page_no"]
        delete data["limit"]
        delete data["user_id"]

        console.log("data    ------------->   ", data)

        data.declined_user = {
          '$nin': [
            user_id
          ]
        }

        var record = await Models.community.aggregate([
          {
            '$match': data
          },
          {
            '$sort': {
                'createdAt': -1
            }
          },
          {
            '$lookup': {
              'from': 'courses', 
              'localField': 'course_id', 
              'foreignField': 'courseedition_id', 
              'as': 'course_data'
            }
          },
          {
            '$lookup': {
              'from': 'courses', 
              'localField': 'course_id', 
              'foreignField': 'courseedition_id', 
              'as': 'course_status'
            }
          },
          {
            '$unwind': {
              'path': '$course_status', 
              'preserveNullAndEmptyArrays': true
            }
          },
          {
            '$addFields': {
              'course_status': '$course_status.is_active'
            }
          },
          {
            '$match': course_filter
          },
          {
            '$lookup': {
              'from': 'categories', 
              'localField': 'course_data.category_id', 
              'foreignField': 'category_id', 
              'as': 'category_data'
            }
          },
          {
            '$lookup': {
              'from': 'user_purchase_communities', 
              'localField': 'course_data.course_id', 
              'foreignField': 'course_id', 
              'as': 'user_course_membar'
            }
          },
          {
            '$lookup': {
              'as': 'payment_data',
              'from': 'user_purchase_communities',
              'let':{'community_id':'$community_id', 'user_id': user_id},
              'pipeline':[
                {
                  '$match':{
                      '$and':[
                        {'$expr':{'$eq':['$community_id','$$community_id']}},
                        {'$expr':{'$eq':['$user_id','$$user_id']}}
                      ]
                  }
                }
              ]
            }
          },
          {
              '$skip': skip
          },
          {
              '$limit': limit
          }
        ]);

        var total = await Models.community.aggregate([
          {
            '$match': data
          },
          {
            '$sort': {
                'createdAt': -1
            }
          },
          {
            '$lookup': {
              'from': 'courses', 
              'localField': 'course_id', 
              'foreignField': 'courseedition_id', 
              'as': 'course_data'
            }
          },
          {
            '$lookup': {
              'from': 'courses', 
              'localField': 'course_id', 
              'foreignField': 'courseedition_id', 
              'as': 'course_status'
            }
          },
          {
            '$unwind': {
              'path': '$course_status', 
              'preserveNullAndEmptyArrays': true
            }
          },
          {
            '$addFields': {
              'course_status': '$course_status.is_active'
            }
          },
          {
            '$match': course_filter
          },
          {
            '$lookup': {
              'from': 'categories', 
              'localField': 'course_data.category_id', 
              'foreignField': 'category_id', 
              'as': 'category_data'
            }
          },
          {
            '$lookup': {
              'from': 'payment_details', 
              'localField': 'course_data.course_id', 
              'foreignField': 'course_id', 
              'as': 'user_course_membar'
            }
          },
          {
            '$lookup': {
              'as': 'payment_data',
              'from': 'user_purchase_communities',
              'let':{'community_id':'$community_id', 'user_id': user_id},
              'pipeline':[
                {
                  '$match':{
                      '$and':[
                        {'$expr':{'$eq':['$community_id','$$community_id']}},
                        {'$expr':{'$eq':['$user_id','$$user_id']}}
                      ]
                  }
                }
              ]
            }
          }
        ]);

        var devident = total.length / limit
        var pages;

        if (devident > parseInt(devident)) {
            pages = parseInt(devident) + 1
        } else {
            pages = devident
        }

        for (var i = 0; i < record.length; i++) {
          if (record[i].community_type == "Free") {
            var user_record = await Models.user.aggregate([
              {
                '$match': {
                  'deleted_date': null,
                  'usertype_in': false
                }
              }
            ]);
          }else{
            var user_record = await Models.payment_detail.aggregate([
              {
                '$match': {
                  'course_id': record[i].course_data[0].course_id
                }
              }, {
                '$lookup': {
                  'from': 'users',
                  'localField': 'user_id',
                  'foreignField': 'user_id',
                  'as': 'user_data'
                }
              }, {
                '$unwind': {
                  'path': '$user_data',
                  'preserveNullAndEmptyArrays': true
                }
              }, {
                '$project': {
                  'deleted_date': '$user_data.deleted_date',
                  'usertype_in': '$user_data.usertype_in',
                  'device_token': '$user_data.device_token'
                }
              }, {
                '$match': {
                  'deleted_date': null,
                  'usertype_in': false
                }
              }
            ]);
          }
          record[i].community_member_count = user_record.length
        }

        if (record.length !== 0) {
            data.response = {
                status: 200,
                total_data: total.length,
                total_pages: pages,
                data: record,
                message: "List fetched successfully"
            }
        } else {
            data.response = {
                status: 200,
                result: STATUS.ERROR,
                message: "Data not found."
            }
        }

        return data;
    } catch (error) {
      console.log("error     ----------->   ", error)
        data.response = {
            status: 0,
            result: STATUS.ERROR,
            message: "Something is wrong",
            error: error
        }
        return data;
    }
}

const user_list_acc_community = async (data, authData) => {
    try {

        const decoded = Auth.decodeToken(authData);
        if (decoded ?. is_active == false || decoded ?. deleted_date !== null) {
            data.response = {
                status: 0,
                message: "You are not valid user!"
            }
            return data;
        }

        delete data["action"]
        delete data["command"]

        let course_data = await Models.course.findOne({courseedition_id: data.course_id}).exec()

        var payment_data = await Models.payment_detail.aggregate([
          {
            '$match': {
              '$or': [
                {
                  'type': 'Course', 
                  'payment_status': 'active', 
                  'course_id': course_data.course_id
                },
                {
                  'type': 'Subscription', 
                  'payment_status': 'active'
                }
              ]
            }
          },
          {
            '$lookup': {
              'from': 'users',
              'localField': 'user_id',
              'foreignField': 'user_id',
              'as': 'user_data'
            }
          },
          {
            '$unwind': {
              'path': '$user_data', 
              'preserveNullAndEmptyArrays': true
            }
          },
          {
            '$match': {
              'user_data.deleted_date': null
            }
          }
        ]);

        if (payment_data.length !== 0) {
          data.response = {
            status: 200,
            data: payment_data,
            message: "List fetched successfully"
          }
        } else {
          data.response = {
            status: 200,
            result: STATUS.ERROR,
            message: "Data not found."
          }
        }

        return data;
    } catch (error) {
      console.log("error     ----------->   ", error)
        data.response = {
            status: 0,
            result: STATUS.ERROR,
            message: "Something is wrong",
            error: error
        }
        return data;
    }
}

const add_user_in_community_from_admin = async (data, authData) => {
    try {

        const decoded = Auth.decodeToken(authData);
        if (decoded ?. is_active == false || decoded ?. deleted_date !== null) {
            data.response = {
                status: 0,
                message: "You are not valid user!"
            }
            return data;
        }

        delete data["action"]
        delete data["command"]
        var saved_payment_data
        var saved_community_data

        // Get the current date
        var expiry_date;
        const currentDate = new Date();
        const day = (`0${currentDate.getDate()}`).slice(-2); // Add leading zero
        const month = (`0${currentDate.getMonth() + 1}`).slice(-2); // Months are zero-indexed, so add 1
        const year = currentDate.getFullYear();
        const date = new Date(`${year}-${month}-${day}`);

        if (day === '01' && isLeapYear(date.getFullYear() - 1)) {
            const previousYear = date.getFullYear() - 1;
            const newDate = new Date(`${previousYear}-02-29`);
            expiry_date = await formatToDDMMYYYY(newDate)
        } else {
            const newDate = addOneYear(subtractDay(date));
            expiry_date = await formatToDDMMYYYY(newDate)
        }
        data.expiry_date = expiry_date

        let community_data = await Models.community.findOne({community_id: data.community_id}).exec()
        let course_data = await Models.course.findOne({courseedition_id: community_data.course_id}).exec()  

        if (course_data.declined_user.includes(data.user_id)) {
          course_data.declined_user = course_data.declined_user.filter(item => item !== data.user_id);
          saved_payment_data = await Models.course.findOneAndUpdate(
            { course_id: course_data.course_id },
            { $set: {
                      declined_user: course_data.declined_user
                    }
            },
            { new: true });
        }else{

          var payment_data = await Models.payment_detail.findOne({course_id: course_data.course_id, user_id: data.user_id, payment_status
: "active"}).exec()

          if (payment_data == null) {
            saved_payment_data = await new Models.payment_detail({
                type: "Course",
                paid_amount: 0,
                total_amount: course_data.amount,
                user_id: data.user_id,
                course_id: course_data.course_id,
                created_by: data.user_id,
                expiry_date: data.expiry_date,
                courseedition_id: course_data.courseedition_id,
                razorpay_payment_status: "authorized"
            }).save()
          }else{
            saved_payment_data = payment_data
          }
        }

        if (community_data.declined_user.includes(data.user_id)) {
          community_data.declined_user = community_data.declined_user.filter(item => item !== data.user_id);
          saved_community_data = await Models.community.findOneAndUpdate(
            { community_id: community_data.community_id },
            { $set: {
                      declined_user: community_data.declined_user
                    }
            },
            { new: true });
        }else{

          var user_community_data = await Models.user_purchase_community.findOne({community_id: data.community_id, user_id: data.user_id}).exec()

          if (user_community_data == null) {
            saved_community_data = await new Models.user_purchase_community({
                paid_amount: 0,
                user_id: data.user_id,
                course_id: course_data.course_id,
                courseedition_id: course_data.courseedition_id,
                community_id: community_data.community_id,
                payment_detail_id: saved_payment_data._id 
            }).save()  
          }else{
            saved_community_data = user_community_data
          }
        }

        if (saved_community_data !== null) {
          data.response = {
            status: 200,
            data: {
              saved_payment_data: saved_payment_data,
              saved_community_data: saved_community_data
            },
            message: "Saved successfully"
          }
        } else {
          data.response = {
            status: 200,
            result: STATUS.ERROR,
            message: "Data not found."
          }
        }

        return data;
    } catch (error) {
        data.response = {
            status: 0,
            result: STATUS.ERROR,
            message: "Something is wrong",
            error: error
        }
        return data;
    }
}

const remove_user_from_community_admin = async (data, authData) => {
    try {

        const decoded = Auth.decodeToken(authData);
        if (decoded ?. is_active == false || decoded ?. deleted_date !== null) {
            data.response = {
                status: 0,
                message: "You are not valid user!"
            }
            return data;
        }

        delete data["action"]
        delete data["command"]

        let user_community = await Models.user_purchase_community.findOne({user_id: data.user_id, community_id: data.community_id}).exec()

        let course_data = await Models.course.findOne({course_id: user_community.course_id}).exec()

        let community_data = await Models.community.findOne({community_id: user_community.community_id}).exec()

        course_data.declined_user.push(data.user_id)
        community_data.declined_user.push(data.user_id)

        let up_course = await Models.course.findOneAndUpdate(
            { course_id: course_data.course_id },
            { $set: {
                      declined_user: course_data.declined_user
                    }
            },
            { new: true });

        let up_community = await Models.community.findOneAndUpdate(
            { community_id: community_data.community_id },
            { $set: {
                      declined_user: community_data.declined_user
                    }
            },
            { new: true });

        if (up_community !== null) {
          data.response = {
            status: 200,
            data: {
              up_course: up_course,
              up_community: up_community
            },
            message: "Saved successfully"
          }
        } else {
          data.response = {
            status: 200,
            result: STATUS.ERROR,
            message: "Data not found."
          }
        }

        return data;
    } catch (error) {
        data.response = {
            status: 0,
            result: STATUS.ERROR,
            message: "Something is wrong",
            error: error
        }
        return data;
    }
}

const community_member_list = async (data, authData) => {
    try {

        const decoded = Auth.decodeToken(authData);

        if (decoded ?. is_active == false || decoded ?. deleted_date !== null) {
            data.response = {
                status: 0,
                message: "You are not valid user!"
            }
            return data;
        }

        var skip = data.limit * (data.page_no - 1)
        var limit = data.limit
        var filter = data.filter

        delete data["action"]
        delete data["command"]
        delete data["page_no"]
        delete data["limit"]


        if (filter == undefined || filter == null || filter == {}) {
          filter = {}
        }else{
          if (filter.first_name !== undefined &&  filter.first_name !== null) {
            filter.first_name  = {
                    '$regex': new RegExp(filter.first_name),
                    '$options': 'i'
                  }
          }

          if (filter.email !== undefined &&  filter.email !== null) {
            filter.email = {
                    '$regex': new RegExp(filter.email),
                    '$options': 'i'
                  }
          }

          if (filter.all !== undefined &&  filter.all !== null) {
            filter = {
              '$or': [
                {
                  'first_name': {
                    '$regex': new RegExp(filter.all),
                    '$options': 'i'
                  }
                },
                {
                  'email': {
                    '$regex': new RegExp(filter.all),
                    '$options': 'i'
                  }
                }
              ]
            } 
          }
        }

        var record = await Models.user_purchase_community.aggregate([
          {
            '$match': {
                community_id: data.community_id
            }
          },
          {
            '$sort': {
                'createdAt': -1
            }
          },
          {
            '$lookup': {
              'from': 'communities', 
              'localField': 'community_id', 
              'foreignField': 'community_id', 
              'as': 'community_data'
            }
          },
          {
            '$lookup': {
              'from': 'users', 
              'localField': 'user_id', 
              'foreignField': 'user_id', 
              'as': 'user_data'
            }
          },
          {
            '$unwind': {
              'path': '$user_data', 
              'preserveNullAndEmptyArrays': true
            }
          },
          {
            '$unwind': {
              'path': '$community_data', 
              'preserveNullAndEmptyArrays': true
            }
          },
          {
            '$addFields': {
              'first_name': '$user_data.first_name', 
              'email': '$user_data.email',
              'declined_user': '$community_data.declined_user'
            }
          },
          {
            '$match': filter
          },
          {
              '$skip': skip
          },
          {
              '$limit': limit
          }
        ]);

        var total = await Models.user_purchase_community.aggregate([
          {
            '$match': {
                community_id: data.community_id
            }
          },
          {
            '$sort': {
                'createdAt': -1
            }
          },
          {
            '$lookup': {
              'from': 'communities', 
              'localField': 'community_id', 
              'foreignField': 'community_id', 
              'as': 'community_data'
            }
          },
          {
            '$lookup': {
              'from': 'users', 
              'localField': 'user_id', 
              'foreignField': 'user_id', 
              'as': 'user_data'
            }
          },
          {
            '$unwind': {
              'path': '$user_data', 
              'preserveNullAndEmptyArrays': true
            }
          },
          {
            '$addFields': {
              'first_name': '$user_data.first_name', 
              'email': '$user_data.email',
              'declined_user': '$community_data.declined_user'
            }
          },
          {
            '$match': filter
          }
        ]);

        var total_arr = []
        for (var i = 0; i < total.length; i++) {
          if (total[i].declined_user.includes(total[i].user_id) == false) {
            total_arr.push(total[i])
          }
        }


        var devident = total_arr.length / limit
        var pages;

        if (devident > parseInt(devident)) {
            pages = parseInt(devident) + 1
        } else {
            pages = devident
        }

        var final_arr = []
        for (var i = 0; i < record.length; i++) {
          if (record[i].declined_user.includes(record[i].user_id) == false) {
            final_arr.push(record[i])
          }
        }

        if (record.length !== 0) {
            data.response = {
                status: 200,
                total_data: total_arr.length,
                total_pages: pages,
                data: final_arr,
                message: "List fetched successfully"
            }
        } else {
            data.response = {
                status: 200,
                result: STATUS.ERROR,
                message: "Data not found."
            }
        }

        return data;
    } catch (error) {
      console.log("error     ----------->   ", error)
        data.response = {
            status: 0,
            result: STATUS.ERROR,
            message: "Something is wrong",
            error: error
        }
        return data;
    }
}

const mobile_user_list = async function (data, authData) {
    try {

        const decoded = Auth.decodeToken(authData);
        if (decoded.usertype_in == false || decoded.is_active == false || decoded.deleted_date !== null) {
            data.response = {
                status: 0,
                result: STATUS.ERROR,
                message: "Invalid user!"
            }
            return data;
        }

        var community_id = data.community_id

        delete data["action"]
        delete data["command"]
        delete data["community_id"]

        data.usertype_in = false
        data.deleted_date = null

        var record = await Models.user.aggregate([
            {
                '$match': data
            },
            {
                '$sort': {
                    'createdAt': -1
                }
            },
            {
            '$lookup': {
              'as': 'user_purchase_communities_data',
              'from': 'user_purchase_communities',
              'let':{'user_id':'$user_id', 'community_id': community_id},
              'pipeline':[
                {
                  '$match':{
                      '$and':[
                        {'$expr':{'$eq':['$community_id','$$community_id']}},
                        {'$expr':{'$eq':['$user_id','$$user_id']}}
                      ]
                  }
                }
              ]
            }
          },
          {
            '$addFields': {
              'user_purchase_communities_data':  {
                '$size': '$user_purchase_communities_data'
              }
            }
          },
          {
            '$match': {
              'user_purchase_communities_data': {
                '$eq': 0
              }
            }
          },
        ]).exec();

        if (record.length > 0) {
            data.response = {
                status: 200,
                result: STATUS.SUCCESS,
                data: record,
                message: "Data found."
            }
        } else {
            data.response = {
                status: 200,
                result: STATUS.ERROR,
                message: "Data not found."
            }
        }

        return data;
    } catch (error) {
        var resp = {
            status: 0,
            result: STATUS.ERROR,
            message: "Something is wrong",
            error: error
        }
        data.response = {
            resp
        };
        return data;
    }
};

function isLeapYear(year) {
    return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
}

function subtractDay(date) {
    date.setDate(date.getDate() - 1);
    return date;
}

function addOneYear(date) {
    date.setFullYear(date.getFullYear() + 1);
    return date;
}

function formatToDDMMYYYY(date) {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
}

module.exports = {
    get_list,
    view_details,
    get_list_for_mobile,
    user_list_acc_community,
    add_user_in_community_from_admin,
    remove_user_from_community_admin,
    community_member_list,
    mobile_user_list,
};
