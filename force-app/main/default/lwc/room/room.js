import { LightningElement,api,track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import deluxeImage from "@salesforce/resourceUrl/deluxe";
import premiumImage from "@salesforce/resourceUrl/premium";
import luxuryImage from "@salesforce/resourceUrl/luxury";

const options = [
    { label: '1', value: 1 },
    { label: '2', value: 2 },
    { label: '3', value: 3 },
    { label: '4', value: 4 }
];

export default class Room extends LightningElement {
    @api room;
    @track guests=1;
    @track optionsPersons=[];
    @track bookingObj;
    @track disabled = false;
    @track disableButton2 = false;
    @api selectedRooms = [];
    @track image;
    @track addLabel = 'Add to Cart';
 
    get disableButton(){
        console.log('in getter');
        return (this.disableAddButton());
    }        

    connectedCallback(){
        this.optionsPersons = options;
        this.checkImage();
        this.createBookingObj();
        this.disableAddButton2();
    }

    renderedCallback(){
        // this.createBookingObj();
        // this.disableAddButton2();
    }

    createBookingObj(){
    }

    checkImage(){
        if(this.room.RoomType == 'Deluxe'){
            this.image = deluxeImage;
        }
        if(this.room.RoomType == 'Premium'){
            this.image = premiumImage;
        }
        if(this.room.RoomType == 'Luxury'){
            this.image = luxuryImage;
        }
    }

    handleChangeGuests(event){
        let persons = event?.detail?.value;
        console.log('persons',persons);
        this.guests = parseInt(persons);
        console.log('guests: ', this.guests);
    }

    handleAddToCart(){
        console.log('In handleAddToCart');
        let today = new Date(new Date().setHours(0, 0, 0,0)).toLocaleDateString('fr-CA');
        let tomorrow = new Date(+new Date().setHours(0, 0, 0,0)+ 86400000).toLocaleDateString('fr-CA');
        let bookingPrice = this.guests*this.room.Price;
        let diff = this.dateDiffInDays(today,tomorrow);
        var bObj = {roomId:this.room.Id,days:diff,room:this.room.Name,roomType:this.room.RoomType,noOfPersons:this.guests,price:this.room.Price,bookingAmount:bookingPrice, startDate:today,endDate:tomorrow,inFinalCart:true};
        this.bookingObj = bObj;
        console.log('this.bookingObj',this.bookingObj);

        const custEvent = new CustomEvent(
            'callroombook', {
                bubbles: true,
                composed: true,
                detail: {value:bObj,selected:this.room.Id}
            });
        this.dispatchEvent(custEvent);
   
        const toastEvent = new ShowToastEvent({
            title:'Success!',
            message: this.room.Name+' Added to cart successfully',
            variant:'success'
            });
        this.dispatchEvent(toastEvent);

        this.disabled = true;
        this.addLabel = 'Added';
        this.disableAddButton2();    
    }

    handleRemove(){
        console.log('In handleAddToCart');
        if(this.bookingObj == null || this.bookingObj==''){
            console.log('booking obj null');
            let today = new Date(new Date().setHours(0, 0, 0,0)).toLocaleDateString('fr-CA');
            let tomorrow = new Date(+new Date().setHours(0, 0, 0,0)+ 86400000).toLocaleDateString('fr-CA');
            let bookingPrice = this.guests*this.room.Price;
            let diff = this.dateDiffInDays(today,tomorrow);
            var bObj = {roomId:this.room.Id,days:diff,room:this.room.Name,roomType:this.room.RoomType,noOfPersons:this.guests,price:this.room.Price,bookingAmount:bookingPrice, startDate:today,endDate:tomorrow,inFinalCart:true};
            this.bookingObj = bObj;
        }
        console.log('this.bookingObj: ',this.bookingObj);
        const custEvent = new CustomEvent(
            'removebooking', {
                bubbles: true,
                composed: true,
                detail: {value:this.bookingObj}
            });
        this.dispatchEvent(custEvent);

        const toastEvent = new ShowToastEvent({
            title:'Deleted',
            message: this.room.Name+' Deleted from cart',
            variant:'warning'
            });
        this.dispatchEvent(toastEvent);
        
        this.disabled = false;
        this.addLabel = 'Add to Cart';
        this.disableAddButton2();
    }

    // disableAddButton(){
    //     console.log('In Disable Button',);
    //     if(this.selectedRooms.length >0){
    //         if(this.selectedRooms.includes(this.room.Id)){
    //             this.addLabel = 'Added';
    //             return true;
    //         }
    //         else{
    //             return this.disabled;
    //         }
    //     }
    //     else{
    //         return this.disabled;
    //     }
    // }

    disableAddButton2(){
        console.log('In Disable Button',);
        if(this.selectedRooms.length >0){
            if(this.selectedRooms.includes(this.room.Id)){
                console.log('in selected rooms');
                this.addLabel = 'Added';
                this.disableButton2 = true;
            }
            else{
                this.disableButton2 =  this.disabled;
            }
        }
        else{
            this.disableButton2 =  this.disabled;
        }
    }

    dateDiffInDays(a, b) {
        console.log('in dateDiffInDays');
        console.log('a',a);
        var date1 = new Date(a); 
        var date2 = new Date(b); 
        return parseInt((date2 - date1) / (1000 * 60 * 60 * 24));
      }

}