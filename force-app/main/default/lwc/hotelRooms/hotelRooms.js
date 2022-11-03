import { LightningElement,api, track, wire } from 'lwc';
import getRooms from '@salesforce/apex/hotelMngController.getRooms';
import getNext from '@salesforce/apex/hotelMngController.getNext';
import getPrevious from '@salesforce/apex/hotelMngController.getPrevious';
import TotalRecords from '@salesforce/apex/hotelMngController.TotalRecords';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
var tempList = [];
var tempListFixed = [];
const units = [
    { label: '1', value: 1 },
    { label: '2', value: 2 },
    { label: '3', value: 3 },
    { label: '4', value: 4 }
];

export default class HotelRooms extends LightningElement {
    @api rCategory ='';
    @api show;
    _selectedItems=[];
    @track rTitle = '';
    @track roomList=[];
    @track showRooms=false;
    @track showRoomList;
    @track isNewBooking = false;
    @track error;
    @track v_Offset=0;
    @track v_TotalRecords;
    @track page_size = 4;
    @track showPaginator;
    @track isLoaded=false;
    @track bookingObj;
    @track showComboBox=false;
    @track roomType;
    @track price=0;
    @track fixedPrice;
    value='1';
    @wire(getRooms,{roomType:'$rCategory',v_Offset: '$v_Offset', v_pagesize: '$page_size'})
    wiredAccount({ error, data }) {
        if (data) {
            console.log(data);
            if(data.length>0){
                // this.roomList = data;
                // let tempList = [];
                // tempList = data;
                function roomExists(Id) {
                    return tempList.some(function(el) {
                      return el.Id === Id;
                    }); 
                  }
                data.forEach(i => {
                    if(tempList.length>0){
                        if(!(roomExists(i.Id))){
                            tempList.push(i);
                            // if(this.price == 0){
                            //     this.price = i.Price;
                            // }
                        }
                    }
                    else{
                        tempList.push(i);
                        // if(this.price == 0){
                        //     this.price = i.Price;
                        // }
                    }
                    // tempList.push(i);
                    // this.price = i.Price;
                    
                });
                // this.showRooms = true;
                // console.log('room list ready',this.roomList);
                // tempList = tempList2;
                console.log('Temp list ready',tempList);
                console.log('selected: ',this.selectedItems);
                // console.log('price',this.price);
                this.showRoomList = data;
                this.roomList = data;
                // if(this.selectedItems.len > 0){
                //     this.disableAddedItems(this.disItems);
                // }
                this.showRooms = true;
                // this.disableAddedItems(this.selectedItems);
                // console.log('Show room list ready',this.showRoomList);
                this.error = undefined;
            }
        } else if (error) {
            this.error = error;
            this.showRoomList = undefined;
        }
    }

    @api
    get selectedItems(){
        console.log('this._selectedItems',this._selectedItems);
        return this._selectedItems;      
    }

    set selectedItems(value){
        console.log('value',value);
        this._selectedItems = value;
        // this.disableAddedItems();
    }

    get optionsPersons() {
        return [
            { label: '1', value: '1' },
            { label: '2', value: '2' },
            { label: '3', value: '3' },
            { label: '4', value: '4' }
        ];
    }

    handleChangeNo(event) {
        // this.value = event.detail.value;
        // console.log('No Of persons:',this.value);
    }

