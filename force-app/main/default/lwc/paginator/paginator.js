import { LightningElement, api, track } from 'lwc';
/* eslint-disable no-console */
 /* eslint-disable no-alert */
export default class Paginator extends LightningElement {
    @track isLoaded = false;
     @api
    changeView(str){
        if(this.isLoaded){
        if(str === 'trueprevious'){
            this.template.querySelector('lightning-button.Previous').disabled = true;
        }
        if(str === 'falsenext'){
            this.template.querySelector('lightning-button.Next').disabled = false;
        }
        if(str === 'truenext'){
            this.template.querySelector('lightning-button.Next').disabled = true;
        }
        if(str === 'falseprevious'){
            this.template.querySelector('lightning-button.Previous').disabled = false;
        }
    }
    }

    connectedCallback(){
        this.onDomLoad();
    }

    renderedCallback(){
        if(this.isLoaded){
            this.template.querySelector('lightning-button.Previous').disabled = true;
        }
    }
    previousHandler1() {
        this.dispatchEvent(new CustomEvent('previous'));
    }

    nextHandler1() {
        this.dispatchEvent(new CustomEvent('next'));
    }
    FirstPageHandler1(){
        this.dispatchEvent(new CustomEvent('firstpage'));
    }
    LastPageHandler1(){
        this.dispatchEvent(new CustomEvent('lastpage'));
    }
    changeHandler(event){
        event.preventDefault();
        const s_value = event.target.value;
        const selectedEvent = new CustomEvent('selected', { detail: s_value});

        this.dispatchEvent(selectedEvent);
 
    }

    onDomLoad(){
        document.addEventListener("DOMContentLoaded", ()=>{
            this.isLoaded = true;
        });
    }
}