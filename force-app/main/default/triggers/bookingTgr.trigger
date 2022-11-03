trigger bookingTgr on Booking__c (before insert,before update) {
    Switch on Trigger.operationType{
        when BEFORE_INSERT{bookingTgrController.beforeInsert(trigger.new);}
        when BEFORE_UPDATE{bookingTgrController.beforeUpdate(trigger.new,trigger.oldMap);}
    }
}