module.exports = function (current_time,session_start_time,session_late_time,session_absent_time) {
    if(current_time<session_late_time){
        return "on-time";
    } else if (current_time<session_absent_time && current_time>= session_late_time){
        return "late";
    } else{
        return "absent";
    }
}