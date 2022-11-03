import { LightningElement,track,api } from 'lwc';
import getRoomTypes from '@salesforce/apex/hotelMngController.getRoomTypes';
import getPageSize from '@salesforce/apex/modifyRooms.getPageSize';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

const optionsRoomType = [
    { value: 'all', label:'All' },
    { value: 'deluxe', label:'Deluxe' },
    { value: 'premium', label:'Premium' },
    { value: 'luxury', label:'Luxury'}
]

export default class HotelManagement2 extends LightningElement {
    @track sConValue='';
    @track selectedContactName='';
    @track optionsRoomType=[];
    @track showRadioFilter = false;
    @track radioTypeSelected='';
    @track roomTypeList=[];
    @track bookingList = [];
    @track bookingMap= new Map();
    @track totalPrice = 0;
    @track personsCount = 0;
    @track showCart = false;
    @api selectedRoomIdList = [];
    @track pageSize= 3;
    @track offSet = 0;
    @track disablePrevious = true;
    @track disableNext = false;
    @track maxRecordCount=0;
    @track maxPage=1;
    @track currentPage=1;
    @track searchKey = '';
    @track showSpinner = false;
    @track showTotal = false;
    @track counter=1;

    connectedCallback(){
        this.fetchRoomType();
        this.fetchPageSize();
        this.loading(2000);
    }

    fetchRoomType(){
        // this.startLoading();
        // this.bookingMap = new Map();
        getRoomTypes().then(data =>{
            this.roomTypeList = data;
            console.log(data);
            this.optionsRoomType = data;
            this.showRadioFilter=true;
            this.radioTypeSelected = 'all';
        }).catch(error =>{
            console.log('Error: '+error.body.message);
        });
        // this.stopLoading();
    }

    fetchPageSize(){
        getPageSize().then(data => {
            this.pageSize = data;
        }).catch(error=>{
            console.log('Error: '+error.body.message);
        });
    }

    handleRadioFilter(event){
        // this.loading(200);
        console.log('HEREEEEEEEEEEe',event?.detail?.value);
        this.radioTypeSelected = event?.detail?.value;
        let tempList= [];
        this.optionsRoomType.forEach(op => {
            if(this.radioTypeSelected=='all'){
                this.roomTypeList = this.optionsRoomType;
            }
            if(this.radioTypeSelected == op.value){
                tempList.push(op);
                this.roomTypeList = tempList;
            }
        });
        this.offSet = 0;
        this.currentPage = 1;
        this.disablePrevious = true;
        this.disableNext = false;
    }

    handleSearchContact(event){
        this.sConValue = event.detail.selectedRecordList;
        console.log('sconval',this.sConValue.Id);
        this.selectedContactName = this.sConValue.Name;
    }

    handleCallRoomBook(event){
        this.startLoading();
        let bookingObj = JSON.parse(JSON.stringify(event.detail?.value));
        console.log('bookingObj',bookingObj);
        if(bookingObj.roomId != null){
            this.totalPrice = this.totalPrice + bookingObj.bookingAmount;
            this.personsCount = this.personsCount + bookingObj.noOfPersons;
            this.bookingMap.set(bookingObj.roomId,bookingObj);
            this.bookingList.push(bookingObj);
            this.selectedRoomIdList.push(bookingObj.roomId);
            console.log('this.bookingMap: ',this.bookingMap);
        }
        this.stopLoading();
    }

    handleRemoveBooking(event){
        console.log('in handleRemoveBooking event.detail.value',event.detail.value);
        let bookingObj = JSON.parse(JSON.stringify(event.detail?.value));
        this.totalPrice = this.totalPrice - this.bookingMap.get(bookingObj.roomId).bookingAmount;
        this.personsCount = this.personsCount - this.bookingMap.get(bookingObj.roomId).noOfPersons;

        // let bookIndex = this.bookingList.indexOf(bookingObj);
        if(this.bookingList.length>0){
            this.bookingList = this.bookingList.filter(item => item.roomId !== bookingObj.roomId);

            let selIndex = this.selectedRoomIdList.indexOf(bookingObj.roomId);
            if (selIndex > -1) { // only splice array when item is found
                this.selectedRoomIdList.splice(selIndex, 1); // 2nd parameter means remove one item only
            }
        }
        console.log('this.bookingList: ',this.bookingList);
        console.log('this.selectedRoomIdList: ',this.selectedRoomIdList);
    }

