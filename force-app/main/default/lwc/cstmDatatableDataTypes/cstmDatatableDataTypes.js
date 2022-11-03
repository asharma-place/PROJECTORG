import LightningDatatable from 'lightning/datatable';
import unitPicklistTemplate from './unitPicklistTemplate.html'

export default class CstmDatatableDataTypes extends LightningDatatable {
    static customTypes ={
        unitPicklist : {
            template: unitPicklistTemplate,
            standardCellLayout : true,
            typeAttributes : ['options', 'value', 'placeholder', 'label'],
        },
    }
}

// import LightningDatatable from 'lightning/datatable';
// import customPicklistType from './customPicklistType.html'
// export default class CustomDatatableType extends LightningDatatable {
//     static customTypes = {
//         quantityPicklist: {
//             template: customPicklistType,
//             standardCellLayout: true,
//             typeAttributes: ['options', 'value', 'placeholder', 'handleonchange', 'label'],
//         },
//     }
// }