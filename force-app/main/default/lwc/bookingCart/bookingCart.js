import { LightningElement,api,track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import createBookings from '@salesforce/apex/hotelMngController.createBookings';
import { NavigationMixin } from 'lightning/navigation';
import LightningConfirm from 'lightning/confirm';

var plcHolder;

const actions = [
    { label: 'Add', name: 'add' },
    { label: 'Delete', name: 'delete' },
];

const columns = [
    {label:'Room No.',fieldName:'room'},
    {label:'Category',fieldName:'roomType'},
    {
        label: 'Guests', type: 'picklistColumn',fieldName: 'noOfPersons',
        typeAttributes: {
            options: [
                { value: 1, label: 1 },
                { value: 2, label: 2 },
                { value: 3, label: 3 },
                { value: 4, label: 4 }
            ],
            value: { fieldName: 'noOfPersons' },
            context: { fieldName: 'roomId' }
        }
    },
    {label:'Price Per Person',fieldName:'price'},
    {label:'Booking Amount',fieldName:'bookingAmount'},
    {label:'Check In Date',fieldName:'startDate',type:'date-local',editable: true},
    {label:'Check Out Date',fieldName:'endDate',type:'date-local',editable: true},
    {label:'In Final Cart',fieldName:'inFinalCart',type:'boolean'},
    {
        type: 'action',
        typeAttributes: { rowActions: actions },
    },
];

export default class BookingCart extends NavigationMixin(LightningElement) {
    @api cartList=[];
    @track finalCartList = [];
    @api customer;
    @api cartGuests = 0;
    @api cartTotal = 0;
    @track orderId = '';
    @track cartMap;
    @track finalCartMap;
    @track finalCartAmount=0;
    @track finalGuests=0;
    draftValues;
    @track draftCellMap = new Map();

    connectedCallback(){
        this.columns = columns;
        this.finalGuests = this.cartGuests;
        this.finalCartAmount = this.cartTotal;
        this.getCarMap();
    }

    async handleGoBack(){
        const result = await LightningConfirm.open({
            message: 'Your changes in cart will not be saved !',
            theme: 'warning', // more would be success, info, warning
            //variant: 'headerless',
            label: 'Are you sure?',
            // setting theme would have no effect
        });
        console.log(result);
        if(result){
            const custEvent = new CustomEvent(
                'gohome', {
                    detail: {showCart: false}
                }); 
            this.dispatchEvent(custEvent);
        }
        // const custEvent = new CustomEvent(
        //     'gohome', {
        //         detail: {showCart: false}
        //     }); 
        // this.dispatchEvent(custEvent);
    }

    handlePicklistChange(event){
        console.log('event.detail.data.value:',parseInt(event.detail.data.value));
        console.log('event.detail.data.context:',event.detail.data.context);
        let id = event.detail.data.context;
        let guests = parseInt(event.detail.data.value);
        console.log('id:',id);
        console.log('guests:',guests);
        let rowObj = this.cartMap.get(id);
        console.log('rowObj',rowObj);
        let amount = this.calculateBookingAmount(guests,rowObj.startDate,rowObj.endDate,rowObj.price);
        this.cartMap.set(id,{bookingAmount:amount,endDate:rowObj.endDate,noOfPersons:guests,price:rowObj.price,room:rowObj.room,roomId:rowObj.roomId,roomType:rowObj.roomType,startDate:rowObj.startDate,inFinalCart:false});
        console.log('this.cartMap',this.cartMap);
        this.cartList = Array.from(this.cartMap.values())
    }

    handleRowAction(event){
        const actionName = event.detail.action.name;
        let row = event.detail.row;
        console.log('actionName',actionName);
        console.log('row',JSON.parse(JSON.stringify(row)));
        switch (actionName) {
            case 'add':
                row.inFinalCart = true;
                console.log('in Add');
                this.addToFinal(row);
                break;
            case 'delete':
                console.log('In delete');
                this.deleteFromCart(row);
                break;
            default:
        }
    }

    deleteFromCart(row){
        console.log('In delete',row);
        if(this.cartMap.has(row.roomId)){

            this.cartMap.delete(row.roomId);
            this.cartList = Array.from(this.cartMap.values());
        }
        if(this.finalCartMap.has(row.roomId)){
            this.finalCartMap.delete(row.roomId);
        }
        let finalAmount = 0;
        let guests = 0;
        Array.from(this.finalCartMap.values()).forEach(r => {
            guests = guests + r.noOfPersons;
            finalAmount = finalAmount + r.bookingAmount;
        });
        this.finalGuests = guests;
        this.finalCartAmount = finalAmount;
    }

    async handleConfirmOrder(){
        const result = await LightningConfirm.open({
            message: 'For '+this.finalGuests.toString()+' Guests with amount of $'+this.finalCartAmount.toString(),
            theme: 'success', // more would be success, info, warning
            //variant: 'headerless',
            label: 'Confirm Order ?',
            // setting theme would have no effect
        });
        if(result){
            this.finalCartList =  Array.from(this.finalCartMap.values());
            console.log('this.finalCartList',JSON.parse(JSON.stringify(this.finalCartList)));
            if(this.customer.Id != null && this.finalCartList.length>0){
                console.log('in iFFFFFF');
                createBookings({conId:this.customer.Id,bookingList:this.finalCartList}).then(data =>{
                    console.log('Order No. ',data.Name);
                    console.log('Order Id. ',data.Id);
                    this.orderId = data.Id;
                    const toastEvent = new ShowToastEvent({
                        title:'Success!',
                        message:'Your Booking is generated successfully with: '+data.Name,
                        variant:'success'
                    });
                    this.dispatchEvent(toastEvent);
                //   if(this.orderId != ''){
                    this.navigateToOrder();
                //   }
                }).catch(error =>{
                console.log('Error: '+error.body.message);
                });        
            }
        }
    }
    

    navigateToOrder() {
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: this.orderId,
                objectApiName: 'Custom_Order__c',
                actionName: 'view'
            }
        });
    }

    handleCellChange(event){
        // console.log('event.detail',JSON.parse(JSON.stringify(event.detail.draftValues[0])));
        let cell = JSON.parse(JSON.stringify(event.detail.draftValues[0]));
        console.log('cell',cell);
        const today = new Date(new Date().setHours(0, 0, 0,0)).toLocaleDateString('fr-CA');

        if(cell?.startDate != null){
            console.log('Startdate change');
            let checkInDate = new Date(cell?.startDate).toLocaleDateString('fr-CA');
            console.log('checkInDate ',checkInDate);
            if( checkInDate< today){ 
                console.log('Error ceheckin date less than today');
                // const toastEvent = new ShowToastEvent({
                //     title:'Select Another Date',
                //     message:'Cannot select a date before today',
                //     variant:'Warning'
                //     });
                // this.dispatchEvent(toastEvent);
            }
            else{
                console.log('this.draftCellMap.has(cell.roomId) : ',this.draftCellMap.has(cell.roomId));
                console.log('this.draftCellMap.get(cell.roomId).endDate != null :',this.draftCellMap.get(cell.roomId)?.endDate != null);
                if(this.draftCellMap.has(cell.roomId)){
                    if((this.draftCellMap.get(cell.roomId)?.endDate != null) && checkInDate >= new Date(this.draftCellMap.get(cell.roomId)?.endDate).toLocaleDateString('fr-CA')){
                        console.log('Error ceheckin date greater than equal to draft endDate');
                    }
                    else if(this.draftCellMap.get(cell.roomId).endDate != null){
                        this.draftCellMap.set(cell.roomId,{startDate:cell.startDate,endDate:this.draftCellMap.get(cell.roomId).endDate});
                    }
                    else{
                        this.draftCellMap.set(cell.roomId,{startDate:cell.startDate,endDate:this.cartMap.get(cell.roomId).endDate});
                    }
                }
                else{
                    if(checkInDate >= new Date(this.cartMap.get(cell.roomId)?.endDate).toLocaleDateString('fr-CA')){
                        console.log('Error ceheckin date greater than equal to orignal endDate');
                    }
                    else{
                        this.draftCellMap.set(cell.roomId,{startDate:cell.startDate,endDate:this.cartMap.get(cell.roomId).endDate});
                    }
                }
            }
        }

        else if(cell?.endDate != null){
            console.log('End date change');
            let checkOutDate = new Date(cell.endDate).toLocaleDateString('fr-CA');            
            if(this.draftCellMap.has(cell.roomId)){
                if((this.draftCellMap.get(cell.roomId)?.startDate != null) && checkOutDate <= new Date(this.draftCellMap.get(cell.roomId)?.startDate).toLocaleDateString('fr-CA')){
                    console.log('Error ceheckout date less than equal to draft startDate');
                }
                else if(this.draftCellMap.get(cell.roomId).startDate != null){
                    this.draftCellMap.set(cell.roomId,{startDate:this.draftCellMap.get(cell.roomId).startDate,endDate:cell.endDate});
                }
                else{
                    this.draftCellMap.set(cell.roomId,{startDate:this.cartMap.get(cell.roomId).startDate,endDate:cell.endDate});
                }
            }
            else{
                if(checkOutDate <= new Date(this.cartMap.get(cell.roomId)?.startDate).toLocaleDateString('fr-CA')){
                    console.log('Error ceheckOut date less than equal to orignal startdate');
                }
                else{
                    this.draftCellMap.set(cell.roomId,{startDate:this.cartMap.get(cell.roomId).startDate,endDate:cell.endDate});
                }
            }
        }

        // this.draftCellMap.set(cell.roomId,cell);
        console.log('this.draftCellMap: ',(this.draftCellMap));
    }

    handleSave(event){
        console.log('event.detail.draftValues',event.detail.draftValues);
        const records = event.detail.draftValues.slice().map((draftValue) => {
            const fields = Object.assign({}, draftValue);
            return { fields };
        });
        this.draftValues = [];
        console.log('records',records);
        records.forEach(r => {
            console.log('r:',r);
            let row = this.cartMap.get(r.fields.roomId);
            console.log('row',row);
            let sDate = row.startDate;
            let eDate = row.endDate;
            console.log('sDate',sDate);
            console.log('eDate',eDate);
            // let amount = row.bookingAmount;
            if(r.fields.startDate){
                console.log('in STArt IF r:',r);
                console.log('in STArt IF r:',r.fields.startDate);
                sDate = r.fields.startDate;
            }
            if(r.fields.endDate){
                console.log('in end IF r:',r);
                console.log('in End IF r:',r.fields.endDate);
                eDate = r.fields.endDate;
            }
            let amount = this.calculateBookingAmount(row.noOfPersons,sDate,eDate,row.price);
            this.cartMap.set(row.roomId,{bookingAmount:amount,endDate:eDate,noOfPersons:row.noOfPersons,price:row.price,room:row.room,roomId:row.roomId,roomType:row.roomType,startDate:sDate,inFinalCart:false});
        });
        this.cartList = Array.from(this.cartMap.values());
        this.draftCellMap.clear();
    }

    handleCancel(){
        this.draftCellMap.clear();
    }

    getCarMap(){
        this.cartMap = new Map();
        this.finalCartMap = new Map();
        this.cartList.forEach(i => {
            this.cartMap.set(i.roomId,i);
            this.finalCartMap.set(i.roomId,i);           
        });
    }

    calculateBookingAmount(count,sDate,eDate,price){
        console.log('in calculateBookingAmount =');
        let days = this.dateDiffInDays(sDate,eDate);
        console.log('days=',days);
        return (count*price*days); 
    }

    dateDiffInDays(a, b) {
        console.log('in dateDiffInDays');
        console.log('a',a);
        var date1 = new Date(a); 
        var date2 = new Date(b); 
        return parseInt((date2 - date1) / (1000 * 60 * 60 * 24));
      }

      addToFinal(row){
        console.log('in add to final');
        this.finalCartMap.set(row.roomId,row);
        console.log('this.finalCartMap',JSON.parse(JSON.stringify(this.finalCartMap)));
        let finalAmount = 0;
        let guests = 0;
        Array.from(this.finalCartMap.values()).forEach(r => {
            guests = guests + r.noOfPersons;
            finalAmount = finalAmount + r.bookingAmount;
        });
        this.finalGuests = guests;
        this.finalCartAmount = finalAmount;
        this.cartMap.set(row.roomId,row);
        this.cartList = Array.from(this.cartMap.values());
        console.log('Array.from(this.finalCartMap.values())',Array.from(this.finalCartMap.values()));
      }

}