    handleGoToCart(event){
        if(this.selectedContactName=='' || this.selectedContactName==null){
            const event = new ShowToastEvent({
                title: '',
                message: 'Please Select the Booking Customer',
                variant: 'error'
            });
            this.dispatchEvent(event);
        }
        else if(this.bookingList.length<1){
            const event = new ShowToastEvent({
                title: '',
                message: 'Please Select Rooms to Book',
                variant: 'error'
            });
            this.dispatchEvent(event);
        }
        else{
            this.loading(200);
            this.showCart = true;   
        }
    }

    handleGoHome(){
        this.loading(200);
        this.showCart = false;
    }

    handlePrevious(){
        this.loading(500);
        this.offSet = this.offSet - this.pageSize;
        console.log('this.offSet Previous',this.offSet);
        this.currentPage = this.currentPage - 1;
        if(this.currentPage==1){
            this.disablePrevious = true;
        }
        this.disableNext = false;
        console.log('done');
    }

    handleNext(){
        this.loading(1000);
        this.offSet = this.offSet + this.pageSize;
        console.log('this.offSet Next',this.offSet);
        this.currentPage = this.currentPage + 1;
        if(this.currentPage == this.maxPage){
            this.disableNext = true;
        }
        this.disablePrevious = false;
        console.log('done');
    }

    handleRoomCount(event){
        console.log('in Handle room countd');
        // if(this.counter == 1){
            this.showTotal = false;
            this.startLoading();
        // }
        console.log('roomCount:',event?.detail?.value);
        let count = event?.detail?.value;
        if(this.radioTypeSelected=='all'){
            this.maxRecordCountRadioAll(count);
        }
        else{
            console.log('in else with count ',count);
            if(count > 0){
                this.maxRecordCount = count;
            }
            else{
                this.maxRecordCount=1;
            }
            console.log('this.maxRecordCount in else',this.maxRecordCount);
        }
        // if(event?.detail?.value > 0){
        //     this.maxRecordCount = event?.detail?.value;
        // }
        // else{
        //     this.maxRecordCount=1;
        // }
        console.log('this.maxRecordCount after else',this.maxRecordCount);
        console.log('this.maxPage: ',this.maxRecordCount/this.pageSize);
        let pages = this.maxRecordCount/this.pageSize;
        if(pages == parseInt(pages)){
            this.maxPage = parseInt(pages);
        }
        else{
            this.maxPage = parseInt(pages) +1;
        }
        if(this.maxPage<2 || this.currentPage == this.maxPage){
            this.disableNext = true;
        }
        else{
            this.disableNext = false;
        }
        console.log('this.maxPage',this.maxPage);
            this.stopLoading();
            this.showTotal = true;
    }

    maxRecordCountRadioAll(count){
        console.log('in maxRecordCountRadioAll',count);
        if(count>this.maxRecordCount){
            this.maxRecordCount = count;
        }
    }

    handleSearchRooms(event){
        this.loading(1000);
        console.log('event?.detail?.value Search Key: ',event?.detail?.value);
        this.searchKey = event?.detail?.value;
        this.offSet = 0;
        this.currentPage = 1;
        this.disablePrevious = true;
    }

    handleClearSearchRooms(event){
        this.loading(500);
        console.log('event?.detail?.value Search Key: ',event?.detail?.value);
        this.searchKey = event?.detail?.value;
    }

    startLoading(){
        console.log('start Loading',this.showSpinner);
        this.showSpinner = true;
        console.log('start Loading',this.showSpinner);
    }

    stopLoading(){
        console.log('stop Loading',this.showSpinner);
        this.showSpinner = false;
        console.log('stop Loading',this.showSpinner);
    }

    loading(msTime){
        this.showSpinner = true;
        this.showTotal = false;
        setTimeout(() => {
            // alert(this.recordId);
             this.showSpinner = false;
             this.showTotal = true;
         },msTime);
    }

    calculateMaxPage(count){

    }

}