    handleAddToCart(event){
        this.roomType = this.rCategory;
        console.log('In handle Add',event?.target);
        console.log('Room Id',event?.target?.value);
        let idRoom = event?.target?.value;
        console.log('In handle Add',event.target?.previousElementSibling?.firstElementChild?.value);
        let pC = event.target?.previousElementSibling?.firstElementChild?.value;
        let personCount;
        if(pC == null || pC == ''){
            personCount = 1;
        }
        else{
            personCount = parseInt(pC);;
        }
        let today = new Date(new Date().setHours(0, 0, 0,0)).toLocaleDateString('fr-CA');
        let tomorrow = new Date(+new Date().setHours(0, 0, 0,0)+ 86400000).toLocaleDateString('fr-CA');
        console.log('No Of persons:',personCount);
        // this.bookingObj.roomId = idRoom;
        // this.bookingObj.noOfPersons = personCount;
        // console.log('No Of persons:',this.bookingObj);
        // this.showComboBox = true; 
        let roomName = '';
        this.template.querySelectorAll("h2[data-id='"+idRoom+"']").forEach(cb => {
            roomName = cb?.innerHTML;
        });
        let roomPrice = 0;
        this.template.querySelectorAll("span[data-name='"+idRoom+"']").forEach(cb => {
            roomPrice = cb?.title;
        });
        roomPrice = parseInt(roomPrice);
        console.log('roomPrice : ',roomPrice);
        console.log('roomName : ',roomName);

        let bookingPrice = personCount*roomPrice;

        let guests = [
            { 'label': '1', 'value': 1 },
            { 'label': '2', 'value': 2 },
            { 'label': '3', 'value': 3 },
            { 'label': '4', 'value': 4 }
        ];

        var bObj = {roomId:idRoom,room:roomName ,roomType: this.roomType,noOfPersons:personCount,price:roomPrice,bookingAmount : bookingPrice,startDate:today,endDate:tomorrow};
        console.log('bObj',bObj);
        this.bookingObj = bObj;

        // console.log('b',this.template.querySelectorAll("lightning-combobox[accessKey='"+idRoom+"']"));
        this.template.querySelectorAll("[accessKey='"+idRoom+"']").forEach(cb => {
            cb.disabled = true;
        });
        // console.log('a',this.template.querySelectorAll("lightning-combobox[accessKey='"+idRoom+"']"));

        // console.log('b',this.template.querySelectorAll("lightning-button[data-id='"+idRoom+"']"));
        this.template.querySelectorAll("lightning-button[data-id='"+idRoom+"']").forEach(cb => {
            cb.disabled = true;
        });

        // this.selectedItems.push(idRoom);        
        // console.log('A',this.template.querySelectorAll("h2[data-id='"+idRoom+"']"));
        // creating and dispatching an event:
        const custEvent = new CustomEvent(
                'callroombook', {
                    detail: {value:this.bookingObj,selected:idRoom}
            });
            this.dispatchEvent(custEvent);

        const toastEvent = new ShowToastEvent({
            title:'Success!',
            message:roomName+' Added to cart successfully',
            variant:'success'
          });
          this.dispatchEvent(toastEvent);
    }

    renderedCallback(){
        if(this._selectedItems.length>0){
            this.disableAddedItems();
        }
    }

    disableAddedItems(){
        console.log('in disableadd',this._selectedItems);
        this._selectedItems?.forEach(i => {
            console.log('i',i);
            this.template.querySelectorAll("lightning-combobox[accessKey='"+i+"']").forEach(cb => {
                console.log('cb',cb);
                cb.disabled = true;
            });
            this.template.querySelectorAll("lightning-button[data-id='"+i+"']").forEach(cb => {
                console.log('cb',cb);
                cb.disabled = true;
            });            
        });
    }

    connectedCallback(){
        // this.fetchRooms();
        this.onDomLoad();
        this.createTitle();
        this.fetchTotalRecords();
        // this.filterRooms();
        this.readyTempList();
    }

    readyTempList(){
        // setTimeout(() => {
        //     tempListFixed = tempList;
        //     console.log('tempListFixed',tempListFixed);
        //     tempList = [];
        //  },400);
    }

    // fetchRooms(){
    //     // console.log('rCategory',this.rCategory);
    //     this.rCategory = this.rCategory.toString();
    //     this.rTitle = this.rCategory.toUpperCase() + ' ROOMS';
    //     getRooms({roomType: this.rCategory}).then(data=>{
    //         console.log('rCategory',this.rCategory);
    //         this.roomList = data;
    //         console.log(this.roomList);
    //         if(data.length >0){
    //             this.showRoomList = this.roomList;
    //             console.log('Show room list',this.showRoomList);
    //             this.showRooms = true;
    //         }
    //         console.log(data);
    //     }).catch(error=>{
    //         console.log('Error: '+error?.body?.message);
    //     });
    // }

