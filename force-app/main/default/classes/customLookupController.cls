public class customLookupController {
    @AuraEnabled(cacheable=true)  
   public static List<sobject> findRecords(String searchKey, String objectName) {
     if(searchKey=='' || searchKey==null){
         return Database.query('SELECT Id, Name FROM ' +objectName);  
     }
     string searchText = '\'' + String.escapeSingleQuotes(searchKey) + '%\'';  
     return Database.query('SELECT Id, Name FROM ' +objectName+ ' WHERE Name LIKE '+searchText+' LIMIT 6');  
   } 
}