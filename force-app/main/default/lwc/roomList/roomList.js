import { LightningElement,api,track,wire } from 'lwc';
import getRooms from '@salesforce/apex/hotelMngController.getRooms';
// import TotalRecords from '@salesforce/apex/hotelMngController.TotalRecords';

export default class RoomList extends LightningElement {
    @api title='';
    @api roomType='';
    @track showRoomList = false;
    @api vOffset;
    @api page_size;
    @track roomList = [];
    @api bookingRoomList=[];
    @track recordsCount=0;
    @api searchRoomKey='';
    @api radioAll='';

    connectedCallback(){
        // this.title = this.roomType.toUpperCase() + ' ROOMS';
        this.createTitle();
        console.log('ROomlist connected');
        console.log('radioAll: ',this.radioAll);
    }

    createTitle(){
        this.title = this.roomType.toUpperCase() + ' ROOMS';
    }

    // hideRoomList(roomType){
    //     if(roomType=='all'){
    //         console.log('room type',roomType);
    //         this.showRoomList = false;
    //     }
    // }

    // getRoomCount(){
    //     TotalRecords({roomType:this.roomType}).then(data=>{
    //         this.recordsCount = data;
    //         console.log('this.recordsCount:',this.recordsCount);
    //         this.passCount();
    //     }).catch(error=>{
    //         console.log('Error: '+error?.body?.message);
    //     });
    // }

    passCount(){
        console.log('in pass Count');
        const custEvent = new CustomEvent(
            'callroomcount', {
                detail: {value:this.recordsCount}
        });
        this.dispatchEvent(custEvent);
    }

    @wire(getRooms,{roomType:'$roomType',v_Offset: '$vOffset', v_pagesize: '$page_size',searchKeyword:'$searchRoomKey',radio:'$radioAll'})
    wiredAccount({ error, data }) {
        if (data) {
            console.log('data: ',data);
            this.recordsCount = data?.TotalRecords;
            this.passCount();
            if(data?.roomList.length>0){
                this.roomList = data?.roomList;
                console.log('data: ',data?.roomList);
                console.log('room list: ',this.roomList);
                // console.log('TotalRecords: ',this.roomList[0]?.TotalRecords);
                // this.recordsCount = this.roomList[0]?.TotalRecords;
                this.showRoomList = true;
                // this.passCount();
            }
            else{
                this.showRoomList = false;
            }
        } else if (error) {
            console.log('IN error',error.body.message);
            this.error = error;
            this.showRoomList = false;
        }
    }

}