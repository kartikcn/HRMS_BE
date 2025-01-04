
const course_filter = async function (data, authData) {
  try{
      const decoded = Auth.decodeToken(authData);

      if (!(decoded ?. usertype_in === true && decoded ?. is_active === true && decoded ?. deleted_date == null)) {
          data.response = {
              status: 0,
              message: "You are not an admin!!"
          }
          return data;
      }

      var course_status = 0;
      if (data.flag == 'Draft') {
          course_status = 0;
      } else if (data.flag == 'Submitted' || data.flag == 'Pending') {
          course_status = 1;
      } else if (data.flag == 'Resubmitted') {
          course_status = 3;
      } else if (data.flag == 'Rejected') {
          course_status = 2;
      } else if (data.flag == 'Approved' || data.flag == 'Published') {
          data.flag = 'Approved'
          course_status = 4;
      }

      let skip = data.limit*(data.page_no-1)

      if (data.filter.author_name != undefined) {
        data.filter.author_name = {
                                '$regex': new RegExp(data.filter.author_name),
                                '$options': 'i'
                              }
      }

      if (data.filter.course_title != undefined) {
        data.filter.course_title = {
                                '$regex': new RegExp(data.filter.course_title),
                                '$options': 'i'
                              }
      }

      if (data.filter.course_type != undefined) {
        data.filter.course_type = {
                                '$regex': new RegExp(data.filter.course_type),
                                '$options': 'i'
                              }
      }

      if (data.filter.createdAt != undefined) {
        data.filter.createdAt = {
                                '$regex': new RegExp(data.filter.createdAt),
                                '$options': 'i'
                              }
      }

      if (data.flag !== 'Approved' && data.flag != 'Rejected') {
        console.log("    ------------------>   Others" )
          if (data.flag == 'Moderator_pending') {
                var record = {
                  '$or': [
                    {
                      status: 1
                    }, {
                      status: 3
                    }
                  ]
                }
          }else{
                var record = {
                  status: course_status
                }
          }

          let is_deleted_record = {
            is_deleted: false
          }

          var list = await Models.courseEdition.aggregate([
              {
                  $match:  {
                    $and: [
                      record,
                      is_deleted_record,
                      data.filter
                    ]
                  }
              }, {
                  $sort: {
                      updatedAt: -1
                }
              }, {
                  $lookup: {
                      from: "categories",
                      localField: "category_id",
                      foreignField: "category_id",
                      as: "categoryInfo"
                  }
              }, {
                  $unwind: {
                      path: "$categoryInfo",
                      preserveNullAndEmptyArrays: true
                  }
              }, {
                $skip: skip
              }, {
                $limit: data.limit
              }, {
                  $project: {
                      _id: 1,
                      courseedition_id: 1,
                      author_name: 1,
                      description: 1,
                      cover_img: 1,
                      course_title: 1,
                      course_type: 1,
                      createdAt: 1,
                      categoryName: "$categoryInfo.category_name"
                  }
              }
          ]).exec();

          var total = await Models.courseEdition.aggregate([
              {
                  $match:  {
                    $and: [
                      record,
                      is_deleted_record,
                      data.filter
                    ]
                  }
              }, {
                  $sort: {
                      createdAt: -1
                }
              }, {
                  $lookup: {
                      from: "categories",
                      localField: "category_id",
                      foreignField: "category_id",
                      as: "categoryInfo"
                  }
              }, {
                  $unwind: {
                      path: "$categoryInfo",
                      preserveNullAndEmptyArrays: true
                  }
              }, {
                  $project: {
                      _id: 1,
                      courseedition_id: 1,
                      author_name: 1,
                      description: 1,
                      cover_img: 1,
                      course_title: 1,
                      course_type: 1,
                      createdAt: 1,
                      categoryName: "$categoryInfo.category_name"
                  }
              }
          ]).exec();
      } else if (data.flag === 'Rejected') {
        console.log("    ------------------>   Rejected" )
        console.log('ncjxbcjbxjcbxjbcjxbcjxbcjbjhdshdisdhishdisdhisdhisdhisdhishdisdhishdi')
        var record = {
          status: course_status
        }

        let is_deleted_record = {
          is_deleted: false
        }

        var list = await Models.courseEdition.aggregate([
            {
                $match: {
                    $and: [
                      record,
                      is_deleted_record,
                      data.filter
                    ]
                }
            },  {
                $sort: {
                    updatedAt: -1
              }
            }, {
              $lookup: {
                from: "categories",
                localField: "category_id",
                foreignField: "category_id",
                as: "categoryInfo",
              },
            },
            {
              $unwind: {
                path: "$categoryInfo",
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $skip: skip
            }, {
              $limit: data.limit
            },
            {
              $project: {
                _id: 1,
                courseedition_id: 1,
                author_name: 1,
                is_active:1,
                description: 1,
                cover_img: 1,
                course_title: 1,
                course_type: 1,
                createdAt: 1,
                categoryName: "$categoryInfo.category_name",
                createdBy: "$courseLogInfo.created_by",
                createdByName: { $concat: ["$userInfo.first_name", " ", "$userInfo.last_name"] } 
              },
            },
        ]).exec();
        console.log(list, 'list');

        for (var i = 0; i < list.length; i++) {
            var other_data = await Models.courseLog.aggregate([
              {
                '$match': {
                  'course_id': list[i].courseedition_id
                }
              }, {
                '$match': {
                  'action': 'Rejected', 
                  'chapterEdition_id': {
                    '$exists': false
                  }
                }
              }, {
                '$sort': {
                  'createdAt': -1
                }
              }, {
                '$lookup': {
                  'from': 'users', 
                  'localField': 'created_by', 
                  'foreignField': '_id', 
                  'as': 'userInfo'
                }
              }, {
                '$unwind': {
                  'path': '$userInfo', 
                  'preserveNullAndEmptyArrays': true
                }
              }, {
                '$project': {
                  'createdByName': {
                    '$concat': [
                      '$userInfo.first_name', ' ', '$userInfo.last_name'
                    ]
                  }
                }
              }
            ]).exec();

            list[i].createdByName = other_data[0]?.createdByName
        }

        var total = await Models.courseEdition.aggregate([
            {
                $match: {
                    status: course_status,
                    is_deleted: false
                }
            },  {
                $sort: {
                    createdAt: -1
              }
            }, {
              $lookup: {
                from: "categories",
                localField: "category_id",
                foreignField: "category_id",
                as: "categoryInfo",
              },
            },
            {
              $unwind: {
                path: "$categoryInfo",
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $project: {
                _id: 1,
                courseedition_id: 1,
                author_name: 1,
                is_active:1,
                description: 1,
                cover_img: 1,
                course_title: 1,
                course_type: 1,
                createdAt: 1,
                categoryName: "$categoryInfo.category_name",
                createdBy: "$courseLogInfo.created_by",
                createdByName: { $concat: ["$userInfo.first_name", " ", "$userInfo.last_name"] } 
              },
            },
        ]).exec();


      } else {
        console.log("    ------------------>   Approved" )
          var record = {
            status: course_status
          }

          let is_deleted_record = {
            is_deleted: false
          }

          var list = await Models.course.aggregate([
              {
                  $match:  {
                    $and: [
                      record,
                      is_deleted_record,
                      data.filter
                    ]
                  }
              },  {
                  $sort: {
                      createdAt: -1
                }
              }, {
                  $lookup: {
                      from: "categories",
                      localField: "category_id",
                      foreignField: "category_id",
                      as: "categoryInfo"
                  }
              }, {
                  $unwind: {
                      path: "$categoryInfo",
                      preserveNullAndEmptyArrays: true
                  }
              }, {
                $skip: skip
              }, {
                $limit: data.limit
              }, {
                  $project: {
                      _id: 1,
                      course_id: 1,
                      author_name: 1,
                      description: 1,
                      cover_img: 1,
                      course_title: 1,
                      course_type: 1,
                      createdAt: 1,
                      categoryName: "$categoryInfo.category_name",
                      createdBy: "$courseLogInfo.created_by",
                      createdByName: { $concat: ["$userInfo.first_name", " ", "$userInfo.last_name"] }
                  }
              }
          ]).exec();

          for (var i = 0; i < list.length; i++) {
            var other_data = await Models.courseLog.aggregate([
              {
                '$match': {
                  'course_id': list[i].course_id
                }
              }, {
                '$match': {
                  'action': 'Approved', 
                  // 'chapterEdition_id': {
                  //   '$exists': false
                  // }
                }
              }, {
                '$lookup': {
                  'from': 'users', 
                  'localField': 'created_by', 
                  'foreignField': '_id', 
                  'as': 'userInfo'
                }
              }, {
                '$unwind': {
                  'path': '$userInfo', 
                  'preserveNullAndEmptyArrays': true
                }
              }, {
                '$project': {
                  'createdByName': {
                    '$concat': [
                      '$userInfo.first_name', ' ', '$userInfo.last_name'
                    ]
                  }
                }
              }
            ]).exec();

            list[i].createdByName = other_data[0]?.createdByName
          }

          var total = await Models.course.aggregate([
              {
                  $match:  {
                    $and: [
                      record,
                      is_deleted_record,
                      data.filter
                    ]
                  }
              },  {
                  $sort: {
                      createdAt: -1
                }
              }, {
                  $lookup: {
                      from: "categories",
                      localField: "category_id",
                      foreignField: "category_id",
                      as: "categoryInfo"
                  }
              }, {
                  $unwind: {
                      path: "$categoryInfo",
                      preserveNullAndEmptyArrays: true
                  }
              },
              {
                  $project: {
                      _id: 1,
                      course_id: 1,
                      author_name: 1,
                      description: 1,
                      cover_img: 1,
                      course_title: 1,
                      course_type: 1,
                      createdAt: 1,
                      categoryName: "$categoryInfo.category_name",
                      createdBy: "$courseLogInfo.created_by",
                      createdByName: { $concat: ["$userInfo.first_name", " ", "$userInfo.last_name"] }
                  }
              }
          ]).exec();
      } 

      let devident = total.length/data.limit
      let pages;

      if (devident > parseInt(devident)) {
        pages = parseInt(devident) + 1
      }else{
        pages = devident
      }
      
      data.response = {
          status: 200,
          total_data: total.length,
          total_pages: pages,
          data: list,
          message: "List fetched successfully"
      }
      return data;
  } catch(err) {
    console.log("Error       ------------>  ", err)
  }
}

const transaction_filter = async (data, authData) => {
  try {
    const decoded = Auth.decodeToken(authData);
    if (decoded?.usertype_in === false || decoded?.is_active == false || decoded?.deleted_date !== null) {
      data.response = {
          status: 0,
          message: "You are not valid user!"
      }
      return data;
    }

    var limit = data.limit
    var createdAt = data.createdAt
    var skip = data.limit*(data.page_no-1)
    var filter = data.filter
    delete data["action"]
    delete data["command"]
    delete data["limit"]
    delete data["page_no"]
    delete data["createdAt"]
    delete data["filter"]
    delete data["flag"]

    data.user_id = {
      '$ne': null
    }

    if (filter.course_name != undefined) {
      filter.course_name = {
                                '$regex': new RegExp(filter.course_name),
                                '$options': 'i'
                              }
    }

    if (filter.author_name != undefined) {
      filter.user_name = {
                                '$regex': new RegExp(filter.author_name),
                                '$options': 'i'
                              }
      delete filter["author_name"]
    }

    if (filter.amount != undefined) {
      filter.paid_amount = {
                                '$regex': new RegExp(filter.amount),
                                '$options': 'i'
                              }
      delete filter["amount"]
    }

    if (filter.invoice_no != undefined) {
      filter.invoice_no = {
                                '$regex': new RegExp(filter.invoice_no),
                                '$options': 'i'
                              }
    }

    if (filter.all !== undefined) {

        filter =  {
          '$or': [
            {
              'course_name': {
                  '$regex': new RegExp(filter.all),
                  '$options': 'i'
              }
            },
            {
              'user_name': {
                  '$regex': new RegExp(filter.all),
                  '$options': 'i'
              }
            },
            {
              'invoice_no': {
                  '$regex': new RegExp(filter.all),
                  '$options': 'i'
              }
            },
            {
              'paid_amount': {
                  '$regex': new RegExp(filter.all),
                  '$options': 'i'
              }
            }
          ]
        }
    }

    const record = await Models.payment_detail.aggregate([
      {
        '$match': data
      }, {
        '$lookup': {
          'from': 'users',
          'localField': 'user_id',
          'foreignField': 'user_id',
          'as': 'user_data'
        }
      },{
          '$unwind': {
              'path': "$user_data",
              'preserveNullAndEmptyArrays': true
          }
      }, {
        '$lookup': {
          'from': 'courses',
          'localField': 'course_id',
          'foreignField': 'course_id',
          'as': 'course_data'
        }
      },{
          '$unwind': {
              'path': "$course_data",
              'preserveNullAndEmptyArrays': true
          }
      }, {
        '$lookup': {
          'from': 'subscriptions',
          'localField': '_id',
          'foreignField': 'subscription_id',
          'as': 'subscription_data'
        }
      },{
          '$unwind': {
              'path': "$subscription_data",
              'preserveNullAndEmptyArrays': true
          }
      }, {
        '$sort': {
          'createdAt': -1
        }
      }, {
          '$project': {
              '_id': 1,
              'courseedition_id': 1,
              'course_name': '$course_data.course_title',
              'user_name':'$user_data.first_name',
              'paid_amount': {'$toString': '$paid_amount'},
              'createdAt': 1,
              'invoice_no': 1,
              'type': 1
          }
      },{
        '$match': filter
      },{
        '$skip': skip
      }, {
        '$limit': limit
      }
    ]);

    var total = await Models.payment_detail.aggregate([
      {
        '$match': data
      }, {
        '$lookup': {
          'from': 'users',
          'localField': 'user_id',
          'foreignField': 'user_id',
          'as': 'user_data'
        }
      },{
          '$unwind': {
              'path': "$user_data",
              'preserveNullAndEmptyArrays': true
          }
      }, {
        '$lookup': {
          'from': 'courses',
          'localField': 'course_id',
          'foreignField': 'course_id',
          'as': 'course_data'
        }
      },{
          '$unwind': {
              'path': "$course_data",
              'preserveNullAndEmptyArrays': true
          }
      }, {
        '$lookup': {
          'from': 'subscriptions',
          'localField': '_id',
          'foreignField': 'subscription_id',
          'as': 'subscription_data'
        }
      },{
          '$unwind': {
              'path': "$subscription_data",
              'preserveNullAndEmptyArrays': true
          }
      }, {
        '$sort': {
          'createdAt': -1
        }
      }, {
          '$project': {
              '_id': 1,
              'courseedition_id': 1,
              'course_name': '$course_data.course_title',
              'user_name':'$user_data.first_name',
              'paid_amount': 1,
              'createdAt': 1,
              'invoice_no': 1,
              'type': 1
          }
      },{
        '$match': filter
      }
    ]);

    let devident = total.length/limit
    let pages;

    if (devident > parseInt(devident)) {
      pages = parseInt(devident) + 1
    }else{
      pages = devident
    }

    if (record.length > 0) {
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
          status: 0,
          result: STATUS.ERROR,
          message: "Something went wrong.",
      }
    }
    userLogger.info(__filename, 'transaction_list response ---->  ,' + data);
    return data;
  } catch (error) {
      console.log("error          ------------>  ", error)
      userLogger.info(__filename, 'transaction_list catch block ---->  ,' + error);
      data.response = {
          status: 0,
          result: STATUS.ERROR,
          message: "Something is wrong",
          error: error
      }
      return data;
  }
}

module.exports = {
    course_filter,
    transaction_filter,
};
