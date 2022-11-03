import { LightningElement, track, api } from 'lwc';
import findRecords from "@salesforce/apex/customLookupController.findRecords";
import NAME_FIELD from '@salesforce/schema/Contact.LastName';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
export default class CustomLookup extends LightningElement {
  fields = [NAME_FIELD];
  @track recordsList;
  @track searchKey = "";
  @api selectedValue;
  @api selectedRecordId;
  @api objectApiName;
  @api iconName;
  @api lookupLabel;
  @api name;
  @track isNewRecord = false;
  @track message;
  @track selectedRecordList = [];
  // _selectedContact;
  // @api 
  // get selectedContact(){
  //   console.log('this._selectedItems',this._selectedContact);
  //   return this._selectedContact;
  // }

  // set selectedContact(value){
  //   console.log('value',value);
  //   this._selectedContact = value;

  // }
  
  onLeave(event) {
    setTimeout(() => {
      this.searchKey = "";
      this.recordsList = null;
    }, 300);
  }
  onRecordSelection(event) {
    this.selectedRecordId = event.target.dataset.key;
    this.selectedValue = event.target.dataset.name;
    console.log('this.selectedValue',this.selectedValue);
    this.recordsList.forEach(element => {
      if (element.Id == event.target.dataset.key) {
        this.selectedRecordList = element;
      }
    });
    this.searchKey = "";
    this.onSeletedRecordUpdate();
  }
  handleKeyChange(event) {
    const searchKey = event.target.value;
    this.searchKey = searchKey;
    this.getLookupResult();
  }
  removeRecordOnLookup(event) {
    this.searchKey = "";
    this.selectedValue = null;
    this.selectedRecordId = null;
    this.recordsList = null;
    this.onSeletedRecordUpdate();
  }
  handleOnClick(){
    this.getLookupResult();
  }

  getLookupResult() {
    console.log('serach key : ' + this.searchKey);
    console.log('objectApiName key : ' + this.objectApiName);
    findRecords({ searchKey: this.searchKey, objectName: this.objectApiName })
      .then((result) => {
        console.log('result key : ' + result);
        if (result.length === 0) {
          this.recordsList = [];
          this.message = "No Records Found";
        } else {
          this.recordsList = result;
          this.message = "";
          console.log('record list :', this.selectedRecordList);
        }
        this.error = undefined;
      })
      .catch((error) => {
        console.log('error key : ' + JSON.stringify(error));
        this.error = error;
        this.recordsList = undefined;
      });
  }

  onSeletedRecordUpdate() {
    const passEventr = new CustomEvent('recordselection', {
      detail: { selectedRecordList: this.selectedRecordList, sectionName: this.name }
    });
    this.dispatchEvent(passEventr);
  }
  createNewRecord() {
    this.isNewRecord = !this.isNewRecord;
  }
  handleSuccess(event) {
    this.isNewRecord = false;
    const evt = new ShowToastEvent({
      title: 'Contact created',
      message: 'Record ID: ' + event.detail.id,
      variant: 'success',
    });
    this.dispatchEvent(evt);
  }
}