import { LightningElement, api, track } from 'lwc';

export default class RadioGroup extends LightningElement {

  @api label = '';
  @api value = '';
  @api name = 'CustomRadioGroup';
  @api options = [];
  @api orientation = 'vertical';

  @track options_ = [];
  @track value_ = '';

  connectedCallback(){
    this.value_ = this.value;
    this.options.forEach( (option,index) => {
      let option_ = JSON.parse(JSON.stringify(option));
      if (this.value == option_.value ) {
        option_.checked = true;
      }
      option_.key = index;
      option_.inputClass = `radio-input-${index}`;
      this.options_.push (option_);
    });
  }

  handleClick(event) {
    let key = event.currentTarget.dataset.key;
    if ( key == undefined || key == null){
      return;
    }

    let input = this.template.querySelector(`.radio-input-${key}`);
    if (input == undefined){
      return;
    }
    console.log(`key ${key} value ${input.value} `);
    //make the input checked
    input.checked = true;
    this.value_ = input.value;
    
    this.dispatchChange(input.value);
  }

  get radioClass(){
    return `slds-radio ${this.orientation == 'horizontal' ? 'horizontal' : ''}`;
  }

  dispatchChange(value){
    const change = new CustomEvent('change', {
      detail: { value:value}
    });
    this.dispatchEvent(change);
  }



}