    createTitle(){
        this.rCategory = this.rCategory.toString();
        this.rTitle =  this.rCategory.toUpperCase() + ' ROOMS';
    }
    
    @api
    filterRooms(searchKey){
        // tempList = [];
        if(searchKey == null || searchKey == ''){
            this.showRoomList = this.roomList;
        }
        else{
            console.log('in Filter Rooms',searchKey);
            console.log('room list in fliter rooms',tempList);
            console.log('rCategory in fliter rooms',this.rCategory);
            let search = (list, text) =>
            list.filter(i => ((i?.RoomType?.toLowerCase() == this.rCategory?.toLowerCase()) && (i?.Description?.toLowerCase()?.includes(text.toLowerCase())|| i?.Name?.toLowerCase()?.includes(text.toLowerCase()))));
            // var items = ['john', 'bob', 'alex'];
            var items = tempList;
            console.log('showRoomList:',tempList);
            console.log('Items:',items);
            var result = search(items, searchKey);
            console.log('result',result);
            this.showRoomList = result;
            if(this.showRoomList.length==0){
                this.showRooms =false;
            }
            else{
                this.showRooms =true;
            }
        }
        // console.log('in Filter Rooms',searchKey);
        // console.log('room list in fliter rooms',tempList);
        // console.log('rCategory in fliter rooms',this.rCategory);
        // let search = (list, text) =>
        // list.filter(i => ((i?.RoomType?.toLowerCase() == this.rCategory?.toLowerCase()) && (i?.Description?.toLowerCase()?.includes(text.toLowerCase())|| i?.Name?.toLowerCase()?.includes(text.toLowerCase()))));
        // // var items = ['john', 'bob', 'alex'];
        // var items = tempList;
        // console.log('showRoomList:',tempList);
        // console.log('Items:',items);
        // var result = search(items, searchKey);
        // console.log('result',result);
        // this.showRoomList = result;
        // if(this.showRoomList.length==0){
        //     this.showRooms =false;
        // }
        // else{
        //     this.showRooms =true;
        // }
    }

    handleNew(){
        this.isNewBooking = true;
    }

    fetchTotalRecords(){
        TotalRecords({roomType:this.rCategory}).then(result=>{
            this.v_TotalRecords = result;
            this.showPaginator = true;
        });
    }

    previousHandler2(){
        getPrevious({v_Offset: this.v_Offset, v_pagesize: this.page_size}).then(result=>{
            this.v_Offset = result;
            if(this.isLoaded){
            if(this.v_Offset === 0){
                this.template.querySelector('c-paginator').changeView('trueprevious');
            }else{
                this.template.querySelector('c-paginator').changeView('falsenext');
            }
        }
        });
    }
    nextHandler2(){
        getNext({v_Offset: this.v_Offset, v_pagesize: this.page_size}).then(result=>{
            this.v_Offset = result;
            if(this.isLoaded){
           if(this.v_Offset + 10 > this.v_TotalRecords){
                this.template.querySelector('c-paginator').changeView('truenext');
            }else{
                this.template.querySelector('c-paginator').changeView('falseprevious');
            }
           }
        });
    }
    
    changeHandler2(event){
        const det = event.detail;
        this.page_size = det;
    }
    firstpagehandler(){
        this.v_Offset = 0;
        if(this.isLoaded){
        this.template.querySelector('c-paginator').changeView('trueprevious');
        this.template.querySelector('c-paginator').changeView('falsenext');
        }
    }
    lastpagehandler(){
        this.v_Offset = this.v_TotalRecords - (this.v_TotalRecords)%(this.page_size);
        if(this.isLoaded){
            this.template.querySelector('c-paginator').changeView('falseprevious');
        this.template.querySelector('c-paginator').changeView('truenext');
        }
    }
    
    onDomLoad(){
        // this.showRoomList = this.roomList;
        // this.showRooms = true;
        document.addEventListener("DOMContentLoaded", ()=>{
            this.isLoaded = true;
        });
    }
}