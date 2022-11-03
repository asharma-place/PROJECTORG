import { LightningElement,api } from 'lwc';

export default class BookingTotal extends LightningElement {
    @api totalAmount = 0;
    @api guests = 0;
    @api contactName = '';

    handleGoToCart(){
        const custEvent = new CustomEvent(
            'gotocart', {
                detail: {showCart: true}
            });
        this.dispatchEvent(custEvent);
    }
}