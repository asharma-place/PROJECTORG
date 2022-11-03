import { LightningElement,track,wire } from 'lwc';
import searchContacts from '@salesforce/apex/getContactCls.searchContacts';
import getRoomTypes from '@salesforce/apex/hotelMngController.getRoomTypes';
import createBookings from '@salesforce/apex/hotelMngController.createBookings';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

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
    {
        type: 'action',
        typeAttributes: { rowActions: actions },
    },
];

export default class HotelManagement extends LightningElement {
    @track sConValue='';
    @track contacts;
    @track error;
    @track rtList=[];
    @track rtListFixed=[];
    @track rtListTemp=[];
    @track showRadioFliter=false;
    @track value = '';
    @track sRoomValue = '';
    @track sRoomKeyword = '';
    @track bookingList = [];
    @track totalPrice = 0;
    @track Persons = 0;
    @track showTotalPrice = 0;
    @track showTotal=false;
    @track showSpinner=true;
    @track showCart = false;
    @track disableItems=[];
    @track selectedContactName;
    columns;
    hide= false;

    // @wire(searchContacts,{keyword:'$sConValue'})
    // wiredContacts({data, error}){
    //     if(data){
    //         this.contacts = data;
    //         this.error = undefined;
    //     }
    //     else if (error) {
    //         this.error = error;
    //         this.contacts = undefined;
    //     }
    // }

    handleRowAction(){}

    handlePicklistChange(event) {
        event.stopPropagation();
        let dataRecieved = event.detail.data;
        let updatedItem = { Id: dataRecieved.context, Type: dataRecieved.value };
        console.log('Item: ',updatedItem);
    }


    handleChange(event) {
        this.value = event.detail.value;
    }
    
    get options() {
        return this.rtList;
    }

    connectedCallback(){
        this.loading(1000);
        this.fetchRoomType();
        this.value = 'all';
        this.domReady();
    }

    fetchRoomType(){
        getRoomTypes().then(data =>{
            this.rtList = data;
            this.rtListFixed = this.rtList;
            console.log(data);
            this.showRadioFliter=true;
        }).catch(error =>{
            console.log('Error: '+error.body.message);
        });
    }
    
    handleSearchContact(event){
        this.sConValue = event.detail.selectedRecordList;
        console.log('sconval',this.sConValue.Id);
        this.selectedContactName = this.sConValue.Name;
    }

    handleClearSearchRoomClick(){
        this.sRoomValue = '';
        // const event = {detail:{value:this.value}};
        // this.handleFilter(event);
        this.template.querySelectorAll('c-Hotel-Rooms').forEach(element => {
            element.filterRooms(this.sRoomValue); //Contains HTML elements
        });
    }

    handleFilter(event){
        this.loading(900);
        console.log('HEREEEEEEEEEEe',event?.detail?.value);
        this.rtListTemp =[];
        // this.rtList=[];
        this.rtListFixed.forEach(rt => {
            if(event?.detail?.value=='all'){
                this.rtList = this.rtListFixed;
            }
            if(event?.detail?.value == rt.value){
                this.rtListTemp.push(rt);
                this.rtList = this.rtListTemp;
            }
        });
    }

    searchRoomChange(event){
        console.log('search key: ',event.target.value);
        this.sRoomValue = event?.target?.value;
    }

    handleSearchRoomClick(){
        console.log('Search key word',this.sRoomValue);
        this.sRoomKeyword = this.sRoomValue.toString();
        this.template.querySelectorAll('c-Hotel-Rooms').forEach(element => {
            element.filterRooms(this.sRoomKeyword); //Contains HTML elements
        });
        // const objChild = this.template.querySelectorAll('c-Hotel-Rooms');
        // objChild.filterRooms(this.sRoomKeyword);
    }

    handleRoomBook(event){
        console.log(event.detail);
        let bObject = JSON.parse(JSON.stringify(event.detail?.value));
        let dItems = JSON.parse(JSON.stringify(event.detail?.selected));
        console.log('In Parent bObject: ',dItems);
        if(bObject?.roomId != null || bObject?.roomId != ''){
            this.totalPrice = this.totalPrice + (bObject?.price * bObject?.noOfPersons);
            this.showTotalPrice = Intl.NumberFormat('en-IN').format(this.totalPrice);
            console.log('Indian-Format totalPrice: ',Intl.NumberFormat('en-IN').format(this.totalPrice));
            this.Persons = this.Persons + bObject?.noOfPersons;
            this.bookingList.push(bObject);
            console.log('dItems: ',dItems);
            this.disableItems.push(dItems.toString());
            console.log('this.disableItems: ',this.disableItems);
            console.log('this.bookingList',this.bookingList);
        }
        // console.log('In Parent',event.detail?.value);
        // var bL=[];
        // bL.push(event.detail?.value);
        // console.log('bL: ',bL);
    }

    handleGoToCart(){
        this.loading(300);
        if(this.sConValue=='' || this.sConValue==null ){
            const event = new ShowToastEvent({
                title: '',
                message: 'Please Select the Booking Customer',
                variant: 'error'
            });
            this.dispatchEvent(event);
        }
        else if(this.bookingList.length <1){
            const event = new ShowToastEvent({
                title: '',
                message: 'Please Select Rooms to Book',
                variant: 'error'
            });
            this.dispatchEvent(event);
        }
        else{
            this.showCart = true;
        }
    }

    handleConfirmOrder(){
        //console.log(this.sConValue,this.bookingList);
        createBookings({conId:this.sConValue.Id,bookingList:this.bookingList}).then(data =>{
            console.log('Order No. ',data);
            // this.bookingList = [];
            // this.sConValue = [];
            // this.showTotalPrice = 0;
            // this.Persons = 0;
            // this.loading(1000);
            // this.showCart = false;
            window.open('url','_self');
            document.location.reload(true);
            const toastEvent = new ShowToastEvent({
                title:'Success!',
                message:'Your Booking is generated successfully with Order No.:'+data,
                variant:'success'
              });
              this.dispatchEvent(toastEvent);
        }).catch(error =>{
            console.log('Error: '+error.body.message);
        });
    }

    handleGoBack(){
        this.loading(300);
        this.showCart = false;
        // this.template.querySelectorAll('c-Hotel-Rooms').forEach(element => {
        //     element.disableAddedItems(this.disableItems); //Contains HTML elements
        // });
        console.log('disabli=e=d');
        // this.showCart = false;
    }

    loading(msTime){
        this.showSpinner = true;
        setTimeout(() => {
            // alert(this.recordId);
            //  this.showTotal = true;
             this.showSpinner = false;
         },msTime);
    }

    domReady(){
        // this.showTotal = true;
        setTimeout(() => {
            // alert(this.recordId);
             this.showTotal = true;
             this.columns = columns;
            //  this.showSpinner = false;
         },500);
    }

}