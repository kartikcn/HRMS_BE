const DEFAULT_USER_IMAGE = "";
const ROLES = {
    SUPER_ADMIN: 'super-admin',
    ADMIN: 'admin',
    STUDENT:'student',
    FATHER: 'father',
    MOTHER: 'mother',
    TEACHER: 'teacher'
}
const USER_STATUS = {
    IN_ACTIVE: 0,
    ACTIVE: 1,
    NEW: 3,
    INVITED: 4,
    ON_HOLD: 6,
    DNC:9,
    PENDING : 10,
    EXPIRED : 11,
    PROCESS_ID : 5,
    PAY_PROCESS_ID : 4
};

const STATUS = {
    IN_ACTIVE: 0,
    ACTIVE: 1,
    SUCCESS:'success',
    ERROR:'error'
}

const ACTIVATED_BY = {
    DEFAULT:'',
    ADMIN:'admin',
    USER:'user'
}

const RESPONSE_STATUS = {
    SUCCESS:'success',
    ERROR:'error'
}

module.exports = {
    DEFAULT_USER_IMAGE,
    ROLES,
    USER_STATUS,
    ACTIVATED_BY,
    STATUS,
    RESPONSE_STATUS,
}
