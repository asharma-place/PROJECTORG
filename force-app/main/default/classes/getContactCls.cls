public class getContactCls {
    @AuraEnabled(Cacheable=true)
    public static List<Contact> searchContacts(String keyword){
        if(keyword == '' || keyword == null){
            List<Contact> allConList = [Select Id,Name FROM Contact];
            System.debug('allConList: '+allConList);
            return allConList;
        }
        else{
            string key = keyword + '%';
            List<Contact> conList = [Select Id,Name FROM Contact WHERE Name LIKE :key];
            system.debug('list: '+conList);
            try {
                return conList;
            } catch (Exception e) {
                throw new AuraHandledException(e.getMessage());
            }   
        }
    }
}