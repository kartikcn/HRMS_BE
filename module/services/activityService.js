const io = require("../../notificationHandler");

const create = async (data, authData) => {

    try {
        delete data["action"]
        delete data["command"]
        
        if (data.activity_id != undefined && data.activity_id != "") {
            var record = await Models.activity.findOneAndUpdate({
                "activity_id": data.activity_id
            }, {
                $set: data
            }, {new: true})

            if (record.activity_status == "Published") {
                let community_chat_data = await Models.community_chat({
                    type: record.type,
                    activity_id: record.activity_id,
                    community_id: record.community_id
                }).save()

                io.emit('community_chat', {message: community_chat_data})
            }
            data.response = {
                status: 200,
                result: STATUS.SUCCESS,
                data: record,
                message: "Activity updated succesfully."
            }
            return data;
        } else {
            var record = await Models.activity(data).save();
            data.response = {
                status: 200,
                result: STATUS.SUCCESS,
                data: record,
                message: "Activity created succesfully."
            }
            return data;
        }

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

// activity_id
//
// to get list of challenge, poll, quest after going inside activity view more according to activity id
const listActivityType = async (data, authData) => {
    try {
        data['is_deleted'] = false;
        const decoded = Auth.decodeToken(authData);
        if (decoded ?. is_active == false || decoded ?. deleted_date !== null) {
            data.response = {
                status: 0,
                message: "You are not valid user!"
            }
            return data;
        }
        let activitytp = data['activity_type'];
        delete data['action'];
        delete data['command'];
        delete data['activity_type'];
        delete data['flag'];

        if (activitytp == 'Poll') {
            var activityDetails = await Models.activity_poll.find(data).exec();
        } else if (activitytp == 'Quest') {
            var activityDetails = await Models.activity_quest.find(data).exec();
        } else {
            var activityDetails = await Models.activity_challenge.find(data).exec();
            console.log(activityDetails, "acakhds")
        }
        data.response = {
            status: 200,
            result: STATUS.SUCCESS,
            mesage: "Successfully fetched",
            data: activityDetails
        }
        return data;
    } catch (e) {
        data.response = {
            status: 0,
            result: STATUS.ERROR,
            message: "Something is wrong",
            error: e
        }
        return data;
    }
}

// activity_id
// type
// community_id
const saveactivity_details = async (data, authData) => {
    try {
        const decoded = Auth.decodeToken(authData);
        if (decoded ?. usertype_in == false || decoded ?. is_active == false || decoded ?. deleted_date !== null) {
            data.response = {
                status: 0,
                message: "You are not valid user!"
            }
            return data;
        }
        var type = data.type
        console.log(type, "typoe");
        // delete data["type"]
        delete data["action"]
        delete data["command"]
        delete data[data.type]._id;

        if (type === "Poll") {
            if (data[data.type].activityType_id != undefined && data[data.type].activityType_id != "") {
                const matchQuery = data[data.type].activityType_id;

                var challengeUpdate = await Models.activity_poll.findOneAndUpdate({
                    activityType_id: matchQuery
                }, {
                    $set: {
                        poll_title: data[data.type].poll_title,
                        description: data[data.type].description,
                        option1: data[data.type].option1,
                        option2: data[data.type].option2,
                        is_deleted: (data[data.type].is_deleted != undefined) ? data[data.type].is_deleted : false
                    }
                }, {new: true})
                data.response = {
                    status: 200,
                    message: type+" updated successfully",
                    result: STATUS.SUCCESS,
                    data: challengeUpdate
                }
                return data;
            } else {
                var challengeUpdate = await new Models.activity_poll(data[data.type]).save();
                data.response = {
                    status: 200,
                    message: type+" saved successfully",
                    result: STATUS.SUCCESS,
                    data: challengeUpdate
                }
                return data;
            }
        } else if (type === "Quest") {
            if (data[data.type].activityType_id != undefined && data[data.type].activityType_id != "") {
                const matchQuery = data[data.type].activityType_id;

                var challengeUpdate = await Models.activity_quest.findOneAndUpdate({
                    activityType_id: matchQuery
                }, {
                    $set: {
                        quest_title: data[data.type].quest_title,
                        description: data[data.type].description,
                        is_deleted: (data[data.type].is_deleted != undefined) ? data[data.type].is_deleted : false
                    }
                }, {new: true})
                data.response = {
                    status: 200,
                    message: type+" updated successfully",
                    result: STATUS.SUCCESS,
                    data: challengeUpdate
                }
                return data;
            } else {
                var challengeUpdate = await new Models.activity_quest(data[data.type]).save();
                data.response = {
                    status: 200,
                    message: type+" saved successfully",
                    result: STATUS.SUCCESS,
                    data: challengeUpdate
                }
                return data;
            }
        } else if (type === "Challenge") {
            if (data[data.type].activityType_id != "" && data[data.type].activityType_id != null) {
                console.log(data[data.type].activityType_id, "data.type")
                console.log(data[data.type], "data");

                const matchQuery = data[data.type].activityType_id;

                var challengeUpdate = await Models.activity_challenge.findOneAndUpdate({
                    activityType_id: matchQuery
                }, {
                    $set: {
                        question: data[data.type].question,
                        option1: data[data.type].option1,
                        option2: data[data.type].option2,
                        option3: data[data.type].option3,
                        option4: data[data.type].option4,
                        correctanswer: data[data.type].correctanswer,
                        is_deleted: data[data.type].is_deleted
                    }
                }, {new: true})
                data.response = {
                    status: 200,
                    message: type+" updated successfully",
                    result: STATUS.SUCCESS,
                    data: challengeUpdate
                }
                return data;
            } else {
                console.log(data[data.type].activityType_id, "data.type in else")
                let saveData = data[data.type];
                console.log(saveData, "savedatasdsdss");
                var challengeUpdate = await new Models.activity_challenge(saveData).save();
                data.response = {
                    status: 200,
                    message: type+" saved successfully",
                    result: STATUS.SUCCESS,
                    data: challengeUpdate
                }
                return data;
            }
        }
        
    } catch (error) {
        console.log(error);
        data.response = {
            status: 0,
            result: STATUS.ERROR,
            message: "Something is wrong",
            error: error
        }
        return data;
    }
}

const activityTypeDetails = async (data, authData) => {
    try {
        const decoded = Auth.decodeToken(authData);
        if (decoded ?. usertype_in == false || decoded ?. is_active == false || decoded ?. deleted_date !== null) {
            data.response = {
                status: 0,
                message: "You are not valid user!"
            }
            return data;
        }
        let activitytp = data['activity_type'];
        delete data['action'];
        delete data['command'];
        delete data['activity_type'];
        data['is_deleted'] = false;
        if (activitytp == 'Poll') {
            var activityDetails = await Models.activity_poll.find(data).exec();
        } else if (activitytp == 'Quest') {
            var activityDetails = await Models.activity_quest.find(data).exec();
        } else {
            var activityDetails = await Models.activity_challenge.find(data).exec();
            console.log(activityDetails, "acakhds")
        }
        data.response = {
            status: 200,
            result: STATUS.SUCCESS,
            mesage: "Successfully fetched",
            data: activityDetails
        }
        return data;
    } catch (e) {
        data.response = {
            status: 0,
            result: STATUS.ERROR,
            message: "Something is wrong",
            error: e
        }
        return data;
    }
}

const activityList = async (data, authData) => {
    try {
        const decoded = Auth.decodeToken(authData);
        if (decoded ?. usertype_in == false || decoded ?. is_active == false || decoded ?. deleted_date !== null) {
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

        if (filter.community_title !== undefined) {
          filter.community_name = {
                                '$regex': new RegExp(filter.community_title),
                                '$options': 'i'
                              }
          delete filter["community_title"]
        }

        if (filter.all !== undefined && data.flag == "Published") {
          filter =  {
            '$or': [
              {
                'community_name': {
                    '$regex': new RegExp(filter.all),
                    '$options': 'i'
                }
              },
              {
                'challenge_count': {
                    '$regex': new RegExp(filter.all),
                    '$options': 'i'
                }
              },
              {
                'quest_count': {
                    '$regex': new RegExp(filter.all),
                    '$options': 'i'
                }
              },
              {
                'poll_count': {
                    '$regex': new RegExp(filter.all),
                    '$options': 'i'
                }
              }
            ]
          }
        }

        if (filter.all !== undefined && data.flag == "Draft") {
          filter =  {
            '$or': [
              {
                'community_name': {
                    '$regex': new RegExp(filter.all),
                    '$options': 'i'
                }
              },
              {
                'content_type': {
                    '$regex': new RegExp(filter.all),
                    '$options': 'i'
                }
              },
              {
                'content_title': {
                    '$regex': new RegExp(filter.all),
                    '$options': 'i'
                }
              },
              {
                'category_name': {
                    '$regex': new RegExp(filter.all),
                    '$options': 'i'
                }
              }
            ]
          }
        }

        if (data.flag == "Published") {
          var activityList = await Models.activity.aggregate([
              {
                $match: {
                  is_deleted: false,
                  activity_status: data.flag,
                  type: {
                      $in: ["Challenge", "Quest", "Poll"]
                  }
                }
              },
              {
                $group: {
                    _id: "$community_id",
                    challenge: {
                      $sum: {
                        $cond: [
                            {
                                $eq: ["$type", "Challenge"]
                            },
                            1,
                            0
                        ]
                      }
                    },
                    quest: {
                      $sum: {
                        $cond: [
                            {
                                $eq: ["$type", "Quest"]
                            },
                            1,
                            0
                        ]
                      }
                    },
                    poll: {
                      $sum: {
                        $cond: [
                            {
                                $eq: ["$type", "Poll"]
                            },
                            1,
                            0
                        ]
                      }
                    },
                    activity_id: {
                      $push: '$$ROOT.activity_id'
                    }
                }
              },
              {
                $addFields: {
                  activity_id: {
                      $max: '$activity_id'
                  }
                }
              },
              {
                $sort: {
                    activity_id: -1
                }
              },
              {
                $lookup: {
                  from: "communities",
                  localField: "_id",
                  foreignField: "community_id",
                  as: "communityDetails"
                }
              },
              {
                $unwind: "$communityDetails"
              },
              {
                $project: {
                  _id: 0,
                  community_id: "$_id",
                  community_name: "$communityDetails.community_title",
                  types: {
                      challenge: "$challenge",
                      quest: "$quest",
                      poll: "$poll"
                  },
                  challenge_count: {"$toString": "$challenge"} ,
                  quest_count: {"$toString": "$quest"},
                  poll_count: {"$toString": "$poll"}
                }
              },
              {
                $match: filter
              },
              {
                $skip: skip
              },
              {
                $limit: limit
              }
          ]);

          var total = await Models.activity.aggregate([
              {
                $match: {
                  is_deleted: false,
                  activity_status: data.flag,
                  type: {
                      $in: ["Challenge", "Quest", "Poll"]
                  }
                }
              },
              {
                $group: {
                    _id: "$community_id",
                    challenge: {
                      $sum: {
                        $cond: [
                            {
                                $eq: ["$type", "Challenge"]
                            },
                            1,
                            0
                        ]
                      }
                    },
                    quest: {
                      $sum: {
                        $cond: [
                            {
                                $eq: ["$type", "Quest"]
                            },
                            1,
                            0
                        ]
                      }
                    },
                    poll: {
                      $sum: {
                        $cond: [
                            {
                                $eq: ["$type", "Poll"]
                            },
                            1,
                            0
                        ]
                      }
                    },
                    activity_id: {
                      $push: '$$ROOT.activity_id'
                    }
                }
              },
              {
                $addFields: {
                  activity_id: {
                      $max: '$activity_id'
                  }
                }
              },
              {
                $sort: {
                    activity_id: -1
                }
              },
              {
                $lookup: {
                  from: "communities",
                  localField: "_id",
                  foreignField: "community_id",
                  as: "communityDetails"
                }
              },
              {
                $unwind: "$communityDetails"
              },
              {
                $project: {
                  _id: 0,
                  community_id: "$_id",
                  community_name: "$communityDetails.community_title",
                  types: {
                      challenge: "$challenge",
                      quest: "$quest",
                      poll: "$poll"
                  },
                  challenge_count: {"$toString": "$challenge"} ,
                  quest_count: {"$toString": "$quest"},
                  poll_count: {"$toString": "$poll"}
                }
              },
              {
                $match: filter
              }
          ]);
        }else{
          var activityList = await Models.activity.aggregate([
              {
                $match: {
                  is_deleted: false,
                  activity_status: data.flag
                }
              },
              {
                $sort: {
                  'createdAt': -1
                }
              },
              {
                $lookup: {
                  from: "communities",
                  localField: "community_id",
                  foreignField: "community_id",
                  as: "communityDetails"
                }
              },
              {
                $unwind: "$communityDetails"
              },
              {
                $lookup: {
                  'from': 'courseeditions', 
                  'localField': 'communityDetails.course_id', 
                  'foreignField': 'courseedition_id', 
                  'as': 'courseedition_data'
                }
              },
              {
                $unwind: {
                  'path': '$courseedition_data', 
                  'preserveNullAndEmptyArrays': true
                }
              },
              {
                $lookup: {
                  'from': 'categories', 
                  'localField': 'courseedition_data.category_id', 
                  'foreignField': 'category_id', 
                  'as': 'category_data'
                }
              },
              {
                $unwind: {
                  'path': '$category_data', 
                  'preserveNullAndEmptyArrays': true
                }
              },
              {
                $addFields: {
                  'community_name': '$communityDetails.community_title', 
                  'category_name': '$category_data.category_name'
                }
              },
              {
                $match: filter
              },
              {
                $skip: skip
              },
              {
                $limit: limit
              }
          ]);

          var total = await Models.activity.aggregate([
              {
                $match: {
                  is_deleted: false,
                  activity_status: data.flag
                }
              },
              {
                $sort: {
                  'createdAt': -1
                }
              },
              {
                $lookup: {
                  from: "communities",
                  localField: "community_id",
                  foreignField: "community_id",
                  as: "communityDetails"
                }
              },
              {
                $unwind: "$communityDetails"
              },
              {
                $lookup: {
                  'from': 'courseeditions', 
                  'localField': 'communityDetails.course_id', 
                  'foreignField': 'courseedition_id', 
                  'as': 'courseedition_data'
                }
              },
              {
                $unwind: {
                  'path': '$courseedition_data', 
                  'preserveNullAndEmptyArrays': true
                }
              },
              {
                $lookup: {
                  'from': 'categories', 
                  'localField': 'courseedition_data.category_id', 
                  'foreignField': 'category_id', 
                  'as': 'category_data'
                }
              },
              {
                $unwind: {
                  'path': '$category_data', 
                  'preserveNullAndEmptyArrays': true
                }
              },
              {
                $addFields: {
                  'community_name': '$communityDetails.community_title', 
                  'category_name': '$category_data.category_name'
                }
              },
              {
                $match: filter
              }
          ]);
        }

        console.log(total, "total");
        var no_of_pages = await total_page(total.length, limit);
        // var devident = total.length / limit
        // var pages;

        // if (devident > parseInt(devident)) {
        //     pages = parseInt(devident) + 1
        // } else {
        //     pages = devident
        // }
        data.response = {
            status: 200,
            total_data: total.length,
            total_pages: no_of_pages,
            result: STATUS.SUCCESS,
            message: "Fetched Successfully",
            data: activityList
        }
        return data;
    } catch (e) {
        console.log(e, "erroe")
        data.response = {
            status: 0,
            result: STATUS.ERROR,
            message: "Something is wrong",
            error: e
        }
        return data;
    }
}

async function total_page(total, limit) {
    console.log(total, "total")
    console.log(limit, "limit")
    var devident = total / limit
    var pages;
    console.log(devident, "divedent")
    if (devident > parseInt(devident)) {
        pages = parseInt(devident) + 1
    } else {
        pages = devident
    }
    console.log(pages, "pages");
    return pages;
}

const activityDetails = async (data, authData) => {
    const decoded = Auth.decodeToken(authData);
    if (decoded ?. usertype_in == false || decoded ?. is_active == false || decoded ?. deleted_date !== null) {
        data.response = {
            status: 0,
            message: "You are not valid user!"
        }
        return data;
    }
    delete data["action"];
    delete data["command"];
    delete data["flag"];
    delete data["activity_type"];

    var activityDetails = await Models.activity.aggregate([
        {
            $match: data
        }, {
            $lookup: {
                from: "communities",
                localField: "community_id",
                foreignField: "community_id",
                as: "communityDetails"
            }
        }, {
            $unwind: "$communityDetails"
        }, {
            $project: {
                _id: 0,
                content_type: 1,
                content_title: 1,
                description: 1,
                start_date: 1,
                end_date: 1,
                status: 1,
                activity_status: 1,
                type: 1,
                activity_id: 1,
                provided_timer: 1,
                community_id: "$communityDetails.community_id",
                community_name: "$communityDetails.community_title",
                types: 1
            }
        }
    ]);
    console.log(activityDetails, "activityDetails")
    if (activityDetails[0]) {
        var activityData = activityDetails[0]
    } else {
        var activityData = activityDetails;
    }
    data.response = {
        status: 200,
        result: STATUS.SUCCESS,
        message: "Fetched Successfully",
        data: activityData
    }
    return data;
}

const activitiesPerCommunity = async (data, authData) => {
    try {

        const decoded = Auth.decodeToken(authData);
        if (decoded ?. usertype_in == false || decoded ?. is_active == false || decoded ?. deleted_date !== null) {
            data.response = {
                status: 0,
                message: "You are not valid user!"
            }
            return data;
        }
        if(data.flag == "Quest") {
            var table_name = "activity_quests"
        } else if(data.flag == "Challenge") {
            var table_name = "activity_challenges"
        } else {
            var table_name = "activity_polls"
        }
        const res = await Models.community.aggregate([
            {
                $match: {
                    community_id: data.community_id
                }
            },
            {
                $lookup: {
                    from: "activities",
                    let: {
                        cid: "$community_id"
                    },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        {
                                            $eq: ["$community_id", "$$cid"]
                                        }, {
                                            $eq: ["$type", data.flag]
                                        }, // Match by type "Challenge"
                                    ]
                                }
                            }
                        },
                    ],
                    as: "result", // Store matched activities in 'activities' array
                }
            },
            {
                $unwind: {
                    path: "$result"
                }
            },
            {
                $lookup: {
                  from: "courses",
                  localField: "course_id",
                  foreignField: "course_id",
                  as: "community_course",
                },
              },
              {
                $unwind: {
                  path: "$community_course",
                  preserveNullAndEmptyArrays: true,
                },
              },
            {
                $group: {
                    _id: "$community_id",
                    community_id: {
                        $first: "$community_id"
                    },
                    community_name: {
                        $first: "$community_title"
                    },
                    community_description: {
                        $first: "$community_description"
                    },
                    createdAt: {
                        $first: "$createdAt"
                    },
                    is_deleted: {
                        $first: "$is_deleted"
                    },
                    community_type: {
                        $first: "$community_type"
                    },
                    amount: {
                        $first: "$community_course.amount",
                      },
                    activities: {
                        $push: "$$ROOT"
                    }
                }
            }, {
                $lookup: {
                    from: table_name, 
                    localField: "activities.result.activity_id", 
                    foreignField: "activity_id", 
                    as: "joinedActivities", 
                }
            }, {
                $project: {
                    _id: 0,
                    community_id: 1,
                    community_name: 1,
                    community_description: 1,
                    community_type: 1,
                    createdAt:1,
                    is_deleted:1,
                    amount: 1,
                    activities: {
                        $map: {
                            input: "$activities",
                            as: "activity",
                            in: {
                                type: "$$activity.result.type",
                                content_type: "$$activity.result.content_type",
                                content_title: "$$activity.result.content_title",
                                description: "$$activity.result.description",
                                start_date: "$$activity.result.start_date",
                                end_date: "$$activity.result.end_date",
                                provided_timer: "$$activity.result.provided_timer",
                                status: "$$activity.result.status",
                                activity_status: "$$activity.result.activity_status",
                                createdAt: "$$activity.result.createdAt",
                                updatedAt: "$$activity.result.updatedAt",
                                activity_id: "$$activity.result.activity_id",
                                __v: "$$activity.result.__v",
                                counts: {
                                    $size: {
                                        $filter: {
                                            input: "$joinedActivities",
                                            as: "quest",
                                            cond: {
                                                $eq: ["$$quest.activity_id", "$$activity.result.activity_id",]
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },
        ]);
        if (res[0]) {
            var activityData = res[0]
        } else {
            var activityData = res;
        }
        data.response = {
            status: 200,
            result: STATUS.SUCCESS,
            message: "Data fetched successully",
            data: activityData
        }
        return data;
    } catch (error) {
        data.response = {
            status: 0,
            result: STATUS.ERROR,
            message: "Error",
            data: error
        }
        return data;
    }
}

const activityViewMore = async (data, authData) => {
    try {

        const decoded = Auth.decodeToken(authData);
        if (decoded ?. usertype_in == false || decoded ?. is_active == false || decoded ?. deleted_date !== null) {
            data.response = {
                status: 0,
                message: "You are not valid user!"
            }
            return data;
        }
        var activityDetails = await Models.community.aggregate(
            [
                {
                    $match: {
                        is_deleted: false,
                        community_id: data.community_id
                    }
                },
                {
                    $lookup: {
                        from: "activities", // Assuming the name of your activities collection
                        localField: "community_id",
                        foreignField: "community_id",
                        as: "community_activities"
                    }
                },
                {
                    $unwind: "$community_activities" // Unwind the array of community_activities
                },
                {
                    $lookup: {
                        from: "courses", // Assuming the name of your activities collection
                        localField: "course_id",
                        foreignField: "courseedition_id",
                        as: "community_course"
                    }
                },
                          {
                    $unwind: "$community_course" // Unwind the array of community_activities
                },
                {
                    $match: {
                        "community_activities.community_id": data.community_id // Match based on community_id
                    }
                }, {
                    $group: {
                        _id: "$_id", // Group by the community document's _id (or any unique identifier)
                        community_title: {
                            $first: "$community_title"
                        }, // Preserve community details
                        community_description: {
                            $first: "$community_description"
                        },
                        community_type: {
                            $first: "$community_type"
                        },
                        is_deleted: {
                            $first: "$is_deleted"
                        },
                        createdAt: {
                            $first: "$createdAt"
                        },
                        amount: {
                            $first: "$community_course.amount"
                        },
                      author_name: {
                            $first: "$community_course.author_name"
                        },
                        challengeCount: {
                            $sum: {
                                $cond: [
                                    {
                                        $eq: ["$community_activities.type", "Challenge"]
                                    },
                                    1,
                                    0
                                ]
                            }
                        },
                        pollCount: {
                            $sum: {
                                $cond: [
                                    {
                                        $eq: ["$community_activities.type", "Poll"]
                                    },
                                    1,
                                    0
                                ]
                            }
                        },
                        questCount: {
                            $sum: {
                                $cond: [
                                    {
                                        $eq: ["$community_activities.type", "Quest"]
                                    },
                                    1,
                                    0
                                ]
                            }
                        }
                    }
                }, {
                    $project: {
                        _id: 0, // Exclude the _id field from the final output (optional)
                        community_title: 1,
                        createdAt: 1,
                        community_description: 1,
                        community_type: 1,
                        is_deleted: 1,
                        challengeCount: 1,
                        pollCount: 1,
                        questCount: 1,
                        community_courses: 1,
                          amount:1,
                          author_name:1
                    }
                }
            ]
        );


        var total_member = await Models.user_purchase_community.find({community_id: data.community_id}).exec()

        if (activityDetails[0]) {
            var activityData = activityDetails[0]
        } else {
            var activityData = activityDetails;
        }
        activityData.total_member = total_member.length
        data.response = {
            status: 200,
            result: STATUS.SUCCESS,
            message: "FETCHED SUCCESSFULLY",
            data: activityData
        }
        return data;
    } catch (error) {
        data.response = {
            status: 0,
            result: STATUS.ERROR,
            message: "Error",
            data: error
        }
        return data;
    }
}

const add_activity_badge = async (data, authData) => {
    try {

        const decoded = Auth.decodeToken(authData);
        if (decoded ?. usertype_in == true || decoded ?. is_active == false || decoded ?. deleted_date !== null) {
            data.response = {
                status: 0,
                message: "You are not valid user!"
            }
            return data;
        }

        delete data["action"]
        delete data["command"]

        var badge_data = await Models.activity_badge.findOne({user_id: data.user_id, activity_id: data.activity_id}).exec()

        if (badge_data == null) {
          var record = await Models.activity_badge(data).save();

          if (record !== null) {
            data.response = {
              status: 200,
              result: STATUS.SUCCESS,
              data: record,
              message: "Data stored."
            }
          } else {
            data.response = {
              status: 0,
              result: STATUS.ERROR,
              message: "Data not stored."
            }
          }
        }else{
          data.response = {
              status: 200,
              result: STATUS.SUCCESS,
              data: badge_data,
              message: "Already activity is completed."
          }
        }

        return data;
    } catch (error) {
        console.log("error    -------------->  " , error)
        data.response = {
            status: 0,
            result: STATUS.ERROR,
            message: "Something is wrong",
            error: error
        }
        return data;
    }
}

const add_activity_score = async (data, authData) => {
    try {
        const decoded = Auth.decodeToken(authData);
        if (decoded ?. is_active == false || decoded ?. deleted_date !== null) {
            data.response = {
                status: 0,
                message: "You are not valid user!"
            }
            return data;
        }

        delete data['action'];
        delete data['command'];

        var saved_data;

        if (data.activity_type == "Challenge") {
          let user_challenge = await Models.activity_score_user.findOne({user_id: data.user_id, activity_id: data.activity_id, activity_type: data.activity_type}).exec()
          if (user_challenge !== null) {
            saved_data = await Models.activity_score_user.findOneAndUpdate(
              { _id: new ObjectId(user_challenge._id) },
              { $set: data},
              { new: true });
          }else{
            saved_data = await Models.activity_score_user(data).save()
          }
        }

        if (data.activity_type == "Poll") {
          let user_poll = await Models.activity_score_user.findOne({user_id: data.user_id, activity_id: data.activity_id, activity_type: data.activity_type}).exec()
          if (user_poll !== null) {
            if (data.poll_answer !== user_poll.poll_answer) {
              saved_data = await Models.activity_score_user.findOneAndUpdate(
                { _id: new ObjectId(user_poll._id) },
                { $set: data },
                { new: true });
            }else{
              saved_data = await Models.activity_score_user.deleteOne({_id: new ObjectId(user_poll._id)}).exec()
              // saved_data = null
            }
          }else{
            saved_data = await Models.activity_score_user(data).save()
          }
          var activity_poll_user_data = await Models.activity_score_user.find({activity_id: data.activity_id, activity_type: data.activity_type}).exec()
          let activity_poll_data = await Models.activity_poll.findOne({activity_id: data.activity_id}).exec()
          let option1_count = await Models.activity_score_user.find({activity_id: data.activity_id, poll_answer: activity_poll_data.option1}).exec()
          let option2_count = await Models.activity_score_user.find({activity_id: data.activity_id, poll_answer: activity_poll_data.option2}).exec()

          saved_data = {
             user_id: saved_data?.user_id,
             activity_id: saved_data?.activity_id,
             activity_type: saved_data?.activity_type,
             poll_answer: saved_data?.poll_answer,
             challenge_earn_score: saved_data?.challenge_earn_score,
             challenge_total_score: saved_data?.challenge_total_score,
             _id: saved_data?._id,
             createdAt: saved_data?.createdAt,
             updatedAt: saved_data?.updatedAt,
             activity_score_user_id: saved_data?.activity_score_user_id,
             id: saved_data?.id,
             activity_poll_user_data: activity_poll_user_data,
             option1_count: option1_count.length,
             option2_count: option2_count.length
          }
        }

        if (data.activity_type == "Quest") {
          let user_quest = await Models.activity_score_user.findOne({user_id: data.user_id, activity_id: data.activity_id, activity_type: data.activity_type}).exec()
          if (user_quest !== null) {
            saved_data = await Models.activity_score_user.findOneAndUpdate(
              { _id: new ObjectId(user_quest._id) },
              { $set: data},
              { new: true });
          }else{
            saved_data = await Models.activity_score_user(data).save()
          }
        }

        if (saved_data !== null) {
          data.response = {
            status: 200,
            result: STATUS.SUCCESS,
            mesage: "Successfully fetched",
            data: saved_data
          }
        }else{
          data.response = {
            status: 0,
            result: STATUS.ERROR,
            mesage: "Data not found."
          }
        }

        return data;
    } catch (e) {
        data.response = {
          status: 0,
          result: STATUS.ERROR,
          message: "Something is wrong",
          error: e
        }
        return data;
    }
}

const activity_analytics_view_Detail = async (data, authData) => {
    try {
        const decoded = Auth.decodeToken(authData);
        if (decoded ?. is_active == false || decoded ?. deleted_date !== null) {
            data.response = {
                status: 0,
                message: "You are not valid user!"
            }
            return data;
        }

        delete data['action'];
        delete data['command'];

        var final_data;
        var user_community_data;
        var activityData = await Models.activity.findOne({activity_id: data.activity_id, type: data.activity_type}).exec()

        var community_record = await Models.community.findOne({community_id: activityData.community_id}).exec()

        if (community_record?.community_type == "Paid") {
            user_community_data = await Models.user_purchase_community.find({community_id: activityData.community_id}).exec()
        }else{
            user_community_data = await Models.user.find({usertype_in: false, deleted_date: null}).exec()
        }

        if (data.activity_type == "Challenge") {
            var challenge_score = await Models.activity_score_user.find({activity_id: data.activity_id, activity_type: data.activity_type}).exec()
            var total_user_not_attempt = user_community_data.length - challenge_score.length

            final_data = {
              total_user_in_community: user_community_data.length,
              total_user_not_attempt: total_user_not_attempt,
              total_user_attempt: challenge_score.length
            }
        }

        if (data.activity_type == "Poll") {
            var poll_score = await Models.activity_score_user.find({activity_id: data.activity_id, activity_type: data.activity_type}).exec()
            var total_user_not_attempt = user_community_data.length - poll_score.length

            var option_1_per = 0
            var option_2_per = 0

            var poll_data = await Models.activity_poll.findOne({activity_id: activityData.activity_id}).exec()
            var option_1 = await Models.activity_score_user.find({activity_id: data.activity_id, activity_type: data.activity_type, poll_answer: poll_data.option1}).exec()
            var option_2 = await Models.activity_score_user.find({activity_id: data.activity_id, activity_type: data.activity_type, poll_answer: poll_data.option2}).exec()

            if (option_1.length !== 0) {
                option_1_per = (option_1.length/user_community_data.length)*100
            }

            if (option_2.length !== 0) {
                option_2_per = (option_2.length/user_community_data.length)*100
            }

            var total_user_not_attempt_per = (total_user_not_attempt/user_community_data.length)*100
            var total_user_attemp_per = (poll_score.length/user_community_data.length)*100

            final_data = {
              total_user_in_community: user_community_data.length,
              total_user_not_attempt: total_user_not_attempt,
              total_user_attemp: poll_score.length,
              total_user_not_attempt_per: total_user_not_attempt_per,
              total_user_attemp_per: total_user_attemp_per,
              option_1_user_count: option_1.length,
              option_2_user_count: option_2.length,
              option_1_per: option_1_per,
              option_2_per: option_2_per
            }
        }

        if (data.activity_type == "Quest") {
            var quest_score = await Models.activity_score_user.find({activity_id: data.activity_id, activity_type: data.activity_type}).exec()
            var total_user_not_attempt = user_community_data.length - quest_score.length
            final_data = {
              total_user_in_community: user_community_data.length,
              total_user_not_attempt: total_user_not_attempt,
              total_user_attemp: quest_score.length
            }
        }

        if (final_data !== null) {
          data.response = {
            status: 200,
            result: STATUS.SUCCESS,
            mesage: "Successfully fetched",
            data: final_data
          }
        }else{
          data.response = {
            status: 0,
            result: STATUS.ERROR,
            mesage: "Data not found."
          }
        }

        return data;
    } catch (e) {
        data.response = {
          status: 0,
          result: STATUS.ERROR,
          message: "Something is wrong",
          error: e
        }
        return data;
    }
}

const activity_analytics_export_Detail = async (data, authData) => {
    try {
        const decoded = Auth.decodeToken(authData);
        if (decoded ?. is_active == false || decoded ?. deleted_date !== null) {
            data.response = {
                status: 0,
                message: "You are not valid user!"
            }
            return data;
        }

        delete data['action'];
        delete data['command'];

        var final_data;
        var user_community_data;
        var activityData = await Models.activity.findOne({activity_id: data.activity_id, type: data.activity_type}).exec()

        var community_record = await Models.community.findOne({community_id: activityData.community_id}).exec()

        if (community_record?.community_type == "Paid") {
            var total_user_community_data = await Models.user_purchase_community.aggregate([
              {
                '$match': {
                  'community_id': activityData.community_id,
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
              }
            ]);

            user_community_data = await total_user_community_data.map(item => item.user_data)
        }else{
            user_community_data = await Models.user.find({usertype_in: false, deleted_date: null}).exec()
        }

        if (data.activity_type == "Challenge") {
            
            var total_user_attempt = await Models.activity_score_user.aggregate([
              {
                '$match': {
                  'activity_id': data.activity_id, 
                  'activity_type': data.activity_type
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
                '$group': {
                  '_id': '$activity_id', 
                  'data': {
                    '$push': '$$ROOT'
                  }, 
                  'user_ids': {
                    '$addToSet': '$user_id'
                  }
                }
              }
            ]);

            var total_user_not_attempt = await user_community_data.filter(item => total_user_attempt[0].user_ids.includes(item.user_id) == false)

            var attend_user_csv = ""
            attend_user_csv +=  "User attend data " + "\n" + "\n";
            attend_user_csv +=  "name, " + "email, " + "mobile_no" + "\n" ;
            total_user_attempt[0].data.forEach((item) => {
                attend_user_csv += item.user_data.first_name + ", " + item.user_data.email + ", " + item.user_data.mobile_no + "\n";
            });

            var not_attend_user_csv = ""
            not_attend_user_csv +=  "User not attend data " + "\n" + "\n";
            not_attend_user_csv +=  "name, " + "email, " + "mobile_no" + "\n" ;
            total_user_not_attempt.forEach((item) => {
                not_attend_user_csv += item.first_name + ", " + item.email + ", " + item.mobile_no + "\n";
            });

            console.log("  attend_user_csv    -------->  ", attend_user_csv)
            console.log("  not_attend_user_csv    -------->  ", not_attend_user_csv)
        }

        if (data.activity_type == "Poll") {

            var total_user_attempt = await Models.activity_score_user.aggregate([
              {
                '$match': {
                  'activity_id': data.activity_id, 
                  'activity_type': data.activity_type
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
                '$group': {
                  '_id': '$activity_id', 
                  'data': {
                    '$push': '$$ROOT'
                  }, 
                  'user_ids': {
                    '$addToSet': '$user_id'
                  }
                }
              }
            ]);

            var total_user_not_attempt = await user_community_data.filter(item => total_user_attempt[0].user_ids.includes(item.user_id) == false)

            var attend_user_csv = ""
            attend_user_csv +=  "User attend data " + "\n" + "\n";
            attend_user_csv +=  "name, " + "email, " + "mobile_no" + "\n" ;
            total_user_attempt[0].data.forEach((item) => {
                attend_user_csv += item.user_data.first_name + ", " + item.user_data.email + ", " + item.user_data.mobile_no + "\n";
            });

            var not_attend_user_csv = ""
            not_attend_user_csv +=  "User not attend data " + "\n" + "\n";
            not_attend_user_csv +=  "name, " + "email, " + "mobile_no" + "\n" ;
            total_user_not_attempt.forEach((item) => {
                not_attend_user_csv += item.first_name + ", " + item.email + ", " + item.mobile_no + "\n";
            });
            console.log("  attend_user_csv  poll  -------->  ", attend_user_csv)
            console.log("  not_attend_user_csv    -------->  ", not_attend_user_csv)
        }

        if (data.activity_type == "Quest") {
            var total_user_attempt = await Models.activity_score_user.aggregate([
              {
                '$match': {
                  'activity_id': data.activity_id, 
                  'activity_type': data.activity_type
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
                '$group': {
                  '_id': '$activity_id', 
                  'data': {
                    '$push': '$$ROOT'
                  }, 
                  'user_ids': {
                    '$addToSet': '$user_id'
                  }
                }
              }
            ]);

            var total_user_not_attempt = await user_community_data.filter(item => total_user_attempt[0].user_ids.includes(item.user_id) == false)

            var attend_user_csv = ""
            attend_user_csv +=  "User attend data " + "\n" + "\n";
            attend_user_csv +=  "name, " + "email, " + "mobile_no" + "\n" ;
            total_user_attempt[0].data.forEach((item) => {
                attend_user_csv += item.user_data.first_name + ", " + item.user_data.email + ", " + item.user_data.mobile_no + "\n";
            });

            var not_attend_user_csv = ""
            not_attend_user_csv +=  "User not attend data " + "\n" + "\n";
            not_attend_user_csv +=  "name, " + "email, " + "mobile_no" + "\n" ;
            total_user_not_attempt.forEach((item) => {
                not_attend_user_csv += item.first_name + ", " + item.email + ", " + item.mobile_no + "\n";
            });
            console.log("  attend_user_csv  quest  -------->  ", attend_user_csv)
            console.log("  not_attend_user_csv    -------->  ", not_attend_user_csv)
        }

        if (final_data !== null) {
          data.response = {
            status: 200,
            result: STATUS.SUCCESS,
            mesage: "Successfully fetched",
            data: {
              attend_user_csv: attend_user_csv,
              not_attend_user_csv: not_attend_user_csv
            }
          }
        }else{
          data.response = {
            status: 0,
            result: STATUS.ERROR,
            mesage: "Data not found."
          }
        }

        return data;
    } catch (error) {
      console.log("error      ----------->  ", error)
        data.response = {
          status: 0,
          result: STATUS.ERROR,
          message: "Something is wrong",
          error: e
        }
        return data;
    }
}

module.exports = {
    create,
    saveactivity_details,
    listActivityType,
    activityTypeDetails,
    activityList,
    activityDetails,
    activityViewMore,
    activitiesPerCommunity,
    add_activity_badge,
    add_activity_score,
    activity_analytics_view_Detail,
    activity_analytics_export_Detail
};
