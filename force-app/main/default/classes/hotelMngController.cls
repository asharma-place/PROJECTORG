public class hotelMngController {
    @AuraEnabled
    public static List<optionObj> getRoomTypes(){
        List<optionObj> rTList = new List<optionObj>();
        optionObj op1 = new optionObj('All','all');
        rTList.add(op1);
        for(RoomType__c rt : [SELECT Name, (select name from rooms__r where isActive__c = true) FROM RoomType__c WHERE IsActive__c=true]){
            if(rt.rooms__r.size()>0){
                optionObj op = new optionObj(rt.Name,(rt.Name).toLowercase());
            	rTList.add(op);
            }
        }
        system.debug('list : '+rTList);
        try {
            return rTList;
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
    
    public class optionObj{
        @AuraEnabled public String label;
        @AuraEnabled public String value;
        public optionObj(String lbl,String val){
            label = lbl;
            value = val;
        }
    }
    /*
    @AuraEnabled(Cacheable= true)
    public static List<roomWrapper> getRooms(String roomType,Integer v_Offset, Integer v_pagesize,String searchKeyword){
        List<roomWrapper> rwList = new List<roomWrapper>();
        String rt = roomType;
        Integer v_Off = v_Offset;
        Integer v_Ps = v_pagesize;
        String sKey = searchKeyword;
        String nKey = '%'+sKey+'%';
        //rList = [SELECT Id,Name,Description__c,RoomType__r.PricePerPerson__c  FROM Room__c WHERE RoomType__r.Name = :rt];
        Set<Id> roomIdSet = new Set<Id>();
        for(Room__c r : [SELECT Id,Description__c,RoomType__r.Name FROM Room__c WHERE RoomType__r.Name = :rt AND isActive__c=true]){
            if(r.Description__c!=null && r.Description__c?.containsIgnoreCase(sKey)){
                roomIdSet?.add(r?.Id);
            }
        }
        
        Integer totalCount = [SELECT count() FROM Room__c WHERE RoomType__r.Name = :rt AND isActive__c=true AND (Id in :roomIdSet OR Name LIKE :nKey)];
        
        for(Room__c r : [SELECT Id,Name,Description__c,RoomType__r.PricePerPerson__c,RoomType__r.Name  FROM Room__c WHERE RoomType__r.Name = :rt AND isActive__c=true AND (Id in :roomIdSet OR Name LIKE :nKey)	 limit :v_Ps OFFSET :v_Off]){
            roomWrapper rw = new roomWrapper(r.Id,r.Name,r.Description__c,r.RoomType__r.PricePerPerson__c,r.RoomType__r.Name,totalCount);
            rwList.add(rw);
        }
        system.debug('rList: '+rwList);
        try {
             return rwList;
        } 
        catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
    */
    
    //getRoomsbackup
    /* 
		public static List<roomWrapper> getRooms(String roomType,Integer v_Offset, Integer v_pagesize){
        List<roomWrapper> rwList = new List<roomWrapper>();
        String rt = roomType;
        Integer v_Off = v_Offset;
        Integer v_Ps = v_pagesize;
        for(Room__c r : [SELECT Id,Name,Description__c,RoomType__r.PricePerPerson__c,RoomType__r.Name  FROM Room__c WHERE RoomType__r.Name = :rt AND isActive__c=true limit :v_Ps OFFSET :v_Off]){
            roomWrapper rw = new roomWrapper(r.Id,r.Name,r.Description__c,r.RoomType__r.PricePerPerson__c,r.RoomType__r.Name);
            rwList.add(rw);
        }
        system.debug('rList: '+rwList);
        try {
             return rwList;
        } 
        catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    	}
	*/
    
    @AuraEnabled(Cacheable= true)
    public static roomListWrapper getRooms(String roomType,Integer v_Offset, Integer v_pagesize,String searchKeyword,String radio){
        List<roomWrapper> rwList = new List<roomWrapper>();
        String rt = roomType;
        Integer v_Off = v_Offset;
        Integer v_Ps = v_pagesize;
        String sKey = searchKeyword;
        String nKey = '%'+sKey+'%';
        //rList = [SELECT Id,Name,Description__c,RoomType__r.PricePerPerson__c  FROM Room__c WHERE RoomType__r.Name = :rt];
        Set<Id> roomIdSet = new Set<Id>();
        for(Room__c r : [SELECT Id,Description__c,RoomType__r.Name FROM Room__c WHERE RoomType__r.Name = :rt AND isActive__c=true]){
            if(r.Description__c!=null && r.Description__c?.containsIgnoreCase(sKey)){
                roomIdSet?.add(r?.Id);
            }
        }
        
        //Integer totalCount = [SELECT count() FROM Room__c WHERE isActive__c=true AND (Id in :roomIdSet OR Name LIKE :nKey)];
        
        List<Room__c> roomCountList = [SELECT Id,RoomType__r.Name FROM Room__c WHERE isActive__c=true AND (Id in :roomIdSet OR Name LIKE :nKey)];
        Integer totalCount = 0;
        Integer dc=0;
        Integer pc=0;
        Integer lc=0;
        for(Room__c room: roomCountList){
            if(room.RoomType__r.Name=='deluxe'){
                dc = dc +1;
            }
            else if(room.RoomType__r.Name=='premium'){
                pc = pc +1;
            }
            else if(room.RoomType__r.Name=='luxury'){
				lc = lc +1;                
            }
        }
        
        if(radio == 'all'){
         	if(dc>totalCount){
            	totalCount = dc;
        	}
        	if(pc>totalCount){
            	totalCount = pc;
        	}
        	if(lc>totalCount){
            	totalCount = lc;
        	}	   
        }
        else{
            if(radio == 'deluxe'){
                totalCount = dc;
            }
            else if(radio == 'premium'){
                totalCount = pc;
            }
            else if(radio == 'luxury'){
                totalCount = lc;
            }
        }
        
        for(Room__c r : [SELECT Id,Name,Description__c,RoomType__r.PricePerPerson__c,RoomType__r.Name,RoomType__r.Room_Image__c  FROM Room__c WHERE RoomType__r.Name = :rt AND isActive__c=true AND (Id in :roomIdSet OR Name LIKE :nKey)	 limit :v_Ps OFFSET :v_Off]){
            roomWrapper rw = new roomWrapper(r.Id,r.Name,r.Description__c,r.RoomType__r.PricePerPerson__c,r.RoomType__r.Name,r.RoomType__r.Room_Image__c);
            rwList.add(rw);
        }
        roomListWrapper rlwList = new roomListWrapper(rwList,totalCount);
        system.debug('rList: '+rwList);
        try {
             return rlwList;
        } 
        catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
    
    public class roomListWrapper{
        @AuraEnabled public List<roomWrapper> roomList = new List<roomWrapper>();
        @AuraEnabled public Integer TotalRecords;
        public roomListWrapper(List<roomWrapper> rmList,Integer Total){
            roomList = rmList;
            TotalRecords = Total;
        }
    }
    
    public class roomWrapper{
        @AuraEnabled public String Id; 
        @AuraEnabled public String Name;
        @AuraEnabled public String Description;
        @AuraEnabled public Decimal Price;
        @AuraEnabled public String RoomType;
        @AuraEnabled public String Image;
        //@AuraEnabled public Integer TotalRecords;
        public roomWrapper(String Ids,String Nam,String Descripton,Decimal Prices,String RoomTyp,String Img){
            Id = Ids;
            Name = Nam;
            Description = Descripton;
            Price = Prices;
            RoomType = RoomTyp;
            Image = Img;
            //TotalRecords = totalCount;
        }
    }
    
    public static void testSoql(){
        String fieldValue = 'ro';
        String fieldName = 'Description__c';
        String query =  'FIND {"'+ fieldValue + '"}  RETURNING ' +
            ' Room__c (id,Name, ' + fieldName + ' ) LIMIT 2000';
        List<List<SObject>> searchList = Search.query(query);//Return List of SObject list
        system.debug('Search result: ' + searchList[0]);//Get search result
        if(searchList[0].size() > 0) {
            //You can cast your result and return other fields if needed
            List<Room__c > objSearchResultsList = (List<Room__c >) searchList[0];
            system.debug(fieldName +' with "' + objSearchResultsList[0].get(fieldName) + '" found. ');
        }
    }
    
    @AuraEnabled
       public static Integer TotalRecords(String roomType){
           String rt = roomType;
           return [Select count() FROM Room__c WHERE RoomType__r.Name = :rt AND isActive__c=true];
       }
    
    @AuraEnabled(cacheable=true)
    public static Integer getNext(Integer v_Offset, Integer v_pagesize){
        v_Offset += v_pagesize;
        return v_Offset;
    }
    
    @AuraEnabled(cacheable=true)
    public static Integer getPrevious(Integer v_Offset, Integer v_pagesize){
        v_Offset -= v_pagesize;
        return v_Offset;
    }
    
    public class bookingWrapper{
        @AuraEnabled public Id roomId;
        @AuraEnabled public String room;
        @AuraEnabled public String roomType;
        @AuraEnabled public Decimal price;
        @AuraEnabled public Integer noOfPersons;
        @AuraEnabled public Date startDate;
        @AuraEnabled public Date endDate;
        public bookingWrapper(){
            Id roomId;
            Integer noOfPersons;
            Date startDate;
            Date endDate;
        }
    }
    
    @AuraEnabled
    public static Custom_Order__c createBookings(Id conId,List<Object> bookingList){
        list<bookingWrapper> myData = (list<bookingWrapper>) JSON.deserialize(JSON.serialize(bookingList), list<bookingWrapper>.class);
        system.debug('conId: '+conId);
        system.debug('bookingList: '+myData);

        if(conId ==null){
            throw new AuraHandledException('Contact is Invalid');
        }
        else if(bookingList.size()<1){
            throw new AuraHandledException('Booking Cart is Invalid');
        }
        else{
            Custom_Order__c odr = new Custom_Order__c();
            odr.Order_Date__c = (system.now()).date();
            odr.Booking_Customer__c = conId;
            try{
                INSERT odr;
                if(odr.Id != null){
                    Set<Id> roomIdSet = new Set<Id>();
                    List<Booking__c> bList =new List<Booking__c>();
                    for(bookingWrapper b: myData){
                        Booking__c bKing = new Booking__c();
                        //bookingWrapper bw = new bookingWrapper();
                        bKing.Booking_Start_Date__c = b.startDate;
                        bKing.Booking_End_Date__c = b.endDate;
                        bKing.Room__c = b.roomId;
                        bKing.NumberOfPerson__c =b.noOfPersons;
                        bKing.Custom_Order__c = odr.Id;
                        roomIdSet.add(b.roomId);
                        bList.add(bKing);
                    }
                    if(bList.size()>0){
                        List<Room__c> bookedRoomList = [SELECT Id,isActive__c FROM Room__c WHERE Id in :roomIdSet];
                        for(Room__c br: bookedRoomList){
                            br.isActive__c = false;
                        }
                        Custom_Order__c currOdr = [SELECT Id,Name from Custom_Order__c WHERE Id =: odr.Id];
                        system.debug('OrderNo.'+currOdr.Name);
                        UPDATE bookedRoomList;
                        INSERT bList;
                        return currOdr;
                    }
                }
            }
            catch(Exception e){
                throw new AuraHandledException(e.getMessage());
            }
        }
        return null;
    }
    
}