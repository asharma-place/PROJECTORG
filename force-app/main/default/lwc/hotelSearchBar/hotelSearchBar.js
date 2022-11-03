import { LightningElement,api } from 'lwc';

export default class HotelSearchBar extends LightningElement {
    @api searchRoomKey='';

    handleSearchRoomChange(event){
        console.log('search Room key: ',event.target.value);
        this.searchRoomKey = event?.target?.value;
    }

    handleSearchRoomClick(){
        const custEvent = new CustomEvent(
            'callsearchrooms', {
                detail: {value:this.searchRoomKey}
        });
        this.dispatchEvent(custEvent);
    }

    handleClearSearchRoomClick(){
        this.searchRoomKey = '';
        const custEvent = new CustomEvent(
            'callclearsearchrooms', {
                detail: {value:this.searchRoomKey}
        });
        this.dispatchEvent(custEvent);
    }

}