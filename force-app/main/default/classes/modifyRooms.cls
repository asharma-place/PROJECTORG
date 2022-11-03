public class modifyRooms {
    public static void modify(String roomType){
		List<Room__c> roomList = [SELECT id,Name,Description__c from room__C where roomType__r.Name = :roomType];
        for(Room__c r : roomList ){
            r.Description__c = 'This is a ' +roomType+ ' room';
        }
		UPDATE roomList;        
    }
    
    @AuraEnabled
    public static Integer getSize(){
        pageSizeList__c myPage = pageSizeList__c.getInstance('OrgDefault');
        Integer size = Integer.valueOf(myPage.size__c);
        return size;
    }
    
    @AuraEnabled
    public static Integer getPageSize(){
        Map<String, pageSizeList__c> pageMap = pageSizeList__c.getAll();
        System.debug('pageMap: '+pageMap.keySet() );
        List <String> pageList = new List <String>();
        pageList.addAll(pageMap.keySet());
        if(pageList.size()>0){
            String inst = pageList[0];
            pageSizeList__c myPage = pageSizeList__c.getInstance(inst);
            Integer size = Integer.valueOf(myPage.size__c);
            System.debug('size: '+size);
            if(size>0 && size<7){
                return size;
            }
            else{
             	return 3;   
            }
        }
        else{
            return 3;
        }
    }
}