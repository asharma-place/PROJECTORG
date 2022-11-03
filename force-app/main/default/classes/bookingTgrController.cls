public class bookingTgrController {
    
    public static void beforeInsert(List<Booking__c> newList){
        for(Booking__c bk : newList){
            bk.Copy_Booking_Amount__c = bk.Booking_Amount__c;
        }
    }
    
    public static void beforeUpdate(List<Booking__c> newList, Map<Id,Booking__c> oldMap){
        for(Booking__c bk : newList){
            if((bk.Copy_Booking_Amount__c != bk.Booking_Amount__c) || (bk.Booking_Amount__c != oldMap.get(bk.Id).Booking_Amount__c) ){
                bk.Copy_Booking_Amount__c = bk.Booking_Amount__c;
            }
        }
    }
}